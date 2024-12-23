import path from 'node:path';
import { createReadStream } from 'node:fs';
import readline from 'node:readline/promises';

type Coordinate = [number, number];
type Velocity = Coordinate;
type RobotMeta = [Coordinate, Velocity];

const MAX_WIDE = 11//101;
const MAX_TALL = 7//103;

const robots: RobotMeta[] = [];

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

  for (let second = 1; second <= 100; second++) {
    for(let robotIndex = 0; robotIndex<robots.length; robotIndex++){
      moveRobot(robotIndex, robots[robotIndex]);
    }
  }

  return calculateSafetyFactor(robots);
};

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

const calculateSafetyFactor = (robots: RobotMeta[]): number => {
  const middleX = Math.floor(MAX_WIDE / 2);
  const middleY = Math.floor(MAX_TALL / 2);

  const quadrants = { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 };

  for (const [position] of robots) {
    const [x, y] = position;

    // Exclude robots on the middle lines
    if (x === middleX || y === middleY) continue;

    if (x < middleX && y < middleY) {
      quadrants.topLeft++;
    } else if (x >= middleX && y < middleY) {
      quadrants.topRight++;
    } else if (x < middleX && y >= middleY) {
      quadrants.bottomLeft++;
    } else if (x >= middleX && y >= middleY) {
      quadrants.bottomRight++;
    }
  }

  return (
    quadrants.topLeft *
    quadrants.topRight *
    quadrants.bottomLeft *
    quadrants.bottomRight
  );
};