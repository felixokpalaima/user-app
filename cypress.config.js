const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000', // Adjust this as necessary for your API server
    supportFile: false,
    video: false, // Set to true if you find videos helpful, false otherwise
    setupNodeEvents(on, config) {
      // Here you can configure plugins if necessary (like retry plugins, etc.)
    },
    specPattern: 'cypress/integration/**/*.js' // Ensures Cypress looks for tests in the integration folder
  }
});

