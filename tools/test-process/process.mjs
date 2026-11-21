// Synced from Resnovas/.github templates/tools/test-process/process.mjs.
/**
 * @file tools/test-process/process.mjs
 *
 * Copyright 2026 Jonathan Stevens trading as Resnovas. All rights reserved.
 * Licensed under the Fair Core License, Version 1.0, MIT Future License
 * (FCL-1.0-MIT); see LICENSE. You may not move, change, disable or circumvent
 * the licence key functionality, or modify any part of the software that the
 * licence key protects.
 *
 * Contributions are made under the Developer Certificate of Origin (DCO.md) and
 * the Contributing Guidelines (CONTRIBUTING.md), subject to the Code of Conduct
 * (CODE_OF_CONDUCT.md) and the Cooperation Commitment (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

// One dependency-free process owner for Node tools and test-runner adapters.
import { ChildProcess, spawn } from 'node:child_process'
import { PassThrough } from 'node:stream'
import { windowsChild } from './windows.mjs'

const controlKey = '__house_child_owner_v1'
const remoteOwners = new Map()
let remoteSequence = 0
const controlListener = () => {}
// Only an explicitly nested Node root receives this private control capability.
const delegated = process.env.HOUSE_CHILD_OWNER === '1' && typeof process.send === 'function'

/** Separate process-owner traffic from the fixture's public IPC channel. */
if (delegated) {
  const originalEmit = process.emit
  process.emit = function (event, ...args) {
    const packet = event === 'message' && args[0]?.[controlKey]
    if (!packet) return Reflect.apply(originalEmit, this, [event, ...args])
    remoteOwners.get(packet.id)?.(packet)
    return true
  }
}

/** Send private ownership traffic without treating a disconnected business process as a live observer. */
function sendControl(channel, packet) {
  if (channel.connected) channel.send({ [controlKey]: packet }, () => {})
}

/** Preserve error identity fields across Node's JSON IPC serialization, never in timing records. */
function wireResult(result) {
  return { ...result, ...(result.error ? { error: { message: result.error.message, code: result.error.code } } : {}),
    ...(result.children ? { children: result.children.map(wireResult) } : {}) }
}

/** Restore typed process failures after transport; timing still contains no error text. */
function localResult(result) {
  return { ...result, ...(result.error ? { error: Object.assign(new Error(result.error.message), { code: result.error.code }) } : {}),
    ...(result.children ? { children: result.children.map(localResult) } : {}) }
}

/**
 * Delegate acquisition to the surviving outer observer, not another local launcher.
 * PID is available at spawn, as for a ChildProcess whose creation has not completed yet.
 * Business IPC and stream events retain their public channel; only the private envelope is consumed.
 */
