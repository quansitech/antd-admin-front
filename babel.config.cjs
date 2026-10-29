module.exports = {
    presets: [
        [
            require.resolve('@umijs/babel-preset-umi'),
            {
                pluginDynamicImportNode: true,
                presetEnv: { modules: 'commonjs' },
            },
        ],
    ],
};
