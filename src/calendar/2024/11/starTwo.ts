import { readFile } from 'node:fs/promises';
import path from 'node:path';
import * as R from 'ramda';
import { logger } from '../../../common';

export async function exec(fileName: string): Promise<number> {
  const filePath = path.join(__dirname, fileName);
  const input = (await readFile(filePath)).toString();
  const stones = input.split(' ');

  let stonesMap = new Map<string, number>();

  for (const stone of stones) {
    addStoneToMap(stone, stonesMap);
  }

  for (let i = 1; i <= 75; i++) {
    logger({ sync: true }).info(`Blink #${i}`);

    stonesMap = blink(stonesMap);
  }

  return R.sum(Array.from(stonesMap.values()));
};

const blink = (stonesMap: Map<string, number>): Map<string, number> => {
  const newStonesMap = new Map<string, number>();

  for (const [stone, count] of stonesMap.entries()) {
    if (stone === '0') {
      addStoneToMap('1', newStonesMap, count);

      continue;
    }

    if (stone.length % 2 === 0) {
      const digits = stone.split('');
      const [left, right] = R.splitAt(stone.length / 2, digits);

      addStoneToMap(String(Number(left.join(''))), newStonesMap, count);
      addStoneToMap(String(Number(right.join(''))), newStonesMap, count);

      continue;
    }

    addStoneToMap(String(Number(stone) * 2024), newStonesMap, count);
  }

  return newStonesMap;
}

const addStoneToMap = (stone: string, stonesMap: Map<string, number>, count = 1) => {
  stonesMap.set(stone, (stonesMap.get(stone) ?? 0) + count);
}
