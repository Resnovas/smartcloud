export declare enum LoggingLevels {
    unknown = 0,
    debug = 100,
    info = 200,
    notice = 300,
    warn = 400,
    error = 500,
    critical = 600,
    alert = 700,
    emergency = 800
}
/**
 * Logging function used throught the package.
 */
export declare function log(name: LoggingLevels, message: string): string;
export default log;
