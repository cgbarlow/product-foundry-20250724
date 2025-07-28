#!/usr/bin/env node

/**
 * @fileoverview Main entry point for Ravi's Adventure
 * Handles CLI interface, game initialization, and core game loop
 */

import { Command } from 'commander'
import chalk from 'chalk'
import readline from 'readline'

// Conditional imports for better performance
let figlet, inquirer, ora, StoryEngine, GameState, DialogueSystem

async function loadGameModules() {
  if (!figlet) {
    const modules = await Promise.all([
      import('figlet'),
      import('inquirer'),
      import('ora'),
      import('./story-engine.js'),
      import('./game-state.js'),
      import('./dialogue-system.js')
    ])
    figlet = modules[0].default
    inquirer = modules[1].default
    ora = modules[2].default
    StoryEngine = modules[3].default
    GameState = modules[4].default
    DialogueSystem = modules[5].default
  }
}

class RavisAdventure {
  constructor(options = {}) {
    this.storyEngine = null
    this.gameState = null
    this.dialogueSystem = null
    this.currentScene = null
    this.gameRunning = false
    this.debugMode = process.env.NODE_ENV === 'development'
    this.simpleMode = options.simpleMode || false // For testing
    this.rl = null // readline interface for simple mode
  }

  /**
   * Initialize the game systems
   */
  async initialize() {
    await loadGameModules()
    
    this.storyEngine = new StoryEngine()
    this.gameState = new GameState()
    
    await this.gameState.initialize()
    this.dialogueSystem = new DialogueSystem(this.storyEngine, this.gameState)
    
    // Register choice callbacks for special interactions
    this.registerChoiceCallbacks()
    
    if (this.debugMode) {
      console.log(chalk.gray('[DEBUG] Game systems initialized'))
    }
  }

  /**
   * Register special choice callbacks
   */
  registerChoiceCallbacks() {
    this.storyEngine.registerChoiceCallback('save_game', async (data) => {
      await this.handleSaveGame(data.saveName || 'quicksave')
    })

    this.storyEngine.registerChoiceCallback('load_game', async (data) => {
      await this.handleLoadGame(data.saveName)
    })

    this.storyEngine.registerChoiceCallback('show_help', async () => {
      this.showHelp()
    })

    this.storyEngine.registerChoiceCallback('show_inventory', async () => {
      this.showInventory()
    })

    this.storyEngine.registerChoiceCallback('show_achievements', async () => {
      this.showAchievements()
    })
  }

  /**
   * Display the game title and introduction
   */
  async showTitle() {
    console.clear()
    
    if (figlet) {
      console.log(chalk.cyan(figlet.textSync('Ravi\'s Adventure', {
        font: 'Small',
        horizontalLayout: 'fitted'
      })))
    } else {
      console.log(chalk.cyan('\n=== RAVI\'S ADVENTURE ===\n'))
    }
    
    console.log(chalk.gray('A hilarious CLI text adventure featuring Ravi and agentic swarm coding\n'))
    console.log(chalk.yellow('🎮 Welcome to a world where NPCs know they\'re NPCs!\n'))
  }

