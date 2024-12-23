import { readFile } from 'node:fs/promises';
import path from 'node:path';

export async function exec(fileName: string): Promise<number> {
  const filePath = path.join(__dirname, fileName);
  const input = (await readFile(filePath)).toString();

  const data = input.trim().split('\n\n');

  const machines = data.map((block) => {
    const lines = block.split('\n');

    const aButton = lines[0].match(/X\+(\d+), Y\+(\d+)/)?.slice(1).map(Number) ?? [0, 0];
    const bButton = lines[1].match(/X\+(\d+), Y\+(\d+)/)?.slice(1).map(Number) ?? [0, 0];
    const prize = lines[2].match(/X=(\d+), Y=(\d+)/)?.slice(1).map(Number) ?? [0, 0];

    return { aButton, bButton, prize };
  });

  let totalTokens = 0;

  for (const { aButton, bButton, prize } of machines) {
    const [aButtonX, aButtonY] = aButton;
    const [bButtonX, bButtonY] = bButton;
    const [prizeX, prizeY] = prize;

    let minCost = Infinity;
    let prizePossible = false;

    for (let aPress = 0; aPress <= 100; aPress++) {
      for (let bPress = 0; bPress <= 100; bPress++) {
        const x = aPress * aButtonX + bPress * bButtonX;
        const y = aPress * aButtonY + bPress * bButtonY;

        if (x === prizeX && y === prizeY) {
          const cost = aPress * 3 + bPress * 1;

          minCost = Math.min(minCost, cost);
          prizePossible = true;
        }
      }
    }

    if (prizePossible) {
      totalTokens += minCost;
    }
  }

  return totalTokens;
}
