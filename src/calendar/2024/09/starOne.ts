import { readFile } from 'node:fs/promises';
import path from 'node:path';
import * as R from 'ramda';

export async function exec(fileName: string): Promise<number> {
  const filePath = path.join(__dirname, fileName);
  const input = (await readFile(filePath)).toString();

  let result = 0;
  const tempParts: string[] = [];

  for (let i = 0, number = 0; i < input.length; i++) {
    if (i % 2 === 0) {
      const repeated = R.repeat(number, Number(input.at(i))).map(String);

      tempParts.push(...repeated);
      number++;
    } else {
      tempParts.push(...'.'.repeat(Number(input.at(i))).split(''));
    }
  }

  for (let i = tempParts.length - 1; i >= 0; i--) {
    const nextDotIndex = tempParts.indexOf('.');

    if (nextDotIndex < 0) {
      break;
    }

    tempParts[nextDotIndex] = tempParts.pop() ?? '.';
  }

  for (let multiplier = 0; multiplier < tempParts.length; multiplier++) {
    result += (multiplier * Number(tempParts.at(multiplier)));
  }

  return result;
};
