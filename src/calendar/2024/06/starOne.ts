import { readFile } from 'node:fs/promises';
import path from 'node:path';
import * as R from 'ramda';

const GUARD_STARTING_POINT_CHARACTER = '^';
const OBSTACLE_CHARACTER = '#';
const MET_POSITION_CHARACTER = 'X';

type Coordinate = [number, number];
type MoveFn = (matrix: string[][]) => void;

enum Directions {
  UP,
  DOWN,
  RIGHT,
  LEFT
};

export async function exec(fileName: string): Promise<number> {
  const filePath = path.join(__dirname, fileName);
  const input = (await readFile(filePath)).toString();

  const matrix = input.split('\n').map(R.split(''));

  //First move is always Up
  moveUp(matrix)
  let lastMove = Directions.UP;
  let [guardPosition] = findMapElements(matrix);

  //Execute moves until the guard will be off the map
  while (R.and(
    R.allPass([R.is(Number), R.gte(R.__, 0)])(guardPosition[0]),
    R.allPass([R.is(Number), R.gte(R.__, 0)])(guardPosition[1])
  )) {
    const [nextDirection, nextDirectionFn] = getNextMove(lastMove);

    nextDirectionFn(matrix);
    lastMove = nextDirection;

    guardPosition = findMapElements(matrix)[0];
  }

  return countDistinctPositions(matrix);
};

const findMapElements = (matrix: string[][]): [Coordinate, Coordinate[]] => {
  let guardPosition: Coordinate = [-1, -1];
  const obstacles: Coordinate[] = [];

  matrix.map((row, rowIndex) => {
    row.map((character, colIndex) => {
      if (character === '.') {
        return;
      }

      if (character === OBSTACLE_CHARACTER) {
        obstacles.push([rowIndex, colIndex]);
      }

      if (character === GUARD_STARTING_POINT_CHARACTER) {
        guardPosition = [rowIndex, colIndex];
      }
    })
  });

  return [guardPosition, obstacles];
};

const moveUp: MoveFn = (matrix: string[][]) => {
  let [guardPosition, obstacles] = findMapElements(matrix);
  let nextObstacle: Coordinate | null = null;

  for (const obstacle of obstacles) {
    if (
      obstacle[1] !== guardPosition[1]
      || obstacle[0] > guardPosition[0]
    ) {
      //We don't need obstacles in different column or below the guard
      continue;
    }

    if (!nextObstacle) {
      nextObstacle = obstacle;

      continue;
    }

    if (obstacle[0] > nextObstacle[0]) {
      //If we find obstacle which is closer to guard than previous obstacle
      //This is the closer obstacle
      nextObstacle = obstacle
    }
  }

  for (let row = guardPosition[0] - 1; row > (nextObstacle?.[0] ?? -2); row--) {
    //New guard position
    guardPosition = [row, guardPosition[1]];

    //If guard is off the map, we don't set the guard mark
    if (guardPosition[0] > 0) {
      matrix[guardPosition[0]][guardPosition[1]] = GUARD_STARTING_POINT_CHARACTER;
    }

    //Mark met field
    matrix[guardPosition[0] + 1][guardPosition[1]] = MET_POSITION_CHARACTER;
  }
}

const moveDown: MoveFn = (matrix: string[][]) => {
  let [guardPosition, obstacles] = findMapElements(matrix);
  let nextObstacle: Coordinate | null = null;

  for (const obstacle of obstacles) {
    if (
      obstacle[1] !== guardPosition[1]
      || obstacle[0] < guardPosition[0]
    ) {
      //We don't need obstacles in different column or above the guard
      continue;
    }

    if (!nextObstacle) {
      nextObstacle = obstacle;

      continue;
    }

    if (obstacle[0] < nextObstacle[0]) {
      //If we find obstacle which is closer to guard than previous obstacle
      //This is the closer obstacle
      nextObstacle = obstacle
    }
  }

  for (let row = guardPosition[0] + 1; row < (nextObstacle?.[0] ?? matrix.length + 1); row++) {
    //New guard position
    guardPosition = [row, guardPosition[1]];

    //If guard is off the map, we don't set the guard mark
    if (guardPosition[0] < matrix.length) {
      matrix[guardPosition[0]][guardPosition[1]] = GUARD_STARTING_POINT_CHARACTER;
    }

    //Mark met field
    matrix[guardPosition[0] - 1][guardPosition[1]] = MET_POSITION_CHARACTER;
  }
}

const moveRight: MoveFn = (matrix: string[][]) => {
  let [guardPosition, obstacles] = findMapElements(matrix);
  let nextObstacle: Coordinate | null = null;

  for (const obstacle of obstacles) {
    if (
      obstacle[0] !== guardPosition[0]
      || obstacle[1] < guardPosition[1]
    ) {
      //We don't need obstacles in different rows or on the left side of the guard
      continue;
    }

    if (!nextObstacle) {
      nextObstacle = obstacle;

      continue;
    }

    if (obstacle[1] < nextObstacle[1]) {
      //If we find obstacle which is closer to guard than previous obstacle
      //This is the closer obstacle
      nextObstacle = obstacle
    }
  }

  for (let col = guardPosition[1] + 1; col < (nextObstacle?.[1] ?? matrix[guardPosition[0]].length + 1); col++) {
    //New guard position
    guardPosition = [guardPosition[0], col];

    //If guard is off the map, we don't set the guard mark
    if (guardPosition[1] < matrix[guardPosition[0]].length) {
      matrix[guardPosition[0]][guardPosition[1]] = GUARD_STARTING_POINT_CHARACTER;
    }

    //Mark met field
    matrix[guardPosition[0]][guardPosition[1] - 1] = MET_POSITION_CHARACTER;
  }
}

const moveLeft: MoveFn = (matrix: string[][]) => {
  let [guardPosition, obstacles] = findMapElements(matrix);
  let nextObstacle: Coordinate | null = null;

  for (const obstacle of obstacles) {
    if (
      obstacle[0] !== guardPosition[0]
      || obstacle[1] > guardPosition[1]
    ) {
      //We don't need obstacles in different rows or on the right side of the guard
      continue;
    }

    if (!nextObstacle) {
      nextObstacle = obstacle;

      continue;
    }

    if (obstacle[1] > nextObstacle[1]) {
      //If we find obstacle which is closer to guard than previous obstacle
      //This is the closer obstacle
      nextObstacle = obstacle
    }
  }

  for (let col = guardPosition[1] - 1; col > (nextObstacle?.[1] ?? -2); col--) {
    //New guard position
    guardPosition = [guardPosition[0], col];

    //If guard is off the map, we don't set the guard mark
    if (guardPosition[1] >= 0) {
      matrix[guardPosition[0]][guardPosition[1]] = GUARD_STARTING_POINT_CHARACTER;
    }

    //Mark met field
    matrix[guardPosition[0]][guardPosition[1] + 1] = MET_POSITION_CHARACTER;
  }
}

const getNextMove = (previousDirection: Directions): [Directions, MoveFn] => {
  switch (previousDirection) {
    case Directions.UP:
      return [Directions.RIGHT, moveRight];

    case Directions.RIGHT:
      return [Directions.DOWN, moveDown];

    case Directions.DOWN:
      return [Directions.LEFT, moveLeft];

    case Directions.LEFT:
      return [Directions.UP, moveUp];
  }
};

const countDistinctPositions = (matrix: string[][]): number => R.pipe(
  R.flatten,
  R.countBy(R.identity),
  R.prop(MET_POSITION_CHARACTER),
  R.defaultTo(0)
)(matrix);
