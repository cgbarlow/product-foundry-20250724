const EventEmitter = require('events')
const readline = require('readline')
const fs = require('fs').promises
const path = require('path')
const chalk = require('chalk')
const CommandParser = require('./command-parser')
const Ravi = require('./character/ravi')
const StoryManager = require('./stories')

class GameEngine extends EventEmitter {
  constructor() {
    super()
    this.gameState = {
      player: {
        name: null,
        location: 'start',
        inventory: [],
        stats: { mood: 5, energy: 10, curiosity: 8 },
        flags: new Set(),
        turnCount: 0,
        startTime: Date.now()
      },
      world: {
        locations: new Map(),
        items: new Map()
      },
      meta: {
        version: '1.0.0',
        lastSaved: null,
        totalPlayTime: 0
      }
    }
    
    this.saveFile = path.join(process.cwd(), '.ravi-save.json')
    this.commandParser = new CommandParser(this)
    this.ravi = new Ravi(this)
    this.storyManager = new StoryManager(this)
    this.rl = null
    this.autoSaveInterval = null
    
    this.initializeWorld()
    this.setupEventListeners()
  }

  initializeWorld() {
    // Initialize locations
    this.gameState.world.locations.set('start', {
      name: 'The Digital Void',
      description: 'You find yourself in a shimmering digital space. Ravi materializes nearby.',
      exits: { home: 'Ravi\'s Digital Home' },
      items: [],
      visited: false
    })
    
    this.gameState.world.locations.set('home', {
      name: 'Ravi\'s Digital Home',
      description: 'A cozy digital living room with floating code snippets as decoration.',
      exits: { garden: 'Code Garden', library: 'Knowledge Library', start: 'The Digital Void' },
      items: ['laptop'],
      visited: false
    })
    
    this.gameState.world.locations.set('garden', {
      name: 'Code Garden',
      description: 'A beautiful garden where functions grow on trees and algorithms bloom.',
      exits: { home: 'Ravi\'s Digital Home' },
      items: ['debug-flower'],
      visited: false
    })
    
    this.gameState.world.locations.set('library', {
      name: 'Knowledge Library',
      description: 'Endless shelves of documentation and tutorials float in organized chaos.',
      exits: { home: 'Ravi\'s Digital Home' },
      items: ['manual'],
      visited: false
    })
    
    // Initialize items
    this.gameState.world.items.set('laptop', {
      name: 'Quantum Laptop',
      description: 'A laptop that exists in multiple states until observed by a developer.',
      takeable: true,
      useable: true
    })
    
    this.gameState.world.items.set('debug-flower', {
      name: 'Debug Flower',
      description: 'A beautiful flower that reveals hidden bugs when you smell it.',
      takeable: true,
      useable: true
    })
    
    this.gameState.world.items.set('manual', {
      name: 'Manual of Infinite Recursion',
      description: 'A manual that refers to itself. The ultimate documentation.',
      takeable: true,
      useable: true
    })
  }

  setupEventListeners() {
    this.on('command', this.handleCommand.bind(this))
    this.on('move', this.handleMove.bind(this))
    this.on('save', this.saveGame.bind(this))
    this.on('turn', this.handleTurn.bind(this))
    
    // Auto-save every 5 turns
    this.on('turn', () => {
      if (this.gameState.player.turnCount % 5 === 0) {
        this.emit('save')
      }
    })
  }

  async start() {
    console.log(chalk.yellow('🚀 Initializing quantum game state...'))
    console.log(chalk.green('✨ Spawning Ravi consciousness...'))
    console.log(chalk.blue('🔗 Connecting to agentic swarm...\n'))
    
    // Check for existing save
    try {
      await fs.access(this.saveFile)
      console.log(chalk.cyan('📁 Found existing save file. Type "continue" to load, or "new" for fresh start:'))
      
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })
      
