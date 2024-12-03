import chalk from 'chalk';

export const printAnswer = (dir: string, result: unknown) => {
  console.log(`
    Directory: ${chalk.blueBright(dir.split('/').slice(-3).join('/'))}
    Input file: ${chalk.blueBright(process.argv.at(2) ?? '')}
    Answer: ${chalk.greenBright(result)}
  `);
};
