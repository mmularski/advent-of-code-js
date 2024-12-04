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
  star?: string
}

const executeExercise = async (year: string, day: string, star: string, input: string) => {
  const exercisePath = path.join(__dirname, '../src/calendar', year, day, star);
  const fullFilePath = path.join(exercisePath, 'index.ts')

  if (!existsSync(fullFilePath)) {
    logger().warn(chalk.yellowBright(`Exercise missing: ${year}/${day}/${star}. Skipping...`));
    return;
  }

  const file = await import(path.join(exercisePath, 'index.ts')) as { exec: (inputFile: string) => Promise<number> };
  const result = await file.exec(input);

  printAnswer(exercisePath, input, result);
};

const executeAllExercises = async () => {
  const availableYears = await getAvailableYears();
  const days = R.map(
    num => num.toString().padStart(2, '0'),
    R.range(1, 25)
  );
  const stars = ['1', '2'];

  const tasks = R.chain(
    year => R.chain(
      day => R.map(
        star => ({ year, day, star }),
        stars
      ),
      days
    ),
    availableYears
  );

  const batches = R.splitEvery(10, tasks);

  for (const batch of batches) {
    await Promise.all(
      R.map((task) => executeExercise(task.year, task.day, task.star, 'example.txt'), batch)
    );
  }
}

const program = new Command();

program.command('calendar')
  .option('-a, --all', 'Run all exercises')
  .option('-y, --year <number>', 'Year')
  .option('-d, --day <number>', 'Day [01-24]')
  .option('-s, --star <number>', 'Star [1-2]')
  .action(async (args: Options) => {
    const { all, year, day, star } = args;

    if (all) {
      await executeAllExercises();
    }

    if(year && day && star) {
      await executeExercise(year, day, star, 'input.txt')
    }

    //ToDo

    //await executeExercise('2024', '01', '1', 'example.txt');
  });

program.parse();
