import chalk from 'chalk';
import { logger } from './logger';

export const printAnswer = (dir: string, input: string, result: unknown) => {
  logger().info(`
    Directory: ${chalk.blueBright(dir.split('/').slice(-3).join('/'))}
    Input file: ${chalk.blueBright(input)}
    Answer: ${chalk.greenBright(result)}
  `);
};
