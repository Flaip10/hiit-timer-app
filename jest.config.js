module.exports = {
    preset: 'jest-expo',
    testMatch: [
        '<rootDir>/tests/**/*.test.ts',
        '<rootDir>/tests/**/*.test.tsx',
    ],
    moduleNameMapper: {
        '^@src/(.*)$': '<rootDir>/src/$1',
        '^expo-modules-core/(.*)$':
            '<rootDir>/node_modules/expo/node_modules/expo-modules-core/$1',
        '^expo-modules-core$':
            '<rootDir>/node_modules/expo/node_modules/expo-modules-core',
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    watchman: false,
};
