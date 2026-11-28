// Synced from Resnovas/.github templates/tools/test-process/process.d.mts.
/**
 * @file tools/test-process/process.d.mts
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

import type { ChildProcess } from 'node:child_process'

/** SIGTERM-to-SIGKILL allowance that every registered budget must reserve. */
export const terminationGraceMs: 100

/** Legacy error identity retained for callers of the earlier Node-only Windows boundary. */
export class UnsupportedChildRootError extends TypeError {
  readonly code: 'ERR_CHILD_ROOT_UNSUPPORTED'
  /** Construct the historical diagnostic without retaining commands or arguments. */
  constructor()
}

/** Validate serial child lifetimes plus cleanup strictly below the enclosing test limit. */
export function childBudgetIssue(budgets: ReadonlyArray<number>, testMs: number): string | undefined

/** Closed phase and parent-relative monotonic duration, without command or stream payloads. */
export interface ChildTiming {
  readonly phase: string
  readonly elapsedMs: number
}

/** Completed process evidence, including failure exits and captured output without reinterpretation. */
export interface ChildResult {
  readonly pid: number
  readonly status: number | null
  readonly signal: NodeJS.Signals | null
  readonly error?: Error & { readonly code?: string }
  readonly stdout: string
  readonly stderr: string
  readonly output: ReadonlyArray<string | null>
  readonly spawnedAtMs: number
  readonly elapsedMs: number
  readonly timings: ReadonlyArray<ChildTiming>
  /** With nested ownership enabled, actual completed child results, recursively, never inferred from disconnect. */
  readonly children?: ReadonlyArray<ChildResult>
}

/** Explicit child lifetime and stream policy; there is deliberately no timing-disable option. */
export interface ChildOptions {
  readonly budgetMs: number
  /** Shell interpretation is forbidden, including an explicit false or inherited runtime option. */
  readonly shell?: never
  readonly ordinal?: number
  readonly cwd?: string
  readonly env?: Readonly<Record<string, string | undefined>>
  readonly input?: string | Uint8Array
  readonly ipc?: boolean
  /** Default false. Delegate nested Node acquisitions to the surviving outer observer through private IPC. */
  readonly nested?: boolean
  readonly journal?: boolean
  readonly maxBuffer?: number
  readonly inheritOutput?: boolean
  readonly signal?: AbortSignal
}

/** Public process-control surface, also supported by delegated handles; stdin is supplied through options.input. */
export type ChildHandle = Pick<ChildProcess, 'pid' | 'exitCode' | 'signalCode' | 'connected' | 'stdout' | 'stderr' |
  'on' | 'once' | 'off' | 'kill'> & {
    /** Send a message over child IPC; the return value is not an acknowledgement from the receiving process. */
    readonly send: (
      message: Parameters<ChildProcess['send']>[0],
      /** Report a transport error or null on successful send, not completion of work in the child. */
      callback?: (error: Error | null) => void
    ) => boolean
  }

/**
 * One cancellable resource; completed/cancel both wait for actual stream and IPC close.
 * POSIX signals include descendants retaining the owned group, including after leader exit.
 * Windows Node roots retain libuv cleanup; native roots use a suspended, non-breakaway private Job.
 * Native completion waits for active-process-zero and supervisor/stream close; IPC/journal remain Node-only.
 * Deliberately detached POSIX groups/sessions are not recursively owned.
 * With nested:true, canonical nested acquisitions are also owned and observed directly by the surviving host.
 * Their child PID becomes available at spawn; await spawn/readiness before using it.
 */
export interface ChildOwner {
  readonly child: ChildHandle
  readonly completed: Promise<ChildResult>
  /** Terminate once and wait until the process is fully released, including after natural close. */
  readonly cancel: () => Promise<void>
}

/** Start one timed resource; native Windows roots require the explicit build-windows.mjs prerequisite. */
export function startChild(command: string, args: ReadonlyArray<string>, options: ChildOptions): ChildOwner

/** Await actual close, including empty-Job evidence for native Windows trees; no shell option is accepted. */
export function runChild(command: string, args: ReadonlyArray<string>, options: ChildOptions): Promise<ChildResult>
