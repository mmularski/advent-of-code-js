import { createReadStream } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import * as R from 'ramda';

type Equation = [number, number[]];

export async function exec(fileName: string): Promise<number> {
  let sum = 0;

  const filePath = path.join(__dirname, fileName);
  const input = createReadStream(filePath);

  const rl = readline.createInterface({
    input,
    crlfDelay: Infinity,
  });

  const equations: Equation[] = [];

  for await (const line of rl) {
    const lineSplit = line.split(':');
    const lineResult = Number(lineSplit[0]);
    const numbers = lineSplit[1].trimStart().split(' ').map(R.pipe(R.trim, Number));

    equations.push([lineResult, numbers]);
  }

  const permutationMap = getOperatorsPermutationMap(equations);

  for (const equation of equations) {
    const resultOfEquation = equation[0];
    const numbers = equation[1];
    const operatorPermutations = permutationMap.get(numbers.length)!;

    for (const operators of operatorPermutations) {
      let tempEquationResult = numbers[0];

      for (let index = 1; index < numbers.length; index++) {
        tempEquationResult = performOperation(tempEquationResult, numbers[index], operators[index - 1]);

        if (tempEquationResult > resultOfEquation) {
          break;
        }
      }

      if (tempEquationResult === resultOfEquation) {
        sum += resultOfEquation;

        break;
      }
    }
  }

  return sum;
};

const getOperatorsPermutationMap = (equations: Equation[]) => {
  const permutationMap = new Map<number, string[][]>();
  const equationsLengths = R.map(R.pipe(
    R.nth(1) as (x: Equation) => number[],
    R.defaultTo<number[]>([]),
    R.length
  ))(equations);

  for (const length of equationsLengths) {
    if (permutationMap.has(length)) {
      continue;
    }

    permutationMap.set(length, generateOperatorPermutations(length));
  }

  return permutationMap;
};

const generateOperatorPermutations = (numbersLength: number) => {
  const symbols = ['+', '*', '||'];
  const result: string[][] = [];

  const backtrack = (currentList: string[]) => {
    if (currentList.length === (numbersLength - 1)) {
      result.push(R.clone(currentList));

      return;
    }

    for (const symbol of symbols) {
      currentList.push(symbol);
      backtrack(currentList);
      currentList.pop();
    }
  }

  backtrack([]);

  return result;
}

const performOperation = (number1: number, number2: number, operator: string) => {
  switch (operator) {
    case '||':
      return Number(`${String(number1)}${String(number2)}`);

    case '*':
      return number1 * number2;

    case '+':
      return number1 + number2;
  }

  return 0;
};
