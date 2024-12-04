import { readFile } from 'node:fs/promises';
import path from 'node:path';
import * as R from 'ramda';

const PATTERNS = ['MAS', 'SAM'];

export async function exec(fileName: string): Promise<number> {
  let result = 0;

  const filePath = path.join(__dirname, fileName);

  const input = (await readFile(filePath)).toString();
  const rows = input.split('\n');

  // logger().info(input);

  const matrix = R.map((row) => row.split(''), rows);

  for (let row = 1; row < matrix.length - 1; row++) {
    for (let col = 1; col < matrix[row].length - 1; col++) {
      if (matrix[row][col] === 'A' && isXMAS(matrix, row, col)) {
        result++;
      }
    }
  }

  return result;
};

const isXMAS = (matrix: string[][], row: number, col: number) => {
  const topLeft = matrix[row - 1]?.[col - 1] ?? '';
  const topRight = matrix[row - 1]?.[col + 1] ?? '';
  const center = matrix[row][col] ?? '';
  const bottomLeft = matrix[row + 1]?.[col - 1] ?? '';
  const bottomRight = matrix[row + 1]?.[col + 1] ?? '';

  const diagonal1 = `${topLeft}${center}${bottomRight}`;
  const diagonal2 = `${topRight}${center}${bottomLeft}`;

  return PATTERNS.includes(diagonal1) && PATTERNS.includes(diagonal2);
}
