#!/usr/bin/env node

/**
 * Ravi's Adventure - Entry Point
 * A hilarious text adventure game about debugging AI
 */

import chalk from 'chalk';
import figlet from 'figlet';
import inquirer from 'inquirer';
import GameEngine from './engine/GameEngine.js';

// Display title
console.log(chalk.cyan(figlet.textSync('Ravi\'s Adventure', {
  font: 'Standard',
  horizontalLayout: 'default',
  verticalLayout: 'default'
})));

console.log(chalk.yellow('🚀 Welcome to the most ridiculous debugging adventure ever!'));
console.log(chalk.gray('Where AI meets comedy and bugs become features!\n'));

class Game {
  constructor() {
    this.engine = new GameEngine();
    this.isRunning = false;
  }

  async start() {
    await this.showMainMenu();
  }

  async showMainMenu() {
    const choices = [
      '🎮 New Game',
      '💾 Load Game',
      '📋 Help',
      '🚪 Quit'
    ];

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: choices
      }
    ]);

    switch (action) {
      case '🎮 New Game':
        await this.startNewGame();
        break;
      case '💾 Load Game':
        await this.loadGame();
        break;
      case '📋 Help':
        this.showHelp();
        await this.showMainMenu();
        break;
      case '🚪 Quit':
        console.log(chalk.yellow('Thanks for playing! May your code be bug-free! 🐛'));
        process.exit(0);
        break;
    }
  }

  async startNewGame() {
    console.log(chalk.green('\n🎯 Starting new adventure...\n'));
    
    const gameState = await this.engine.initialize();
    this.isRunning = true;

    // Show opening story
    this.showOpeningStory();
    
    // Start main game loop
    await this.gameLoop();
  }

  showOpeningStory() {
    console.log(chalk.blue('\n📖 THE STORY BEGINS...\n'));
    console.log(chalk.white('You are Ravi, a senior developer at SwarmTech Inc.'));
    console.log(chalk.white('The company\'s latest AI project has gone rogue, and now'));
    console.log(chalk.white('it\'s threatening to deploy code that would make PHP look elegant.\n'));
    console.log(chalk.white('Your mission: Debug the swarm before it pushes to production!'));
    console.log(chalk.white('Armed with nothing but caffeine and a rubber duck,'));
    console.log(chalk.white('you must navigate the corporate maze and save the day.\n'));
    console.log(chalk.yellow('🎭 Remember: In this office, bugs are features and features are bugs!\n'));
  }

  async gameLoop() {
    while (this.isRunning) {
      // Show current room
      this.displayRoom();
      
      // Get player input
      const { command } = await inquirer.prompt([
        {
          type: 'input',
          name: 'command',
          message: '> ',
          prefix: ''
        }
      ]);

      // Process command
      const result = this.engine.processCommand(command);
      
      // Display result
      this.displayResult(result);
      
      // Check if game should end
      if (result.success && (command.toLowerCase() === 'quit' || command.toLowerCase() === 'exit')) {
        this.isRunning = false;
        await this.showMainMenu();
      }
    }
  }

  displayRoom() {
    const room = this.engine.gameState.currentRoom;
    if (!room) return;
    
    console.log(chalk.blue('\n' + '='.repeat(50)));
    console.log(chalk.cyan(`📍 ${room.name}`));
    console.log(chalk.blue('='.repeat(50)));
    console.log(chalk.white(room.getDescription()));
    console.log('');
  }

  displayResult(result) {
    if (result.success) {
      console.log(chalk.green(`✅ ${result.message}`));
    } else {
      console.log(chalk.red(`❌ ${result.message}`));
    }
    
    // Display additional information
    if (result.room) {
      // Room changed, will be displayed in next loop
    }
    
    if (result.inventory) {
      console.log(chalk.yellow('\n📦 ' + result.message));
    }
    
    if (result.character) {
      console.log(chalk.magenta(`💬 [${result.character}]: ${result.message}`));
    }
    
    console.log(''); // Empty line for spacing
  }

  async loadGame() {
    const saveManager = this.engine.saveManager;
    const savesResult = saveManager.listSaves();
    
    if (!savesResult.success || savesResult.saves.length === 0) {
      console.log(chalk.yellow('No save files found.'));
      await this.showMainMenu();
      return;
    }
    
    const choices = savesResult.saves.map(save => ({
      name: `${save.slotName} (${save.timestamp}) - ${save.playTime}`,
      value: save.slotName
    }));
    
    choices.push({ name: '🔙 Back to Main Menu', value: 'back' });
    
    const { slotName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'slotName',
        message: 'Select a save file:',
        choices: choices
      }
    ]);
    
    if (slotName === 'back') {
      await this.showMainMenu();
      return;
    }
    
    const loadResult = this.engine.saveManager.loadGame(slotName);
    
    if (loadResult.success) {
      this.engine.restoreGameState(loadResult.gameState);
      this.isRunning = true;
      console.log(chalk.green(`\n✅ ${loadResult.message}`));
      await this.gameLoop();
    } else {
      console.log(chalk.red(`\n❌ ${loadResult.message}`));
      await this.showMainMenu();
    }
  }

  showHelp() {
    console.log(chalk.cyan('\n📖 RAVI\'S ADVENTURE - HELP\n'));
    console.log(chalk.white('🎯 OBJECTIVE:'));
    console.log(chalk.white('   Debug the rogue AI swarm before it deploys terrible code!\n'));
    
    console.log(chalk.white('🎮 BASIC COMMANDS:'));
    console.log(chalk.white('   go [direction]     - Move around (north, south, east, west)'));
    console.log(chalk.white('   look [item]        - Examine surroundings or specific items'));
    console.log(chalk.white('   take [item]        - Pick up items'));
    console.log(chalk.white('   use [item]         - Use items from inventory'));
    console.log(chalk.white('   talk [character]   - Talk to characters'));
    console.log(chalk.white('   inventory          - Check your inventory'));
    console.log(chalk.white('   save [slot]        - Save your game'));
    console.log(chalk.white('   load [slot]        - Load a saved game'));
    console.log(chalk.white('   help               - Show this help'));
    console.log(chalk.white('   quit               - Exit to main menu\n'));
    
    console.log(chalk.white('💡 TIPS:'));
    console.log(chalk.white('   • Talk to everyone - they might have clues!'));
    console.log(chalk.white('   • Combine items for powerful effects'));
    console.log(chalk.white('   • Coffee is your friend (and health potion)'));
    console.log(chalk.white('   • The rubber duck knows all secrets'));
    console.log(chalk.white('   • Watch out for the AI - it\'s learning...\n'));
  }
}

// Start the game
const game = new Game();
game.start().catch(error => {
  console.error(chalk.red('💥 Game crashed! Error:'), error);
  process.exit(1);
});