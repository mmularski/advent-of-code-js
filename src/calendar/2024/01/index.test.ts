import path from 'node:path';
import { exec as starOne } from './starOne';
import { exec as starTwo } from './starTwo';
import { readFileSync } from 'node:fs';

describe('Unit: 2024 | Day - 01', () => {
  test('Star 1 passes global example', async () => {
    const expectedAnswer = Number(readFileSync(
      path.join(__dirname, 'answer-1.txt'),
      'utf-8'
    ));
    const result = await starOne('example.txt');

    expect(result).toEqual(expectedAnswer);
  });

  test('Star 2 passes global example', async () => {
    const expectedAnswer = Number(readFileSync(
      path.join(__dirname, 'answer-2.txt'),
      'utf-8'
    ));
    const result = await starTwo('example.txt');

    expect(result).toEqual(expectedAnswer);
  });
});
