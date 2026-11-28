"""Checkout-local Graphify lifecycle. Synced from the canonical house template.

Generation uses an isolated source snapshot and an atomic graph replacement.
Nothing in this module stages files, creates commits or accesses a remote model.
"""

from __future__ import annotations

import contextlib
import hashlib
import importlib.metadata
import json
import os
from pathlib import Path
import queue
import re
import shutil
import subprocess
import sys
import tempfile
import threading
import time
import urllib.request

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "graphify-out"
GRAPH = OUT / "graph.json"
VERSION = importlib.metadata.version("graphifyy")
TIMEOUT = 1200


def git(*args: str) -> bytes:
    """Read this checkout, not a Git directory inherited from another hook."""
    env = {k: v for k, v in os.environ.items() if not k.startswith("GIT_")}
    return subprocess.check_output(["git", "-C", str(ROOT), *args], env=env)


@contextlib.contextmanager
def locked():
    """Use an OS-released checkout lock, including after interrupted generation."""
    OUT.mkdir(exist_ok=True)
    with (OUT / ".house-lock").open("a+b") as stream:
        if os.name == "nt":
            import msvcrt
            stream.write(b"0")
            stream.flush()
            stream.seek(0)
            deadline = time.monotonic() + TIMEOUT
            while True:
                try:
                    msvcrt.locking(stream.fileno(), msvcrt.LK_NBLCK, 1)
                    break
                except OSError:
                    if time.monotonic() >= deadline:
                        raise TimeoutError("Graphify checkout lock timed out")
                    time.sleep(0.1)
        else:
            import fcntl
            deadline = time.monotonic() + TIMEOUT
            while True:
                try:
                    fcntl.flock(stream, fcntl.LOCK_EX | fcntl.LOCK_NB)
                    break
                except BlockingIOError:
                    if time.monotonic() >= deadline:
                        raise TimeoutError("Graphify checkout lock timed out")
                    time.sleep(0.1)
        try:
            yield
        finally:
            if os.name == "nt":
                stream.seek(0)
                msvcrt.locking(stream.fileno(), msvcrt.LK_UNLCK, 1)
            else:
                fcntl.flock(stream, fcntl.LOCK_UN)


def inputs() -> tuple[dict[str, bytes], str, str]:
    """Hash names and bytes, including dirty/untracked sources and ignore rules."""
    from graphify.detect import ignored_predicate

    ignored = ignored_predicate(ROOT)
    files = {}
    names = git("ls-files", "-z", "--cached", "--others", "--exclude-standard").split(b"\0")
    for raw in sorted(set(names)):
        if not raw:
            continue
        name = os.fsdecode(raw)
        path = ROOT / name
        # Never follow a link outside the corpus or ingest historical snapshots.
        if name.split("/")[0].lower() in {"graphify-out", "graphify-snapshot", "examples", ".amp"}:
            continue
        if path.is_symlink() or any(p.is_symlink() for p in path.parents if p != ROOT):
            continue
        if not path.is_file():
            continue
        config = path.name in {".gitignore", ".graphifyignore", ".graphifyrc"}
        if not config and ignored(path):
            continue
        files[name] = path.read_bytes()
    digest = hashlib.sha256(VERSION.encode())
    config_digest = hashlib.sha256()
    for name, data in files.items():
        entry = os.fsencode(name) + b"\0" + hashlib.sha256(data).digest()
        digest.update(entry)
        if Path(name).name in {".gitignore", ".graphifyignore", ".graphifyrc"} or name.startswith("tools/graphify/"):
            config_digest.update(entry)
    return files, digest.hexdigest(), config_digest.hexdigest()


def provenance() -> dict:
    """A legacy or interrupted graph has no trusted freshness record."""
    if not GRAPH.exists():
        return {}
    try:
        return json.loads(GRAPH.read_text(encoding="utf-8")).get("house_snapshot", {})
    except (ValueError, UnicodeError):
        return {}


