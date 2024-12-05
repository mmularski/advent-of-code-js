import { createReadStream } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import * as R from 'ramda';

export async function exec(fileName: string): Promise<number> {
  let sum = 0;

  const filePath = path.join(__dirname, fileName);
  const input = createReadStream(filePath);

  const rl = readline.createInterface({
    input,
    crlfDelay: Infinity,
  });

  const rules: string[][] = [];
  const updates: string[][] = [];

  //Rules are always first
  let rulesSection = true;

  for await (const line of rl) {
    if (!line) {
      rulesSection = false;
      continue;
    }

    if (rulesSection) {
      rules.push(line.split('|'));
    } else {
      updates.push(line.split(','));
    }
  }

  updates.map(update => {
    const filteredRules = R.filter(
      R.pipe(
        R.intersection(update),
        R.length,
        //We only need rules that implies fully to the update line
        (length) => length === 2
      ),
    )(rules);


    if (!isValidUpdate(update, filteredRules)) {
      return;
    }

    sum += Number(update[Math.floor(update.length / 2)]);
  });

  return sum;
};

const isValidUpdate = (update: string[], rules: string[][]): boolean => {
  for (const rule of rules) {
    const [num, mark] = rule;

    if (!isBefore(num, mark, update)) {
      return false;
    }
  }

  return true;
};

const isBefore = (num: string, mark: string, list: string[]) => {
  const markIndex = R.indexOf(mark, list);
  const numIndex = R.indexOf(num, list);

  return numIndex < markIndex;
};
