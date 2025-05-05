module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine', 'karma-typescript'],
        files: [
            { pattern: 'src/**/*.ts' }
        ],
        preprocessors: {
            '**/*.ts': ['karma-typescript']
        },
        reporters: ['progress', 'karma-typescript'],
        browsers: ['Chrome'],
        singleRun: true,
        karmaTypescriptConfig: {
            tsconfig: './tsconfig.spec.json'
        }
    });
};