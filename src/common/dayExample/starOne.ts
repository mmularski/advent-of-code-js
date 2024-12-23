import { readFile } from 'node:fs/promises';
import path from 'node:path';

export async function exec(fileName: string): Promise<number> {
  const filePath = path.join(__dirname, fileName);
  const input = (await readFile(filePath)).toString();

  const result = 0;

  return result;
}
