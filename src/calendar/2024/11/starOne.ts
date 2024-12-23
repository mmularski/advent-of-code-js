import { readFile } from 'node:fs/promises';
import path from 'node:path';
import * as R from 'ramda';

export async function exec(fileName: string): Promise<number> {
  const filePath = path.join(__dirname, fileName);
  const input = (await readFile(filePath)).toString();
  let stones = input.split(' ');

  for (let i = 1; i <= 25; i++) {
    stones = blink(stones);
  }

  return stones.length;
};

const blink = (stones: string[]): string[] => {
  const newStones: string[] = [];

  for (const stone of stones) {
    if (stone === '0') {
      newStones.push('1');

      continue;
    }

    if (stone.length % 2 === 0) {
      const digits = stone.split('');
      const splitted = R.splitAt(stone.length / 2, digits);

      const formattedStones = R.map(
        R.pipe(R.join(''), Number, String),
      )(splitted);

      newStones.push(...R.flatten(formattedStones));

      continue;
    }

    newStones.push(String((Number(stone) * 2024)));
  }

  return newStones;
}
