import { defineConfig } from 'cypress';
import webpackPreprocessor from '@cypress/webpack-preprocessor';

export default defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.cy.{js,ts}',
    baseUrl: 'http://localhost:4200',
    setupNodeEvents(on, config) {
      // Wire in the Webpack preprocessor with your Cypress tsconfig
      const options = {
        webpackOptions: {
          resolve: {
            extensions: ['.ts', '.js'],
          },
          module: {
            rules: [
              {
                test: /\.ts$/,
                exclude: [/node_modules/],
                use: [
                  {
                    loader: 'ts-loader',
                    options: {
                      configFile: 'cypress/tsconfig.json',
                    },
                  },
                ],
              },
            ],
          },
        },
        watchOptions: {},
      };

      on('file:preprocessor', webpackPreprocessor(options));
      return config;
    },
  },
});
