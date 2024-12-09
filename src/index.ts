import { Command } from 'commander';
import inquirer from 'inquirer';
import path from 'node:path';
import { printAnswer } from './common/printAnswer';
// import { getAvailableYears, logger } from './common';
import { existsSync } from 'node:fs';
import chalk from 'chalk';
// import * as R from 'ramda';
import { logger } from './common';


interface Options {
  //all?: string;
  year?: string;
  day?: string;
  input?: string;
}

const executeExercise = async (year: string, day: string, input: string) => {
  const exercisePath = path.join(__dirname, '../src/calendar', year, day);
  const inputPath = path.join(exercisePath, input);

  if (!existsSync(inputPath)) {
    logger().warn(chalk.yellowBright(`Input file missing: ${inputPath}. Skipping...`));

    return;
  }

  const filePaths = [path.join(exercisePath, 'starOne.ts'), path.join(exercisePath, 'starTwo.ts')];

  await Promise.all(filePaths.map(async (filePath, index) => {
    if (!existsSync(filePath)) {
      logger().warn(chalk.yellowBright(`Exercise missing: ${year}/${day} star ${index + 1}. Skipping...`));

      return;
    }

    const file = (await import(filePath)) as { exec: (_inputFile: string) => Promise<number> };
    const result = await file.exec(input);

    printAnswer(filePath, input, result);
  }));
};

// const executeAllExercises = async () => {
//   const availableYears = await getAvailableYears();
//   const days = R.map(num => num.toString().padStart(2, '0'), R.range(1, 25));

//   const tasks = R.chain(
//     year => R.map(day => ({ year, day }), days),
//     availableYears
//   );

//   const batches = R.splitEvery(10, tasks);

//   for (const batch of batches) {
//     await Promise.all(
//       R.map(task => executeExercise(task.year, task.day, 'example.txt'), batch)
//     );
//   }
// };

const program = new Command();

program
  .command('calendar')
  // .option('-a, --all', 'Run all exercises')
  .option('-y, --year <number>', 'Year')
  .option('-d, --day <number>', 'Day [01-24]')
  .option('-i, --input <file>', 'Input file')
  .action(async (args: Options) => {
    let { year, day, input } = args;

    if (!year) {
      const answer = await inquirer.prompt([
        {
          type: 'input',
          name: 'year',
          message: 'Year not provided. Please specify the year:',
          validate: (value) => (value.trim() !== '' ? true : 'Year cannot be empty.'),
        },
      ]);

      year = answer.year as string;
    }

    if (!day) {
      const answer = await inquirer.prompt([
        {
          type: 'input',
          name: 'day',
          message: 'Day not provided. Please specify the day:',
          validate: (value) => (value.trim() !== '' ? true : 'Day cannot be empty.'),
        },
      ]);

      day = answer.day as string;
    }

    if (!input) {
      const answer = await inquirer.prompt([
        {
          type: 'input',
          name: 'input',
          message: 'Input file not provided. Please specify the input file:',
          validate: (value) => (value.trim() !== '' ? true : 'Input file cannot be empty.'),
        },
      ]);

      input = answer.input as string;
    }

    await executeExercise(year, day, input);
  });

program.parse();
