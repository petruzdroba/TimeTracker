module.exports = function(config) {
  config.set({
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    files: [
      { pattern: 'src/**/*.spec.ts', watched: false }
    ],
    exclude: [
      'cypress/**/*.ts',   // ignore Cypress
      'src/**/*.cy.ts'
    ],
    preprocessors: {
      'src/**/*.spec.ts': ['webpack', 'sourcemap']
    },
    // …rest of your existing Karma setup
  });
};
