import { createReadStream } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';

async function exec(fileName: string): Promise<number> {
  let safeReports = 0;

  const filePath = path.join(__dirname, fileName);
  const input = createReadStream(filePath);

  const rl = readline.createInterface({
    input,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const numbers = line.split(' ').map(Number);

    //Build variations(remove each index once)
    const variations = [numbers];

    variations.push(
      ...numbers.map((_, indexToRemove) => {
        return numbers.filter((_, index) => indexToRemove !== index);
      })
    );

    //Perform check for each variation
    const variationsResult = variations.map(verifyNumbers);

    //If at least one variation passes, it's a safe report
    if (variationsResult.some(Boolean)) {
      safeReports++
    };
  }

  return safeReports;
};

const verifyNumbers = (numbers: number[]) => {
  const numbersSet = new Set(numbers);

  //Check occurrences of the same number
  if (numbersSet.size !== numbers.length) {
    return false;
  }

  const shouldIncreasing = numbers[0] < numbers[1];

  let variationResult = true;

  for (let i = 1; (i < numbers.length); i++) {
    const diff = numbers[i - 1] - numbers[i];
    const isIncrease = diff < 0;

    /**
     * - numbers must constantly increase or decrease
     * - any two adjacent differ between 1 and 3
     */
    if (shouldIncreasing !== isIncrease || Math.abs(diff) > 3 || Math.abs(diff) < 1) {
      variationResult = false;
    }
  }

  return variationResult;
};

exec(process.argv.at(2) ?? '').then(console.log);
