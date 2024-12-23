import path from 'node:path';
import * as R from 'ramda';
import { createReadStream } from 'node:fs';
import readline from 'node:readline/promises';
import inquirer from 'inquirer';

type Coordinate = [number, number];
type Velocity = Coordinate;
type RobotMeta = [Coordinate, Velocity];

const MAX_WIDE = 101;
const MAX_TALL = 103;

const robots: RobotMeta[] = [];
const map = R.times(() => R.repeat('.', MAX_WIDE), MAX_TALL);

export async function exec(fileName: string): Promise<number> {
  const filePath = path.join(__dirname, fileName);
  const input = createReadStream(filePath);

  const rl = readline.createInterface({
    input,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const matches = line.matchAll(/p=(-?\d+,-?\d+)\s+v=(-?\d+,-?\d+)/g);

    Array.from(matches).map((matchRegexp) => {
      const [_, pos, vel] = matchRegexp;

      const position = pos.split(',').map(Number) as Coordinate;
      const velocity = vel.split(',').map(Number) as [number, number];

      robots.push([position, velocity]);
    });
  }

  printMatrix(placeRobots(R.clone(map), robots));
  let isEasterEggVisible = await askIsEasterEgg();

  for (let second = 1; !isEasterEggVisible.isEaster; second++) {
    for (let robotIndex = 0; robotIndex < robots.length; robotIndex++) {
      moveRobot(robotIndex, robots[robotIndex]);
    }

    // Manually looked through some snapshots and seems like there is a some sort of "cycle"
    // or formation every 103 seconds(starting from 121 second)
    if ((second - 121) % 103 === 0) {
      console.log(`second #${second} snapshot`);
      printMatrix(placeRobots(R.clone(map), robots));

      isEasterEggVisible = await askIsEasterEgg()

      if (isEasterEggVisible.isEaster) {
        return second;
      }
    }
  }

  return 0;
};

const placeRobots = (map: string[][], robots: RobotMeta[]) => {
  for (const [index, robot] of robots.entries()) {
    const coord = robot[0];

    map[coord[1]][coord[0]] = 'x';
  }

  return map;
}

const printMatrix = (matrix: string[][]) => {
  matrix.map((row) => console.log(row.join('')));

  console.log('\n');
}

const moveRobot = (index: number, robot: RobotMeta): Coordinate => {
  const start = robot[0];
  const velocity = robot[1];

  let x = start[0] + velocity[0];

  if (x >= MAX_WIDE) {
    x -= MAX_WIDE;
  }

  if (x < 0) {
    x += MAX_WIDE;
  }

  let y = start[1] + velocity[1];

  if (y >= MAX_TALL) {
    y -= MAX_TALL;
  }

  if (y < 0) {
    y += MAX_TALL;
  }

  //Set new position to robots meta
  robots[index][0] = [x, y];

  return [x, y];
}

const askIsEasterEgg = async () => {
  return inquirer.prompt([
    {
      type: 'confirm',
      name: 'isEaster',
      message: 'Is an Easter Egg visible?',
      default: false
    },
  ]);
};
