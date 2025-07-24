/**
 * Test Helper Utilities
 * QA Engineer: Shared testing utilities and helpers
 */

const chalk = require('chalk');

/**
 * Advanced test utilities for game testing
 */
class GameTestHelpers {
  constructor() {
    this.mockConsole = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn()
    };
  }
  
  // Game state generators
  generateRandomGameState() {
    const locations = ['living_room', 'kitchen', 'bedroom', 'office', 'garden'];
    const items = ['key', 'book', 'coffee', 'phone', 'remote', 'notebook'];
    
    return {
      currentLocation: locations[Math.floor(Math.random() * locations.length)],
      inventory: this.getRandomSubset(items, Math.floor(Math.random() * 4)),
      gameProgress: {
        introComplete: Math.random() > 0.5,
        chaptersCompleted: Math.floor(Math.random() * 5),
        achievements: this.getRandomSubset(['first_steps', 'explorer', 'chatty'], 2)
      },
      character: {
        name: 'TestPlayer',
        health: Math.floor(Math.random() * 100) + 1,
        energy: Math.floor(Math.random() * 100) + 1
      },
      ravi: {
        mood: this.getRandomMood(),
        relationship: Math.floor(Math.random() * 100),
        knownFacts: this.getRandomSubset(['player_name', 'favorite_color', 'goal'], 2)
      }
    };
  }
  
  getRandomSubset(array, maxCount) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(maxCount, array.length));
  }
  
  getRandomMood() {
    const moods = ['sarcastic', 'helpful', 'annoyed', 'excited', 'philosophical', 'dramatic'];
    return moods[Math.floor(Math.random() * moods.length)];
  }
  
  // Command generators
  generateRandomCommand() {
    const commands = ['look', 'go', 'take', 'drop', 'inventory', 'help'];
    const directions = ['north', 'south', 'east', 'west'];
    const items = ['key', 'book', 'coffee', 'phone'];
    
    const command = commands[Math.floor(Math.random() * commands.length)];
    let args = [];
    
    switch (command) {
      case 'go':
        args = [directions[Math.floor(Math.random() * directions.length)]];
        break;
      case 'take':
      case 'drop':
        args = [items[Math.floor(Math.random() * items.length)]];
        break;
      case 'look':
        if (Math.random() > 0.5) {
          args = ['around', 'carefully'][Math.floor(Math.random() * 2)];
        }
        break;
    }
    
    return {
      command,
      args,
      rawInput: `${command} ${args.join(' ')}`.trim(),
      timestamp: Date.now()
    };
  }
  
  generateCommandSequence(length = 10) {
    return Array.from({ length }, () => this.generateRandomCommand());
  }
  
  // Validation helpers
  validateGameStateIntegrity(state) {
    const errors = [];
    
    // Required fields
    const requiredFields = ['currentLocation', 'inventory', 'gameProgress'];
    requiredFields.forEach(field => {
      if (!(field in state)) {
        errors.push(`Missing required field: ${field}`);
      }
    });
    
    // Type checks
    if (state.inventory && !Array.isArray(state.inventory)) {
      errors.push('Inventory must be an array');
    }
    
    if (state.gameProgress && typeof state.gameProgress !== 'object') {
      errors.push('Game progress must be an object');
    }
    
    // Value validation
    if (state.character) {
      if (state.character.health < 0 || state.character.health > 100) {
        errors.push('Character health must be between 0 and 100');
      }
      if (state.character.energy < 0 || state.character.energy > 100) {
        errors.push('Character energy must be between 0 and 100');
      }
    }
    
    if (state.ravi) {
      if (state.ravi.relationship < 0 || state.ravi.relationship > 100) {
        errors.push('Ravi relationship must be between 0 and 100');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  validateCommand(command) {
    const errors = [];
    
    if (!command || typeof command !== 'object') {
      errors.push('Command must be an object');
      return { isValid: false, errors };
    }
    
    if (typeof command.command !== 'string') {
      errors.push('Command must have a string command field');
    }
    
    if (!Array.isArray(command.args)) {
      errors.push('Command must have an args array');
    }
    
    if (command.rawInput && typeof command.rawInput !== 'string') {
      errors.push('Raw input must be a string');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Performance testing
  async measurePerformance(operation, iterations = 100) {
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = process.hrtime.bigint();
      await operation();
      const end = process.hrtime.bigint();
      times.push(Number(end - start) / 1000000); // Convert to milliseconds
    }
    
    return {
      iterations,
      min: Math.min(...times),
      max: Math.max(...times),
      avg: times.reduce((a, b) => a + b, 0) / times.length,
      median: times.sort((a, b) => a - b)[Math.floor(times.length / 2)],
      p95: times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)]
    };
  }
  
  async measureMemoryUsage(operation) {
    const before = process.memoryUsage();
    await operation();
    const after = process.memoryUsage();
    
    return {
      heapUsedDelta: after.heapUsed - before.heapUsed,
      heapTotalDelta: after.heapTotal - before.heapTotal,
      externalDelta: after.external - before.external,
      rss: after.rss
    };
  }
  
  // Data generators for stress testing
  generateLargeInventory(size = 1000) {
    return Array.from({ length: size }, (_, i) => `item_${i}_${Date.now()}`);
  }
  
  generateComplexGameState(complexity = 'medium') {
    const base = this.generateRandomGameState();
    
    switch (complexity) {
      case 'simple':
        return base;
      
      case 'medium':
        base.inventory = this.generateLargeInventory(50);
        base.gameProgress.achievements = this.generateLargeInventory(20);
        return base;
      
      case 'complex':
        base.inventory = this.generateLargeInventory(500);
        base.gameProgress.achievements = this.generateLargeInventory(100);
        base.ravi.knownFacts = this.generateLargeInventory(200);
        base.customData = {
          deepNesting: {
            level1: { level2: { level3: this.generateLargeInventory(100) } }
          }
        };
        return base;
      
      default:
        return base;
    }
  }
  
  // Assertion helpers
  expectValidGameResponse(response) {
    expect(response).toBeDefined();
    expect(typeof response === 'string' || typeof response === 'object').toBe(true);
    
    if (typeof response === 'string') {
      expect(response.length).toBeGreaterThan(0);
    }
    
    return response;
  }
  
  expectPerformanceWithin(actualMs, expectedMaxMs, operation = 'operation') {
    if (actualMs > expectedMaxMs) {
      console.warn(chalk.yellow(
        `⚠️  Performance warning: ${operation} took ${actualMs}ms (expected < ${expectedMaxMs}ms)`
      ));
    }
    expect(actualMs).toBeLessThan(expectedMaxMs * 1.5); // Allow 50% tolerance
  }
  
  expectMemoryWithin(actualBytes, expectedMaxBytes, operation = 'operation') {
    if (actualBytes > expectedMaxBytes) {
      console.warn(chalk.yellow(
        `⚠️  Memory warning: ${operation} used ${actualBytes} bytes (expected < ${expectedMaxBytes} bytes)`
      ));
    }
    expect(actualBytes).toBeLessThan(expectedMaxBytes * 2); // Allow 100% tolerance for memory
  }
  
  // Mock setup helpers
  setupMockConsole() {
    const original = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };
    
    console.log = this.mockConsole.log;
    console.error = this.mockConsole.error;
    console.warn = this.mockConsole.warn;
    console.info = this.mockConsole.info;
    
    return () => {
      console.log = original.log;
      console.error = original.error;
      console.warn = original.warn;
      console.info = original.info;
    };
  }
  
  setupGameEnvironment() {
    // Setup test environment with all necessary mocks
    const cleanupTasks = [];
    
    // Mock console
    cleanupTasks.push(this.setupMockConsole());
    
    // Mock timers if needed
    if (jest.useFakeTimers) {
      jest.useFakeTimers();
      cleanupTasks.push(() => jest.useRealTimers());
    }
    
    // Return cleanup function
    return () => {
      cleanupTasks.forEach(cleanup => cleanup());
    };
  }
  
  // Debugging helpers
  logGameState(gameEngine, label = 'Game State') {
    if (process.env.DEBUG_TESTS) {
      console.log(chalk.blue(`\n🎮 ${label}:`));
      console.log(JSON.stringify(gameEngine.getState(), null, 2));
    }
  }
  
  logRaviStats(ravi, label = 'Ravi Stats') {
    if (process.env.DEBUG_TESTS) {
      console.log(chalk.magenta(`\n🤖 ${label}:`));
      console.log(JSON.stringify(ravi.getStats(), null, 2));
    }
  }
  
  logPerformanceMetrics(metrics, label = 'Performance') {
    if (process.env.DEBUG_TESTS) {
      console.log(chalk.green(`\n⚡ ${label}:`));
      console.log(`Iterations: ${metrics.iterations}`);
      console.log(`Average: ${metrics.avg.toFixed(2)}ms`);
      console.log(`Min: ${metrics.min.toFixed(2)}ms`);
      console.log(`Max: ${metrics.max.toFixed(2)}ms`);
      console.log(`95th percentile: ${metrics.p95.toFixed(2)}ms`);
    }
  }
}

// Export singleton instance
const gameTestHelpers = new GameTestHelpers();

module.exports = {
  GameTestHelpers,
  gameTestHelpers,
  
  // Direct exports for convenience
  generateRandomGameState: () => gameTestHelpers.generateRandomGameState(),
  generateRandomCommand: () => gameTestHelpers.generateRandomCommand(),
  validateGameState: (state) => gameTestHelpers.validateGameStateIntegrity(state),
  measurePerformance: (op, iterations) => gameTestHelpers.measurePerformance(op, iterations),
  expectValidGameResponse: (response) => gameTestHelpers.expectValidGameResponse(response),
  expectPerformanceWithin: (actual, expected, op) => gameTestHelpers.expectPerformanceWithin(actual, expected, op)
};