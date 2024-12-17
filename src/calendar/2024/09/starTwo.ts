import { readFile } from 'node:fs/promises';
import path from 'node:path';
import * as R from 'ramda';

export async function exec(fileName: string): Promise<number> {
  const filePath = path.join(__dirname, fileName);
  const input = (await readFile(filePath)).toString();

  let result = 0;
  const tempParts: string[] = [];

  for (let i = 0, number = 0; i < input.length; i++) {
    if (i % 2 === 0) {
      const repeated = R.repeat(number, Number(input.at(i))).map(String);

      tempParts.push(...repeated);
      number++;
    } else {
      tempParts.push(...'.'.repeat(Number(input.at(i))).split(''));
    }
  }

  for (let fileID = tempParts.length; fileID >= 0; fileID--) {
    let fileSize = 0;

    for (let i = 0; i < tempParts.length; i++) {
      if (tempParts[i] === String(fileID)) {
        fileSize++;

        if (i === tempParts.length - 1 || tempParts[i + 1] !== String(fileID)) {
          const spaceIndex = findSpaceForFile(tempParts, fileSize);

          if (spaceIndex !== -1 && spaceIndex < i) {
            tempParts.splice(spaceIndex, fileSize, ...R.repeat(String(fileID), fileSize));
            tempParts.splice(i - fileSize + 1, fileSize, ...R.repeat('.', fileSize));

            i = spaceIndex + fileSize - 1;
          }

          fileSize = 0;
        }
      }
    }
  }

  for (let multiplier = 0; multiplier < tempParts.length; multiplier++) {
    if (tempParts[multiplier] !== '.') {
      result += multiplier * Number(tempParts[multiplier]);
    }
  }

  return result;
}

const findSpaceForFile = (list: string[], fileSize: number): number => {
  let dotSpaces = 0;

  for (let i = 0; i < list.length; i++) {
    if (list[i] === '.') {
      dotSpaces++;
    } else {
      dotSpaces = 0;
    }

    if (dotSpaces === fileSize) {
      return i - dotSpaces + 1;
    }
  }

  return -1;
};
