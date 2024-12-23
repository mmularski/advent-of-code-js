import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  transformIgnorePatterns: ['<rootDir>/dist'],
  testMatch: ['<rootDir>/src/calendar/**/*.test.{js,mjs,cjs,ts}'],
};

export default config;