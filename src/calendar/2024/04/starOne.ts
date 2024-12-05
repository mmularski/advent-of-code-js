import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { logger } from '../../../common';
import * as R from 'ramda';

const PATTERN = 'XMAS';

export async function exec(fileName: string): Promise<number> {
  let result = 0;

  const filePath = path.join(__dirname, fileName);

  const input = (await readFile(filePath)).toString();
  const rows = input.split('\n');

  // logger().info(input);

  const matrix = R.map((row) => row.split(''), rows);

  // Left-Right check
  for (let row = 0; row < matrix.length; row++) {
    result += countLeftRight(matrix[row]);
  }

  const transposedMatrix = R.transpose(matrix);

  // Top-Down check
  for (let row = 0; row < transposedMatrix.length; row++) {
    result += countLeftRight(transposedMatrix[row]);
  }

  // Diagonal check
  const diagonals = getDiagonals(matrix);

  for (let row = 0; row < diagonals.length; row++) {
    result += countLeftRight(diagonals[row]);
  }

  // logger().info(diagonals.map((row) => row.join('')));

  return result;
};

const countLeftRight = (row: string[]) => {
  const rowJoined = row.join('');
  const rowReversed = R.reverse(row).join('');

  const countOccurrences = (str: string) => (str.match(new RegExp(PATTERN, 'g')) ?? []).length;

  return R.sum([countOccurrences(rowJoined), countOccurrences(rowReversed)]);
};

const getDiagonals = (matrix: string[][]): string[][] => {
  const diagonals = [];
  const rows = matrix.length;
  const cols = matrix[0].length;

  // Top-left to bottom-right (main diagonals)
  for (let startRow = 0; startRow < rows; startRow++) {
    const diagonal = [];

    for (let row = startRow, col = 0; row < rows && col < cols; row++, col++) {
      diagonal.push(matrix[row][col]);
    }

    diagonals.push(diagonal);
  }

  for (let startCol = 1; startCol < cols; startCol++) {
    const diagonal = [];

    for (let row = 0, col = startCol; row < rows && col < cols; row++, col++) {
      diagonal.push(matrix[row][col]);
    }

    diagonals.push(diagonal);
  }

  // Top-right to bottom-left (opposite diagonals)
  for (let startRow = 0; startRow < rows; startRow++) {
    const diagonal = [];

    for (let row = startRow, col = cols - 1; row < rows && col >= 0; row++, col--) {
      diagonal.push(matrix[row][col]);
    }

    diagonals.push(diagonal);
  }

  for (let startCol = cols - 2; startCol >= 0; startCol--) {
    const diagonal = [];

    for (let row = 0, col = startCol; row < rows && col >= 0; row++, col--) {
      diagonal.push(matrix[row][col]);
    }

    diagonals.push(diagonal);
  }

  return diagonals;
};
