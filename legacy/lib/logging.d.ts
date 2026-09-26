export declare enum LoggingLevels {
    unknown = 0,// The log entry has no assigned severity level.
    debug = 100,//  Debug or trace information.
    info = 200,//  Routine information, such as ongoing status or performance.
    notice = 300,//  Normal but significant events, such as start up, shut down, or a configuration change.
    warn = 400,//  Warning events might cause problems.
    error = 500,//  Error events are likely to cause problems.
    critical = 600,//  Critical events cause more severe problems or outages.
    alert = 700,//  A person must take an action immediately.
    emergency = 800
}
/**
 * Logging function used throught the package.
 */
export declare function log(name: LoggingLevels, message: string): string;
export default log;
