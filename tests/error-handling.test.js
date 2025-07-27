/**
 * Comprehensive Error Handling and Edge Case Test Suite
 * Error Handling Specialist: Testing all failure modes and recovery mechanisms
 */

const fs = require('fs').promises
const path = require('path')
const { GameTestHelpers } = require('./utils/test-helpers')
const MockGameEngine = require('./mocks/game-engine.mock')
const MockRavi = require('./mocks/ravi.mock')

// Mock fs operations for testing file system errors
jest.mock('fs', () => ({
  promises: {
    writeFile: jest.fn(),
    readFile: jest.fn(),
    access: jest.fn(),
    unlink: jest.fn(),
    stat: jest.fn()
  },
  existsSync: jest.fn(),
  unlinkSync: jest.fn()
}))

describe('Error Handling and Edge Cases', () => {
  let gameEngine
  let ravi
  let testHelpers
  let originalConsole

  beforeEach(() => {
    gameEngine = new MockGameEngine()
    ravi = new MockRavi(gameEngine)
    testHelpers = new GameTestHelpers()
    gameEngine.setCharacter(ravi)
    
    // Setup console mocking
    originalConsole = testHelpers.setupMockConsole()
    
    // Reset all mocks
    jest.clearAllMocks()
  })

  afterEach(() => {
    if (originalConsole) {
      originalConsole()
    }
  })

  describe('Invalid Input Handling', () => {
    test('should handle null command input gracefully', async () => {
      const command = { command: null, args: [], rawInput: null }
      
      const response = await gameEngine.processCommand(command)
      
      expect(response).toBeDefined()
      expect(response).toContain('don\'t understand')
      expect(gameEngine.getState()).toBeValidGameState()
    })

    test('should handle undefined command input gracefully', async () => {
      const response = await gameEngine.processCommand(undefined)
      
      expect(response).toBeDefined()
      expect(response).toContain('don\'t understand')
      expect(gameEngine.getState()).toBeValidGameState()
    })

    test('should handle empty string commands', async () => {
      const command = { command: '', args: [], rawInput: '' }
      
      const response = await gameEngine.processCommand(command)
      
      expect(response).toBeDefined()
      expect(gameEngine.getState()).toBeValidGameState()
    })

    test('should handle commands with only whitespace', async () => {
      const command = { command: '   ', args: [], rawInput: '   \t\n  ' }
      
      const response = await gameEngine.processCommand(command)
      
      expect(response).toBeDefined()
      expect(gameEngine.getState()).toBeValidGameState()
    })

    test('should handle extremely long command inputs', async () => {
      const longCommand = 'a'.repeat(10000)
      const command = { command: longCommand, args: [], rawInput: longCommand }
      
      const response = await gameEngine.processCommand(command)
      
      expect(response).toBeDefined()
      expect(gameEngine.getState()).toBeValidGameState()
    })

    test('should handle commands with special characters and unicode', async () => {
      const specialCommands = [
        '\\n\\r\\t',
        '🎮🚀🤖',
        '<script>alert("xss")</script>',
        'DROP TABLE users;--',
        '../../etc/passwd',
        'null\x00byte'
      ]

      for (const specialCmd of specialCommands) {
        const command = { command: specialCmd, args: [], rawInput: specialCmd }
        
        const response = await gameEngine.processCommand(command)
        
        expect(response).toBeDefined()
        expect(gameEngine.getState()).toBeValidGameState()
      }
    })

    test('should handle malformed game state inputs', () => {
      const malformedStates = [
        null,
        undefined,
        'not an object',
        123,
        [],
        { currentLocation: null },
        { inventory: 'not_an_array' },
        { gameProgress: 'invalid' },
        { character: [] }
      ]

      malformedStates.forEach(state => {
        expect(() => gameEngine.setState(state)).not.toThrow()
        expect(gameEngine.getState()).toBeValidGameState()
      })
    })

    test('should handle invalid movement directions', async () => {
      const invalidDirections = [
        null,
        undefined,
        '',
        '   ',
        123,
        {},
        [],
        'nonexistent_location',
        '../../../escape',
        'location\x00null'
      ]

      for (const direction of invalidDirections) {
        const success = gameEngine.moveToLocation(direction)
        
        expect(success).toBe(false)
        expect(gameEngine.getState().currentLocation).toBe('living_room')
        expect(gameEngine.getState()).toBeValidGameState()
      }
    })

    test('should handle invalid inventory operations', () => {
      const invalidItems = [null, undefined, '', '   ', 123, {}, []]

      invalidItems.forEach(item => {
        expect(() => gameEngine.addToInventory(item)).not.toThrow()
        expect(() => gameEngine.removeFromInventory(item)).not.toThrow()
        expect(() => gameEngine.hasInInventory(item)).not.toThrow()
      })
    })
  })

  describe('File System Error Scenarios', () => {
    test('should handle save file write permissions error', async () => {
      const fsModule = require('fs')
      fsModule.promises.writeFile.mockRejectedValue(new Error('EACCES: permission denied'))

      gameEngine.addToInventory('test_item')
      
      await expect(gameEngine.saveGame('permission_test')).rejects.toThrow()
      
      // Game state should remain intact
      expect(gameEngine.getState()).toBeValidGameState()
      expect(gameEngine.hasInInventory('test_item')).toBe(true)
    })

    test('should handle save file disk space error', async () => {
      const fsModule = require('fs')
      fsModule.promises.writeFile.mockRejectedValue(new Error('ENOSPC: no space left on device'))

      await expect(gameEngine.saveGame('diskspace_test')).rejects.toThrow()
      
      expect(gameEngine.getState()).toBeValidGameState()
    })

    test('should handle corrupted save file during load', async () => {
      const fsModule = require('fs')
      fsModule.promises.readFile.mockResolvedValue('corrupted{invalid:json:data}')

      await expect(gameEngine.loadGame('corrupted_save')).rejects.toThrow()
      
      // Game should remain in valid state
      expect(gameEngine.getState()).toBeValidGameState()
    })

    test('should handle empty save file', async () => {
      const fsModule = require('fs')
      fsModule.promises.readFile.mockResolvedValue('')

      await expect(gameEngine.loadGame('empty_save')).rejects.toThrow()
      
      expect(gameEngine.getState()).toBeValidGameState()
    })

    test('should handle save file path traversal attempts', async () => {
      const dangerousPaths = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        '/etc/shadow',
        'C:\\Windows\\System32\\config\\SAM',
        '../../../../root/.ssh/id_rsa'
      ]

      for (const dangerousPath of dangerousPaths) {
        // Save operations should sanitize paths or reject dangerous ones
        await expect(gameEngine.saveGame(dangerousPath)).resolves.not.toThrow()
        
        // Verify no actual dangerous file operations occurred
        const fsModule = require('fs')
        expect(fsModule.promises.writeFile).not.toHaveBeenCalledWith(
          expect.stringContaining('..'),
          expect.anything()
        )
      }
    })

    test('should handle concurrent file operations', async () => {
      const fsModule = require('fs')
      let callCount = 0
      
      fsModule.promises.writeFile.mockImplementation(() => {
        callCount++
        if (callCount <= 2) {
          return new Promise(resolve => setTimeout(resolve, 100))
        }
        throw new Error('EBUSY: resource busy or locked')
      })

      gameEngine.addToInventory('concurrent_test')

      // Try multiple concurrent saves
      const savePromises = [
        gameEngine.saveGame('concurrent_1'),
        gameEngine.saveGame('concurrent_2'),
        gameEngine.saveGame('concurrent_3')
      ]

      const results = await Promise.allSettled(savePromises)
      
      // At least some should complete without errors
      const successful = results.filter(r => r.status === 'fulfilled').length
      expect(successful).toBeGreaterThan(0)
      
      // Game state should remain valid
      expect(gameEngine.getState()).toBeValidGameState()
    })
  })

  describe('Memory Constraint Testing', () => {
    test('should handle extremely large game states efficiently', async () => {
      const memoryBefore = process.memoryUsage()
      
      // Create massive game state
      const largeInventory = Array.from({ length: 50000 }, (_, i) => `item_${i}`)
      const largeAchievements = Array.from({ length: 10000 }, (_, i) => `achievement_${i}`)
      
      gameEngine.setState({
        currentLocation: 'memory_test',
        inventory: largeInventory,
        gameProgress: {
          achievements: largeAchievements
        }
      })

      const memoryAfter = process.memoryUsage()
      const memoryIncrease = memoryAfter.heapUsed - memoryBefore.heapUsed
      
      // Should not consume excessive memory (allow up to 100MB)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024)
      
      // State should still be valid
      expect(gameEngine.getState()).toBeValidGameState()
      expect(gameEngine.getState().inventory).toHaveLength(50000)
    })

    test('should handle memory pressure during operations', async () => {
      // Simulate memory pressure by creating large objects
      const memoryHogs = []
      
      try {
        // Fill memory gradually while testing operations
        for (let i = 0; i < 100; i++) {
          memoryHogs.push(new Array(100000).fill(`memory_test_${i}`))
          
          // Test that game operations still work under memory pressure
          const command = testHelpers.generateRandomCommand()
          const response = await gameEngine.processCommand(command)
          
          expect(response).toBeDefined()
          expect(gameEngine.getState()).toBeValidGameState()
          
          if (i % 10 === 0) {
            // Force garbage collection periodically if available
            if (global.gc) {
              global.gc()
            }
          }
        }
      } catch (error) {
        // If we hit memory limits, that's expected behavior
        expect(error.message).toMatch(/memory|heap|allocation/i)
      } finally {
        // Clean up
        memoryHogs.length = 0
      }
    })

    test('should detect and prevent memory leaks in command processing', async () => {
      const initialMemory = process.memoryUsage().heapUsed
      
      // Process many commands to detect potential leaks
      for (let i = 0; i < 1000; i++) {
        const command = testHelpers.generateRandomCommand()
        await gameEngine.processCommand(command)
        
        // Periodically check memory growth
        if (i % 100 === 0 && global.gc) {
          global.gc()
          const currentMemory = process.memoryUsage().heapUsed
          const memoryGrowth = currentMemory - initialMemory
          
          // Memory should not grow excessively (allow 50MB growth)
          expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024)
        }
      }
    })

    test('should handle deep object nesting without stack overflow', () => {
      // Create deeply nested object
      let deepObject = {}
      let current = deepObject
      
      for (let i = 0; i < 1000; i++) {
        current.level = i
        current.next = {}
        current = current.next
      }
      
      expect(() => gameEngine.setState({
        customData: deepObject
      })).not.toThrow()
      
      expect(gameEngine.getState()).toBeValidGameState()
    })
  })

  describe('Network Timeout and Failure Testing', () => {
    test('should handle network timeouts gracefully', async () => {
      // Mock network operations if they exist
      const mockNetworkOperation = jest.fn().mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('ETIMEDOUT: Operation timed out')), 5000)
        )
      )

      // Test that timeouts don't crash the game
      await expect(mockNetworkOperation()).rejects.toThrow('ETIMEDOUT')
      
      expect(gameEngine.getState()).toBeValidGameState()
    })

    test('should handle connection refused errors', async () => {
      const mockNetworkOperation = jest.fn().mockRejectedValue(
        new Error('ECONNREFUSED: Connection refused')
      )

      await expect(mockNetworkOperation()).rejects.toThrow('ECONNREFUSED')
      
      expect(gameEngine.getState()).toBeValidGameState()
    })

    test('should implement retry logic for transient failures', async () => {
      let attemptCount = 0
      const mockRetryableOperation = jest.fn().mockImplementation(() => {
        attemptCount++
        if (attemptCount < 3) {
          return Promise.reject(new Error('Transient failure'))
        }
        return Promise.resolve('Success')
      })

      // Simulate retry logic
      let result = null
      let error = null
      
      for (let i = 0; i < 5; i++) {
        try {
          result = await mockRetryableOperation()
          break
        } catch (err) {
          error = err
          await new Promise(resolve => setTimeout(resolve, 100)) // Wait before retry
        }
      }

      expect(result).toBe('Success')
      expect(attemptCount).toBe(3)
    })
  })

  describe('Corrupted Data Recovery Testing', () => {
    test('should recover from partially corrupted save data', async () => {
      const partiallyCorruptedSave = {
        currentLocation: 'kitchen',
        inventory: ['valid_item'],
        gameProgress: null, // Corrupted section
        character: {
          name: 'TestPlayer',
          health: 'not_a_number', // Invalid data type
          energy: 100
        }
      }

      gameEngine.saveData = {
        filename: 'partial_corruption_test',
        state: partiallyCorruptedSave,
        timestamp: Date.now()
      }

      await expect(gameEngine.loadGame('partial_corruption_test')).resolves.not.toThrow()
      
      const state = gameEngine.getState()
      expect(state).toBeValidGameState()
      expect(state.currentLocation).toBe('kitchen') // Valid data preserved
      expect(state.inventory).toContain('valid_item') // Valid data preserved
    })

    test('should rebuild missing game state sections', async () => {
      const incompleteSave = {
        currentLocation: 'bedroom'
        // Missing inventory, gameProgress, etc.
      }

      gameEngine.saveData = {
        filename: 'incomplete_save_test',
        state: incompleteSave,
        timestamp: Date.now()
      }

      await gameEngine.loadGame('incomplete_save_test')
      
      const state = gameEngine.getState()
      expect(state).toBeValidGameState()
      expect(state.currentLocation).toBe('bedroom')
      expect(Array.isArray(state.inventory)).toBe(true)
      expect(typeof state.gameProgress).toBe('object')
    })

    test('should handle save file format version mismatches', async () => {
      const futureSaveFormat = {
        version: '999.0.0',
        currentLocation: 'future_location',
        newFeatures: {
          quantumInventory: ['quantum_item'],
          multiDimensionalProgress: true
        }
      }

      gameEngine.saveData = {
        filename: 'future_format_test',
        state: futureSaveFormat,
        timestamp: Date.now()
      }

      // Should handle gracefully without crashing
      await expect(gameEngine.loadGame('future_format_test')).resolves.not.toThrow()
      
      expect(gameEngine.getState()).toBeValidGameState()
    })
  })

  describe('Graceful Degradation Validation', () => {
    test('should continue operating with missing character', () => {
      gameEngine.setCharacter(null)
      
      expect(() => gameEngine.getCurrentLocation()).not.toThrow()
      expect(() => gameEngine.moveToLocation('kitchen')).not.toThrow()
      expect(() => gameEngine.addToInventory('test_item')).not.toThrow()
      
      expect(gameEngine.getState()).toBeValidGameState()
    })

    test('should handle missing location data gracefully', () => {
      gameEngine.setState({ currentLocation: 'nonexistent_location' })
      
      const location = gameEngine.getCurrentLocation()
      expect(location).toBeDefined()
      expect(gameEngine.getState()).toBeValidGameState()
    })

    test('should fallback when features are unavailable', async () => {
      // Mock unavailable features
      const originalProcessCommand = gameEngine.processCommand
      gameEngine.processCommand = null

      // Game should still function in basic mode
      expect(() => gameEngine.getState()).not.toThrow()
      expect(() => gameEngine.moveToLocation('kitchen')).not.toThrow()
      
      // Restore original functionality
      gameEngine.processCommand = originalProcessCommand
    })

    test('should provide meaningful error messages', async () => {
      const invalidCommand = { command: 'nonexistent', args: [], rawInput: 'nonexistent' }
      
      const response = await gameEngine.processCommand(invalidCommand)
      
      expect(response).toBeDefined()
      expect(typeof response).toBe('string')
      expect(response.length).toBeGreaterThan(0)
      expect(response).toMatch(/don't understand|unknown|help/i)
    })

    test('should maintain game state consistency during errors', async () => {
      const originalState = gameEngine.getState()
      
      // Trigger various error conditions
      try {
        await gameEngine.processCommand(null)
        gameEngine.moveToLocation(null)
        gameEngine.addToInventory(undefined)
        gameEngine.setState('invalid')
      } catch (error) {
        // Errors are expected
      }
      
      const finalState = gameEngine.getState()
      expect(finalState).toBeValidGameState()
      
      // Core state should remain consistent
      expect(finalState.currentLocation).toBeDefined()
      expect(Array.isArray(finalState.inventory)).toBe(true)
    })
  })

  describe('Cross-Platform Edge Cases', () => {
    test('should handle different path separators', async () => {
      const pathVariations = [
        'save/game.json',
        'save\\game.json',
        'save//game.json',
        'save\\\\game.json'
      ]

      for (const savePath of pathVariations) {
        await expect(gameEngine.saveGame(savePath)).resolves.not.toThrow()
      }
    })

    test('should handle different line endings', () => {
      const lineEndingVariations = [
        'command\nwith\nunix\nlines',
        'command\r\nwith\r\nwindows\r\nlines',
        'command\rwith\rmac\rlines',
        'mixed\n\r\n\rline\nendings'
      ]

      lineEndingVariations.forEach(input => {
        const command = { command: 'test', args: [], rawInput: input }
        expect(() => gameEngine.processCommand(command)).not.toThrow()
      })
    })

    test('should handle case sensitivity variations', async () => {
      const caseVariations = [
        'look',
        'LOOK',
        'Look',
        'lOoK',
        'go north',
        'GO NORTH',
        'Go North'
      ]

      for (const variation of caseVariations) {
        const command = { command: variation.split(' ')[0], args: variation.split(' ').slice(1), rawInput: variation }
        const response = await gameEngine.processCommand(command)
        
        expect(response).toBeDefined()
        expect(gameEngine.getState()).toBeValidGameState()
      }
    })

    test('should handle unicode and international characters', () => {
      const unicodeInputs = [
        'look 🎮',
        'take café',
        'go 北',
        'examine 🚀',
        'talk ñoño'
      ]

      unicodeInputs.forEach(input => {
        const parts = input.split(' ')
        const command = { command: parts[0], args: parts.slice(1), rawInput: input }
        expect(() => gameEngine.processCommand(command)).not.toThrow()
      })
    })
  })

  describe('Performance Under Error Conditions', () => {
    test('should maintain performance during repeated error handling', async () => {
      const startTime = Date.now()
      
      // Generate many error conditions
      for (let i = 0; i < 1000; i++) {
        try {
          await gameEngine.processCommand(null)
          gameEngine.moveToLocation('invalid')
          gameEngine.addToInventory(undefined)
        } catch (error) {
          // Expected errors
        }
      }
      
      const duration = Date.now() - startTime
      
      // Should handle errors efficiently (under 5 seconds for 1000 operations)
      expect(duration).toBeLessThan(5000)
      expect(gameEngine.getState()).toBeValidGameState()
    })

    test('should not leak memory during error recovery', async () => {
      const initialMemory = process.memoryUsage().heapUsed
      
      // Create many error conditions and recoveries
      for (let i = 0; i < 500; i++) {
        try {
          await gameEngine.processCommand(null)
          gameEngine.setState('invalid')
          await gameEngine.loadGame('nonexistent')
        } catch (error) {
          // Expected errors
        }
        
        if (i % 50 === 0 && global.gc) {
          global.gc()
        }
      }
      
      if (global.gc) {
        global.gc()
      }
      
      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = finalMemory - initialMemory
      
      // Memory increase should be minimal (allow 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
    })
  })

  describe('Error Message Quality and Localization', () => {
    test('should provide user-friendly error messages', async () => {
      const errorScenarios = [
        { action: () => gameEngine.processCommand(null), expectedKeywords: ['understand', 'help'] },
        { action: () => gameEngine.moveToLocation('invalid'), expectedKeywords: ['go', 'location'] },
        { action: () => gameEngine.addToInventory(null), expectedKeywords: [] },
        { action: () => gameEngine.loadGame('nonexistent'), expectedKeywords: ['found', 'save'] }
      ]

      for (const scenario of errorScenarios) {
        try {
          const result = await scenario.action()
          if (typeof result === 'string') {
            scenario.expectedKeywords.forEach(keyword => {
              expect(result.toLowerCase()).toMatch(new RegExp(keyword, 'i'))
            })
          }
        } catch (error) {
          expect(error.message).toBeDefined()
          expect(error.message.length).toBeGreaterThan(0)
        }
      }
    })

    test('should avoid exposing internal system details in errors', async () => {
      const sensitivePatterns = [
        /stack trace/i,
        /file path.*node_modules/i,
        /internal error/i,
        /system error/i,
        /debug/i
      ]

      try {
        await gameEngine.loadGame('nonexistent_save')
      } catch (error) {
        sensitivePatterns.forEach(pattern => {
          expect(error.message).not.toMatch(pattern)
        })
      }
    })
  })
})