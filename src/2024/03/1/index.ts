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

  for await (const line of rl) {
    const matches = line.matchAll(/mul\((\d{1,3})\,(\d{1,3})\)/g);

    Array.from(matches).map((matchRegexp) => {
      const [_, leftNumber, rightNumber] = matchRegexp;

      sum += Number(leftNumber) * Number(rightNumber);
    });
  }

  return sum;
};

exec(process.argv.at(2) ?? '').then(console.log);