function remoteChild(command, args, options) {
  const id = ++remoteSequence
  const child = new ChildProcess()
  child.stdout = new PassThrough()
  child.stderr = new PassThrough()
  child.stdout.setEncoding('utf8')
  child.stderr.setEncoding('utf8')
  // As at the real acquisition boundary, a launch error is retained in completed even without a caller listener.
  child.on('error', () => {})
  child.connected = true
  const sends = new Map()
  let sendSequence = 0
  let closed = false
  let finish
  const completed = new Promise((resolve) => { finish = resolve })
  child.send = (message, callback) => {
    const sendId = ++sendSequence
    if (callback) sends.set(sendId, callback)
    sendControl(process, { id, action: 'message', message, sendId })
    return process.connected
  }
  child.kill = (signal = 'SIGTERM') => {
    if (closed) return false
    sendControl(process, { id, action: 'kill', signal })
    return true
  }
  const cancel = async () => {
    if (!closed) sendControl(process, { id, action: 'cancel' })
    await completed
  }
  const abort = () => { void cancel() }
  options.signal?.addEventListener('abort', abort, { once: true })
  if (remoteOwners.size === 0) process.on('message', controlListener)
  remoteOwners.set(id, (packet) => {
    if (packet.event === 'spawn') {
      child.pid = packet.pid
      child.emit('spawn')
    } else if (packet.event === 'message') child.emit('message', packet.message)
    else if (packet.event === 'sent') {
      sends.get(packet.sendId)?.(packet.error ? new Error(packet.error) : null)
      sends.delete(packet.sendId)
    }
    else if (packet.event === 'stdout' || packet.event === 'stderr') {
      child[packet.event].write(packet.chunk)
      if (options.inheritOutput) process[packet.event].write(packet.chunk)
    } else if (packet.event === 'exit') {
      child.exitCode = packet.code
      child.signalCode = packet.signal
      child.emit('exit', packet.code, packet.signal)
    } else if (packet.event === 'error') child.emit('error', Object.assign(new Error(packet.message), { code: packet.code }))
    else if (packet.event === 'close') {
      closed = true
      child.connected = false
      child.stdout.end()
      child.stderr.end()
      child.emit('close', packet.status, packet.signal)
    } else if (packet.event === 'completed') {
      closed = true
      child.connected = false
      child.stdout.end()
      child.stderr.end()
      options.signal?.removeEventListener('abort', abort)
      for (const callback of sends.values()) callback(new Error('Child closed before IPC delivery completed.'))
      sends.clear()
      remoteOwners.delete(id)
      if (remoteOwners.size === 0) process.off('message', controlListener)
      finish(localResult(packet.result))
    }
  })
  const serializable = { ...options, env: options.env ?? process.env, cwd: options.cwd ?? process.cwd() }
  delete serializable.signal
  if (options.input instanceof Uint8Array) serializable.input = [...options.input]
  sendControl(process, { id, action: 'spawn', command, args, options: serializable })
  return { child, completed, cancel }
}

/** Per-child cleanup allowance reserved by both registration and execution. */
export const terminationGraceMs = 100

/** Legacy error identity retained for consumers of the earlier Node-only Windows boundary. */
export class UnsupportedChildRootError extends TypeError {
  /** Explain the supported launch form without exposing the rejected command. */
  constructor() {
    super('Windows child ownership requires the current Node executable (process.execPath); native executable and shell roots cannot guarantee descendant cleanup. Launch a Node entry point through process.execPath instead.')
    this.name = 'UnsupportedChildRootError'
    this.code = 'ERR_CHILD_ROOT_UNSUPPORTED'
  }
}

/**
 * Reject inconsistent serial child lifetimes before registering or executing a scenario.
 * Optimization evidence: Node 24.22.3 admission proof took 2.08 ms for invalid/boundary/valid controls; no speedup is claimed.
 */
export function childBudgetIssue(budgets, testMs) {
  if (!Number.isSafeInteger(testMs) || testMs <= 0 || budgets.length === 0 ||
      budgets.some((value) => !Number.isSafeInteger(value) || value <= 0))
    return 'Declare positive integer child budgets and a finite test timeout.'
  if (budgets.reduce((sum, value) => sum + value + terminationGraceMs, 0) >= testMs)
    return 'Child budgets and termination grace must fit below the test timeout; measure and shorten the children, not raise the test limit.'
  return undefined
}

const journalPhase = /^(?:child-start|module-first|module-64|module-256|module-1024|entry-source-loaded|effect-source-loaded|root-start|bootstrap-failure-logged|process-before-exit|process-exit-success|process-exit-failure|(?:main-use-exit|main-services-released|main-telemetry-released|bootstrap-use-exit|root-exit):(?:success|failure|interrupted))(?![\s\S])/
const ownedPhase = /^(?:spawn-request|spawned|native-supervisor-spawned|native-process-created|native-main-entry|native-control-connected|native-request-decoded|output-first|diagnostic-output|registration-output|ipc-output|ready|deadline|output-limit|cancel|exit|close|total)(?![\s\S])/

/**
 * Accept only bounded numeric phase evidence, never commands, IPC payloads or arbitrary child text.
 * Optimization evidence: the real-child journal/privacy proof took 37.87 ms including startup; per-record cost is not isolated.
 */
function timingRow(value) {
  return value !== null && typeof value === 'object' && value.code === 'test.child.timing' &&
    typeof value.phase === 'string' && (ownedPhase.test(value.phase) || journalPhase.test(value.phase)) &&
    ['child', 'startedAtMs', 'budgetMs', 'elapsedMs'].every((key) => Number.isSafeInteger(value[key]) && value[key] >= 0)
}