def refresh(force: bool = False, check: bool = False) -> None:
    """Publish only a complete graph built from an unchanged source snapshot."""
    with locked():
        tracked = git("ls-files", "--", "graphify-out").decode().splitlines()
        if any(name not in {"graphify-out/.gitignore", "graphify-out/.gitattributes"} for name in tracked):
            raise RuntimeError("Generated output is still tracked. Preserve caches and untrack it before local generation; see docs/graphify.md.")
        files, fingerprint, config = inputs()
        previous = provenance()
        revision = git("rev-parse", "HEAD").decode().strip()
        if not force and previous.get("fingerprint") == fingerprint and previous.get("source_sha") == revision:
            print("graphify: local graph is current", file=sys.stderr)
            return
        if check:
            raise RuntimeError("Local graph is stale or unavailable; run sh tools/graphify/graphify update.")
        # Build outside the source tree. No symlinks to ignored build output, no
        # incremental stale nodes, and no semantic extraction in this path.
        with tempfile.TemporaryDirectory(prefix=".build-", dir=OUT) as directory:
            source = Path(directory) / "source"
            source.mkdir()
            for name, data in files.items():
                path = source / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(data)
            env = dict(os.environ, GRAPHIFY_OUT=str(source / "graphify-out"), PYTHONHASHSEED="0")
            for key in list(env):
                if key.startswith("GIT_"):
                    del env[key]
            # A VCS boundary stops upstream inheriting this checkout's ignored
            # graphify-out ancestor rules into the isolated source corpus.
            subprocess.run(["git", "init", "-q", str(source)], env=env, check=True)
            subprocess.run([sys.executable, "-m", "graphify", "update", str(source), "--force"],
                           cwd=source, env=env, check=True, stdout=sys.stderr, timeout=TIMEOUT)
            generated = source / "graphify-out" / "graph.json"
            graph = json.loads(generated.read_text(encoding="utf-8"))
            if not isinstance(graph.get("nodes"), list) or not isinstance(graph.get("links", graph.get("edges")), list):
                raise RuntimeError("Generator did not produce a node/link graph")
            if inputs()[1] != fingerprint or git("rev-parse", "HEAD").decode().strip() != revision:
                raise RuntimeError("Sources changed during generation; old graph retained, retry update.")
            graph["house_snapshot"] = {
                "source_sha": revision,
                "generator_version": VERSION,
                "fingerprint": fingerprint,
                "configuration_sha256": config,
                "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "mode": "code-only",
            }
            # Keep expensive legacy caches byte-for-byte. They are deliberately
            # not fed into automatic generation or published in shared snapshots.
            generated.write_text(json.dumps(graph, ensure_ascii=False) + "\n", encoding="utf-8")
            os.replace(generated, GRAPH)
            viewer = source / "graphify-out" / "graph.html"
            if viewer.exists():
                os.replace(viewer, OUT / "graph.html")
        print("graphify: refreshed ignored local graph", file=sys.stderr)


def install_hooks() -> None:
    """Compose post-event hooks without touching pre-commit or user programs."""
    hooks = Path(os.fsdecode(git("rev-parse", "--git-path", "hooks")).strip())
    if not hooks.is_absolute():
        hooks = ROOT / hooks
    hooks.mkdir(parents=True, exist_ok=True)
    markers = {"post-commit": "graphify-hook", "post-checkout": "graphify-checkout-hook",
               "post-merge": "graphify-merge-hook", "post-rewrite": "graphify-rewrite-hook"}
    for name, legacy in markers.items():
        path = hooks / name
        if path.is_symlink():
            raise RuntimeError(f"Preserve symlink hook {path}; compose the house refresh manually.")
        text = path.read_text() if path.exists() else "#!/bin/sh\n"
        if not text or text.splitlines()[0] not in {"#!/bin/sh", "#!/bin/bash", "#!/usr/bin/env bash", "#!/usr/bin/env sh"}:
            raise RuntimeError(f"Preserve non-shell hook {path}; compose the house refresh manually.")
        for marker in (legacy, "house-graphify"):
            start, end = f"# {marker}-start", f"# {marker}-end"
            if start in text or end in text:
                if text.count(start) != 1 or text.count(end) != 1 or text.index(end) < text.index(start):
                    raise RuntimeError(f"Ambiguous Graphify ownership in {path}; inspect without overwriting.")
                text = re.sub(re.escape(start) + r".*?" + re.escape(end) + r"\n?", "", text, flags=re.S)
        # Prepend after the shebang: a foreign hook's exec/exit remains intact
        # and cannot silently skip the local refresh. Its exit status survives.
        first, _, rest = text.partition("\n")
        block = ('# house-graphify-start\n'
                 '(\n'
                 '  root=$(git rev-parse --show-toplevel) || exit 0\n'
                 '  if [ -f "$root/tools/graphify/local.py" ]; then\n'
                 '    sh "$root/tools/graphify/graphify" hook || printf "%s\\n" "graphify: navigation stale; run graphify update" >&2\n'
                 '  fi\n'
                 ')\n'
                 '# house-graphify-end\n')
        updated = first + "\n" + block + rest
        if path.exists() and path.read_text() == updated:
            continue
        if path.exists():
            backup = path.with_name(name + ".before-house-graphify")
            if not backup.exists():
                shutil.copy2(path, backup)
        # Git invokes these with a POSIX shell even on Windows; CRLF breaks it.
        path.write_text(updated, newline="\n")
        path.chmod(path.stat().st_mode | 0o100)
    # A common Git config can still serve unmigrated sibling worktrees. Retain
    # the dormant driver there; no attribute in the migrated tree selects it.
    print("graphify: post-event hooks installed; pre-commit and merge-driver config preserved", file=sys.stderr)


