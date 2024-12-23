import { readFile } from 'node:fs/promises';
import path from 'node:path';
import * as R from 'ramda';

type Coordinate = [number, number];

export async function exec(fileName: string): Promise<number> {
  const filePath = path.join(__dirname, fileName);
  const input = (await readFile(filePath)).toString();
  const matrix = input.split('\n').map(R.split(''));

  let total = 0;
  const visited = new Set<string>();

  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      const key = `${row},${col}`;

      if (!visited.has(key)) {
        const { area, edgeCount } = exploreRegion(matrix, [row, col], matrix[row][col], visited);
        total += area * edgeCount;
      }
    }
  }

  return total;
}

const exploreRegion = (
  matrix: string[][],
  start: Coordinate,
  plantType: string,
  visited: Set<string>
): { area: number; edgeCount: number } => {
  const queue: Coordinate[] = [start];
  let area = 0;
  let edgeCount = 0;

  const edges = new Set<string>();

  while (queue.length > 0) {
    const [x, y] = queue.shift()!;
    const key = `${x},${y}`;

    if (visited.has(key)) continue;
    visited.add(key);

    area++;

    const neighbors = getNeighbors([x, y]);

    for (let polarity = 0; polarity < neighbors.length; polarity++) {
      const [nx, ny] = neighbors[polarity];

      if (!inBounds(matrix, [nx, ny]) || matrix[nx][ny] !== plantType) {
        // This is an edge
        edgeCount++;

        const edgeKey = `${polarity},${nx},${ny}`;
        edges.add(edgeKey);

        // Check for duplicate edges to adjust edge count
        for (const n2 of getNeighbors([nx, ny])) {
          const n2Key = `${polarity},${n2[0]},${n2[1]}`;

          if (edges.has(n2Key)) {
            edgeCount--;
          }
        }
      } else {
        queue.push([nx, ny]);
      }
    }
  }

  return { area, edgeCount };
};

const getNeighbors = ([x, y]: Coordinate): Coordinate[] => {
  return [
    [x, y - 1], // Left
    [x, y + 1], // Right
    [x + 1, y], // Down
    [x - 1, y], // Up
  ];
};

const inBounds = (matrix: string[][], [x, y]: Coordinate): boolean => {
  return x >= 0 && y >= 0 && x < matrix.length && y < matrix[0].length;
};
