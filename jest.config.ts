import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  transformIgnorePatterns: ['<rootDir>/dist'],
  testMatch: ['<rootDir>/**/*.spec.{js,mjs,cjs,ts}', '<rootDir>/**/*.test.{js,mjs,cjs,ts}'],
};

export default config;