import { createReadStream } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';

export async function exec(fileName: string): Promise<number> {
  let sum = 0;

  const filePath = path.join(__dirname, fileName);
  const input = createReadStream(filePath);

  const occurrences = new Map<string, number>();
  const leftPool = [];

  const rl = readline.createInterface({
    input,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const [left, right] = line.split('   ');

    leftPool.push(left);
    occurrences.set(right, (occurrences.get(right) ?? 0) + 1);
  }

  for (let i = 0; i < leftPool.length; i++) {
    const num = Number(leftPool[i]);

    sum += (num * (occurrences.get(leftPool[i]) ?? 0));
  }

  return sum;
};
