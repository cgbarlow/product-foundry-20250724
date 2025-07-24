/**
 * Jest Test Setup
 * QA Engineer: Global test configuration and utilities
 */

const chalk = require('chalk');

// Global test utilities
global.testUtils = {
  // Mock console methods for testing
  mockConsole() {
    const originalConsole = { ...console };
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
    console.info = jest.fn();
    return originalConsole;
  },
  
  // Restore console
  restoreConsole(originalConsole) {
    Object.assign(console, originalConsole);
  },
  
  // Wait for async operations
  async wait(ms = 100) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  
  // Create mock game state
  createMockGameState() {
    return {
      currentLocation: 'living_room',
      inventory: ['phone', 'keys'],
      gameProgress: {
        introComplete: true,
        chaptersCompleted: 0,
        achievements: []
      },
      character: {
        name: 'Player',
        health: 100,
        energy: 100
      },
      ravi: {
        mood: 'sarcastic',
        relationship: 50,
        knownFacts: ['player_name']
      }
    };
  },
  
  // Create mock command input
  createMockCommand(command, args = []) {
    return {
      command,
      args,
      rawInput: `${command} ${args.join(' ')}`.trim(),
      timestamp: Date.now()
    };
  }
};

// Global test constants
global.testConstants = {
  TIMEOUT: {
    SHORT: 1000,
    MEDIUM: 5000,
    LONG: 10000
  },
  
  GAME_COMMANDS: [
    'look', 'go', 'north', 'south', 'east', 'west',
    'inventory', 'take', 'drop', 'use', 'talk',
    'help', 'save', 'load', 'quit'
  ],
  
  LOCATIONS: [
    'living_room', 'kitchen', 'bedroom', 'office',
    'garden', 'basement', 'attic'
  ],
  
  RAVI_MOODS: [
    'sarcastic', 'helpful', 'annoyed', 'excited',
    'philosophical', 'dramatic'
  ]
};

// Enhanced matchers for game testing
expect.extend({
  toBeValidGameState(received) {
    const required = ['currentLocation', 'inventory', 'gameProgress'];
    const missing = required.filter(key => !(key in received));
    
    if (missing.length > 0) {
      return {
        message: () => `Expected valid game state but missing: ${missing.join(', ')}`,
        pass: false
      };
    }
    
    return {
      message: () => 'Expected invalid game state',
      pass: true
    };
  },
  
  toBeValidCommand(received) {
    const hasCommand = received && typeof received.command === 'string';
    const hasArgs = Array.isArray(received.args);
    
    if (!hasCommand || !hasArgs) {
      return {
        message: () => 'Expected valid command object with command string and args array',
        pass: false
      };
    }
    
    return {
      message: () => 'Expected invalid command object',
      pass: true
    };
  },
  
  toHaveRaviResponse(received) {
    const hasResponse = received && typeof received === 'string' && received.length > 0;
    
    if (!hasResponse) {
      return {
        message: () => 'Expected Ravi to have a response',
        pass: false
      };
    }
    
    return {
      message: () => 'Expected Ravi to have no response',
      pass: true
    };
  }
});

// Suppress console output during tests unless debugging
if (!process.env.DEBUG_TESTS) {
  console.log = jest.fn();
  console.info = jest.fn();
  console.warn = jest.fn();
}

// Test environment setup
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset module registry to ensure clean imports
  jest.resetModules();
});

afterEach(() => {
  // Clean up any test artifacts
  jest.restoreAllMocks();
});

// Global error handling for tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Test performance monitoring
const testStartTimes = new Map();

beforeEach(() => {
  const testName = expect.getState().currentTestName;
  testStartTimes.set(testName, Date.now());
});

afterEach(() => {
  const testName = expect.getState().currentTestName;
  const startTime = testStartTimes.get(testName);
  if (startTime) {
    const duration = Date.now() - startTime;
    if (duration > 5000) {
      console.warn(chalk.yellow(`⚠️  Slow test detected: ${testName} took ${duration}ms`));
    }
    testStartTimes.delete(testName);
  }
});

console.log(chalk.green('🧪 Test environment initialized by QA Engineer'));