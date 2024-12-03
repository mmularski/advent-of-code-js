import { createReadStream } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';

async function exec(fileName: string): Promise<number> {
  let sum = 0;

  const filePath = path.join(__dirname, fileName);
  const input = createReadStream(filePath);

  const rl = readline.createInterface({
    input,
    crlfDelay: Infinity,
  });

  let mulEnabled = isMulEnabled();

  for await (const line of rl) {
    const matches = line.matchAll(/(mul\((\d{1,3}),(\d{1,3})\))|((do\(\)|don't\(\)))/g);

    Array.from(matches).map((matchRegexp) => {
      const [_fullMatch, _mul, leftNumber, rightNumber, doOrDont] = matchRegexp;

      if (doOrDont) {
        mulEnabled = isMulEnabled(doOrDont);
      }

      if (mulEnabled && leftNumber && rightNumber) {
        sum += Number(leftNumber) * Number(rightNumber);
      }
    });
  }

  return sum;
};

const isMulEnabled = (action?: string) => (!action || action === 'do()') ? true : false;

exec(process.argv.at(2) ?? '').then(console.log);
