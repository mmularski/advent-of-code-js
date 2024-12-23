import { createReadStream } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';

const ROBOT_MARKER = '@';
const WALL_MARKER = '#';
const BOX_MARKER = 'O';
const EMPTY_MARKER = '.';

const DIRECTION_UP = '^';
const DIRECTION_DOWN = 'v';
const DIRECTION_LEFT = '<';
const DIRECTION_RIGHT = '>';

type Coordinate = [number, number];

export async function exec(fileName: string): Promise<number> {
  const filePath = path.join(__dirname, fileName);
  const input = createReadStream(filePath);

  const rl = readline.createInterface({
    input,
    crlfDelay: Infinity,
  });

  const map: string[][] = [];
  const moves: string[] = [];

  let isMapInput = true;

  for await (const line of rl) {
    if (!line) {
      isMapInput = false
    }

    if (isMapInput) {
      map.push(line.split(''));
    } else {
      moves.push(...line.split(''));
    }
  }

  let robotPosition: Coordinate = getRobotPosition(map);

  //printMatrix(map);

  for (const move of moves) {
    //console.log(`Move [${move}]`);

    robotPosition = moveRobot(map, robotPosition, move);

    //printMatrix(map);
  }

  let result = 0;

  const boxes = getBoxesPosition(map);

  for (const boxPosition of boxes) {
    result += (boxPosition[0] * 100) + boxPosition[1];
  }

  return result;
}

const moveRobot = (map: string[][], robotPosition: Coordinate, direction: string) => {
  if (direction === DIRECTION_RIGHT) {
    moveRight(map, robotPosition);
  }

  if (direction === DIRECTION_LEFT) {
    moveLeft(map, robotPosition);
  }

  if (direction === DIRECTION_DOWN) {
    moveDown(map, robotPosition);
  }

  if (direction === DIRECTION_UP) {
    moveUp(map, robotPosition);
  }

  robotPosition = getRobotPosition(map);

  return robotPosition;
};

const moveRight = (map: string[][], robotPosition: Coordinate) => {
  let nearestSpace: Coordinate = [-1, -1];
  const boxes: string[] = [ROBOT_MARKER];

  //Standard move
  if (map[robotPosition[0]][robotPosition[1] + 1] === EMPTY_MARKER) {
    map[robotPosition[0]][robotPosition[1] + 1] = ROBOT_MARKER;
    map[robotPosition[0]][robotPosition[1]] = EMPTY_MARKER;

    return;
  }

  //Pushing boxes logic

  //We scan map till the nearest wall
  for (let col = robotPosition[1] + 1; col < map[robotPosition[0]].length; col++) {
    const field = map[robotPosition[0]][col];

    if (field === BOX_MARKER) {
      boxes.push(field);
    }

    if (field === WALL_MARKER) {
      nearestSpace = [robotPosition[0], col];
      break;
    }

    if (field === EMPTY_MARKER) {
      nearestSpace = [robotPosition[0], col + 1];
      break;
    }
  }

  //Going backwards from the nearest wall, apply changes
  for (let col = nearestSpace[1] - 1; col >= robotPosition[1]; col--) {
    const itemFromBoxes = boxes.pop();

    map[robotPosition[0]][col] = itemFromBoxes ? itemFromBoxes : EMPTY_MARKER;
  }
};

const moveUp = (map: string[][], robotPosition: Coordinate) => {
  let nearestSpace: Coordinate = [-1, -1];
  const boxes: string[] = [ROBOT_MARKER];

  //Standard move
  if (map[robotPosition[0] - 1][robotPosition[1]] === EMPTY_MARKER) {
    map[robotPosition[0] - 1][robotPosition[1]] = ROBOT_MARKER;
    map[robotPosition[0]][robotPosition[1]] = EMPTY_MARKER;

    return;
  }

  //Pushing boxes logic

  // Scan map upwards until the nearest space(or wall)
  for (let row = robotPosition[0] - 1; row >= 0; row--) {
    const field = map[row][robotPosition[1]];

    if (field === BOX_MARKER) {
      boxes.push(field);
    }

    if (field === WALL_MARKER) {
      nearestSpace = [row, robotPosition[1]];
      break;
    }

    if (field === EMPTY_MARKER) {
      nearestSpace = [row - 1, robotPosition[1]];
      break;
    }
  }

  // Go backwards from the nearest space and apply changes
  for (let row = nearestSpace[0] + 1; row <= robotPosition[0]; row++) {
    const itemFromBoxes = boxes.pop();

    map[row][robotPosition[1]] = itemFromBoxes ? itemFromBoxes : EMPTY_MARKER;
  }
};