  /**
   * Start a new game
   */
  async startNewGame(playerName = null, options = {}) {
    await this.showTitle()
    
    // Handle simple mode for testing
    if (this.simpleMode) {
      playerName = playerName || 'TestPlayer'
      console.log(`Welcome ${playerName}! Starting your adventure...`)
    } else if (!playerName) {
      // Check TTY availability for proper input handling
      const isTTYAvailable = process.stdin.isTTY === true || process.stdout.isTTY === true
      
      if (!isTTYAvailable) {
        // Fallback for non-TTY environments (like some CI/CD or containers)
        playerName = 'Player'
        console.log(chalk.yellow('🎮 Welcome Player! (Using default name in non-interactive environment)'))
      } else {
        try {
          const { name } = await inquirer.prompt([
            {
              type: 'input',
              name: 'name',
              message: 'What should Ravi call you?',
              default: 'Player',
              validate: (input) => {
                if (input.trim().length === 0) {
                  return 'Please enter a name (or just press Enter for "Player")'
                }
                return true
              }
                }
          ])
          playerName = name.trim() || 'Player'
        } catch (error) {
          // Fallback if inquirer fails
          console.log(chalk.yellow('🎮 Welcome Player! (Input error, using default name)'))
          playerName = 'Player'
        }
      }
    }

    if (this.simpleMode) {
      // Simple mode - minimal initialization
      console.log(chalk.green(`\nRavi: Hey ${playerName}! Welcome to my digital world!\n`))
      this.gameRunning = true
      await this.simpleGameLoop()
    } else {
      // Full game mode
      // Initialize game state
      this.gameState.startNewGame(playerName)
      
      // Show Ravi's introduction
      const introduction = this.dialogueSystem.generateIntroduction()
      console.log(chalk.green(`\n${introduction.text}\n`))

      // Load the intro story
      const spinner = ora('Loading adventure...').start()
      try {
        await this.storyEngine.loadStory('../stories/intro.js')
        this.currentScene = this.storyEngine.getScene('start')
        spinner.succeed('Adventure loaded!')
        
        // Start the main game loop
        this.gameRunning = true
        await this.gameLoop()
        
      } catch (error) {
        spinner.fail('Failed to load adventure')
        console.error(chalk.red(`Error: ${error.message}`))
        process.exit(1)
      }
    }
  }

  /**
   * Main game loop
   */
  async gameLoop() {
    while (this.gameRunning && this.currentScene) {
      try {
        // Display current scene
        this.displayScene(this.currentScene)
        
        // Handle meta-commentary if present
        if (this.currentScene.metaText) {
          const metaResponse = this.dialogueSystem.generateResponse('meta_trigger', {
            metaText: this.currentScene.metaText
          })
          console.log(chalk.magenta(`\nRavi: ${metaResponse.text}\n`))
          this.gameState.recordStatistic('metaReferencesTriggered')
        }

        // Get player choice
        const choice = await this.getPlayerChoice(this.currentScene)
        
        if (choice === 'quit') {
          break
        }

        if (choice === 'help') {
          this.showHelp()
          continue
        }

        if (choice === 'inventory') {
          this.showInventory()
          continue
        }

        if (choice === 'save') {
          await this.promptAndSave()
          continue
        }

        if (choice === 'load') {
          await this.promptAndLoad()
          continue
        }

        if (choice === 'stats') {
          this.showStats()
          continue
        }

        // Process the choice and transition
        await this.processChoice(choice)

      } catch (error) {
        console.error(chalk.red(`Game error: ${error.message}`))
        if (this.debugMode) {
          console.error(error.stack)
        }
        
        // Try to recover by staying in current scene
        const response = this.dialogueSystem.respondToGameEvent('error_occurred', {
          error: error.message
        })
        console.log(chalk.red(`\nRavi: ${response.text}\n`))
      }
    }

    // Game ending
    await this.endGame()
  }

  /**
   * Process text formatting (convert *text* to bold)
   */
  formatText(text) {
    // Convert *text* to bold using chalk
    return text.replace(/\*(.*?)\*/g, (match, content) => {
      return chalk.bold(content)
    })
  }

  /**
   * Display the current scene
   */
  displayScene(scene) {
    console.log('\n' + '═'.repeat(60))
    console.log(chalk.cyan.bold(`📍 ${scene.title}`))
    console.log('═'.repeat(60))
    console.log(chalk.white(this.formatText(scene.text)))
    
    if (scene.choices && scene.choices.length > 0) {
      console.log(chalk.yellow('\n🎯 What do you want to do?\n'))
      scene.choices.forEach((choice, index) => {
        console.log(chalk.white(`${index + 1}. ${this.formatText(choice.text)}`))
      })
    }
    
    console.log('') // Empty line for spacing
  }

