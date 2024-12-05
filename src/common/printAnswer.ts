import chalk from 'chalk';
import { logger } from './logger';

export const printAnswer = (filePath: string, input: string, result: unknown) => {
  logger().info(`
    File: ${chalk.blueBright(filePath.split('/').slice(-4).join('/'))}
    Input file: ${chalk.blueBright(input)}
    Answer: ${chalk.greenBright(result)}
  `);
};
