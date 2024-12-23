import { createReadStream } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';

const ROBOT_MARKER = '@';
const WALL_MARKER = '#';
const BOX_MARKER = 'O';
const EMPTY_MARKER = '.';

const BOX_LEFT_MARKER = '[';
const BOX_RIGHT_MARKER = ']';

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

  const scaledMap = scaleMap(map);

  let robotPosition: Coordinate = getRobotPosition(scaledMap);

   printMatrix(scaledMap);

  for (const move of moves) {
    console.log(`Move [${move}]`);

    robotPosition = moveRobot(scaledMap, robotPosition, move);

    printMatrix(scaledMap);
  }

  //printMatrix(scaledMap);

  let result = 0;

  const boxes = getBoxesPosition(scaledMap);

  for (const boxPosition of boxes) {
    result += (boxPosition[0] * 100) + boxPosition[1];
  }

  return result;
}

const scaleMap = (map: string[][]): string[][] => {
  const scaledMap: string[][] = [];

  for (const row of map) {
    const scaledRow: string[] = [];

    for (const tile of row) {
      if (tile === WALL_MARKER) {
        scaledRow.push(WALL_MARKER, WALL_MARKER); // ##
      } else if (tile === BOX_MARKER) {
        scaledRow.push(BOX_LEFT_MARKER, BOX_RIGHT_MARKER); // []
      } else if (tile === EMPTY_MARKER) {
        scaledRow.push(EMPTY_MARKER, EMPTY_MARKER); // ..
      } else if (tile === ROBOT_MARKER) {
        scaledRow.push(ROBOT_MARKER, EMPTY_MARKER); // @.
      }
    }

    scaledMap.push(scaledRow);
  }

  return scaledMap;
};

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

    if ([BOX_LEFT_MARKER, BOX_RIGHT_MARKER].includes(field)) {
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

const canMoveUp = (map: string[][], from: Coordinate, to: Coordinate): boolean => {
  const [fromRow, fromCol] = from;
  const [_, toCol] = to;

  // Iterate through the columns in the range [fromCol, toCol]
  for (let col = fromCol; col <= toCol; col++) {
    const aboveField = map[fromRow - 1][col]; // Check the field in the row above

    if (aboveField === WALL_MARKER) {
      return false;
    }

    if ([BOX_LEFT_MARKER, BOX_RIGHT_MARKER].includes(aboveField)) {
      // If there's a box, determine its full range in the row above
      let boxStart = col;
      let boxEnd = col;

      // Expand left to find the start of the connected boxes
      while (boxStart > 0 && map[fromRow - 1][boxStart - 1] === BOX_LEFT_MARKER) {
        boxStart -= 1;
      }

      // Expand right to find the end of the connected boxes
      while (boxEnd < map[fromRow - 1].length - 1 && map[fromRow - 1][boxEnd + 1] === BOX_RIGHT_MARKER) {
        boxEnd += 1;
      }

      // Check recursively if this range of boxes can move up
      if (!canMoveUp(map, [fromRow - 1, boxStart], [fromRow - 1, boxEnd])) {
        return false;
      }

      // Skip the already-checked box range
      col = boxEnd;
    } else if (aboveField !== EMPTY_MARKER) {
      // If the field is neither empty nor a box, return false
      return false;
    }
  }

  return true;
};

const moveBoxesUp = (map: string[][], from: Coordinate, to: Coordinate) => {
  const [fromRow, fromCol] = from;
  const [_, toCol] = to;

  // Iterate through the columns in the range [fromCol, toCol]
  for (let col = fromCol; col <= toCol; col++) {
    const aboveField = map[fromRow - 1][col]; // Check the field in the row above

    if (aboveField === WALL_MARKER) {
      return;
    }

    if ([BOX_LEFT_MARKER, BOX_RIGHT_MARKER].includes(aboveField)) {
      // If there's a box, determine its full range in the row above
      let boxStart = col;
      let boxEnd = col;

      // Expand left to find the start of the connected boxes
      while (
        boxStart > 0 &&
        boxStart >= fromCol && // Stop expanding if we go outside the "from" range
        // [BOX_LEFT_MARKER, BOX_RIGHT_MARKER].includes(map[fromRow - 1][boxStart - 1])
        map[fromRow - 1][boxEnd - 1] === BOX_LEFT_MARKER && // Check if it's part of the same group
        map[fromRow - 1][boxEnd] === BOX_RIGHT_MARKER // Ensure left-right pair integrity
      ) {
        boxStart -= 1;
      }

      // Expand right to find the end of the connected boxes
      while (
        boxEnd < map[fromRow - 1].length - 1 &&
        boxEnd <= toCol && // Stop expanding if we go outside the "to" range
        map[fromRow - 1][boxEnd + 1] === BOX_RIGHT_MARKER && // Check if it's part of the same group
        map[fromRow - 1][boxEnd] === BOX_LEFT_MARKER // Ensure left-right pair integrity
      ) {
        boxEnd += 1;
      }

      // Check recursively if this range of boxes can move up
      moveBoxesUp(map, [fromRow - 1, boxStart], [fromRow - 1, boxEnd]);

      // Skip the already-checked box range
      col = boxEnd;
    } else if (aboveField !== EMPTY_MARKER) {
      // If the field is neither empty nor a box, return false
      return;
    }
  }

  // Apply movement for the current range [fromCol, toCol]
  for (let col = from[1]; col <= to[1]; col++) {
    map[from[0] - 1][col] = map[from[0]][col];
    map[from[0]][col] = EMPTY_MARKER;
  }
};

const moveUp = (map: string[][], robotPosition: Coordinate) => {
  //Standard move
  if (map[robotPosition[0] - 1][robotPosition[1]] === EMPTY_MARKER) {
    map[robotPosition[0] - 1][robotPosition[1]] = ROBOT_MARKER;
    map[robotPosition[0]][robotPosition[1]] = EMPTY_MARKER;

    return;
  }

  //Pushing boxes logic

  const moveUpPossible = canMoveUp(map, robotPosition, robotPosition);

  if (!moveUpPossible) {
    return;
  }

  moveBoxesUp(map, robotPosition, robotPosition);
};

const canMoveDown = (map: string[][], from: Coordinate, to: Coordinate): boolean => {
  const [fromRow, fromCol] = from;
  const [_, toCol] = to;

  // Iterate through the columns in the range [fromCol, toCol]
  for (let col = fromCol; col <= toCol; col++) {
    const belowField = map[fromRow + 1][col]; // Check the field in the row below

    if (belowField === WALL_MARKER) {
      return false;
    }

    if ([BOX_LEFT_MARKER, BOX_RIGHT_MARKER].includes(belowField)) {
      // If there's a box, determine its full range in the row below
      let boxStart = col;
      let boxEnd = col;

      // Expand left to find the start of the connected boxes
      while (boxStart > 0 && map[fromRow + 1][boxStart - 1] === BOX_LEFT_MARKER) {
        boxStart -= 1;
      }

      // Expand right to find the end of the connected boxes
      while (boxEnd < map[fromRow + 1].length - 1 && map[fromRow + 1][boxEnd + 1] === BOX_RIGHT_MARKER) {
        boxEnd += 1;
      }

      // Check recursively if this range of boxes can move down
      if (!canMoveDown(map, [fromRow + 1, boxStart], [fromRow + 1, boxEnd])) {
        return false;
      }

      // Skip the already-checked box range
      col = boxEnd;
    } else if (belowField !== EMPTY_MARKER) {
      // If the field is neither empty nor a box, return false
      return false;
    }
  }

  return true;
};

const moveBoxesDown = (map: string[][], from: Coordinate, to: Coordinate) => {
  const [fromRow, fromCol] = from;
  const [_, toCol] = to;

  // Iterate through the columns in the range [fromCol, toCol]
  for (let col = fromCol; col <= toCol; col++) {
    const belowField = map[fromRow + 1][col]; // Check the field in the row below

    if (belowField === WALL_MARKER) {
      return;
    }

    if ([BOX_LEFT_MARKER, BOX_RIGHT_MARKER].includes(belowField)) {
      // If there's a box, determine its full range in the row below
      let boxStart = col;
      let boxEnd = col;

      // Expand left to find the start of the connected boxes
      while (
        boxStart > 0 &&
        boxStart >= fromCol && // Stop expanding if we go outside the "from" range
        // [BOX_LEFT_MARKER, BOX_RIGHT_MARKER].includes(map[fromRow + 1][boxStart - 1])
        map[fromRow + 1][boxEnd - 1] === BOX_LEFT_MARKER && // Check if it's part of the same group
        map[fromRow + 1][boxEnd] === BOX_RIGHT_MARKER // Ensure left-right pair integrity
      ) {
        boxStart -= 1;
      }

      // Expand right to find the end of the connected boxes
      while (
        boxEnd < map[fromRow + 1].length - 1 &&
        boxEnd <= toCol && // Stop expanding if we go outside the "to" range
        map[fromRow + 1][boxEnd + 1] === BOX_RIGHT_MARKER && // Check if it's part of the same group
        map[fromRow + 1][boxEnd] === BOX_LEFT_MARKER // Ensure left-right pair integrity
      ) {
        boxEnd += 1;
      }

      // Check recursively if this range of boxes can move down
      moveBoxesDown(map, [fromRow + 1, boxStart], [fromRow + 1, boxEnd]);

      // Skip the already-checked box range
      col = boxEnd;
    } else if (belowField !== EMPTY_MARKER) {
      // If the field is neither empty nor a box, return;
      return;
    }
  }

  // Apply movement for the current range [fromCol, toCol]
  for (let col = from[1]; col <= to[1]; col++) {
    map[from[0] + 1][col] = map[from[0]][col];
    map[from[0]][col] = EMPTY_MARKER;
  }
};


const moveDown = (map: string[][], robotPosition: Coordinate) => {
  //Standard move
  if (map[robotPosition[0] + 1][robotPosition[1]] === EMPTY_MARKER) {
    map[robotPosition[0] + 1][robotPosition[1]] = ROBOT_MARKER;
    map[robotPosition[0]][robotPosition[1]] = EMPTY_MARKER;

    return;
  }

  //Pushing boxes logic

  const moveDownPossible = canMoveDown(map, robotPosition, robotPosition);

  if (!moveDownPossible) {
    return;
  }

  // Move the boxes down
  moveBoxesDown(map, robotPosition, robotPosition);
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

    if ([BOX_LEFT_MARKER, BOX_RIGHT_MARKER].includes(field)) {
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
      if (map[row][col] === BOX_LEFT_MARKER) {
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
