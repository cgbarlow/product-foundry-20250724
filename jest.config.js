/**
 * Jest Configuration for Ravi's Adventure
 * QA Engineer: Comprehensive testing setup with coverage and reporting
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Root directory
  rootDir: '.',
  
  // Test directories
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'text-summary', 
    'html',
    'lcov',
    'json'
  ],
  
  // Coverage thresholds - Epic requirement: 90%+
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/game-engine.js': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    },
    './src/command-parser.js': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/story-engine.js': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  
  // Files to collect coverage from
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js', // Entry point - tested via integration
    '!src/**/*.config.js',
    '!src/**/*.mock.js'
  ],
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.js'
  ],
  
  // Module paths
  moduleDirectories: [
    'node_modules',
    'src'
  ],
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output for debugging
  verbose: true,
  
  // Handle ES6 modules if needed
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Mock file extensions
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  
  // Error handling
  errorOnDeprecated: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true
};