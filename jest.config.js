/**
 * Jest config for Expo + React Native Testing Library.
 *
 * The preset is required directly rather than via `preset: 'jest-expo'`
 * because Jest's preset resolution can fail to find it in some workspace
 * layouts. Requiring it ourselves sidesteps that and makes the merge explicit.
 *
 * Version note: `jest-expo`'s major tracks the **Expo SDK**, not Jest. SDK 54
 * pairs with `jest-expo@~54`, which is built on the Jest 29 line. Installing
 * `jest-expo@latest` alongside `jest@latest` mixes runtimes and fails with
 * errors like `this._moduleMocker.clearMocksOnScope is not a function`.
 */
const expoPreset = require('jest-expo/jest-preset');

module.exports = {
  ...expoPreset,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Expo and RN ship untranspiled ESM; these must go through babel.
  transformIgnorePatterns: [
    'node_modules/(?!(?:.pnpm/)?((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|native-base|react-native-svg))',
  ],
  moduleNameMapper: {
    ...(expoPreset.moduleNameMapper || {}),
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
  collectCoverageFrom: ['lib/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}'],
};
