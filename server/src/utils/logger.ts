import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

// Configure pino logger
export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  // Use pretty printing in development
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
  // Redact sensitive fields
  redact: {
    paths: ['req.headers.authorization', 'req.body.password', 'req.body.currentPassword', 'req.body.newPassword'],
    censor: '[REDACTED]',
  },
  // Add base fields
  base: {
    env: process.env.NODE_ENV || 'development',
  },
  // Customize serializers
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      query: req.query,
      params: req.params,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err,
  },
});

// Create child loggers for different modules
export const createLogger = (module: string) => logger.child({ module });

// Convenience exports for common log levels
export const logInfo = (msg: string, data?: object) => logger.info(data, msg);
export const logError = (msg: string, error?: Error | object) => logger.error(error, msg);
export const logWarn = (msg: string, data?: object) => logger.warn(data, msg);
export const logDebug = (msg: string, data?: object) => logger.debug(data, msg);

export default logger;
