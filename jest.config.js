/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        // Source is ESM-authored; compile to CJS for jest.
        module: 'commonjs',
        esModuleInterop: true,
      },
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // `server-only` throws when imported outside a React Server Component
    // graph. It exists to fail the build if server code leaks into a client
    // bundle, and has no runtime behaviour worth exercising here.
    '^server-only$': '<rootDir>/__mocks__/serverOnly.js',
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/fileMock.js',
  },
};

module.exports = config;
