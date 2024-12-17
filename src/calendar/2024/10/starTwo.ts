import { readFile } from 'node:fs/promises';
import path from 'node:path';
import * as R from 'ramda';

type Coordinate = [number, number];

export async function exec(fileName: string): Promise<number> {
  const filePath = path.join(__dirname, fileName);
  const input = (await readFile(filePath)).toString();

  let result = 0;
  const matrix = input.split('\n').map(R.split(''));
  const possibleTrailheads = getPossibleTrailheads(matrix);

  for (let trailHeadIndex = 0; trailHeadIndex < possibleTrailheads.length; trailHeadIndex++) {
    const currentPosition = possibleTrailheads[trailHeadIndex];

    result += pathLookup(currentPosition, matrix);
  }

  return result;
};

const pathLookup = (currentPosition: Coordinate, map: string[][]): number => {
  if (map[currentPosition[0]][currentPosition[1]] === '9') {
    //Found the end - score
    return 1;
  }

  const nextPossibleSteps = getNextPossibleSteps(currentPosition, map);

  if (nextPossibleSteps.length > 0) {
    return R.sum(R.map((nextPossibleStep) => pathLookup(nextPossibleStep, map), nextPossibleSteps));
  }

  //Found dead end - no score
  return 0;
}

const getPossibleTrailheads = (map: string[][]): Coordinate[] => {
  const result: Coordinate[] = [];

  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      if (map[row][col] === '0') {
        result.push([row, col]);
      }
    }
  }

  return result;
}

const getNextPossibleSteps = (coordinate: Coordinate, map: string[][]): Coordinate[] => {
  const result: Coordinate[] = [];

  //Check up
  if (coordinate[0] >= 1 && canBeNextStep(coordinate, [coordinate[0] - 1, coordinate[1]], map)) {
    result.push([coordinate[0] - 1, coordinate[1]]);
  }

  //Check down
  if (coordinate[0] < map.length - 1 && canBeNextStep(coordinate, [coordinate[0] + 1, coordinate[1]], map)) {
    result.push([coordinate[0] + 1, coordinate[1]]);
  }

  //Check left
  if (coordinate[1] >= 1 && canBeNextStep(coordinate, [coordinate[0], coordinate[1] - 1], map)) {
    result.push([coordinate[0], coordinate[1] - 1]);
  }

  //Check right
  if (coordinate[1] < map[coordinate[0]].length - 1 && canBeNextStep(coordinate, [coordinate[0], coordinate[1] + 1], map)) {
    result.push([coordinate[0], coordinate[1] + 1]);
  }

  return result;
};

const canBeNextStep = (current: Coordinate, next: Coordinate, map: string[][]): boolean => Number(map[next[0]][next[1]]) - Number(map[current[0]][current[1]]) === 1
