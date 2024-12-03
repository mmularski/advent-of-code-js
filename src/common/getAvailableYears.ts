import { readdir } from 'node:fs/promises';
import path from 'node:path';

export const getAvailableYears = async () => {
  const directories = await readdir(
    path.join(__dirname, '.././calendar'),
    {
      encoding: 'utf-8',
      recursive: false,
      withFileTypes: false
    }
  );

  return directories;
};
