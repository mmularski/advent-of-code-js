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

    return { aButton, bButton, prize: [prize[0] + 10e12, prize[1] + 10e12] };
  });

  let totalTokens = 0;

  for (const { aButton, bButton, prize } of machines) {
    /**
     * Equation
     *
     * aPress * aButtonX + bPress * bButtonX = prizeX
     * aPress * aButtonY + bPress * bButtonY = prizeY
     *
     * These can be represented as:
     *
     * A * X = B
     *
     * where:
     * - A is the coefficient matrix:
     *     [
     *       [aButtonX, bButtonX],
     *       [aButtonY, bButtonY]
     *     ]
     * - X is the unknown vector:
     *     [aPress, bPress]
     * - B is the result vector:
     *     [prizeX, prizeY]
     *
     *
     * det(A) = aButtonX * bButtonY - aButtonY * bButtonX
     *
     * @see https://en.wikipedia.org/wiki/Cramer%27s_rule
     */
    const [aButtonX, aButtonY] = aButton;
    const [bButtonX, bButtonY] = bButton;
    const [prizeX, prizeY] = prize;

    const det = aButtonX * bButtonY - aButtonY * bButtonX;

    if (det === 0) {
      //No solution
      continue;
    }

    const aPress = (prizeX * bButtonY - prizeY * bButtonX) / det;
    const bPress = (aButtonX * prizeY - aButtonY * prizeX) / det;

    if (
      Number.isInteger(aPress) &&
      Number.isInteger(bPress) &&
      aPress >= 0 &&
      bPress >= 0
    ) {
      const cost = aPress * 3 + bPress * 1;
      totalTokens += cost;
    }
  }

  return totalTokens;
}
