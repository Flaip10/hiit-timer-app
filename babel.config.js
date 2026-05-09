module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            ['inline-import', { extensions: ['.sql'] }],
            [
                'module-resolver',
                {
                    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
                    alias: {
                        '@assets': './assets',
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
