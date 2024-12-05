import { createReadStream } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';

export async function exec(fileName: string): Promise<number> {
  let distance = 0;

  const filePath = path.join(__dirname, fileName);
  const input = createReadStream(filePath);

  const leftPool = [];
  const rightPool = [];

  const rl = readline.createInterface({
    input,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const [left, right] = line.split('   ');

    leftPool.push(Number(left));
    rightPool.push(Number(right));
  }

  leftPool.sort();
  rightPool.sort();

  for (let i = 0; i < leftPool.length; i++) {
    distance += Math.abs(leftPool[i] - rightPool[i]);
  }

  return distance;
};
