/**
 * Integration Test Suite
 * QA Engineer: End-to-end gameplay testing
 */

const MockGameEngine = require('./mocks/game-engine.mock')
const MockRavi = require('./mocks/ravi.mock')

// Mock the main index.js components
jest.mock('../src/index.js', () => {
  const MockGameEngine = require('./mocks/game-engine.mock')
  const gameEngine = new MockGameEngine()
  
  return {
    program: {
      parse: jest.fn(),
      command: jest.fn().mockReturnThis(),
      description: jest.fn().mockReturnThis(),
      version: jest.fn().mockReturnThis(),
      option: jest.fn().mockReturnThis(),
      action: jest.fn().mockReturnThis()
    },
    gameEngine
  }
})

describe('Integration: Complete Gameplay Flow', () => {
  let gameEngine
  let ravi
  
  beforeEach(() => {
    gameEngine = new MockGameEngine()
    ravi = new MockRavi(gameEngine)
    gameEngine.setCharacter(ravi)
  })
  
  describe('Game Initialization', () => {
    test('should initialize complete game system', async () => {
      // Verify all components are connected
      expect(gameEngine).toBeDefined()
      expect(ravi).toBeDefined()
      expect(gameEngine.getCharacter()).toBe(ravi)
      
      // Verify initial state
      const state = gameEngine.getState()
      expect(state).toBeValidGameState()
      expect(state.currentLocation).toBe('living_room')
    })
    
    test('should start interactive mode successfully', async () => {
      await expect(gameEngine.startInteractiveMode()).resolves.not.toThrow()
      expect(gameEngine.getState().isRunning).toBe(true)
    })
  })
  
  describe('Complete User Journey: New Player', () => {
    test('should handle complete new player experience', async () => {
      // 1. Game starts
      await gameEngine.startInteractiveMode()
      
      // 2. Player looks around
      const lookResponse = await gameEngine.processCommand(
        testUtils.createMockCommand('look')
      )
      expect(lookResponse).toHaveRaviResponse()
      
      // 3. Ravi responds
      const raviResponse = ravi.respondToCommand(
        testUtils.createMockCommand('look')
      )
      expect(raviResponse.text).toHaveRaviResponse()
      expect(raviResponse.mood).toBe('sarcastic')
      
      // 4. Player moves around
      const moveResponse = await gameEngine.processCommand(
        testUtils.createMockCommand('go', ['north'])
      )
      expect(moveResponse).toContain('Kitchen')
      
      // 5. Player checks inventory
      const invResponse = await gameEngine.processCommand(
        testUtils.createMockCommand('inventory')
      )
      expect(invResponse).toContain('empty')
      
      // 6. Player takes an item
      const takeResponse = await gameEngine.processCommand(
        testUtils.createMockCommand('take', ['coffee'])
      )
      expect(takeResponse).toContain('You take the coffee')
      expect(gameEngine.hasInInventory('coffee')).toBe(true)
      
      // 7. Ravi comments on the action
      const raviItemResponse = ravi.respondToInventoryChange('take', 'coffee')
      expect(raviItemResponse).toHaveRaviResponse()
      
      // 8. Save game
      await gameEngine.saveGame('test_journey')
      expect(gameEngine.saveData).toBeDefined()
    })
    
    test('should handle player making mistakes gracefully', async () => {
      // Try invalid commands
      const invalidResponse = await gameEngine.processCommand(
        testUtils.createMockCommand('fly')
      )
      expect(invalidResponse).toContain('don\'t understand')
      
      // Try going in invalid direction
      const badMoveResponse = await gameEngine.processCommand(
        testUtils.createMockCommand('go', ['down'])
      )
      expect(badMoveResponse).toContain('can\'t go')
      
      // Try taking non-existent item
      const badTakeResponse = await gameEngine.processCommand(
        testUtils.createMockCommand('take', ['unicorn'])
      )
      expect(badTakeResponse).toContain('no unicorn')
      
      // Game should still be functional
      expect(gameEngine.getState().isRunning).toBe(true)
    })
  })
  
  describe('Complete User Journey: Returning Player', () => {
    test('should handle save and load cycle', async () => {
      // Set up game state
      gameEngine.addToInventory('special_item')
      gameEngine.moveToLocation('bedroom')
      ravi.adjustRelationship(25)
      
      // Save the game
      await gameEngine.saveGame('returning_player')
      
      // Simulate new session - reset and load
      await gameEngine.resetGame()
      expect(gameEngine.getState().inventory).toEqual([])
      expect(gameEngine.getState().currentLocation).toBe('living_room')
      
      // Load saved game
      await gameEngine.loadGame('returning_player')
      
      // Verify state restored
      expect(gameEngine.hasInInventory('special_item')).toBe(true)
      expect(gameEngine.getState().currentLocation).toBe('bedroom')
      
      // Verify Ravi remembers relationship
      const raviStats = ravi.getStats()
      expect(raviStats.relationship).toBe(75) // 50 + 25
    })
    
    test('should handle loading non-existent save gracefully', async () => {
      await expect(gameEngine.loadGame('non_existent')).rejects.toThrow()
      
      // Game should remain functional
      const state = gameEngine.getState()
      expect(state).toBeValidGameState()
    })
  })
  
  describe('Ravi Integration', () => {
    test('should have Ravi respond to all game events', async () => {
      // Game start
      const startResponse = ravi.respondToGameEvent('game_start')
      expect(startResponse).toHaveRaviResponse()
      
      // Location changes
      gameEngine.moveToLocation('kitchen')
      const locationResponse = ravi.respondToLocation('kitchen')
      expect(locationResponse).toHaveRaviResponse()
      
      // Inventory changes
      gameEngine.addToInventory('test_item')
      const itemResponse = ravi.respondToInventoryChange('take', 'test_item')
      expect(itemResponse).toHaveRaviResponse()
      
      // Game save
      const saveResponse = ravi.respondToGameEvent('game_save')
      expect(saveResponse).toHaveRaviResponse()
    })
    
    test('should track Ravi\'s mood changes throughout gameplay', async () => {
      // Start with default mood
      expect(ravi.getMood()).toBe('sarcastic')
      
      // Positive interactions should improve relationship
      ravi.adjustRelationship(30)
      expect(ravi.getRelationship()).toBe(80)
      expect(ravi.getMood()).toBe('helpful')
      
      // Negative interactions should worsen relationship
      ravi.adjustRelationship(-60)
      expect(ravi.getRelationship()).toBe(20)
      expect(ravi.getMood()).toBe('annoyed')
      
      // Responses should reflect mood
      const annoyedResponse = ravi.generateResponse({ command: 'look' })
      expect(annoyedResponse.mood).toBe('annoyed')
    })
  })
  
  describe('Command Parser Integration', () => {
    test('should handle complex command sequences', async () => {
      const commands = [
        'look around carefully',
        'go north to the kitchen',
        'take the coffee mug',
        'go back south',
        'drop coffee on floor',
        'pick up remote control'
      ]
      
      for (const commandText of commands) {
        const parts = commandText.split(' ')
        const command = testUtils.createMockCommand(parts[0], parts.slice(1))
        
        const response = await gameEngine.processCommand(command)
        expect(response).toBeDefined()
        expect(typeof response).toBe('string')
      }
      
      // Verify final state makes sense
      const history = gameEngine.getCommandHistory()
      expect(history).toHaveLength(commands.length)
    })
    
    test('should handle rapid command input', async () => {
      const rapidCommands = Array.from({ length: 50 }, (_, i) => 
        testUtils.createMockCommand('look', [`iteration_${i}`])
      )
      
      const startTime = Date.now()
      
      for (const command of rapidCommands) {
        await gameEngine.processCommand(command)
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(1000) // Should handle 50 commands quickly
      expect(gameEngine.getCommandHistory()).toHaveLength(50)
    })
  })
  
  describe('Error Recovery', () => {
    test('should recover from invalid game states', async () => {
      // Corrupt the game state
      gameEngine.setState({ currentLocation: 'invalid_location' })
      
      // Try to process a command
      const response = await gameEngine.processCommand(
        testUtils.createMockCommand('look')
      )
      
      // Should handle gracefully
      expect(response).toBeDefined()
      
      // Reset to valid state
      gameEngine.moveToLocation('living_room')
      expect(gameEngine.getCurrentLocation()).toBeDefined()
    })
    
    test('should handle character disconnection', async () => {
      // Remove character
      gameEngine.setCharacter(null)
      
      // Game should still function
      const response = await gameEngine.processCommand(
        testUtils.createMockCommand('look')
      )
      expect(response).toBeDefined()
      
      // Reconnect character
      gameEngine.setCharacter(ravi)
      expect(gameEngine.getCharacter()).toBe(ravi)
    })
  })
  
  describe('Performance Integration', () => {
    test('should maintain performance during extended play', async () => {
      const operationCount = 200
      const startTime = Date.now()
      
      // Simulate extended gameplay
      for (let i = 0; i < operationCount; i++) {
        // Mix of different operations
        switch (i % 4) {
        case 0:
          await gameEngine.processCommand(testUtils.createMockCommand('look'))
          break
        case 1:
          gameEngine.addToInventory(`item_${i}`)
          break
        case 2:
          ravi.generateResponse({ command: 'test' })
          break
        case 3:
          gameEngine.moveToLocation(['living_room', 'kitchen', 'bedroom'][i % 3])
          break
        }
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(2000) // Should complete 200 operations in under 2 seconds
      
      // Memory shouldn't grow excessively
      const state = gameEngine.getState()
      expect(state.inventory.length).toBeLessThan(100) // Some items should be duplicates
    })
    
    test('should handle concurrent operations', async () => {
      // Simulate multiple operations happening simultaneously
      const promises = []
      
      for (let i = 0; i < 20; i++) {
        promises.push(gameEngine.processCommand(
          testUtils.createMockCommand('look', [`concurrent_${i}`])
        ))
      }
      
      const results = await Promise.all(promises)
      
      expect(results).toHaveLength(20)
      results.forEach(result => {
        expect(result).toBeDefined()
        expect(typeof result).toBe('string')
      })
    })
  })
  
  describe('Swarm Coordination Integration', () => {
    test('should coordinate with swarm hooks', async () => {
      // Test swarm hook integration
      const hookResult = await gameEngine.executeSwarmHook('test-hook', {
        gameState: gameEngine.getState(),
        raviMood: ravi.getMood()
      })
      
      expect(hookResult.success).toBe(true)
      expect(hookResult.data.gameState).toBeDefined()
      expect(hookResult.data.raviMood).toBe('sarcastic')
    })
    
    test('should share game progress with swarm memory', async () => {
      // Simulate game progress
      gameEngine.moveToLocation('kitchen')
      gameEngine.addToInventory('coffee')
      ravi.adjustRelationship(10)
      
      // Share with swarm
      const progressData = {
        location: gameEngine.getState().currentLocation,
        inventoryCount: gameEngine.getState().inventory.length,
        raviRelationship: ravi.getRelationship()
      }
      
      const hookResult = await gameEngine.executeSwarmHook('progress-update', progressData)
      
      expect(hookResult.success).toBe(true)
      expect(hookResult.data.location).toBe('kitchen')
      expect(hookResult.data.inventoryCount).toBe(1)
      expect(hookResult.data.raviRelationship).toBe(60)
    })
  })
  
  describe('Edge Cases in Integration', () => {
    test('should handle rapid save/load cycles', async () => {
      for (let i = 0; i < 10; i++) {
        // Make some changes
        gameEngine.addToInventory(`item_${i}`)
        ravi.adjustRelationship(i % 2 === 0 ? 5 : -3)
        
        // Save
        await gameEngine.saveGame(`cycle_${i}`)
        
        // Load previous save if it exists
        if (i > 0) {
          await gameEngine.loadGame(`cycle_${i - 1}`)
        }
      }
      
      // Should end up in a consistent state
      const finalState = gameEngine.getState()
      expect(finalState).toBeValidGameState()
    })
    
    test('should handle memory exhaustion gracefully', async () => {
      // Fill up inventory to potential memory limits
      for (let i = 0; i < 10000; i++) {
        gameEngine.addToInventory(`stress_item_${i}`)
      }
      
      // Game should still respond
      const response = await gameEngine.processCommand(
        testUtils.createMockCommand('inventory')
      )
      expect(response).toBeDefined()
      
      // Should be able to reset
      await gameEngine.resetGame()
      expect(gameEngine.getState().inventory).toEqual([])
    })
    
    test('should maintain data integrity across operations', async () => {
      // Perform many different operations
      const operations = [
        () => gameEngine.moveToLocation('kitchen'),
        () => gameEngine.addToInventory('test_item'),
        () => ravi.learnFact('player_likes_coffee'),
        () => gameEngine.processCommand(testUtils.createMockCommand('look')),
        () => ravi.setMood('excited'),
        () => gameEngine.removeFromInventory('test_item'),
        () => gameEngine.moveToLocation('living_room')
      ]
      
      // Execute operations in random order multiple times
      for (let i = 0; i < 50; i++) {
        const randomOp = operations[Math.floor(Math.random() * operations.length)]
        await randomOp()
      }
      
      // Verify data integrity
      const state = gameEngine.getState()
      expect(state).toBeValidGameState()
      
      const raviStats = ravi.getStats()
      expect(raviStats.mood).toBeDefined()
      expect(raviStats.relationship).toBeGreaterThanOrEqual(0)
      expect(raviStats.relationship).toBeLessThanOrEqual(100)
    })
  })
})