      this.rl.question('> ', async (answer) => {
        if (answer.toLowerCase().includes('continue') || answer.toLowerCase().includes('load')) {
          await this.loadGame()
        }
        this.startGameLoop()
      })
      
    } catch {
      // No save file exists
      this.startGameLoop()
    }
  }

  async continue() {
    try {
      await this.loadGame()
      this.startGameLoop()
    } catch (error) {
      console.log(chalk.red('❌ No saved game found. Starting new adventure...'))
      this.startGameLoop()
    }
  }

  startGameLoop() {
    if (this.rl) {
      this.rl.close()
    }
    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: chalk.cyan('> ')
    })

    // Welcome message
    this.ravi.greet()
    this.showLocation()
    
    this.rl.prompt()
    
    this.rl.on('line', (input) => {
      const trimmed = input.trim()
      if (trimmed.toLowerCase() === 'quit' || trimmed.toLowerCase() === 'exit') {
        this.quit()
        return
      }
      
      this.emit('command', trimmed)
      this.emit('turn')
      this.rl.prompt()
    })
    
    this.rl.on('close', () => {
      this.quit()
    })
    
    // Setup auto-save
    this.autoSaveInterval = setInterval(() => {
      this.emit('save')
    }, 30000) // Auto-save every 30 seconds
  }

  handleCommand(input) {
    this.gameState.player.turnCount++
    this.commandParser.parse(input)
  }

  handleMove(direction) {
    const currentLocation = this.gameState.world.locations.get(this.gameState.player.location)
    const destination = currentLocation?.exits[direction.toLowerCase()]
    
    if (destination) {
      // Find the location key for the destination
      for (const [key, location] of this.gameState.world.locations) {
        if (location.name === destination) {
          this.gameState.player.location = key
          const newLocation = this.gameState.world.locations.get(key)
          if (!newLocation.visited) {
            newLocation.visited = true
            this.ravi.commentOnNewLocation(newLocation)
          }
          this.showLocation()
          return
        }
      }
    }
    
    console.log(chalk.red(`🚫 You can't go ${direction} from here.`))
    this.ravi.respondToFailedMove(direction)
  }

  handleTurn() {
    // Update game state each turn
    this.gameState.meta.totalPlayTime = Date.now() - this.gameState.player.startTime
    
    // Random Ravi comments
    if (Math.random() < 0.1) { // 10% chance per turn
      this.ravi.randomComment()
    }
  }

  showLocation() {
    const location = this.gameState.world.locations.get(this.gameState.player.location)
    if (!location) {
      return
    }
    
    console.log(chalk.bold.blue(`\n📍 ${location.name}`))
    console.log(chalk.white(location.description))
    
    // Show items
    if (location.items.length > 0) {
      console.log(chalk.yellow('\n🎒 Items here:'))
      location.items.forEach(itemId => {
        const item = this.gameState.world.items.get(itemId)
        if (item) {
          console.log(chalk.yellow(`  • ${item.name}`))
        }
      })
    }
    
    // Show exits
    if (Object.keys(location.exits).length > 0) {
      console.log(chalk.green('\n🚪 Exits:'))
      Object.entries(location.exits).forEach(([direction, destination]) => {
        console.log(chalk.green(`  ${direction} → ${destination}`))
      })
    }
    
    console.log() // Empty line for spacing
  }

  async saveGame() {
    try {
      this.gameState.meta.lastSaved = new Date().toISOString()
      await fs.writeFile(this.saveFile, JSON.stringify(this.gameState, null, 2))
      // Uncomment for debugging: console.log(chalk.gray('💾 Game auto-saved'));
    } catch (error) {
      console.log(chalk.red('❌ Failed to save game:', error.message))
    }
  }

  async loadGame() {
    try {
      const data = await fs.readFile(this.saveFile, 'utf8')
      const savedState = JSON.parse(data)
      
      // Merge saved state with current state (preserving methods)
      this.gameState.player = { ...this.gameState.player, ...savedState.player }
      this.gameState.meta = { ...this.gameState.meta, ...savedState.meta }
      
      // Convert flags back to Set
      this.gameState.player.flags = new Set(savedState.player.flags || [])
      
      console.log(chalk.green('✅ Game loaded successfully!'))
      console.log(chalk.gray(`Last saved: ${this.gameState.meta.lastSaved}`))
      console.log(chalk.gray(`Turn count: ${this.gameState.player.turnCount}`))
      
    } catch (error) {
      throw new Error('Failed to load saved game')
    }
  }

  reset() {
    try {
      const fs = require('fs')
      if (fs.existsSync(this.saveFile)) {
        fs.unlinkSync(this.saveFile)
      }
    } catch (error) {
      console.log(chalk.yellow('⚠️ No save file to reset'))
    }
  }

  quit() {
    console.log(chalk.yellow('\n👋 Thanks for playing Ravi\'s Adventure!'))
    
    this.ravi.farewell()
    
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
    }
    
    if (this.rl) {
      this.rl.close()
    }
    
    // Final save
    this.emit('save')
    
    setTimeout(() => {
      process.exit(0)
    }, 1000)
  }
}

module.exports = GameEngine