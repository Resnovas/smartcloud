// Synced from Resnovas/.github templates/tools/test-process/windows-supervisor.cs.
/*
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

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.IO.Pipes;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Web.Script.Serialization;

// Platform acquisition only. The Node owner supplies deadlines, admission,
// output bounds and timing. No business output is interpreted as control.
internal static class WindowsSupervisor
{
    [StructLayout(LayoutKind.Sequential)]
    private struct BasicLimits
    {
        internal long ProcessTime, JobTime;
        internal uint Flags;
        internal UIntPtr MinimumWorkingSet, MaximumWorkingSet;
        internal uint ActiveProcessLimit;
        internal UIntPtr Affinity;
        internal uint PriorityClass, SchedulingClass;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct IoCounters
    {
        internal ulong ReadOperations, WriteOperations, OtherOperations;
        internal ulong ReadBytes, WriteBytes, OtherBytes;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct ExtendedLimits
    {
        internal BasicLimits Basic;
        internal IoCounters Io;
        internal UIntPtr ProcessMemory, JobMemory, PeakProcessMemory, PeakJobMemory;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct Accounting
    {
        internal long UserTime, KernelTime, PeriodUserTime, PeriodKernelTime;
        internal uint PageFaults, TotalProcesses, ActiveProcesses, TerminatedProcesses;
    }

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    private struct Startup
    {
        internal uint Size;
        internal string Reserved, Desktop, Title;
        internal uint X, Y, Width, Height, BufferWidth, BufferHeight, Fill, Flags;
        internal ushort Show, ReservedSize;
        internal IntPtr ReservedBytes, Input, Output, Error;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct ExtendedStartup
    {
        internal Startup Basic;
        internal IntPtr Attributes;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct ProcessInfo
    {
        internal IntPtr Process, Thread;
        internal uint Pid, ThreadId;
    }

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern IntPtr CreateJobObjectW(IntPtr attributes, IntPtr name);
    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool SetInformationJobObject(IntPtr job, int kind, ref ExtendedLimits limits, uint size);
    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool QueryInformationJobObject(IntPtr job, int kind, out Accounting value, uint size, IntPtr length);
    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool AssignProcessToJobObject(IntPtr job, IntPtr process);
    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool TerminateJobObject(IntPtr job, uint code);
    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool TerminateProcess(IntPtr process, uint code);
    [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
    private static extern bool CreateProcessW(string application, StringBuilder command, IntPtr processSecurity,
        IntPtr threadSecurity, bool inherit, uint flags, IntPtr environment, string directory,
        ref ExtendedStartup startup, out ProcessInfo info);
    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool InitializeProcThreadAttributeList(IntPtr list, int count, uint flags, ref IntPtr size);
    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool UpdateProcThreadAttribute(IntPtr list, uint flags, IntPtr attribute, IntPtr value,
        IntPtr size, IntPtr previous, IntPtr returned);
    [DllImport("kernel32.dll")]
    private static extern void DeleteProcThreadAttributeList(IntPtr list);
    [DllImport("kernel32.dll")]
    private static extern IntPtr GetStdHandle(int kind);
    [DllImport("kernel32.dll")]
    private static extern IntPtr GetCurrentProcess();
    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool DuplicateHandle(IntPtr sourceProcess, IntPtr source, IntPtr targetProcess,
        out IntPtr target, uint access, bool inherit, uint options);
    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern uint ResumeThread(IntPtr thread);
    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern uint WaitForSingleObject(IntPtr handle, uint milliseconds);
    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool GetExitCodeProcess(IntPtr process, out uint code);
    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool GetProcessTimes(IntPtr process, out long creation, out long exit, out long kernel, out long user);
    [DllImport("kernel32.dll")]
    private static extern bool CloseHandle(IntPtr handle);

    private static IntPtr job;
    private static int stopped;
    private static int rootExited;

    // The Windows CRT argv convention doubles backslashes before quotes and
    // before the closing quote. No shell, command concatenation or expansion.
    private static string Quote(string value)
    {
        if (value.Length > 0 && value.IndexOfAny(new char[] { ' ', '\t', '\n', '\v', '"' }) < 0) return value;
        StringBuilder result = new StringBuilder("\"");
        int slashes = 0;
        foreach (char character in value)
        {
            if (character == '\\') { slashes++; continue; }
            result.Append('\\', character == '"' ? slashes * 2 + 1 : slashes);
            result.Append(character);
            slashes = 0;
        }
        return result.Append('\\', slashes * 2).Append('"').ToString();
    }

    private static void Check(bool succeeded)
    {
        if (!succeeded) throw new Win32Exception(Marshal.GetLastWin32Error());
    }

    // Completion-port delivery is not guaranteed for active-process-zero.
    // Query the job itself, including nested jobs, before reporting release.
    private static void WaitEmpty()
    {
        Accounting accounting;
        do
        {
            Check(QueryInformationJobObject(job, 1, out accounting, (uint)Marshal.SizeOf(typeof(Accounting)), IntPtr.Zero));
            if (accounting.ActiveProcesses != 0) Thread.Sleep(5);
        } while (accounting.ActiveProcesses != 0);
    }

    private static ProcessInfo Start(string command, object[] arguments)
    {
        ExtendedStartup startup = new ExtendedStartup();
        ProcessInfo process = new ProcessInfo();
        IntPtr handles = IntPtr.Zero;
        IntPtr[] copies = new IntPtr[3];
        bool attributesReady = false;
        try
        {
            IntPtr size = IntPtr.Zero;
            InitializeProcThreadAttributeList(IntPtr.Zero, 1, 0, ref size);
            startup.Attributes = Marshal.AllocHGlobal(size);
            Check(InitializeProcThreadAttributeList(startup.Attributes, 1, 0, ref size));
            attributesReady = true;
            handles = Marshal.AllocHGlobal(IntPtr.Size * 3);
            for (int index = 0; index < copies.Length; index++)
            {
                Check(DuplicateHandle(GetCurrentProcess(), GetStdHandle(-10 - index), GetCurrentProcess(),
                    out copies[index], 0, true, 2));
                Marshal.WriteIntPtr(handles, index * IntPtr.Size, copies[index]);
            }
            Check(UpdateProcThreadAttribute(startup.Attributes, 0, new IntPtr(0x20002), handles,
                new IntPtr(IntPtr.Size * 3), IntPtr.Zero, IntPtr.Zero));
            startup.Basic.Size = (uint)Marshal.SizeOf(typeof(ExtendedStartup));
            startup.Basic.Flags = 0x100;
            startup.Basic.Input = copies[0];
            startup.Basic.Output = copies[1];
            startup.Basic.Error = copies[2];
            StringBuilder line = new StringBuilder(Quote(command));
            foreach (object argument in arguments) line.Append(' ').Append(Quote((string)argument));
            // Suspended acquisition closes the spawn-before-assignment escape.
            // The only inherited handles are stdio: never the job or control pipe.
            Check(CreateProcessW(null, line, IntPtr.Zero, IntPtr.Zero, true, 0x80004,
                IntPtr.Zero, null, ref startup, out process));
            Check(AssignProcessToJobObject(job, process.Process));
            if (ResumeThread(process.Thread) == uint.MaxValue) throw new Win32Exception(Marshal.GetLastWin32Error());
            return process;
        }
        catch
        {
            if (process.Process != IntPtr.Zero)
            {
                TerminateProcess(process.Process, 1);
                WaitForSingleObject(process.Process, uint.MaxValue);
                CloseHandle(process.Process);
            }
            throw;
        }
        finally
        {
            if (process.Thread != IntPtr.Zero) CloseHandle(process.Thread);
            foreach (IntPtr copy in copies) if (copy != IntPtr.Zero) CloseHandle(copy);
            if (attributesReady) DeleteProcThreadAttributeList(startup.Attributes);
            if (startup.Attributes != IntPtr.Zero) Marshal.FreeHGlobal(startup.Attributes);
            if (handles != IntPtr.Zero) Marshal.FreeHGlobal(handles);
        }
    }

    private static int Main(string[] arguments)
    {
        // Capture entry before JIT-compiling Run and loading its serializer path.
        return Run(arguments, DateTime.UtcNow.ToFileTimeUtc());
    }

    [MethodImpl(MethodImplOptions.NoInlining)]
    private static int Run(string[] arguments, long mainEntry)
    {
        if (arguments.Length != 1) return 1;
        JavaScriptSerializer json = new JavaScriptSerializer();
        // The control thread keeps a read pending while this thread publishes
        // exit/empty. A synchronous Windows pipe handle serializes those I/O
        // operations, leaving a natural exit blocked until cancellation input.
        using (NamedPipeClientStream pipe = new NamedPipeClientStream(".", arguments[0], PipeDirection.InOut, PipeOptions.Asynchronous))
        {
            pipe.Connect();
            StreamReader reader = new StreamReader(pipe, new UTF8Encoding(false));
            StreamWriter writer = new StreamWriter(pipe, new UTF8Encoding(false));
            writer.AutoFlush = true;
            long creation, exitTime, kernelTime, userTime;
            Check(GetProcessTimes(GetCurrentProcess(), out creation, out exitTime, out kernelTime, out userTime));
            // FILETIME and UTC entry share the Windows clock. They separate OS
            // creation-to-managed-entry from post-entry setup; not a CPU profile.
            writer.WriteLine("{\"action\":\"entry\",\"createdAtMs\":" + (creation / 10000 - 11644473600000L) +
                ",\"mainAtMs\":" + (mainEntry / 10000 - 11644473600000L) + "}");
            ProcessInfo process = new ProcessInfo();
            ManualResetEvent released = new ManualResetEvent(false);
            Thread control = null;
            try
            {
                Dictionary<string, object> request = json.Deserialize<Dictionary<string, object>>(reader.ReadLine());
                writer.WriteLine("{\"action\":\"decoded\"}");
                if ((bool)request["cancelled"]) return 1;
                job = CreateJobObjectW(IntPtr.Zero, IntPtr.Zero);
                Check(job != IntPtr.Zero);
                ExtendedLimits limits = new ExtendedLimits();
                limits.Basic.Flags = 0x2000; // KILL_ON_JOB_CLOSE only; neither breakaway flag.
                Check(SetInformationJobObject(job, 9, ref limits, (uint)Marshal.SizeOf(typeof(ExtendedLimits))));
                List<object> argv = new List<object>();
                foreach (object argument in (System.Collections.IEnumerable)request["args"]) argv.Add(argument);
                process = Start((string)request["command"], argv.ToArray());
                writer.WriteLine(json.Serialize(new { action = "started", pid = process.Pid }));
                control = new Thread(delegate()
                {
                    // EOF also cancels: the owning Node process may have died.
                    try
                    {
                        string action;
                        while ((action = reader.ReadLine()) != null)
                        {
                            if (action == "release") return;
                            if (Interlocked.CompareExchange(ref rootExited, 0, 0) == 0) Interlocked.Exchange(ref stopped, 1);
                            TerminateJobObject(job, 1);
                        }
                    }
                    catch (IOException) { }
                    finally { TerminateJobObject(job, 1); released.Set(); }
                });
                control.IsBackground = true;
                control.Start();
                if (WaitForSingleObject(process.Process, uint.MaxValue) != 0) throw new Win32Exception(Marshal.GetLastWin32Error());
                Interlocked.Exchange(ref rootExited, 1);
                uint status;
                Check(GetExitCodeProcess(process.Process, out status));
                writer.WriteLine(json.Serialize(new { action = "exited", status = status, terminated = stopped != 0 }));
                Check(TerminateJobObject(job, 1));
                WaitEmpty();
                writer.WriteLine(json.Serialize(new { action = "empty" }));
                // The two channels can otherwise deliver process exit before
                // Node has consumed the private root-exit/empty observations.
                released.WaitOne();
                control.Join();
                return unchecked((int)status);
            }
            catch (Exception failure)
            {
                if (job != IntPtr.Zero) { TerminateJobObject(job, 1); WaitEmpty(); }
                Win32Exception native = failure as Win32Exception;
                try
                {
                    writer.WriteLine(json.Serialize(new { action = "failed", code = native == null ? 1 : native.NativeErrorCode }));
                    if (control == null) reader.ReadLine();
                    else { released.WaitOne(); control.Join(); }
                }
                catch (IOException) { }
                return 1;
            }
            finally
            {
                if (process.Process != IntPtr.Zero) CloseHandle(process.Process);
                if (job != IntPtr.Zero) CloseHandle(job);
            }
        }
    }
}