def mcp() -> None:
    """Refresh before each MCP read and serialize calls so upstream reloads safely."""
    refresh()
    child = subprocess.Popen([str(Path(sys.executable).with_name("graphify-mcp")),
                              "--graph", str(GRAPH), "--transport", "stdio"],
                             stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    responses = queue.Queue()

    def output() -> None:
        for line in child.stdout:
            sys.stdout.write(line)
            sys.stdout.flush()
            message = json.loads(line)
            if "id" in message and "method" not in message:
                responses.put(message["id"])
        responses.put(None)

    threading.Thread(target=output, daemon=True).start()
    try:
        for line in sys.stdin:
            message = json.loads(line)
            if message.get("method") in {"tools/call", "resources/read"}:
                try:
                    project = message.get("params", {}).get("arguments", {}).get("project_path")
                    if project and Path(project).resolve() != ROOT:
                        raise RuntimeError("This local MCP endpoint serves only its own checkout.")
                    refresh()
                except Exception as exc:
                    print(json.dumps({"jsonrpc": "2.0", "id": message.get("id"),
                                      "error": {"code": -32000, "message": f"Graph navigation unavailable: {exc}"}}), flush=True)
                    continue
            child.stdin.write(line)
            child.stdin.flush()
            if "id" in message and "method" in message:
                received = responses.get(timeout=TIMEOUT)
                if received != message["id"]:
                    raise RuntimeError("Graphify MCP exited or returned an unexpected response")
    finally:
        child.stdin.close()
        child.terminate()
        child.wait(timeout=10)


def semantic(force: bool) -> None:
    """Keep explicit local model output separate from automatic navigation."""
    endpoint = "http://127.0.0.1:11434"
    model = os.environ.get("GRAPHIFY_MODEL", "qwen2.5-coder:7b")
    # Loopback only, without ambient HTTP proxies; neither setup nor pulls call
    # this operation. Missing models fail rather than triggering a download.
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    with opener.open(endpoint + "/api/tags", timeout=5) as response:
        models = json.load(response).get("models", [])
    if model not in {item.get("name") for item in models}:
        raise RuntimeError(f"Local Ollama model {model} is unavailable; install it explicitly first.")
    with locked():
        destination = OUT / "semantic"
        destination.mkdir(exist_ok=True)
        if (OUT / "cache").exists() and not (destination / "cache").exists():
            shutil.copytree(OUT / "cache", destination / "cache")
        env = dict(os.environ, GRAPHIFY_OUT=str(destination), OLLAMA_BASE_URL=endpoint + "/v1", OLLAMA_API_KEY="local")
        args = [sys.executable, "-m", "graphify", "extract", str(ROOT), "--backend", "ollama", "--model", model,
                "--max-concurrency", "1", "--token-budget", os.environ.get("GRAPHIFY_TOKEN_BUDGET", "1200"), "--no-cluster"]
        subprocess.run(args + (["--force"] if force else []), cwd=ROOT, env=env, check=True, timeout=TIMEOUT)


def main() -> None:
    """Dispatch only local lifecycle operations; arbitrary upstream writes stay explicit."""
    command = sys.argv[1]
    if command == "hooks":
        install_hooks()
    elif command == "mcp":
        mcp()
    elif command == "semantic":
        if any(arg != "--force" for arg in sys.argv[2:]):
            raise ValueError("Only --force is accepted")
        semantic("--force" in sys.argv[2:])
    elif command == "snapshot":
        refresh()
        with locked():
            destination = OUT / "snapshot"
            destination.mkdir(exist_ok=True)
            shutil.copyfile(GRAPH, destination / "graph.json")
            (destination / "provenance.json").write_text(json.dumps(provenance(), indent=2) + "\n")
    else:
        if any(arg != "--force" for arg in sys.argv[2:]):
            raise ValueError("Only --force is accepted")
        refresh(force="--force" in sys.argv[2:], check=command == "check")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"graphify: {error}", file=sys.stderr)
        sys.exit(1)
