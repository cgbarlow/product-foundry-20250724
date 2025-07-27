const fs = require('fs').promises
const path = require('path')

/**
 * Real Game Engine - Production implementation replacing mocks
 * Handles all game state, logic, and persistence
 */
class RealGameEngine {
  constructor() {
    this.gameState = {
      isRunning: false,
      playerName: 'Anonymous Adventurer',
      currentLocation: 'start',
      gameTime: 0,
      inventory: [],
      stats: {
        health: 100,
        energy: 100,
        mood: 'curious'
      },
      flags: {},
      relationships: {},
      lastSaved: null
    }
    
    this.locations = {
      start: {
        name: 'Starting Area',
        description: 'You are in a cozy digital space with Ravi. The environment feels warm and welcoming.',
        exits: ['home', 'garden'],
        items: ['mysterious key']
      },
      home: {
        name: 'Home Base',
        description: 'Your virtual home base. A comfortable space where you can rest.',
        exits: ['start', 'library'],
        items: []
      },
      garden: {
        name: 'Digital Garden',
        description: 'A beautiful digital garden with pixelated flowers and geometric trees.',
        exits: ['start'],
        items: ['digital flower']
      },
      library: {
        name: 'Virtual Library',
        description: 'A vast digital library with floating books containing infinite knowledge.',
        exits: ['home'],
        items: ['ancient scroll']
      }
    }

    this.character = null
    this.saveFilePath = path.join(__dirname, '..', 'save-game.json')
  }

  /**
   * Initialize the game engine
   */
  async initialize() {
    this.gameState.isRunning = true
    this.gameState.gameTime = 0
    this.gameState.playerName = 'Anonymous Adventurer'
    
    // Try to load existing save (but keep defaults if none)
    try {
      await this.loadGame()
    } catch (error) {
      // No save file exists, continue with defaults
    }
    
    return true
  }

  /**
   * Start a new game
   */
  startNewGame(playerName = 'Anonymous Adventurer') {
    this.gameState = {
      isRunning: true,
      playerName: playerName || 'Anonymous Adventurer',
      currentLocation: 'start',
      gameTime: 0,
      inventory: [],
      stats: {
        health: 100,
        energy: 100,
        mood: 'curious'
      },
      flags: {},
      relationships: {},
      lastSaved: null
    }
    
    return this.gameState
  }

  /**
   * Get current game state
   */
  getGameState() {
    return { ...this.gameState }
  }

  /**
   * Get current state (alias for compatibility)
   */
  getState() {
    return {
      isRunning: this.gameState.isRunning,
      ...this.gameState
    }
  }

  /**
   * Update game state
   */
  updateGameState(updates) {
    this.gameState = {
      ...this.gameState,
      ...updates
    }
    
    // Increment game time on state changes
    this.gameState.gameTime += 1
    
    return this.gameState
  }

  /**
   * Get current location object
   */
  getCurrentLocation() {
    const locationKey = this.gameState.currentLocation
    const location = this.locations[locationKey]
    
    if (!location) {
      return {
        name: 'Unknown Location',
        description: 'You find yourself in an unknown digital realm.',
        exits: [],
        items: []
      }
    }
    
    return {
      ...location,
      key: locationKey
    }
  }

  /**
   * Get player stats
   */
  getPlayerStats() {
    return { ...this.gameState.stats }
  }

  /**
   * Add item to inventory
   */
  addToInventory(item) {
    if (!this.gameState.inventory.includes(item)) {
      this.gameState.inventory.push(item)
      
      // Remove item from current location
      const currentLocation = this.locations[this.gameState.currentLocation]
      if (currentLocation && currentLocation.items) {
        const itemIndex = currentLocation.items.indexOf(item)
        if (itemIndex > -1) {
          currentLocation.items.splice(itemIndex, 1)
        }
      }
      
      this.gameState.gameTime += 1
      return true
    }
    return false
  }

  /**
   * Remove item from inventory
   */
  removeFromInventory(item) {
    const index = this.gameState.inventory.indexOf(item)
    if (index > -1) {
      this.gameState.inventory.splice(index, 1)
      this.gameState.gameTime += 1
      return true
    }
    return false
  }

  /**
   * Check if item is in inventory
   */
  hasInInventory(item) {
    return this.gameState.inventory.includes(item)
  }

  /**
   * Set story flag
   */
  setFlag(key, value) {
    this.gameState.flags[key] = value
    this.gameState.gameTime += 1
  }

  /**
   * Get story flag
   */
  getFlag(key) {
    return this.gameState.flags[key]
  }

