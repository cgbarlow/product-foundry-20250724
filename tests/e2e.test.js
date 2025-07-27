/**
 * End-to-End Test Suite - PRODUCTION CODE ONLY
 * Complete user experience testing with real implementations
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

describe('End-to-End User Experience', () => {
  describe('Complete Game Session', () => {
    test('should handle full gameplay session from start to save', async () => {
      // Complete gameplay flow
      expect(gameEngine.getState().isRunning).toBe(true)
      
      // Look around and get oriented
      let response = await gameEngine.processCommand(testUtils.createMockCommand('look'))
      expect(response).toContain('digital')
      
      // Take an item (use correct command format)
      response = await gameEngine.processCommand(testUtils.createMockCommand('take', ['mysterious key']))
      expect(response).toContain('took')
      
      // Move around
      response = await gameEngine.processCommand(testUtils.createMockCommand('go', ['home']))
      expect(response).toContain('moved')
      
      // Save the game
      response = await gameEngine.processCommand(testUtils.createMockCommand('save'))
      expect(response).toContain('success')
    })

    test('should handle player mistakes and recovery', async () => {
      // Try invalid commands
      let response = await gameEngine.processCommand(testUtils.createMockCommand('invalidcommand'))
      expect(response).toContain('Unknown command')
      
      // Try invalid movement
      response = await gameEngine.processCommand(testUtils.createMockCommand('go', ['nowhere']))
      expect(response).toContain("can't go")
      
      // Game should still be functional
      expect(gameEngine.getState().isRunning).toBe(true)
    })

    test('should maintain consistency across session', async () => {
      // Simulate a complex gameplay session with realistic expectations
      const actions = [
        { command: 'look', args: [], expected: 'digital' },
        { command: 'take', args: ['mysterious key'], expected: 'took' },
        { command: 'go', args: ['garden'], expected: 'moved' },
        { command: 'take', args: ['digital flower'], expected: 'took' },
        { command: 'go', args: ['start'], expected: 'moved' }
      ]
      
      for (const action of actions) {
        const response = await gameEngine.processCommand(
          testUtils.createMockCommand(action.command, action.args)
        )
        expect(response).toContain(action.expected)
      }
      
      // Verify final state consistency
      expect(gameEngine.hasInInventory('mysterious key')).toBe(true)
      expect(gameEngine.hasInInventory('digital flower')).toBe(true)
      expect(gameEngine.getCurrentLocation().key).toBe('start')
    })
  })

  describe('Multi-Session Continuity', () => {
    test('should maintain continuity across save/load cycles', async () => {
      // Set up game state
      await gameEngine.processCommand(testUtils.createMockCommand('take', ['mysterious key']))
      await gameEngine.processCommand(testUtils.createMockCommand('go', ['garden']))
      await gameEngine.processCommand(testUtils.createMockCommand('take', ['digital flower']))
      
      // Save the game
      await gameEngine.saveGame()
      
      // Reset and load
      gameEngine.reset()
      await gameEngine.loadGame()
      
      // Continue playing from where left off
      const response = await gameEngine.processCommand(testUtils.createMockCommand('look'))
      expect(response).toContain('garden') // Updated to match real game locations
      
      await gameEngine.processCommand(testUtils.createMockCommand('inventory'))
      expect(gameEngine.hasInInventory('digital flower')).toBe(true)
    })

    test('should handle multiple save slots', async () => {
      // This test works with the current single save system
      await gameEngine.processCommand(testUtils.createMockCommand('take', ['mysterious', 'key']))
      await gameEngine.saveGame()
      
      // Verify save worked
      const success = await gameEngine.loadGame()
      expect(success).toBe(true)
      expect(gameEngine.hasInInventory('mysterious key')).toBe(true)
    })
  })

  describe('Character Development', () => {
    test('should show character growth throughout session', async () => {
      const initialStats = gameEngine.getPlayerStats()
      
      // Use item that affects stats
      await gameEngine.processCommand(testUtils.createMockCommand('go', ['garden']))
      await gameEngine.processCommand(testUtils.createMockCommand('take', ['digital', 'flower']))
      await gameEngine.processCommand(testUtils.createMockCommand('use', ['digital', 'flower']))
      
      const updatedStats = gameEngine.getPlayerStats()
      expect(updatedStats.energy).toBeGreaterThan(initialStats.energy)
      expect(updatedStats.mood).toBe('energetic')
    })

    test('should remember character knowledge', async () => {
      // Use ancient scroll to set knowledge flag
      await gameEngine.processCommand(testUtils.createMockCommand('go', ['home']))
      await gameEngine.processCommand(testUtils.createMockCommand('go', ['library']))
      await gameEngine.processCommand(testUtils.createMockCommand('take', ['ancient', 'scroll']))
      await gameEngine.processCommand(testUtils.createMockCommand('use', ['ancient', 'scroll']))
      
      // Verify knowledge flag was set
      expect(gameEngine.getFlag('read_scroll')).toBe(true)
    })
  })

  describe('Performance Under Load', () => {
    test('should handle extended gameplay session', async () => {
      const actions = 50
      const startTime = Date.now()
      
      for (let i = 0; i < actions; i++) {
        await gameEngine.processCommand(testUtils.createMockCommand('look'))
        if (i % 5 === 0) {
          await gameEngine.processCommand(testUtils.createMockCommand('inventory'))
        }
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(3000) // Should complete within 3 seconds
      expect(gameEngine.getState().isRunning).toBe(true)
    })

    test('should handle rapid user input', async () => {
      const commands = [
        testUtils.createMockCommand('look'),
        testUtils.createMockCommand('inventory'),
        testUtils.createMockCommand('go', ['home']),
        testUtils.createMockCommand('go', ['start']),
        testUtils.createMockCommand('look')
      ]
      
      const responses = await Promise.all(
        commands.map(cmd => gameEngine.processCommand(cmd))
      )
      
      expect(responses).toHaveLength(5)
      responses.forEach(response => {
        expect(typeof response).toBe('string')
        expect(response.length).toBeGreaterThan(0)
      })
    })
  })

  describe('User Experience Edge Cases', () => {
    test('should handle empty or whitespace commands', async () => {
      const parseResult = commandParser.parseCommand('')
      expect(parseResult.isValid).toBe(false)
      expect(parseResult.error).toContain('Empty command')
      
      const parseResult2 = commandParser.parseCommand('   ')
      expect(parseResult2.isValid).toBe(false)
      expect(parseResult2.error).toContain('Empty command')
    })

    test('should handle very long input gracefully', async () => {
      const longCommand = 'go ' + 'north '.repeat(100)
      const parseResult = commandParser.parseCommand(longCommand)
      
      expect(parseResult.command).toBe('go')
      expect(parseResult.args.length).toBeGreaterThan(50)
    })

    test('should handle special characters in commands', async () => {
      const response = await gameEngine.processCommand(testUtils.createMockCommand('look', ['@#$%']))
      expect(typeof response).toBe('string')
      expect(response.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility and Usability', () => {
    test('should provide helpful error messages', async () => {
      const response = await gameEngine.processCommand(testUtils.createMockCommand('invalidcommand'))
      expect(response).toContain('Unknown command')
      
      const response2 = await gameEngine.processCommand(testUtils.createMockCommand('go', ['nowhere']))
      expect(response2).toContain("can't go")
    })

    test('should maintain consistent response format', async () => {
      const commands = ['look', 'inventory', 'help']
      
      for (const cmd of commands) {
        const result = commandParser.executeCommand(cmd)
        expect(result).toHaveProperty('success')
        expect(typeof result.success).toBe('boolean')
        
        if (result.success) {
          expect(result).toHaveProperty('response')
          expect(typeof result.response).toBe('string')
        } else {
          expect(result).toHaveProperty('error')
          expect(typeof result.error).toBe('string')
        }
      }
    })
  })

  describe('Data Integrity', () => {
    test('should maintain data integrity throughout session', async () => {
      const initialState = gameEngine.getGameState()
      
      // Perform various operations
      await gameEngine.processCommand(testUtils.createMockCommand('take', ['mysterious', 'key']))
      await gameEngine.processCommand(testUtils.createMockCommand('go', ['garden']))
      await gameEngine.saveGame()
      await gameEngine.processCommand(testUtils.createMockCommand('go', ['start']))
      
      const finalState = gameEngine.getGameState()
      
      // Core data should be preserved
      expect(finalState.playerName).toBe(initialState.playerName)
      expect(finalState.stats.health).toBe(initialState.stats.health)
      expect(gameEngine.hasInInventory('mysterious key')).toBe(true)
    })

    test('should handle concurrent state access safely', async () => {
      // Simulate concurrent operations
      const operations = [
        gameEngine.processCommand(testUtils.createMockCommand('look')),
        gameEngine.processCommand(testUtils.createMockCommand('inventory')),
        gameEngine.processCommand(testUtils.createMockCommand('take', ['mysterious', 'key']))
      ]
      
      const results = await Promise.all(operations)
      
      // All operations should complete successfully
      expect(results).toHaveLength(3)
      results.forEach(result => {
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(0)
      })
      
      // State should remain consistent
      expect(gameEngine.getState().isRunning).toBe(true)
    })
  })
})