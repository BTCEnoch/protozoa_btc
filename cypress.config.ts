// @ts-ignore - Cypress types are not properly recognized
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // Use the Cypress file server
    baseUrl: null,
    specPattern: 'src/tests/e2e/**/*.test.ts',
    supportFile: 'src/tests/e2e/support/index.ts',
    videosFolder: 'src/tests/e2e/videos',
    screenshotsFolder: 'src/tests/e2e/screenshots',
    fixturesFolder: 'src/tests/e2e/fixtures',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    video: true,
    screenshotOnRunFailure: true,
    chromeWebSecurity: false,
    experimentalStudio: true,
    retries: {
      runMode: 2,
      openMode: 0
    },
    // @ts-ignore - Parameters are required by Cypress
    setupNodeEvents(on: any, config: any) {
      // implement node event listeners here
      return config;
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'src/tests/component/**/*.test.{js,jsx,ts,tsx}',
    supportFile: 'src/tests/component/support/index.ts',
  },
});
