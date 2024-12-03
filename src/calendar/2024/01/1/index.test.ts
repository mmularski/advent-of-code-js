import path from 'node:path';
import { exec } from '.';
import { readFileSync } from 'node:fs';

describe('Unit: 2024 | Day - 01 | Star - 1', () => {
  test('Passes global example', async () => {
    const expectedAnswer = Number(readFileSync(
      path.join(__dirname, 'example-answer.txt'),
      'utf-8'
    ));
    const result = await exec('example.txt');

    expect(result).toEqual(expectedAnswer);
  });
});