/**
 * Emit a closed record to stderr so a Node fixture's JSON stdout remains its business result.
 * Optimization evidence: the output/mandatory-timing proof took 73.52 ms including startup; no producer-only speedup is claimed.
 */
function emit(row) {
  process.stderr.write(`${JSON.stringify({ code: 'test.child.timing', child: row.child,
    startedAtMs: row.startedAtMs, budgetMs: row.budgetMs, phase: row.phase, elapsedMs: row.elapsedMs })}\n`)
}

/**
 * Start one bounded child with mandatory timing, bounded streams and optional IPC/journal descriptors.
 * The returned owner retains cancellation until actual close; callers must await completed or cancel().
 * POSIX signals target the owned group; Windows native roots use a suspended, non-breakaway Job acquisition.
 * Descendants that deliberately create another POSIX session/group are outside this ownership boundary.
 * No option disables timing. Command, environment, stream and IPC payloads are never logged as timing.
 * Optimization evidence: real-child output/IPC/abort proofs took 73.52/42.95/45.11 ms; one owner avoids a second polling runner.
 */
export function startChild(command, args, options) {
  if (options.signal?.aborted) throw new Error('Child launch aborted before spawn.')
  if ('shell' in options) throw new TypeError('Shell options are forbidden; pass an executable and an argument array, never a command string.')
  const { budgetMs, ordinal = 1, cwd, env = process.env, input, ipc = false, nested = false,
    journal = false, maxBuffer = 65536, inheritOutput = false } = options
  if (!Number.isSafeInteger(budgetMs) || budgetMs <= 0 || !Number.isSafeInteger(ordinal) || ordinal <= 0 ||
      !Number.isSafeInteger(maxBuffer) || maxBuffer <= 0)
    throw new TypeError('Declare a positive integer child budget, ordinal and output bound before spawning.')
  if (nested && command !== process.execPath) throw new TypeError('Nested ownership requires process.execPath.')
  const nativeWindows = process.platform === 'win32' && command !== process.execPath
  if (nativeWindows && (ipc || journal)) throw new TypeError('IPC and journal descriptors require a Node entry point; native programs use stdin/stdout/stderr.')
  if (delegated) return remoteChild(command, args, options)
  const started = performance.now()
  const spawnedAtMs = Math.round(performance.timeOrigin + started)
  const timings = []
  const seen = new Set()
  /**
   * Deduplicate first observations so a noisy child cannot flood timing diagnostics.
   * Optimization evidence: the 37.87 ms journal proof includes duplicate/privacy filtering; no independent callback benchmark is claimed.
   */
  const phase = (name, elapsedMs = Math.round(performance.now() - started)) => {
    if (seen.has(name)) return
    seen.add(name)
    const row = { phase: name, elapsedMs: Math.max(0, elapsedMs) }
    timings.push(row)
    emit({ child: ordinal, startedAtMs: spawnedAtMs, budgetMs, ...row })
  }
  phase('spawn-request')
  const stdio = ['pipe', 'pipe', 'pipe', ...(journal ? ['pipe'] : nested && !ipc ? ['ignore'] : []), ...(ipc || nested ? ['ipc'] : [])]
  // POSIX descendants inherit this owned group, even after its leader exits.
  const grouped = process.platform !== 'win32'
  const spawnOptions = { cwd, env: nested ? { ...env, HOUSE_CHILD_OWNER: '1' } : env, stdio, detached: grouped, shell: false }
  const child = nativeWindows ? windowsChild(command, args, spawnOptions, phase, spawnedAtMs) : spawn(command, args, spawnOptions)
  const children = new Map()
  const originalEmit = child.emit
  // Node otherwise buffers private IPC when the caller did not request business messages.
  if (nested) child.on('message', controlListener)
  if (nested) child.emit = function (event, ...values) {
    const packet = event === 'message' && values[0]?.[controlKey]
    if (!packet) return Reflect.apply(originalEmit, this, [event, ...values])
    if (packet.action === 'spawn') {
      if (terminating || closed) return true
      try {
        const input = Array.isArray(packet.options.input) ? Uint8Array.from(packet.options.input) : packet.options.input
        const owner = startChild(packet.command, packet.args, { ...packet.options, input, nested: packet.command === process.execPath, inheritOutput: false })
        children.set(packet.id, owner)
        owner.child.once('spawn', () => sendControl(child, { id: packet.id, event: 'spawn', pid: owner.child.pid }))
        owner.child.stdout.on('data', (chunk) => sendControl(child, { id: packet.id, event: 'stdout', chunk }))
        owner.child.stderr.on('data', (chunk) => sendControl(child, { id: packet.id, event: 'stderr', chunk }))
        owner.child.on('message', (message) => sendControl(child, { id: packet.id, event: 'message', message }))
        owner.child.once('exit', (code, signal) => sendControl(child, { id: packet.id, event: 'exit', code, signal }))
        owner.child.once('close', (status, signal) => sendControl(child, { id: packet.id, event: 'close', status, signal }))
        owner.child.once('error', (failure) => sendControl(child, { id: packet.id, event: 'error', message: failure.message, code: failure.code }))
        void owner.completed.then((result) => sendControl(child, { id: packet.id, event: 'completed', result: wireResult(result) }))
      } catch (failure) {
        sendControl(child, { id: packet.id, event: 'error', message: failure.message, code: failure.code })
        // Acquisition threw before a child existed: settle without inventing a close observation.
        sendControl(child, { id: packet.id, event: 'completed', result: wireResult({
          pid: 0, status: null, signal: null, error: failure, stdout: '', stderr: '',
          output: [null, '', ''], spawnedAtMs: Math.round(performance.timeOrigin + performance.now()),
          elapsedMs: 0, timings: [],
        }) })
      }
    } else {
      const owner = children.get(packet.id)
      if (packet.action === 'cancel') void owner?.cancel()
      if (packet.action === 'kill') owner?.child.kill(packet.signal)
      if (packet.action === 'message' && owner?.child.connected) owner.child.send(packet.message,
        (failure) => sendControl(child, { id: packet.id, event: 'sent', sendId: packet.sendId, error: failure?.message }))
    }
    return true
  }
  let stdout = ''
  let stderr = ''
  let diagnostic = ''
  let pendingJournal = ''
  let pendingTiming = ''
  let bytes = 0
  let error
  let forced
  let closed = false
  let terminating = false
  let release
  child.stdout.setEncoding('utf8')
  child.stderr.setEncoding('utf8')
  /** Signal the owned POSIX group without reinterpreting the direct child's exit result. */
  const signalTree = (signal) => {
    if (!grouped) return child.kill(signal)
    if (!child.pid) return false
    try {
      process.kill(-child.pid, signal)
      return true
    } catch (failure) {
      if (failure.code !== 'ESRCH') error ??= failure
      return false
    }
  }
  /** Finish escalation even if the group leader and its own descriptors have already closed. */
  const force = () => {
    clearTimeout(forced)
    forced = undefined
    signalTree('SIGKILL')
    for (const owner of children.values()) void owner.cancel()
    release?.()
  }
  /**
   * Signal a bounded failure once, retaining a forced-kill allowance for non-cooperating children.
   * Optimization evidence: the resistant child hit its 400 ms deadline at 408 ms and closed at 511 ms with unchanged 100 ms grace.
   */
  const terminate = (code) => {
    if (terminating || closed) return
    terminating = true
    error ??= Object.assign(new Error('Bounded child did not complete normally.'), { code })
    phase(code === 'ETIMEDOUT' ? 'deadline' : 'output-limit')
    signalTree('SIGTERM')
    for (const owner of children.values()) void owner.cancel()
    forced = setTimeout(force, terminationGraceMs)
  }
  const deadline = setTimeout(() => terminate('ETIMEDOUT'), budgetMs)
  /**
   * Bound all retained descriptors together; changing stream cannot bypass the limit.
   * Optimization evidence: the real output-flood child closed in 46 ms with ENOBUFS; admission retains one shared byte counter.
   */
  const admit = (chunk) => {
    bytes += Buffer.byteLength(chunk)
    if (bytes <= maxBuffer) return true
    terminate('ENOBUFS')
    return false
  }
  child.once('spawn', () => phase('spawned'))
  child.stdout.on('data', (chunk) => {
    if (!admit(chunk)) return
    stdout += chunk
    phase('output-first')
    if (/\b(?:bootstrap\.failure|diagnostic\.(?:startup|registered|unavailable))\b/.test(stdout)) phase('diagnostic-output')
    if (/Eventiva modules registered/.test(stdout)) phase('registration-output')
    if (inheritOutput) process.stdout.write(chunk)
  })
  child.stderr.on('data', (chunk) => {
    if (!admit(chunk)) return
    stderr += chunk
    phase('output-first')
    if (inheritOutput) process.stderr.write(chunk)
    else {
      // Forward only validated nested-owner timing, preserving the captured business stream byte-for-byte.
      pendingTiming += chunk
      const lines = pendingTiming.split('\n')
      pendingTiming = lines.pop() ?? ''
      for (const line of lines) {
        let row
        try { row = JSON.parse(line) } catch { continue }
        if (timingRow(row)) emit(row)
      }
    }
  })
  if (journal) child.stdio[3].on('data', (chunk) => {
    if (!admit(chunk)) return
    diagnostic += chunk.toString('utf8')
    pendingJournal += chunk.toString('utf8')
    const lines = pendingJournal.split('\n')
    pendingJournal = lines.pop() ?? ''
    for (const line of lines) {
      let row
      try { row = JSON.parse(line) } catch { continue }
      if (Array.isArray(row) && row.length === 2 && typeof row[0] === 'string' && journalPhase.test(row[0]) &&
          Number.isSafeInteger(row[1]) && row[1] >= 0) phase(row[0], row[1] - spawnedAtMs)
    }
  })
  if (ipc) child.on('message', (value) => {
    phase('ipc-output')
    if (value !== null && typeof value === 'object' && (value.ready === true || value.boundary === 'ready')) phase('ready')
  })
  child.once('error', (failure) => { error ??= failure })
  // EPIPE is a launch/result failure, not an unhandled parent exception.
  child.stdin.on('error', (failure) => { error ??= failure })
  child.stdin.end(input)
  child.once('exit', () => {
    phase('exit')
    for (const owner of children.values()) void owner.cancel()
    // A normally exited leader must not leave descendants holding pipes or doing background work.
    if (grouped && !terminating && signalTree('SIGTERM')) {
      terminating = true
      forced = setTimeout(force, terminationGraceMs)
    }
  })
  const completed = new Promise((resolve) => {
    child.once('close', (status, signal) => {
      closed = true
      // Descriptor close is distinct from leader exit and any later descendant escalation release.
      phase('close')
      clearTimeout(deadline)
      let released = false
      release = async () => {
        if (released) return
        released = true
        const nestedResults = await Promise.all([...children.values()].map((owner) => owner.completed))
        options.signal?.removeEventListener('abort', abort)
        phase('total')
        resolve({ pid: child.pid ?? 0, status, signal, ...(error ? { error } : {}), stdout, stderr,
          output: journal ? [null, stdout, stderr, diagnostic] : [null, stdout, stderr],
          spawnedAtMs, elapsedMs: Math.round(performance.now() - started), timings,
          ...(nested ? { children: nestedResults } : {}) })
      }
      // Closing the leader's pipes cannot cancel escalation of a resistant descendant.
      if (!forced) release()
    })
  })
  /**
   * Cancellation awaits actual pipes/IPC close and sends SIGKILL to the owned group on POSIX.
   * Windows native cancellation observes an empty private Job before supervisor close.
   * Linux descendant cancel/abort contracts completed in 66/66 ms; this is correctness evidence, not a speedup.
   */
  const cancel = async () => {
    clearTimeout(deadline)
    if (!closed || forced) {
      phase('cancel')
      terminating = true
      force()
    }
    await completed
  }
  const abort = () => { void cancel() }
  options.signal?.addEventListener('abort', abort, { once: true })
  return { child, completed, cancel }
}

/**
 * Run one noninteractive child to actual close; an AbortSignal cancels and awaits that same owner.
 * Optimization evidence: exact fake-executable compiler/editor consumer proofs took 221.89/138.38 ms; these are not real compiler budgets.
 */
export function runChild(command, args, options) {
  return startChild(command, args, options).completed
}
