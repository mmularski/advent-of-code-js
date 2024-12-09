import { readFile } from 'node:fs/promises';
import path from 'node:path';
import * as R from 'ramda';

const GUARD_STARTING_POINT_CHARACTER = '^';
const OBSTACLE_CHARACTER = '#';
const MET_POSITION_CHARACTER = 'X';
const MAP_VOID_FIELD = '.';

type Coordinate = [number, number];
type MoveFn = (matrix: string[][]) => void;
type MovementAction = [Coordinate, Directions];

enum Directions {
  UP,
  DOWN,
  RIGHT,
  LEFT
};

let movementLog: MovementAction[] = [];
let guardPosition: Coordinate;
let obstacles: Coordinate[];

export async function exec(fileName: string): Promise<number> {
  let result = 0;

  const filePath = path.join(__dirname, fileName);
  const input = (await readFile(filePath)).toString();

  const matrix = input.split('\n').map(R.split(''));

  for (let row = 0; row < matrix.length; row++) {

    for (let col = 0; col < matrix[row].length; col++) {
      //We don't change already placed obstacles/guard position
      if (matrix[row][col] !== MAP_VOID_FIELD) {
        continue;
      }

      const tempMatrix = R.clone(matrix);
      tempMatrix[row][col] = OBSTACLE_CHARACTER;
      [guardPosition, obstacles] = findMapElements(tempMatrix);
      movementLog = [];

      //First move is always Up
      moveUp(tempMatrix)
      let lastMove = Directions.UP;

      //Execute moves until the guard will be off the map or
      while (R.and(
        R.allPass([R.is(Number), R.gte(R.__, 0), R.lt(R.__, tempMatrix.length)])(guardPosition[0]),
        R.allPass([R.is(Number), R.gte(R.__, 0), R.lt(R.__, tempMatrix[row].length)])(guardPosition[1])
      )) {
        if(isGuardInLoop(guardPosition, lastMove)){
          result++;
          break;
        }

        movementLog.push([guardPosition, lastMove]);

        const [nextDirection, nextDirectionFn] = getNextMove(lastMove);

        nextDirectionFn(tempMatrix);
        lastMove = nextDirection;
      }
    }
  }

  return result;
};

const isGuardInLoop = (guardPosition: Coordinate, lastMove: Directions) => R.any(
  R.equals([guardPosition, lastMove]),
  movementLog
);

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
