# Hook integration

Optional. Manual invocation is usually better; see the bottom of this file.

## A session-end reminder

Add this to your harness's hook configuration to remind the agent to
self-evaluate at the end of every session. The hook echoes a reminder; it
does not run an evaluator.

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo '[Self-Eval] Session complete. Consider running agent-self-evaluation to rate your output.'"
          }
        ],
        "description": "Remind agent to self-evaluate at session end"
      }
    ]
  }
}
```

`Stop` events do not require a `matcher` field; it is optional for `Stop`,
`Notification`, `UserPromptSubmit` and `SubagentStop`. If omitted, the hook
object needs only `hooks` and metadata such as `description`.

## A post-verification reminder

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "echo '[Self-Eval] If this command completed verification for a non-trivial task, consider running agent-self-evaluation.'"
          }
        ],
        "description": "Remind agent to self-evaluate after shell verification"
      }
    ]
  }
}
```

This uses a simple supported matcher string rather than command-expression
syntax, which is not universally supported. If your harness does support
command-level matcher expressions, prefer a word-boundary regex such as
`\b(pytest|npm test|go test)\b` over a broad `test` substring, which will
fire on almost everything.

## Prefer manual invocation

The most reliable approach is no hook at all: the agent runs the evaluation
as part of its workflow when this skill is active. The body's trigger list -
multi-file changes, multi-step workflows, debugging sessions that took
several attempts, written design or analysis - already covers when it should
fire, and it does so with the context needed to actually score, which a
shell hook does not have.
