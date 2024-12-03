import { Command } from 'commander';
import path from 'node:path';
import { printAnswer } from './common/printAnswer';

enum Options {
  ALL = 'all',
  DAY = 'day',
  STAR = 'star',
  YEAR = 'year'
}

const executeExercise = async (year: string, day: string, star: string, input: string) => {
  const fullPath = path.join(__dirname, '../src/calendar', year, day, star);
  const file = await import(path.join(fullPath, 'index.ts')) as { exec: (inputFile: string) => Promise<number> };

  const result = await file.exec(input);

  printAnswer(fullPath, result);
};

const program = new Command();

program.command('calendar')
  .option('-a, --all', 'Run all exercises', true)
  .option('-y, --year <number>', 'Year', new Date().getFullYear().toString())
  .option('-d, --day <number>', 'Day [01-24]')
  .option('-s, --star <number>', 'Star [1-2]')
  .action(async (name, options, command, xxx) => {

    // console.log(await getAvailableYears())

    //ToDo

    await executeExercise('2024', '01', '1', 'example.txt');
  });

program.parse();
