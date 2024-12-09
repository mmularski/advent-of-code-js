import { createReadStream } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import * as R from 'ramda';

type Coordinate = [number, number];

export async function exec(fileName: string): Promise<number> {
  let result = 0;
  const filePath = path.join(__dirname, fileName);
  const input = createReadStream(filePath);

  const rl = readline.createInterface({
    input,
    crlfDelay: Infinity,
  });

  const matrix: string[][] = [];
  const letterCoordinates = new Map<string, Coordinate[]>();

  const antinodesCords: Coordinate[] = [];

  for await (const line of rl) {
    matrix.push(line.split(''));
  }

  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      const coordValue = matrix[row][col];

      if (coordValue === '.') {
        continue;
      }

      const coordinate: Coordinate = [row, col];

      letterCoordinates.set(coordValue, [...(letterCoordinates.get(coordValue) ?? []), coordinate]);
    }
  }

  let index = 0;
  for (const coords of letterCoordinates.values()) {
    console.log(index);
    index++;

    result += coords.length > 1 ? coords.length : 0;

    for (let coord1Index = 0; coord1Index < coords.length; coord1Index++) {
      for (let coord2Index = 0; coord2Index < coords.length; coord2Index++) {
        if (coord1Index === coord2Index) {
          continue;
        }

        let coord1 = coords[coord1Index];
        let coord2 = coords[coord2Index];

        let [antinodeRow, antinodeCol] = calculateNearestAntinodeCord(coord1, coord2)

        while (antinodeRow >= 0 &&
          antinodeRow < matrix.length &&
          antinodeCol >= 0 &&
          antinodeCol < matrix[antinodeRow].length) {
          if (
            R.intersection(antinodesCords, [[antinodeRow, antinodeCol]]).length === 0
            && matrix[antinodeRow][antinodeCol] === '.'
          ) {
            antinodesCords.push([antinodeRow, antinodeCol]);

            //ToDo
            matrix[antinodeRow][antinodeCol] = '#';
          }
          const tempCoord = coord1;
          coord1 = [antinodeRow, antinodeCol];
          coord2 = tempCoord;

          [antinodeRow, antinodeCol] = calculateNearestAntinodeCord(coord1, coord2);
        }
      }
    }
  }

  result += antinodesCords.length;

  return result;
}

const calculateNearestAntinodeCord = (coord1: Coordinate, coord2: Coordinate): Coordinate => {
  const antinodeRow = coord1[0] - coord2[0] > 0 ?
    coord1[0] + Math.abs(coord1[0] - coord2[0]) :
    coord1[0] - Math.abs(coord1[0] - coord2[0]);

  const antinodeCol = coord1[1] - coord2[1] > 0 ?
    coord1[1] + Math.abs(coord1[1] - coord2[1]) :
    coord1[1] - Math.abs(coord1[1] - coord2[1]);

  return [antinodeRow, antinodeCol];
};

// const getDistanceBetweenCords = (coord1: Coordinate, coord2: Coordinate): [number, number] => {
//   return [
//     Math.abs(coord1[0] - coord2[0]),
//     Math.abs(coord1[1]) - coord2[1]
//   ];
// }