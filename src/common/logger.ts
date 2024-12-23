import pino, { Logger } from 'pino';

let loggerInstance: Logger;

export const logger = (opts = { sync: false }) => {
  if (loggerInstance) {
    return loggerInstance
  }

  loggerInstance = pino({
    name: 'Advent of Code',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        sync: opts.sync
      }
    }
  })

  return loggerInstance;
}
