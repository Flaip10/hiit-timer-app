module.exports = {
    preset: 'jest-expo',
    clearMocks: true,
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native|react-native|expo(nent)?|@expo(nent)?/.*|@expo/.*|@unimodules/.*|unimodules|sentry-expo|native-base|zustand|immer|nanoid))',
    ],
    moduleNameMapper: {
        '^@src/(.*)$': '<rootDir>/src/$1',
        '^@screens/(.*)$': '<rootDir>/src/screens/$1',
        '^@components/(.*)$': '<rootDir>/src/components/$1',
        '^@state/(.*)$': '<rootDir>/src/state/$1',
        '^@core/(.*)$': '<rootDir>/src/core/$1',
        '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
        '^@assets/(.*)$': '<rootDir>/assets/$1',
    },
};