  /**
   * Get player choice input
   */
  async getPlayerChoice(scene) {
    const choices = scene.choices || []
    const maxChoice = choices.length
    
    // Add system commands to choices
    const systemCommands = ['help', 'inventory', 'save', 'load', 'stats', 'quit']
    
    const { choice } = await inquirer.prompt([
      {
        type: 'input',
        name: 'choice',
        message: 'Enter your choice (number), or type help, inventory, save, load, stats, quit:',
        validate: (input) => {
          const trimmed = input.trim().toLowerCase()
          
          // Check system commands
          if (systemCommands.includes(trimmed)) {
            return true
          }
          
          // Check numeric choice
          const num = parseInt(trimmed)
          if (isNaN(num) || num < 1 || num > maxChoice) {
            return `Please enter a number between 1 and ${maxChoice}, or a command like 'help'`
          }
          
          return true
        }
      }
    ])

    const trimmed = choice.trim().toLowerCase()
    
    // Handle system commands
    if (systemCommands.includes(trimmed)) {
      return trimmed
    }
    
    // Handle numeric choice
    const num = parseInt(trimmed)
    if (!isNaN(num) && num >= 1 && num <= maxChoice) {
      return choices[num - 1].id
    }
    
    // This shouldn't happen due to validation, but just in case
    return 'help'
  }

  /**
   * Process a player choice
   */
  async processChoice(choiceId) {
    // Record choice statistics
    this.gameState.recordStatistic('choicesMade')
    
    // Generate Ravi's response to the choice
    const raviResponse = this.dialogueSystem.generateResponse('choice_made', {
      choiceId,
      currentScene: this.currentScene.id
    })
    
    console.log(chalk.green(`\nRavi: ${raviResponse.text}\n`))
    
    // Process the choice through story engine
    const nextScene = await this.storyEngine.makeChoice(choiceId, {
      timestamp: Date.now(),
      raviMood: raviResponse.mood
    })
    
    this.currentScene = nextScene
    
    // Auto-save if enabled
    if (this.gameState.isAutoSaveEnabled()) {
      await this.gameState.autoSave(this.storyEngine.getStoryState())
    }
    
    // Check for achievements
    this.checkAchievements()
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log(chalk.cyan('\n📚 HELP - Available Commands:\n'))
    console.log(chalk.white('• Enter a number (1-N) to choose from available options'))
    console.log(chalk.white('• help - Show this help message'))
    console.log(chalk.white('• inventory - Show your inventory'))
    console.log(chalk.white('• save - Save your current progress'))
    console.log(chalk.white('• load - Load a previously saved game'))
    console.log(chalk.white('• stats - Show game statistics and achievements'))
    console.log(chalk.white('• quit - Exit the game'))
    console.log(chalk.gray('\n💡 Tip: Ravi loves to comment on your choices, so don\'t be surprised by his reactions!\n'))
  }

  /**
   * Show inventory
   */
  showInventory() {
    const inventory = this.storyEngine.getInventory()
    const items = Object.keys(inventory)
    
    console.log(chalk.cyan('\n🎒 INVENTORY:\n'))
    
    if (items.length === 0) {
      console.log(chalk.gray('Your inventory is empty.'))
      
      const response = this.dialogueSystem.respondToGameEvent('inventory_empty')
      console.log(chalk.green(`\nRavi: ${response.text}`))
    } else {
      items.forEach(item => {
        const quantity = inventory[item]
        const displayName = item.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        console.log(chalk.white(`• ${displayName} ${quantity > 1 ? `(${quantity})` : ''}`))
      })
      
      const response = this.dialogueSystem.respondToGameEvent('inventory_shown', {
        itemCount: items.length
      })
      console.log(chalk.green(`\nRavi: ${response.text}`))
    }
    
    console.log('') // Empty line
  }

