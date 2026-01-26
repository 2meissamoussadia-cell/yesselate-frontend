import pino from 'pino';
export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  base: undefined,
  transport: process.env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
});
export const withReq = (reqId?: string) => (reqId ? logger.child({ reqId }) : logger);
