import { createReadStream } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';

export async function exec(fileName: string): Promise<number> {
  let safeReports = 0;

  const filePath = path.join(__dirname, fileName);
  const input = createReadStream(filePath);

  const rl = readline.createInterface({
    input,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const numbers = line.split(' ').map(Number);
    const numbersSet = new Set(numbers);

    //Check occurrences of the same number
    if (numbersSet.size !== numbers.length) {
      continue;
    }

    const shouldIncreasing = numbers[0] < numbers[1];
    let isSafeReport = true;

    for (let i = 1; (i < numbers.length) && isSafeReport; i++) {
      const diff = numbers[i - 1] - numbers[i];
      const isIncrease = diff < 0;

      /**
       * - numbers must constantly increase or decrease
       * - any two adjacent differ between 1 and 3
       */
      if (shouldIncreasing !== isIncrease || Math.abs(diff) > 3 || Math.abs(diff) < 1) {
        isSafeReport = false;
      }
    }

    if (isSafeReport) {
      safeReports++
    };
  }

  return safeReports;
};