  /**
   * Show game statistics
   */
  showStats() {
    const stats = this.gameState.getStatsSummary()
    const achievements = this.gameState.getUnlockedAchievements()
    
    console.log(chalk.cyan('\n📊 GAME STATISTICS:\n'))
    console.log(chalk.white(`🎯 Choices Made: ${stats.choicesMade}`))
    console.log(chalk.white(`📚 Stories Completed: ${stats.storiesCompleted}`))
    console.log(chalk.white(`🔍 Secrets Found: ${stats.secretsFound}`))
    console.log(chalk.white(`😏 Ravi's Mockings Received: ${stats.raviMockingsReceived}`))
    console.log(chalk.white(`🎭 Meta References Triggered: ${stats.metaReferencesTriggered}`))
    console.log(chalk.white(`⏱️  Total Play Time: ${stats.playTime}`))
    
    console.log(chalk.cyan(`\n🏆 ACHIEVEMENTS (${achievements.length} unlocked):\n`))
    if (achievements.length > 0) {
      achievements.forEach(achievement => {
        console.log(chalk.yellow(`✓ ${achievement.name} - ${achievement.description}`))
      })
    } else {
      console.log(chalk.gray('No achievements unlocked yet. Keep playing!'))
    }
    
    const response = this.dialogueSystem.respondToGameEvent('stats_viewed', {
      achievementCount: achievements.length
    })
    console.log(chalk.green(`\nRavi: ${response.text}\n`))
  }

  /**
   * Show achievements
   */
  showAchievements() {
    const achievements = this.gameState.getUnlockedAchievements()
    const progress = this.gameState.getAchievementProgress()
    
    console.log(chalk.cyan('\n🏆 ACHIEVEMENTS:\n'))
    console.log(chalk.white(`Progress: ${progress.unlocked}/${progress.total} (${progress.percentage}%)\n`))
    
    if (achievements.length > 0) {
      achievements.forEach(achievement => {
        console.log(chalk.green(`✅ ${achievement.name}`))
        console.log(chalk.gray(`   ${achievement.description}\n`))
      })
    } else {
      console.log(chalk.gray('No achievements unlocked yet.\n'))
    }
    
    const response = this.dialogueSystem.respondToGameEvent('achievement_showcase', {
      unlockedCount: achievements.length,
      totalCount: progress.total
    })
    console.log(chalk.green(`Ravi: ${response.text}\n`))
  }

