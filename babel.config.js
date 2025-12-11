module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            // your other plugins would go here (if any)require.resolve('expo-router/babel'),
            [
                'module-resolver',
                {
                    root: ['.'],
                    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
                    alias: {
                        '@src': './src',
                        '@screens': './src/screens',
                        '@components': './src/components',
                        '@state': './src/state',
                        '@core': './src/core',
                        '@hooks': './src/hooks',
                    },
                },
            ],
            'react-native-worklets/plugin', // MUST be last
        ],
    };
};
