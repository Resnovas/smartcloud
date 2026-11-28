// Synced from Resnovas/.github templates/tools/test-process/windows.mjs.
/**
 * @file tools/test-process/windows.mjs
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

import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { createServer } from 'node:net'
import { fileURLToPath } from 'node:url'

/**
 * Acquire a Windows-native tree inside the canonical owner's existing lifecycle.
 * This adapter supplies no budget, deadline, output counter or second result owner.
 * The supervisor's sole job handle is private, kill-on-close and non-breakaway.
 */
export function windowsChild(command, args, options, phase, startedAtMs) {
  const name = `house-child-${randomUUID()}`
  const server = createServer()
  server.listen(`\\\\.\\pipe\\${name}`)
  const child = spawn(fileURLToPath(new URL('./windows-supervisor.exe', import.meta.url)), [name], {
    ...options, stdio: ['pipe', 'pipe', 'pipe'], shell: false,
  })
  // The public PID identifies the owned root, never its platform supervisor.
  child.pid = undefined
  const originalEmit = child.emit
  const nativeKill = child.kill.bind(child)
  let channel
  let requestedSignal
  let rootExit
  let failed = false
  let empty = false
  let connected = false
  let releasing = false

  /** Route cancellation through the supervisor so its close follows active-process-zero. */
  child.kill = (signal = 'SIGTERM') => {
    // Release is the final command: the peer may already have closed its pipe
    // while Node still reports writable. Keep awaiting supervisor/stream close.
    if (releasing) return false
    requestedSignal ??= signal
    if (channel?.writable) channel.write('stop\n')
    else if (!connected) return nativeKill(signal)
    return child.exitCode === null
  }

  /** Keep actual native PID/spawn and root exit distinct from supervisor release. */
  child.emit = function (event, ...values) {
    if (event === 'spawn') {
      phase('native-supervisor-spawned')
      return true
    }
    if (event === 'exit' || event === 'close') {
      const signal = rootExit ? rootExit.terminated ? requestedSignal ?? 'SIGKILL' : null : values[1]
      const status = failed || rootExit?.terminated ? null : rootExit?.status ?? values[0]
      // Root exit was delivered on the private channel; supervisor exit only
      // establishes that the platform resource itself has now been released.
      if (event === 'exit' && rootExit) return true
      if (event === 'exit' && !rootExit && !failed && !values[1]) {
        originalEmit.call(child, 'error', Object.assign(new Error('Windows process supervisor closed without job release evidence.'), { code: 'EOWNER' }))
      }
      if (event === 'close') {
        if (!empty && rootExit && !failed) originalEmit.call(child, 'error', Object.assign(new Error('Windows process supervisor did not observe an empty job.'), { code: 'EOWNER' }))
        channel?.destroy()
        if (!connected) server.close()
      }
      child.exitCode = status
      child.signalCode = signal
      return Reflect.apply(originalEmit, this, [event, status, signal])
    }
    return Reflect.apply(originalEmit, this, [event, ...values])
  }

  server.once('error', (failure) => {
    failed = true
    originalEmit.call(child, 'error', failure)
    // Before connection no root can have been created. Closing the channel
    // after connection asks the same supervisor to terminate its job.
    channel?.destroy()
    if (!connected) nativeKill('SIGKILL')
  })
  server.once('connection', (socket) => {
    connected = true
    phase('native-control-connected')
    server.close()
    channel = socket
    socket.setEncoding('utf8')
    socket.write(`${JSON.stringify({ command, args, cancelled: Boolean(requestedSignal) })}\n`)
    let pending = ''
    socket.on('error', (failure) => { originalEmit.call(child, 'error', failure) })
    socket.on('data', (chunk) => {
      pending += chunk
      // This private channel carries only small numeric lifecycle messages.
      // Business stdout/stderr and their bounds remain in process.mjs.
      if (pending.length > 4096) {
        failed = true
        originalEmit.call(child, 'error', Object.assign(new Error('Invalid supervisor control packet.'), { code: 'EOWNER' }))
        socket.destroy()
        return
      }
      const lines = pending.split('\n')
      pending = lines.pop() ?? ''
      for (const line of lines) {
        let packet
        try { packet = JSON.parse(line) } catch { socket.destroy(); continue }
        if (packet.action === 'entry' && Number.isSafeInteger(packet.createdAtMs) &&
            Number.isSafeInteger(packet.mainAtMs) && packet.mainAtMs >= packet.createdAtMs) {
          phase('native-process-created', packet.createdAtMs - startedAtMs)
          phase('native-main-entry', packet.mainAtMs - startedAtMs)
        } else if (packet.action === 'decoded') {
          phase('native-request-decoded')
        } else if (packet.action === 'started' && Number.isSafeInteger(packet.pid) && packet.pid > 0) {
          child.pid = packet.pid
          originalEmit.call(child, 'spawn')
          if (requestedSignal) socket.write('stop\n')
        } else if (packet.action === 'exited' && Number.isSafeInteger(packet.status) && typeof packet.terminated === 'boolean') {
          rootExit = packet
          child.exitCode = packet.terminated ? null : packet.status
          child.signalCode = packet.terminated ? requestedSignal ?? 'SIGKILL' : null
          originalEmit.call(child, 'exit', child.exitCode, child.signalCode)
        } else if (packet.action === 'empty') {
          empty = true
          releasing = true
          socket.write('release\n')
        }
        else if (packet.action === 'failed') {
          failed = true
          releasing = true
          socket.write('release\n')
          originalEmit.call(child, 'error', Object.assign(new Error('Windows process acquisition failed.'), {
            code: packet.code === 2 || packet.code === 3 ? 'ENOENT' : packet.code === 5 ? 'EACCES' : 'EOWNER',
          }))
        } else socket.destroy()
      }
    })
  })
  return child
}
