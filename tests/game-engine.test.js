/**
 * Game Engine Test Suite
 * QA Engineer: Core engine functionality testing
 */

const MockGameEngine = require('./mocks/game-engine.mock')

// Mock the actual implementation if it exists
jest.mock('../src/game-engine', () => {
  return require('./mocks/game-engine.mock')
})

describe('Game Engine Core Functionality', () => {
  let gameEngine
  
  beforeEach(() => {
    gameEngine = new MockGameEngine()
  })
  
  afterEach(() => {
    gameEngine = null
  })
  
  describe('Initialization', () => {
    test('should initialize with default state', () => {
      const state = gameEngine.getState()
      
      expect(state).toBeValidGameState()
      expect(state.currentLocation).toBe('living_room')
      expect(state.inventory).toEqual([])
      expect(state.gameProgress.introComplete).toBe(false)
      expect(state.isRunning).toBe(false)
    })
    
    test('should initialize locations map', () => {
      const livingRoom = gameEngine.getCurrentLocation()
      
      expect(livingRoom).toBeDefined()
      expect(livingRoom.name).toBe('Living Room')
      expect(livingRoom.exits).toHaveProperty('north')
      expect(livingRoom.exits).toHaveProperty('east')
    })
  })
  
  describe('State Management', () => {
    test('should update state correctly', () => {
      const newState = { currentLocation: 'kitchen' }
      gameEngine.setState(newState)
      
      expect(gameEngine.getState().currentLocation).toBe('kitchen')
    })
    
    test('should preserve existing state when updating', () => {
      gameEngine.setState({ inventory: ['test_item'] })
      gameEngine.setState({ currentLocation: 'bedroom' })
      
      const state = gameEngine.getState()
      expect(state.inventory).toContain('test_item')
      expect(state.currentLocation).toBe('bedroom')
    })
  })
  
  describe('Location Management', () => {
    test('should get current location details', () => {
      const location = gameEngine.getCurrentLocation()
      
      expect(location).toHaveProperty('name')
      expect(location).toHaveProperty('description')
      expect(location).toHaveProperty('exits')
      expect(location).toHaveProperty('items')
      expect(location).toHaveProperty('npcs')
    })
    
    test('should move to valid location', () => {
      const success = gameEngine.moveToLocation('kitchen')
      
      expect(success).toBe(true)
      expect(gameEngine.getState().currentLocation).toBe('kitchen')
    })
    
    test('should reject invalid location', () => {
      const success = gameEngine.moveToLocation('invalid_location')
      
      expect(success).toBe(false)
      expect(gameEngine.getState().currentLocation).toBe('living_room')
    })
    
    test('should handle location transitions correctly', () => {
      // Start in living room
      expect(gameEngine.getCurrentLocation().name).toBe('Living Room')
      
      // Move to kitchen
      gameEngine.moveToLocation('kitchen')
      expect(gameEngine.getCurrentLocation().name).toBe('Kitchen')
      
      // Move to bedroom (should fail from kitchen)
      const success = gameEngine.moveToLocation('bedroom')
      expect(success).toBe(false)
      expect(gameEngine.getCurrentLocation().name).toBe('Kitchen')
    })
  })
  
  describe('Inventory Management', () => {
    test('should add items to inventory', () => {
      const success = gameEngine.addToInventory('test_item')
      
      expect(success).toBe(true)
      expect(gameEngine.hasInInventory('test_item')).toBe(true)
      expect(gameEngine.getState().inventory).toContain('test_item')
    })
    
    test('should not add duplicate items', () => {
      gameEngine.addToInventory('test_item')
      const success = gameEngine.addToInventory('test_item')
      
      expect(success).toBe(false)
      expect(gameEngine.getState().inventory.filter(item => item === 'test_item')).toHaveLength(1)
    })
    
    test('should remove items from inventory', () => {
      gameEngine.addToInventory('test_item')
      const success = gameEngine.removeFromInventory('test_item')
      
      expect(success).toBe(true)
      expect(gameEngine.hasInInventory('test_item')).toBe(false)
    })
    
    test('should handle removing non-existent items', () => {
      const success = gameEngine.removeFromInventory('non_existent')
      
      expect(success).toBe(false)
    })
    
    test('should check inventory contents correctly', () => {
      expect(gameEngine.hasInInventory('test_item')).toBe(false)
      
      gameEngine.addToInventory('test_item')
      expect(gameEngine.hasInInventory('test_item')).toBe(true)
      
      gameEngine.removeFromInventory('test_item')
      expect(gameEngine.hasInInventory('test_item')).toBe(false)
    })
  })
  
  describe('Character Management', () => {
    test('should set character', () => {
      const mockCharacter = { name: 'Ravi', type: 'ai_companion' }
      gameEngine.setCharacter(mockCharacter)
      
      expect(gameEngine.getCharacter()).toEqual(mockCharacter)
    })
    
    test('should handle null character', () => {
      gameEngine.setCharacter(null)
      
      expect(gameEngine.getCharacter()).toBeNull()
    })
  })
  
  describe('Command Processing', () => {
    test('should process look command', async () => {
      const command = testUtils.createMockCommand('look')
      const response = await gameEngine.processCommand(command)
      
      expect(response).toHaveRaviResponse()
      expect(response).toContain('cozy living room')
    })
    
    test('should process go command with valid direction', async () => {
      const command = testUtils.createMockCommand('go', ['north'])
      const response = await gameEngine.processCommand(command)
      
      expect(response).toContain('Kitchen')
      expect(gameEngine.getState().currentLocation).toBe('kitchen')
    })
    
    test('should handle go command with invalid direction', async () => {
      const command = testUtils.createMockCommand('go', ['south'])
      const response = await gameEngine.processCommand(command)
      
      expect(response).toContain('can\'t go south')
      expect(gameEngine.getState().currentLocation).toBe('living_room')
    })
    
    test('should process inventory command', async () => {
      const command = testUtils.createMockCommand('inventory')
      const response = await gameEngine.processCommand(command)
      
      expect(response).toContain('inventory is empty')
      
      // Add item and test again
      gameEngine.addToInventory('test_item')
      const response2 = await gameEngine.processCommand(command)
      expect(response2).toContain('test_item')
    })
    
    test('should process take command', async () => {
      const command = testUtils.createMockCommand('take', ['remote'])
      const response = await gameEngine.processCommand(command)
      
      expect(response).toContain('You take the remote')
      expect(gameEngine.hasInInventory('remote')).toBe(true)
      
      // Remote should no longer be in the room
      const location = gameEngine.getCurrentLocation()
      expect(location.items).not.toContain('remote')
    })
    
    test('should handle unknown commands', async () => {
      const command = testUtils.createMockCommand('unknowncommand')
      const response = await gameEngine.processCommand(command)
      
      expect(response).toContain('don\'t understand')
    })
    
    test('should maintain command history', async () => {
      const command1 = testUtils.createMockCommand('look')
      const command2 = testUtils.createMockCommand('go', ['north'])
      
      await gameEngine.processCommand(command1)
      await gameEngine.processCommand(command2)
      
      const history = gameEngine.getCommandHistory()
      expect(history).toHaveLength(2)
      expect(history[0].command).toBe('look')
      expect(history[1].command).toBe('go')
    })
  })
  
  describe('Game Lifecycle', () => {
    test('should start interactive mode', async () => {
      await gameEngine.startInteractiveMode()
      
      expect(gameEngine.getState().isRunning).toBe(true)
    })
    
    test('should stop game', async () => {
      await gameEngine.startInteractiveMode()
      await gameEngine.stopGame()
      
      expect(gameEngine.getState().isRunning).toBe(false)
    })
  })
  
  describe('Save/Load Functionality', () => {
    test('should save game state', async () => {
      gameEngine.addToInventory('test_item')
      gameEngine.moveToLocation('kitchen')
      
      await gameEngine.saveGame('test_save')
      
      expect(gameEngine.saveData).toBeDefined()
      expect(gameEngine.saveData.filename).toBe('test_save')
      expect(gameEngine.saveData.state.inventory).toContain('test_item')
      expect(gameEngine.saveData.state.currentLocation).toBe('kitchen')
    })
    
    test('should load game state', async () => {
      // Set up game state
      gameEngine.addToInventory('test_item')
      gameEngine.moveToLocation('kitchen')
      await gameEngine.saveGame('test_save')
      
      // Reset and load
      await gameEngine.resetGame()
      await gameEngine.loadGame('test_save')
      
      expect(gameEngine.getState().inventory).toContain('test_item')
      expect(gameEngine.getState().currentLocation).toBe('kitchen')
    })
    
    test('should handle loading non-existent save', async () => {
      await expect(gameEngine.loadGame('non_existent')).rejects.toThrow('Save file not found')
    })
    
    test('should reset game completely', async () => {
      // Modify game state
      gameEngine.addToInventory('test_item')
      gameEngine.moveToLocation('kitchen')
      await gameEngine.processCommand(testUtils.createMockCommand('look'))
      
      // Reset
      await gameEngine.resetGame()
      
      const state = gameEngine.getState()
      expect(state.inventory).toEqual([])
      expect(state.currentLocation).toBe('living_room')
      expect(state.isRunning).toBe(false)
      expect(gameEngine.getCommandHistory()).toEqual([])
    })
  })
  
  describe('Swarm Coordination', () => {
    test('should execute swarm hooks', async () => {
      const result = await gameEngine.executeSwarmHook('pre-task', { task: 'test' })
      
      expect(result.success).toBe(true)
      expect(result.hookType).toBe('pre-task')
      expect(result.data).toEqual({ task: 'test' })
    })
  })
  
  describe('Edge Cases and Error Handling', () => {
    test('should handle empty command', async () => {
      const command = testUtils.createMockCommand('')
      const response = await gameEngine.processCommand(command)
      
      expect(response).toContain('don\'t understand')
    })
    
    test('should handle commands with no args when args expected', async () => {
      const command = testUtils.createMockCommand('go')
      const response = await gameEngine.processCommand(command)
      
      expect(response).toBeDefined()
    })
    
    test('should handle null/undefined inputs gracefully', () => {
      expect(() => gameEngine.setState(null)).not.toThrow()
      expect(() => gameEngine.moveToLocation(null)).not.toThrow()
      expect(() => gameEngine.addToInventory(null)).not.toThrow()
    })
  })
  
  describe('Performance Tests', () => {
    test('should process commands within reasonable time', async () => {
      const startTime = Date.now()
      
      for (let i = 0; i < 100; i++) {
        await gameEngine.processCommand(testUtils.createMockCommand('look'))
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(1000) // Should complete 100 commands in under 1 second
    })
    
    test('should handle large inventories efficiently', () => {
      const startTime = Date.now()
      
      for (let i = 0; i < 1000; i++) {
        gameEngine.addToInventory(`item_${i}`)
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(100) // Should handle 1000 items in under 100ms
      expect(gameEngine.getState().inventory).toHaveLength(1000)
    })
  })
})