const moveDown = (map: string[][], robotPosition: Coordinate) => {
  let nearestSpace: Coordinate = [-1, -1];
  const boxes: string[] = [ROBOT_MARKER];

  //Standard move
  if (map[robotPosition[0] + 1][robotPosition[1]] === EMPTY_MARKER) {
    map[robotPosition[0] + 1][robotPosition[1]] = ROBOT_MARKER;
    map[robotPosition[0]][robotPosition[1]] = EMPTY_MARKER;

    return;
  }

  //Pushing boxes logic

  // Scan map downwards until the nearest wall
  for (let row = robotPosition[0] + 1; row < map.length; row++) {
    const field = map[row][robotPosition[1]];

    if (field === BOX_MARKER) {
      boxes.push(field);
    }

    if (field === WALL_MARKER) {
      nearestSpace = [row, robotPosition[1]];
      break;
    }

    if (field === EMPTY_MARKER) {
      nearestSpace = [row + 1, robotPosition[1]];
      break;
    }
  }

  // Go backwards from the nearest wall and apply changes
  for (let row = nearestSpace[0] - 1; row >= robotPosition[0]; row--) {
    const itemFromBoxes = boxes.pop();

    map[row][robotPosition[1]] = itemFromBoxes ? itemFromBoxes : EMPTY_MARKER;
  }
};

const moveLeft = (map: string[][], robotPosition: Coordinate) => {
  let nearestSpace: Coordinate = [-1, -1];
  const boxes: string[] = [ROBOT_MARKER];

  //Standard move
  if (map[robotPosition[0]][robotPosition[1] - 1] === EMPTY_MARKER) {
    map[robotPosition[0]][robotPosition[1] - 1] = ROBOT_MARKER;
    map[robotPosition[0]][robotPosition[1]] = EMPTY_MARKER;

    return;
  }

  //Pushing boxes logic

  // Scan map to the left until the nearest wall
  for (let col = robotPosition[1] - 1; col >= 0; col--) {
    const field = map[robotPosition[0]][col];

    if (field === BOX_MARKER) {
      boxes.push(field);
    }

    if (field === WALL_MARKER) {
      nearestSpace = [robotPosition[0], col];
      break;
    }

    if (field === EMPTY_MARKER) {
      nearestSpace = [robotPosition[0], col - 1];
      break;
    }
  }

  // Go backwards from the nearest wall and apply changes
  for (let col = nearestSpace[1] + 1; col <= robotPosition[1]; col++) {
    const itemFromBoxes = boxes.pop();

    map[robotPosition[0]][col] = itemFromBoxes ? itemFromBoxes : EMPTY_MARKER;
  }
};

const getRobotPosition = (map: string[][]): Coordinate => {
  //Map is surrounded by walls
  for (let row = 1; row < map.length - 1; row++) {
    for (let col = 1; col < map[row].length - 1; col++) {
      if (map[row][col] === ROBOT_MARKER) {
        return [row, col];
      }
    }
  }

  return [-1, -1];
};

const getBoxesPosition = (map: string[][]): Coordinate[] => {
  const boxes: Coordinate[] = [];

  //Map is surrounded by walls
  for (let row = 1; row < map.length - 1; row++) {
    for (let col = 1; col < map[row].length - 1; col++) {
      if (map[row][col] === BOX_MARKER) {
        boxes.push([row, col]);
      }
    }
  }

  return boxes;
};

const printMatrix = (matrix: string[][]) => {
  matrix.map((row) => console.log(row.join(' ')));

  console.log('\n');
};
