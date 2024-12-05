import { Command } from 'commander';
import path from 'node:path';
import { printAnswer } from './common/printAnswer';
import { getAvailableYears, logger } from './common';
import { existsSync } from 'node:fs';
import chalk from 'chalk';
import * as R from 'ramda';

interface Options {
  all: boolean
  year?: string
  day?: string
}

const executeExercise = async (year: string, day: string, input: string) => {
  const exercisePath = path.join(__dirname, '../src/calendar', year, day);
  const inputPath = path.join(exercisePath, input);

  if(!existsSync(inputPath)){
    logger().warn(chalk.yellowBright(`Input file missing: ${inputPath}. Skipping...`));

    return;
  }

  const filePaths = [path.join(exercisePath, 'starOne.ts'), path.join(exercisePath, 'starTwo.ts')]

  filePaths.map(async (filePath, index) => {
    if (!existsSync(filePath)) {
      logger().warn(chalk.yellowBright(`Exercise missing: ${year}/${day} star ${index + 1}. Skipping...`));

      return;
    }

    const file = await import(filePath) as { exec: (inputFile: string) => Promise<number> };
    const result = await file.exec(input);

    printAnswer(filePath, input, result);
  });
};

const executeAllExercises = async () => {
  const availableYears = await getAvailableYears();
  const days = R.map(
    num => num.toString().padStart(2, '0'),
    R.range(1, 25)
  );

  const tasks = R.chain(
    year => R.map(
      day => ({ year, day }),
      days
    ),
    availableYears
  );

  const batches = R.splitEvery(10, tasks);

  for (const batch of batches) {
    await Promise.all(
      R.map((task) => executeExercise(task.year, task.day, 'example.txt'), batch)
    );
  }
}

const program = new Command();

program.command('calendar')
  .option('-a, --all', 'Run all exercises')
  .option('-y, --year <number>', 'Year')
  .option('-d, --day <number>', 'Day [01-24]')
  .action(async (args: Options) => {
    const { all, year, day } = args;

    if (all) {
      await executeAllExercises();
    }

    if (year && day) {

      await executeExercise(year, day, 'input.txt')
    }
  });

program.parse();
