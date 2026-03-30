const { createCjsPreset } = require('jest-preset-angular/presets');

module.exports = {
  ...createCjsPreset({
    tsconfig: '<rootDir>/tsconfig.jest.json',
  }),
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/projects/**/src/**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'html', 'js', 'json', 'mjs'],
  moduleNameMapper: {
    '^@angular-architects/native-federation$': '<rootDir>/test/mocks/native-federation.mock.ts',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/'],
};
