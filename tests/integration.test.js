/**
 * Integration Test Suite - PRODUCTION CODE ONLY
 * End-to-end gameplay testing with real implementations
 */

const RealGameEngine = require('../src/real-game-engine')
const CommandParserSync = require('../src/command-parser-sync')

// Test utilities
const testUtils = {
  createMockCommand: (command, args = []) => ({
    command,
    args
  })
}

let gameEngine, commandParser

beforeEach(async () => {
  gameEngine = new RealGameEngine()
  await gameEngine.initialize()
  commandParser = new CommandParserSync(gameEngine)
})

afterEach(async () => {
  if (gameEngine) {
    gameEngine.stop()
  }
})

describe('Integration: Complete Gameplay Flow', () => {
  describe('Game Engine Initialization', () => {
    test('should initialize game engine successfully', async () => {
      expect(gameEngine.getState().isRunning).toBe(true)
      expect(gameEngine.getCurrentLocation().key).toBe('start')
    })

    test('should start with default player state', async () => {
      const state = gameEngine.getGameState()
      
      expect(state.playerName).toBe('Anonymous Adventurer')
      expect(state.inventory).toEqual([])
      expect(state.stats.health).toBe(100)
      expect(state.stats.energy).toBe(100)
      expect(state.stats.mood).toBe('curious')
    })
  })

  describe('Complete User Journey: New Player', () => {
    test('should handle complete new player experience', async () => {
      // New player starts the game
      expect(gameEngine.getState().isRunning).toBe(true)
      
      // Player looks around
      let response = await gameEngine.processCommand(testUtils.createMockCommand('look'))
      expect(response).toContain('cozy digital space')
      
      // Player checks inventory (empty)
      response = await gameEngine.processCommand(testUtils.createMockCommand('inventory'))
      expect(response).toContain('empty')
      
      // Player takes an item
      response = await gameEngine.processCommand(testUtils.createMockCommand('take', ['mysterious', 'key']))
      expect(response).toContain('You took')
      expect(gameEngine.hasInInventory('mysterious key')).toBe(true)
      
      // Player moves to new location
      response = await gameEngine.processCommand(testUtils.createMockCommand('go', ['home']))
      expect(response).toContain('moved to')
      expect(gameEngine.getCurrentLocation().key).toBe('home')
      
      // Player saves game
      response = await gameEngine.processCommand(testUtils.createMockCommand('save'))
      expect(response).toContain('successfully')
    })

    test('should handle player making mistakes gracefully', async () => {
      // Try invalid movement
      let response = await gameEngine.processCommand(testUtils.createMockCommand('go', ['invalid_location']))
      expect(response).toContain("can't go")
      
      // Try taking non-existent item
      response = await gameEngine.processCommand(testUtils.createMockCommand('take', ['nonexistent_item']))
      expect(response).toContain("no nonexistent_item here")
      
      // Try using item not in inventory
      response = await gameEngine.processCommand(testUtils.createMockCommand('use', ['nonexistent_item']))
      expect(response).toContain("don't have")
      
      // Game should still be functional
      expect(gameEngine.getState().isRunning).toBe(true)
    })
  })

  describe('Item Interaction System', () => {
    test('should handle item pickup and usage flow', async () => {
      // Move to garden and pick up digital flower
      await gameEngine.processCommand(testUtils.createMockCommand('go', ['garden']))
      let response = await gameEngine.processCommand(testUtils.createMockCommand('take', ['digital', 'flower']))
      expect(response).toContain('You took')
      
      // Check inventory
      expect(gameEngine.hasInInventory('digital flower')).toBe(true)
      
      // Use the flower
      const statsBefore = gameEngine.getPlayerStats()
      response = await gameEngine.processCommand(testUtils.createMockCommand('use', ['digital', 'flower']))
      expect(response).toContain('energetic')
      
      // Check stats changed
      const statsAfter = gameEngine.getPlayerStats()
      expect(statsAfter.energy).toBeGreaterThan(statsBefore.energy)
      expect(statsAfter.mood).toBe('energetic')
    })

    test('should handle multiple item interactions', async () => {
      // Collect items from different locations
      await gameEngine.processCommand(testUtils.createMockCommand('take', ['mysterious', 'key']))
      
      await gameEngine.processCommand(testUtils.createMockCommand('go', ['garden']))
      await gameEngine.processCommand(testUtils.createMockCommand('take', ['digital', 'flower']))
      
      await gameEngine.processCommand(testUtils.createMockCommand('go', ['start']))
      await gameEngine.processCommand(testUtils.createMockCommand('go', ['home']))
      await gameEngine.processCommand(testUtils.createMockCommand('go', ['library']))
      await gameEngine.processCommand(testUtils.createMockCommand('take', ['ancient', 'scroll']))
      
      // Verify all items collected
      expect(gameEngine.hasInInventory('mysterious key')).toBe(true)
      expect(gameEngine.hasInInventory('digital flower')).toBe(true)
      expect(gameEngine.hasInInventory('ancient scroll')).toBe(true)
      
      // Use scroll to set flag
      let response = await gameEngine.processCommand(testUtils.createMockCommand('use', ['ancient', 'scroll']))
      expect(response).toContain('knowledge')
      expect(gameEngine.getFlag('read_scroll')).toBe(true)
    })
  })

  describe('Location Navigation System', () => {
    test('should handle complex navigation paths', async () => {
      const navigationPath = [
        { location: 'home', command: ['go', ['home']] },
        { location: 'library', command: ['go', ['library']] },
        { location: 'home', command: ['go', ['home']] },
        { location: 'start', command: ['go', ['start']] },
        { location: 'garden', command: ['go', ['garden']] },
        { location: 'start', command: ['go', ['start']] }
      ]
      
      for (const step of navigationPath) {
        await gameEngine.processCommand(testUtils.createMockCommand(...step.command))
        expect(gameEngine.getCurrentLocation().key).toBe(step.location)
      }
    })

    test('should enforce location restrictions', async () => {
      // Try going to locations not accessible from start
      let response = await gameEngine.processCommand(testUtils.createMockCommand('go', ['library']))
      expect(response).toContain("can't go")
      
      // Move to home first, then library should be accessible
      await gameEngine.processCommand(testUtils.createMockCommand('go', ['home']))
      response = await gameEngine.processCommand(testUtils.createMockCommand('go', ['library']))
      expect(response).toContain('moved to')
    })
  })

  describe('Game State Persistence', () => {
    test('should save and restore complete game state', async () => {
      // Set up complex game state
      await gameEngine.processCommand(testUtils.createMockCommand('take', ['mysterious', 'key']))
      await gameEngine.processCommand(testUtils.createMockCommand('go', ['garden']))
      await gameEngine.processCommand(testUtils.createMockCommand('take', ['digital', 'flower']))
      await gameEngine.processCommand(testUtils.createMockCommand('use', ['digital', 'flower']))
      
      const stateBefore = gameEngine.getGameState()
      
      // Save game
      await gameEngine.saveGame()
      
      // Reset and load
      gameEngine.reset()
      await gameEngine.loadGame()
      
      const stateAfter = gameEngine.getGameState()
      
      // Verify state restored correctly
      expect(stateAfter.currentLocation).toBe(stateBefore.currentLocation)
      expect(stateAfter.inventory).toEqual(stateBefore.inventory)
      expect(stateAfter.stats.mood).toBe(stateBefore.stats.mood)
    })
  })

  describe('Error Recovery', () => {
    test('should recover from invalid game states', async () => {
      // Simulate corrupted state
      gameEngine.gameState.currentLocation = 'invalid_location'
      
      // System should handle gracefully
      const location = gameEngine.getCurrentLocation()
      expect(location.name).toBe('Unknown Location')
      
      // Should still process commands
      let response = await gameEngine.processCommand(testUtils.createMockCommand('look'))
      expect(response).toContain('unknown digital realm')
    })

    test('should handle rapid command sequences', async () => {
      const commands = [
        testUtils.createMockCommand('look'),
        testUtils.createMockCommand('inventory'),
        testUtils.createMockCommand('go', ['home']),
        testUtils.createMockCommand('go', ['start']),
        testUtils.createMockCommand('take', ['mysterious', 'key']),
        testUtils.createMockCommand('use', ['mysterious', 'key'])
      ]
      
      // Execute all commands rapidly
      const responses = await Promise.all(
        commands.map(cmd => gameEngine.processCommand(cmd))
      )
      
      // All should execute successfully
      expect(responses).toHaveLength(6)
      responses.forEach(response => {
        expect(typeof response).toBe('string')
        expect(response.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Performance Tests', () => {
    test('should handle extended gameplay sessions', async () => {
      const startTime = Date.now()
      
      // Simulate 100 game actions
      for (let i = 0; i < 100; i++) {
        await gameEngine.processCommand(testUtils.createMockCommand('look'))
        if (i % 10 === 0) {
          await gameEngine.processCommand(testUtils.createMockCommand('inventory'))
        }
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(5000) // 5 seconds max
      expect(gameEngine.getState().isRunning).toBe(true)
    })

    test('should maintain performance during extended play', async () => {
      // Set up complex state with many items and movements
      for (let i = 0; i < 50; i++) {
        await gameEngine.processCommand(testUtils.createMockCommand('go', ['home']))
        await gameEngine.processCommand(testUtils.createMockCommand('go', ['start']))
      }
      
      // Measure command response time
      const start = Date.now()
      await gameEngine.processCommand(testUtils.createMockCommand('look'))
      const end = Date.now()
      
      // Should still be responsive
      expect(end - start).toBeLessThan(100) // Less than 100ms
    })

    test('should handle concurrent operations', async () => {
      // Simulate concurrent command processing
      const concurrentCommands = Array(10).fill().map((_, i) => 
        gameEngine.processCommand(testUtils.createMockCommand('look'))
      )
      
      const responses = await Promise.all(concurrentCommands)
      
      // All should complete successfully
      expect(responses).toHaveLength(10)
      responses.forEach(response => {
        expect(response).toContain('digital')
      })
    })
  })

  describe('Command Parser Integration', () => {
    test('should integrate command parser with game engine', () => {
      const parseResult = commandParser.parseCommand('go north')
      expect(parseResult.isValid).toBe(true)
      
      const executeResult = commandParser.executeCommand('look')
      expect(executeResult.success).toBe(true)
      expect(executeResult.response).toContain('digital')
    })

    test('should handle parser aliases correctly', () => {
      const result = commandParser.executeCommand('i') // inventory alias
      expect(result.success).toBe(true)
      expect(result.response).toContain('inventory')
    })
  })

  describe('Edge Cases in Integration', () => {
    test('should handle rapid save/load cycles', async () => {
      for (let i = 0; i < 10; i++) {
        await gameEngine.saveGame()
        await gameEngine.loadGame()
      }
      
      expect(gameEngine.getState().isRunning).toBe(true)
    })

    test('should handle memory exhaustion gracefully', async () => {
      // Create large state to test memory handling
      const largeInventory = Array(1000).fill().map((_, i) => `item_${i}`)
      gameEngine.gameState.inventory = largeInventory
      
      // Should still function
      const state = gameEngine.getGameState()
      expect(state.inventory.length).toBe(1000)
      
      // Should handle commands
      const response = await gameEngine.processCommand(testUtils.createMockCommand('look'))
      expect(response).toContain('digital')
    }, 10000)

    test('should maintain data integrity across operations', async () => {
      const initialState = gameEngine.getGameState()
      
      // Perform many operations
      await gameEngine.processCommand(testUtils.createMockCommand('take', ['mysterious', 'key']))
      await gameEngine.processCommand(testUtils.createMockCommand('go', ['home']))
      await gameEngine.saveGame()
      await gameEngine.processCommand(testUtils.createMockCommand('go', ['start']))
      await gameEngine.loadGame()
      
      const finalState = gameEngine.getGameState()
      
      // Key data should be preserved
      expect(finalState.playerName).toBe(initialState.playerName)
      expect(finalState.stats.health).toBe(initialState.stats.health)
      expect(gameEngine.hasInInventory('mysterious key')).toBe(true)
    })
  })
})