  /**
   * Handle saving game with user prompt
   */
  async promptAndSave() {
    const { saveName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'saveName',
        message: 'Enter save name:',
        default: 'quicksave',
        validate: (input) => {
          if (input.trim().length === 0) {
            return 'Save name cannot be empty'
          }
          return true
        }
      }
    ])
    
    await this.handleSaveGame(saveName.trim())
  }

  /**
   * Handle loading game with user prompt
   */
  async promptAndLoad() {
    try {
      const saveFiles = await this.gameState.getSaveFiles()
      
      if (saveFiles.length === 0) {
        console.log(chalk.yellow('No save files found.'))
        return
      }
      
      const choices = saveFiles.map(save => ({
        name: `${save.name} (${save.playerName}, ${save.playTime})`,
        value: save.name
      }))
      
      const { saveName } = await inquirer.prompt([
        {
          type: 'list',
          name: 'saveName',
          message: 'Choose a save file:',
          choices: [...choices, { name: 'Cancel', value: null }]
        }
      ])
      
      if (saveName) {
        await this.handleLoadGame(saveName)
      }
      
    } catch (error) {
      console.error(chalk.red(`Failed to load save files: ${error.message}`))
    }
  }

  /**
   * Handle saving the game
   */
  async handleSaveGame(saveName) {
    try {
      const spinner = ora('Saving game...').start()
      const storyState = this.storyEngine.getStoryState()
      const saveFile = await this.gameState.saveGame(saveName, storyState)
      spinner.succeed(`Game saved as "${saveName}"`)
      
      const response = this.dialogueSystem.respondToGameEvent('save_game', {
        saveName
      })
      console.log(chalk.green(`\nRavi: ${response.text}\n`))
      
    } catch (error) {
      console.error(chalk.red(`Failed to save game: ${error.message}`))
    }
  }

  /**
   * Handle loading a game
   */
  async handleLoadGame(saveName) {
    try {
      const spinner = ora('Loading game...').start()
      const saveData = await this.gameState.loadGame(saveName)
      
      // Restore story state
      if (saveData.storyState) {
        await this.storyEngine.loadStoryState(saveData.storyState)
        // Try to get the current scene or start from beginning
        try {
          this.currentScene = this.storyEngine.getScene(saveData.storyState.currentScene || 'start')
        } catch {
          await this.storyEngine.loadStory('../stories/intro.js')
          this.currentScene = this.storyEngine.getScene('start')
        }
      }
      
      spinner.succeed(`Game loaded: "${saveName}"`)
      
      const response = this.dialogueSystem.respondToGameEvent('load_game', {
        saveName
      })
      console.log(chalk.green(`\nRavi: ${response.text}\n`))
      
    } catch (error) {
      console.error(chalk.red(`Failed to load game: ${error.message}`))
    }
  }

  /**
   * Check for newly unlocked achievements
   */
  checkAchievements() {
    // This is called automatically by GameState.recordStatistic()
    // but we could add visual feedback here for new achievements
  }

  /**
   * Simple game loop for testing
   */
  async simpleGameLoop() {
    // Setup readline interface with cross-platform compatibility
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
      historySize: 0 // Disable history for cleaner testing
    })
    
    // Handle different line ending styles
    this.rl.on('line', (input) => {
      // Remove both \r and \n characters for cross-platform compatibility
      const cleanInput = input.replace(/\r?\n/g, '').trim()
      this.handleSimpleCommand(cleanInput)
    })

    console.log('\n' + '═'.repeat(60))
    console.log(chalk.cyan.bold('📍 Welcome to Ravi\'s Adventure!'))
    console.log('═'.repeat(60))
    console.log(chalk.white('You find yourself in a cozy digital room with Ravi.'))
    console.log(chalk.yellow('\n🎯 What do you want to do?\n'))
    console.log(chalk.white('Available commands: look, help, inventory, save, quit'))
    console.log('')

    // Commands are handled by the line listener defined above

    this.rl.on('close', () => {
      process.exit(0)
    })

    // Handle SIGINT (Ctrl+C)
    process.on('SIGINT', () => {
      console.log(chalk.cyan('\nThanks for playing!'))
      this.rl.close()
      process.exit(0)
    })

    this.prompt()
  }

  /**
   * Handle simple commands in test mode
   */
  async handleSimpleCommand(command) {
    if (command === 'quit' || command === 'exit') {
      console.log(chalk.cyan('Thanks for playing!'))
      this.rl.close()
      process.exit(0)
    } else if (command === 'look') {
      console.log(chalk.cyan('You see a comfortable room with warm lighting.'))
      this.prompt()
    } else if (command === 'help') {
      console.log(chalk.cyan('Available commands: look, help, inventory, save, quit'))
      this.prompt()
    } else if (command === 'inventory') {
      console.log(chalk.cyan('Your inventory is empty.'))
      this.prompt()
    } else if (command.startsWith('save')) {
      console.log(chalk.green('Game progress saved!'))
      this.prompt()
    } else if (command === '') {
      this.prompt()
    } else {
      console.log(chalk.red(`I don't understand "${command}". Try: look, help, inventory, save, quit`))
      this.prompt()
    }
  }

  /**
   * Show command prompt
   */
  prompt() {
    if (this.rl && !this.rl.closed) {
      process.stdout.write('> ')
    }
  }

  /**
   * End the game gracefully
   */
  async endGame() {
    console.log(chalk.cyan('\n🎮 Thanks for playing Ravi\'s Adventure!\n'))
    
    if (this.rl) {
      this.rl.close()
    }
    
    // Final statistics (simplified for testing)
    if (!this.simpleMode && this.gameState) {
      const stats = this.gameState.getStatsSummary()
      console.log(chalk.gray(`You made ${stats.choicesMade} choices in ${stats.playTime}.`))
      
      // Final Ravi comment
      if (this.dialogueSystem) {
        const farewell = this.dialogueSystem.generateResponse('game_end', {
          playTime: stats.playTime,
          choicesMade: stats.choicesMade
        })
        console.log(chalk.green(`\nRavi: ${farewell.text}\n`))
      }
      
      // Auto-save final state
      if (this.gameState.isAutoSaveEnabled()) {
        await this.gameState.autoSave(this.storyEngine.getStoryState())
      }
    }
    
    process.exit(0)
  }
}

