module.exports = {
    extends: ['@react-native'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
    },
    rules: {
        // Core discipline
        'func-style': ['error', 'expression'],
        'react/function-component-definition': [
            'error',
            {
                namedComponents: 'arrow-function',
                unnamedComponents: 'arrow-function',
            },
        ],

        // Type safety & correctness
        '@typescript-eslint/no-unused-vars': [
            'warn',
            { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unnecessary-condition': 'error',
        '@typescript-eslint/no-unnecessary-type-assertion': 'error',
        '@typescript-eslint/switch-exhaustiveness-check': 'error',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/consistent-type-imports': [
            'error',
            { prefer: 'type-imports' },
        ],

        // Optional but recommended
        '@typescript-eslint/prefer-nullish-coalescing': 'error',
        '@typescript-eslint/prefer-optional-chain': 'error',

        // React
        'react-hooks/exhaustive-deps': 'error',
    },

    overrides: [
        {
            // Don’t run typed linting on config / JS files
            files: ['*.js', '*.cjs', '*.mjs'],
            parser: 'espree',
            parserOptions: { ecmaVersion: 'latest', sourceType: 'script' },
            rules: {
                '@typescript-eslint/consistent-type-imports': 'off',
                '@typescript-eslint/no-unnecessary-condition': 'off',
                '@typescript-eslint/no-unnecessary-type-assertion': 'off',
                '@typescript-eslint/switch-exhaustiveness-check': 'off',
                '@typescript-eslint/no-floating-promises': 'off',
                '@typescript-eslint/prefer-nullish-coalescing': 'off',
                '@typescript-eslint/prefer-optional-chain': 'off',
            },
        },
    ],
};