  /**
   * Update relationship with character
   */
  updateRelationship(character, change) {
    if (!this.gameState.relationships[character]) {
      this.gameState.relationships[character] = 0
    }
    
    this.gameState.relationships[character] = Math.max(-100, 
      Math.min(100, this.gameState.relationships[character] + change)
    )
    
    this.gameState.gameTime += 1
  }

  /**
   * Get relationship level
   */
  getRelationship(character) {
    return this.gameState.relationships[character] || 0
  }

  /**
   * Process a command
   */
  async processCommand(command) {
    if (!this.gameState.isRunning) {
      return 'Game is not running. Please start a new game.'
    }

    const cmd = command.command || command
    const args = command.args || []

    switch (cmd) {
      case 'look':
        return this.getCurrentLocation().description
      
      case 'go':
        const direction = args[0]
        return this.moveToLocation(direction)
      
      case 'inventory':
        return this.getInventoryString()
      
      case 'take':
        const item = args.join(' ')
        return this.takeItem(item)
      
      case 'use':
        const useItem = args.join(' ')
        return this.useItem(useItem)
      
      case 'save':
        await this.saveGame()
        return 'Game saved successfully!'
      
      case 'quit':
        this.gameState.isRunning = false
        return 'Thanks for playing!'
      
      default:
        return `Unknown command: ${cmd}. Type 'help' for available commands.`
    }
  }

  /**
   * Move to a location
   */
  moveToLocation(direction) {
    const currentLocation = this.locations[this.gameState.currentLocation]
    
    if (!currentLocation || !currentLocation.exits.includes(direction)) {
      const availableExits = currentLocation ? currentLocation.exits.join(', ') : 'none'
      return `You can't go ${direction} from here. Available directions: ${availableExits}`
    }
    
    this.gameState.currentLocation = direction
    this.gameState.gameTime += 1
    
    const newLocation = this.locations[direction]
    return `You moved to ${newLocation.name}. ${newLocation.description}`
  }

  /**
   * Take an item
   */
  takeItem(item) {
    const currentLocation = this.locations[this.gameState.currentLocation]
    
    if (!currentLocation || !currentLocation.items.includes(item)) {
      return `There's no ${item} here to take.`
    }
    
    this.addToInventory(item)
    return `You took the ${item}.`
  }

  /**
   * Use an item
   */
  useItem(item) {
    if (!this.hasInInventory(item)) {
      return `You don't have ${item} in your inventory.`
    }
    
    // Item effects
    const effects = {
      'digital flower': () => {
        this.gameState.stats.energy = Math.min(100, this.gameState.stats.energy + 10)
        this.gameState.stats.mood = 'energetic'
        return 'The flower brightens your mood! You feel more energetic.'
      },
      'mysterious key': () => {
        return 'The key glows softly but nothing happens... yet.'
      },
      'ancient scroll': () => {
        this.setFlag('read_scroll', true)
        return 'The scroll reveals cryptic symbols that fill you with knowledge!'
      }
    }
    
    const effect = effects[item]
    if (effect) {
      return effect()
    }
    
    return `You examine the ${item} but aren't sure how to use it.`
  }

  /**
   * Get inventory as string
   */
  getInventoryString() {
    if (this.gameState.inventory.length === 0) {
      return 'Your inventory is empty.'
    }
    
    return `Inventory: ${this.gameState.inventory.join(', ')}`
  }

  /**
   * Save game to file
   */
  async saveGame() {
    try {
      this.gameState.lastSaved = new Date().toISOString()
      await fs.writeFile(this.saveFilePath, JSON.stringify(this.gameState, null, 2))
      return true
    } catch (error) {
      console.error('Failed to save game:', error)
      return false
    }
  }

  /**
   * Load game from file
   */
  async loadGame() {
    try {
      const data = await fs.readFile(this.saveFilePath, 'utf-8')
      const savedState = JSON.parse(data)
      
      // Validate saved state
      if (savedState && typeof savedState === 'object') {
        this.gameState = {
          ...this.gameState,
          ...savedState,
          isRunning: true // Always set running when loading
        }
        return true
      }
    } catch (error) {
      // File doesn't exist or is invalid - start new game
      console.log('No valid save file found, starting new game')
    }
    
    return false
  }

  /**
   * Reset game to initial state
   */
  reset() {
    this.startNewGame()
    
    // Reset locations to initial state
    this.locations.start.items = ['mysterious key']
    this.locations.garden.items = ['digital flower']
    this.locations.library.items = ['ancient scroll']
    this.locations.home.items = []
    
    return this.gameState
  }

  /**
   * Set character for interaction
   */
  setCharacter(character) {
    this.character = character
  }

  /**
   * Stop the game
   */
  stop() {
    this.gameState.isRunning = false
  }
}

module.exports = RealGameEngine