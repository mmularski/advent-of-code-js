import { readFile } from 'node:fs/promises';
import path from 'node:path';
import * as R from 'ramda';

type Coordinate = [number, number];

export async function exec(fileName: string): Promise<number> {
  const filePath = path.join(__dirname, fileName);
  const input = (await readFile(filePath)).toString();
  const matrix = input.split('\n').map(R.split(''));

  let price = 0;
  const plantsMap = new Map<string, Coordinate[]>();

  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      plantsMap.set(
        matrix[row][col],
        [
          ...(plantsMap.get(matrix[row][col]) ?? []),
          [row, col],
        ]
      );
    }
  }

  const visited = new Set<string>();

  for (const [plant, coordinates] of plantsMap.entries()) {
    for (const coordinate of coordinates) {
      const key = `${coordinate[0]},${coordinate[1]}`;

      if (!visited.has(key)) {
        const { area, perimeter } = exploreRegion(matrix, coordinate, plant, visited);

        price += area * perimeter;
      }
    }
  }

  return price;
}

const exploreRegion = (matrix: string[][], start: Coordinate, plantType: string, visitedCoords: Set<string>): { area: number; perimeter: number } => {
  const directions = [
    [-1, 0], // Up
    [1, 0],  // Down
    [0, -1], // Left
    [0, 1]   // Right
  ];

  const queue: Coordinate[] = [start];
  let area = 0;
  let perimeter = 0;

  while (queue.length > 0) {
    const [x, y] = queue.pop()!;
    const key = `${x},${y}`;

    if (visitedCoords.has(key)) continue;
    visitedCoords.add(key);

    area++;

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;

      if (nx < 0 || ny < 0 || nx >= matrix.length || ny >= matrix[0].length || matrix[nx][ny] !== plantType) {
        perimeter++;
      } else if (!visitedCoords.has(`${nx},${ny}`)) {
        queue.push([nx, ny]);
      }
    }
  }

  return { area, perimeter };
}
