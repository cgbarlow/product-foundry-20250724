/**
 * Performance Test Suite
 * QA Engineer: Testing game performance and resource usage
 */

const MockGameEngine = require('./mocks/game-engine.mock');
const MockRavi = require('./mocks/ravi.mock');
const { gameTestHelpers } = require('./utils/test-helpers');

describe('Performance Testing', () => {
  let gameEngine;
  let ravi;
  
  beforeEach(() => {
    gameEngine = new MockGameEngine();
    ravi = new MockRavi(gameEngine);
    gameEngine.setCharacter(ravi);
  });
  
  describe('Command Processing Performance', () => {
    test('should process commands within performance thresholds', async () => {
      const metrics = await gameTestHelpers.measurePerformance(async () => {
        const command = testUtils.createMockCommand('look');
        await gameEngine.processCommand(command);
      }, 100);
      
      gameTestHelpers.logPerformanceMetrics(metrics, 'Command Processing');
      
      expect(metrics.avg).toBeLessThan(5); // Average under 5ms
      expect(metrics.p95).toBeLessThan(10); // 95th percentile under 10ms
      expect(metrics.max).toBeLessThan(50); // No command over 50ms
    });
    
    test('should handle rapid command sequences efficiently', async () => {
      const commands = Array.from({ length: 1000 }, (_, i) => 
        testUtils.createMockCommand('look', [`iteration_${i}`])
      );
      
      const startTime = Date.now();
      
      for (const command of commands) {
        await gameEngine.processCommand(command);
      }
      
      const totalTime = Date.now() - startTime;
      const avgTimePerCommand = totalTime / commands.length;
      
      gameTestHelpers.expectPerformanceWithin(totalTime, 1000, '1000 commands');
      expect(avgTimePerCommand).toBeLessThan(1); // Under 1ms per command on average
    });
    
    test('should maintain performance with complex game states', async () => {
      // Create complex game state
      const complexState = gameTestHelpers.generateComplexGameState('complex');
      gameEngine.setState(complexState);
      
      const metrics = await gameTestHelpers.measurePerformance(async () => {
        await gameEngine.processCommand(testUtils.createMockCommand('inventory'));
      }, 50);
      
      expect(metrics.avg).toBeLessThan(10); // Even with complex state, under 10ms average
    });
  });
  
  describe('Memory Usage Performance', () => {
    test('should not leak memory during normal gameplay', async () => {
      const memoryUsage = await gameTestHelpers.measureMemoryUsage(async () => {
        // Simulate extended gameplay
        for (let i = 0; i < 500; i++) {
          await gameEngine.processCommand(testUtils.createMockCommand('look'));
          gameEngine.addToInventory(`item_${i}`);
          ravi.generateResponse({ command: 'test' });
          
          // Occasionally clear some items to simulate normal gameplay
          if (i % 50 === 0) {
            gameEngine.setState({ inventory: [] });
          }
        }
      });
      
      gameTestHelpers.expectMemoryWithin(
        memoryUsage.heapUsedDelta, 
        10 * 1024 * 1024, // 10MB limit
        'Extended gameplay'
      );
      
      expect(memoryUsage.heapUsedDelta).toBeLessThan(50 * 1024 * 1024); // Hard limit: 50MB
    });
    
    test('should handle large inventories efficiently', async () => {
      const largeInventory = gameTestHelpers.generateLargeInventory(10000);
      
      const memoryUsage = await gameTestHelpers.measureMemoryUsage(async () => {
        largeInventory.forEach(item => gameEngine.addToInventory(item));
        
        // Test inventory operations
        await gameEngine.processCommand(testUtils.createMockCommand('inventory'));
        gameEngine.hasInInventory(largeInventory[5000]);
        gameEngine.removeFromInventory(largeInventory[0]);
      });
      
      expect(memoryUsage.heapUsedDelta).toBeLessThan(100 * 1024 * 1024); // Under 100MB for 10k items
    });
    
    test('should efficiently manage Ravi knowledge base', async () => {
      const memoryUsage = await gameTestHelpers.measureMemoryUsage(async () => {
        // Add many facts to Ravi's knowledge
        for (let i = 0; i < 5000; i++) {
          ravi.learnFact(`fact_${i}_${Date.now()}`);
        }
        
        // Test knowledge operations
        ravi.knowsFact('fact_2500');
        ravi.getKnownFacts();
      });
      
      expect(memoryUsage.heapUsedDelta).toBeLessThan(20 * 1024 * 1024); // Under 20MB for 5k facts
    });
  });
  
  describe('Response Time Performance', () => {
    test('should generate Ravi responses quickly', async () => {
      const metrics = await gameTestHelpers.measurePerformance(() => {
        ravi.generateResponse({ command: 'test', gameState: gameEngine.getState() });
      }, 1000);
      
      expect(metrics.avg).toBeLessThan(1); // Under 1ms average
      expect(metrics.max).toBeLessThan(5); // No response over 5ms
    });
    
    test('should handle mood changes efficiently', async () => {
      const moods = ['sarcastic', 'helpful', 'annoyed', 'excited', 'philosophical', 'dramatic'];
      
      const metrics = await gameTestHelpers.measurePerformance(() => {
        const randomMood = moods[Math.floor(Math.random() * moods.length)];
        ravi.setMood(randomMood);
        ravi.generateResponse({ command: 'test' });
      }, 500);
      
      expect(metrics.avg).toBeLessThan(2); // Under 2ms for mood change + response
    });
    
    test('should scale well with relationship complexity', async () => {
      // Build up complex relationship state
      for (let i = 0; i < 1000; i++) {
        ravi.adjustRelationship(Math.random() > 0.5 ? 1 : -1);
        ravi.learnFact(`relationship_fact_${i}`);
      }
      
      const metrics = await gameTestHelpers.measurePerformance(() => {
        ravi.generateResponse({ command: 'test' });
        ravi.getStats();
      }, 100);
      
      expect(metrics.avg).toBeLessThan(3); // Should remain under 3ms even with complex state
    });
  });
  
  describe('Save/Load Performance', () => {
    test('should save game state efficiently', async () => {
      // Create substantial game state
      for (let i = 0; i < 1000; i++) {
        gameEngine.addToInventory(`item_${i}`);
        ravi.learnFact(`fact_${i}`);
      }
      
      const metrics = await gameTestHelpers.measurePerformance(async () => {
        await gameEngine.saveGame('performance_test');
      }, 10);
      
      expect(metrics.avg).toBeLessThan(100); // Under 100ms average for large saves
      expect(metrics.max).toBeLessThan(500); // No save over 500ms
    });
    
    test('should load game state efficiently', async () => {
      // Save a large game state first
      for (let i = 0; i < 1000; i++) {
        gameEngine.addToInventory(`item_${i}`);
      }
      await gameEngine.saveGame('large_state');
      
      const metrics = await gameTestHelpers.measurePerformance(async () => {
        await gameEngine.resetGame();
        await gameEngine.loadGame('large_state');
      }, 10);
      
      expect(metrics.avg).toBeLessThan(100); // Under 100ms average for large loads
    });
  });
  
  describe('Concurrent Operations Performance', () => {
    test('should handle simultaneous operations efficiently', async () => {
      const startTime = Date.now();
      
      // Simulate multiple operations happening simultaneously
      const promises = [];
      
      for (let i = 0; i < 50; i++) {
        promises.push(gameEngine.processCommand(testUtils.createMockCommand(`look_${i}`)));
        promises.push(Promise.resolve(ravi.generateResponse({ command: `test_${i}` })));
        promises.push(Promise.resolve(gameEngine.addToInventory(`item_${i}`)));
      }
      
      await Promise.all(promises);
      
      const totalTime = Date.now() - startTime;
      expect(totalTime).toBeLessThan(1000); // All concurrent operations under 1 second
    });
    
    test('should maintain performance under load', async () => {
      // Stress test with many rapid operations
      const operations = [];
      
      for (let i = 0; i < 200; i++) {
        operations.push(async () => {
          await gameEngine.processCommand(testUtils.createMockCommand('look'));
          ravi.generateResponse({ command: 'stress' });
          gameEngine.moveToLocation(['living_room', 'kitchen', 'bedroom'][i % 3]);
          ravi.adjustRelationship(Math.random() > 0.5 ? 1 : -1);
        });
      }
      
      const startTime = Date.now();
      await Promise.all(operations.map(op => op()));
      const totalTime = Date.now() - startTime;
      
      expect(totalTime).toBeLessThan(2000); // 200 complex operations under 2 seconds
    });
  });
  
  describe('Scaling Performance', () => {
    test('should scale linearly with inventory size', async () => {
      const inventorySizes = [100, 500, 1000, 2000];
      const timings = [];
      
      for (const size of inventorySizes) {
        await gameEngine.resetGame();
        
        // Add items
        for (let i = 0; i < size; i++) {
          gameEngine.addToInventory(`item_${i}`);
        }
        
        // Measure inventory operation time
        const startTime = Date.now();
        await gameEngine.processCommand(testUtils.createMockCommand('inventory'));
        const endTime = Date.now();
        
        timings.push(endTime - startTime);
      }
      
      // Check that timing doesn't increase exponentially
      const ratio1to2 = timings[1] / timings[0];
      const ratio2to3 = timings[2] / timings[1];
      const ratio3to4 = timings[3] / timings[2];
      
      // Ratios shouldn't increase dramatically (allowing for some variance)
      expect(ratio2to3).toBeLessThan(ratio1to2 * 3);
      expect(ratio3to4).toBeLessThan(ratio2to3 * 3);
    });
    
    test('should scale well with knowledge base size', async () => {
      const factCounts = [100, 500, 1000, 2000];
      const timings = [];
      
      for (const count of factCounts) {
        ravi.resetStats();
        
        // Add facts
        for (let i = 0; i < count; i++) {
          ravi.learnFact(`scaling_fact_${i}`);
        }
        
        // Measure knowledge operation time
        const startTime = Date.now();
        ravi.knowsFact(`scaling_fact_${Math.floor(count / 2)}`); // Search middle
        ravi.getKnownFacts();
        const endTime = Date.now();
        
        timings.push(endTime - startTime);
      }
      
      // Knowledge operations should remain fast regardless of size
      timings.forEach((timing, index) => {
        expect(timing).toBeLessThan(10); // Each operation under 10ms
      });
    });
  });
  
  describe('Resource Cleanup Performance', () => {
    test('should clean up resources efficiently on reset', async () => {
      // Create substantial state
      for (let i = 0; i < 5000; i++) {
        gameEngine.addToInventory(`cleanup_item_${i}`);
        ravi.learnFact(`cleanup_fact_${i}`);
        await gameEngine.processCommand(testUtils.createMockCommand(`command_${i}`));
      }
      
      const resetTime = await gameTestHelpers.measurePerformance(async () => {
        await gameEngine.resetGame();
        ravi.resetStats();
      }, 1);
      
      expect(resetTime.avg).toBeLessThan(50); // Reset should be fast even with large state
      
      // Verify clean state
      expect(gameEngine.getState().inventory).toEqual([]);
      expect(ravi.getKnownFacts()).toEqual([]);
      expect(gameEngine.getCommandHistory()).toEqual([]);
    });
    
    test('should handle memory cleanup during garbage collection', async () => {
      let beforeMemory, afterMemory;
      
      // Create and destroy many objects
      for (let cycle = 0; cycle < 10; cycle++) {
        if (cycle === 0) {
          beforeMemory = process.memoryUsage();
        }
        
        // Create temporary state
        for (let i = 0; i < 1000; i++) {
          const tempEngine = new MockGameEngine();
          const tempRavi = new MockRavi(tempEngine);
          tempEngine.setCharacter(tempRavi);
          
          for (let j = 0; j < 100; j++) {
            tempEngine.addToInventory(`temp_${i}_${j}`);
            tempRavi.generateResponse({ command: 'temp' });
          }
        }
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }
      
      afterMemory = process.memoryUsage();
      const memoryGrowth = afterMemory.heapUsed - beforeMemory.heapUsed;
      
      // Memory growth should be reasonable (under 50MB for this test)
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024);
    });
  });
  
  describe('Edge Case Performance', () => {
    test('should handle edge case inputs efficiently', async () => {
      const edgeCases = [
        '',
        ' '.repeat(1000),
        'a'.repeat(10000),
        null,
        undefined,
        '\\'.repeat(100),
        '"'.repeat(100),
        '\n'.repeat(100)
      ];
      
      for (const edgeCase of edgeCases) {
        const startTime = Date.now();
        
        try {
          const command = testUtils.createMockCommand(edgeCase || 'fallback');
          await gameEngine.processCommand(command);
          ravi.generateResponse({ command: edgeCase });
        } catch (err) {
          // Expected for some edge cases
        }
        
        const endTime = Date.now();
        expect(endTime - startTime).toBeLessThan(100); // Even edge cases under 100ms
      }
    });
    
    test('should maintain performance with corrupted state', async () => {
      // Intentionally corrupt game state
      gameEngine.setState({
        currentLocation: null,
        inventory: 'not_an_array',
        gameProgress: null,
        character: { invalid: 'structure' }
      });
      
      // Should still handle commands reasonably quickly
      const metrics = await gameTestHelpers.measurePerformance(async () => {
        try {
          await gameEngine.processCommand(testUtils.createMockCommand('look'));
        } catch (err) {
          // Expected with corrupted state
        }
      }, 10);
      
      expect(metrics.avg).toBeLessThan(20); // Even with corrupted state, under 20ms
    });
  });
});