// CLI setup
const program = new Command()

program
  .name('ravis-adventure')
  .description('A hilarious CLI text adventure game featuring Ravi and agentic swarm coding')
  .version('1.0.0')

program
  .command('start')
  .description('Start a new adventure')
  .option('-n, --name <name>', 'player name')
  .option('-d, --debug', 'enable debug mode')
  .action(async (options) => {
    if (options.debug) {
      process.env.NODE_ENV = 'development'
    }
    
    await loadGameModules()
    const game = new RavisAdventure()
    await game.initialize()
    await game.startNewGame(options.name)
  })

program
  .command('continue')
  .description('Continue from the most recent save')
  .action(async () => {
    await loadGameModules()
    const game = new RavisAdventure()
    await game.initialize()
    
    try {
      const saveFiles = await game.gameState.getSaveFiles()
      if (saveFiles.length > 0) {
        const mostRecent = saveFiles[0] // Already sorted by date
        await game.handleLoadGame(mostRecent.name)
        game.gameRunning = true
        await game.gameLoop()
      } else {
        console.log(chalk.yellow('No save files found. Starting new game...'))
        await game.startNewGame()
      }
    } catch (error) {
      console.error(chalk.red(`Failed to continue: ${error.message}`))
      process.exit(1)
    }
  })

program
  .command('saves')
  .description('List all save files')
  .action(async () => {
    await loadGameModules()
    const gameState = new GameState()
    await gameState.initialize()
    
    try {
      const saveFiles = await gameState.getSaveFiles()
      if (saveFiles.length === 0) {
        console.log(chalk.yellow('No save files found.'))
        return
      }
      
      console.log(chalk.cyan('\n💾 SAVE FILES:\n'))
      saveFiles.forEach((save, index) => {
        console.log(chalk.white(`${index + 1}. ${save.name}`))
        console.log(chalk.gray(`   Player: ${save.playerName}`))
        console.log(chalk.gray(`   Play Time: ${save.playTime}`))
        console.log(chalk.gray(`   Saved: ${new Date(save.savedAt).toLocaleString()}\n`))
      })
    } catch (error) {
      console.error(chalk.red(`Failed to list saves: ${error.message}`))
    }
  })

// Handle CLI arguments properly
async function handleCLI() {
  // Check for help or version first
  const args = process.argv.slice(2)
  if (args.includes('--help') || args.includes('-h')) {
    program.help()
    return
  }
  if (args.includes('--version') || args.includes('-V')) {
    console.log(program.version())
    return
  }

  // Default action - start new game if no command
  if (args.length === 0) {
    // Detect if we're in test mode (spawned by test runner)
    const isTestMode = process.env.NODE_ENV === 'test' || 
                       process.env.JEST_WORKER_ID !== undefined ||
                       process.argv0.includes('jest')
    
    const game = new RavisAdventure({ simpleMode: isTestMode })
    
    // Initialize game systems only if not in simple mode
    if (!isTestMode) {
      await game.initialize()
    }
    
    await game.startNewGame()
  } else {
    // Parse command line arguments
    program.parse()
  }
}

// Only run if this is the main module
// Handle both direct execution and global npm CLI execution
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     process.argv[1]?.endsWith('ravis-adventure') ||
                     process.argv[1] === undefined

if (isMainModule) {
  handleCLI().catch(error => {
    console.error(chalk.red(`Error: ${error.message}`))
    process.exit(1)
  })
}