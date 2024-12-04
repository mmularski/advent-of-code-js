import pino, { Logger } from 'pino';

let loggerInstance: Logger;

export const logger = () => {
  if (loggerInstance) {
    return loggerInstance
  }

  loggerInstance = pino({
    name: 'Advent of Code',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  })

  return loggerInstance;
}
