const chalk = require('chalk');

class CommandParser {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.commands = new Map();
    this.setupCommands();
  }
  
  setupCommands() {
    // Core game commands
    this.addCommand('help', this.showHelp.bind(this), 'Show available commands');
    this.addCommand('status', this.showStatus.bind(this), 'Show current game status');
    this.addCommand('inventory', this.showInventory.bind(this), 'Show your inventory');
    this.addCommand('stats', this.showStats.bind(this), 'Show your current stats');
    this.addCommand('save', this.saveGame.bind(this), 'Save the current game');
    this.addCommand('look', this.lookAround.bind(this), 'Look around your current location');
    
    // Movement commands
    this.addCommand('go', this.movePlayer.bind(this), 'Move to a location (e.g., "go north")');
    this.addCommand('move', this.movePlayer.bind(this), 'Alias for go command');
    
    // Interaction commands
    this.addCommand('talk', this.talkToCharacter.bind(this), 'Talk to Ravi or other characters');
    this.addCommand('ask', this.askCharacter.bind(this), 'Ask Ravi a question');
    this.addCommand('tell', this.tellCharacter.bind(this), 'Tell Ravi something');
    
    // Action commands
    this.addCommand('take', this.takeItem.bind(this), 'Take an item');
    this.addCommand('use', this.useItem.bind(this), 'Use an item from inventory');
    this.addCommand('examine', this.examineItem.bind(this), 'Examine an item or location closely');
    
    // Meta commands
    this.addCommand('about', this.showAbout.bind(this), 'Learn about this game');
    this.addCommand('time', this.showTime.bind(this), 'Show current game time');
  }
  
  addCommand(name, handler, description) {
    this.commands.set(name.toLowerCase(), {
      handler,
      description
    });
  }
  
  async parse(input) {
    const parts = input.trim().toLowerCase().split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);
    
    if (this.commands.has(command)) {
      try {
        const result = await this.commands.get(command).handler(args, input.trim());
        return {
          success: true,
          response: result
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    } else {
      // Try to handle natural language with Ravi
      if (this.gameEngine.character) {
        const response = await this.gameEngine.character.handleNaturalLanguage(input.trim());
        return {
          success: true,
          response: response
        };
      }
      
      return {
        success: false,
        error: `Unknown command: "${command}". Type "help" for available commands.`
      };
    }
  }
  
  async showHelp() {
    const helpText = [chalk.cyan('\n=== Available Commands ===')];
    
    for (const [command, info] of this.commands) {
      helpText.push(chalk.green(`  ${command.padEnd(12)}`) + ` - ${info.description}`);
    }
    
    helpText.push('');
    helpText.push(chalk.yellow('You can also talk naturally to Ravi!'));
    helpText.push(chalk.gray('Examples: "What should I do?" or "Tell me about yourself"'));
    helpText.push('');
    
    return helpText.join('\n');
  }
  
  async showStatus() {
    const state = this.gameEngine.getGameState();
    const statusText = [
      chalk.cyan('\n=== Game Status ==='),
      chalk.green(`Player: ${state.playerName || 'Anonymous Adventurer'}`),
      chalk.green(`Location: ${state.currentLocation}`),
      chalk.green(`Game Time: ${state.gameTime} turns`),
      chalk.green(`Mood: ${state.stats.mood}`)
    ];
    
    if (state.lastSaved) {
      statusText.push(chalk.gray(`Last Saved: ${new Date(state.lastSaved).toLocaleString()}`));
    }
    
    statusText.push('');
    return statusText.join('\n');
  }
  
  async showInventory() {
    const state = this.gameEngine.getGameState();
    
    if (state.inventory.length === 0) {
      return chalk.yellow('\n🎒 Your inventory is empty.');
    }
    
    const inventoryText = [
      chalk.cyan('\n=== Inventory ==='),
      ...state.inventory.map((item, index) => 
        chalk.green(`  ${index + 1}. ${item}`)
      ),
      ''
    ];
    
    return inventoryText.join('\n');
  }
  
  async showStats() {
    const stats = this.gameEngine.getPlayerStats();
    
    const statsText = [
      chalk.cyan('\n=== Your Stats ==='),
      chalk.green(`Health: ${stats.health}/100`),
      chalk.green(`Energy: ${stats.energy}/100`),
      chalk.green(`Mood: ${stats.mood}`),
      ''
    ];
    
    return statsText.join('\n');
  }
  
  async saveGame() {
    const success = await this.gameEngine.saveGame();
    return success ? null : chalk.red('Failed to save game.');
  }
  
  async lookAround() {
    const location = this.gameEngine.getCurrentLocation();
    
    // This would typically load location data from story system
    const descriptions = {
      start: 'You are in a cozy digital space with Ravi. The environment feels warm and welcoming, with soft blue light emanating from various screens around you.',
      home: 'Your virtual home base. A comfortable space where you can rest and plan your next adventure.',
      garden: 'A beautiful digital garden with pixelated flowers and geometric trees. The air smells of fresh algorithms.',
      library: 'A vast digital library with floating books containing infinite knowledge. Ravi seems particularly excited here.'
    };
    
    const description = descriptions[location] || 'You find yourself in an unknown digital realm.';
    
    return chalk.cyan('\n👀 ') + description + '\n';
  }
  
  async movePlayer(args) {
    if (args.length === 0) {
      return chalk.red('Where do you want to go? (e.g., "go north" or "go library")');
    }
    
    const direction = args.join(' ');
    
    // Basic location system - would be expanded with proper story system
    const validMoves = {
      start: ['home', 'garden'],
      home: ['start', 'library'],
      garden: ['start'],
      library: ['home']
    };
    
    const currentLocation = this.gameEngine.getCurrentLocation();
    const possibleMoves = validMoves[currentLocation] || [];
    
    if (possibleMoves.includes(direction)) {
      this.gameEngine.updateGameState({ currentLocation: direction });
      
      if (this.gameEngine.character) {
        await this.gameEngine.character.onLocationChange(direction);
      }
      
      return chalk.green(`➡️  You moved to: ${direction}\n`) + await this.lookAround();
    } else {
      return chalk.red(`You can't go "${direction}" from here. Available locations: ${possibleMoves.join(', ') || 'none'}`);
    }
  }
  
  async talkToCharacter() {
    if (this.gameEngine.character) {
      return await this.gameEngine.character.startConversation();
    }
    return chalk.yellow('There\'s no one here to talk to.');
  }
  
  async askCharacter(args, fullInput) {
    if (args.length === 0) {
      return chalk.red('What do you want to ask? (e.g., "ask about the garden")');
    }
    
    if (this.gameEngine.character) {
      const question = fullInput.substring(4); // Remove 'ask ' prefix
      return await this.gameEngine.character.handleQuestion(question);
    }
    
    return chalk.yellow('There\'s no one here to ask.');
  }
  
  async tellCharacter(args, fullInput) {
    if (args.length === 0) {
      return chalk.red('What do you want to tell? (e.g., "tell about your day")');
    }
    
    if (this.gameEngine.character) {
      const message = fullInput.substring(5); // Remove 'tell ' prefix
      return await this.gameEngine.character.handlePlayerMessage(message);
    }
    
    return chalk.yellow('There\'s no one here to tell.');
  }
  
  async takeItem(args) {
    if (args.length === 0) {
      return chalk.red('What do you want to take?');
    }
    
    const item = args.join(' ');
    
    // Simple item system - would be expanded
    const availableItems = {
      start: ['mysterious key'],
      garden: ['digital flower'],
      library: ['ancient scroll']
    };
    
    const currentLocation = this.gameEngine.getCurrentLocation();
    const items = availableItems[currentLocation] || [];
    
    if (items.includes(item)) {
      this.gameEngine.addToInventory(item);
      return chalk.green(`✅ You took the ${item}.`);
    } else {
      return chalk.red(`There's no "${item}" here to take.`);
    }
  }
  
  async useItem(args) {
    if (args.length === 0) {
      return chalk.red('What do you want to use?');
    }
    
    const item = args.join(' ');
    const state = this.gameEngine.getGameState();
    
    if (!state.inventory.includes(item)) {
      return chalk.red(`You don't have "${item}" in your inventory.`);
    }
    
    // Simple use system - would be expanded
    const itemEffects = {
      'mysterious key': 'The key glows softly but nothing happens... yet.',
      'digital flower': 'The flower brightens your mood! You feel more energetic.',
      'ancient scroll': 'The scroll reveals cryptic symbols that make Ravi very excited!'
    };
    
    const effect = itemEffects[item] || `You examine the ${item} but aren't sure how to use it.`;
    
    if (item === 'digital flower') {
      this.gameEngine.updateGameState({
        stats: {
          ...state.stats,
          energy: Math.min(100, state.stats.energy + 10),
          mood: 'energetic'
        }
      });
    }
    
    return chalk.cyan(`✨ ${effect}`);
  }
  
  async examineItem(args) {
    if (args.length === 0) {
      return await this.lookAround();
    }
    
    const item = args.join(' ');
    
    // Simple examine system
    const examineTexts = {
      'mysterious key': 'An ornate digital key with intricate patterns. It pulses with a soft blue light.',
      'digital flower': 'A beautiful pixelated flower that seems to shift colors as you watch it.',
      'ancient scroll': 'An old scroll with mysterious symbols that hurt your eyes to look at directly.'
    };
    
    const description = examineTexts[item] || `You look closely at the ${item} but don't notice anything special.`;
    
    return chalk.cyan(`🔍 ${description}`);
  }
  
  async showAbout() {
    return chalk.cyan([
      '\n=== About Ravi\'s Adventure ===',
      '',
      'This is an interactive adventure game where you explore',
      'a digital world with Ravi, your AI companion.',
      '',
      'Ravi is curious, helpful, and loves to learn about everything.',
      'Talk to him naturally or use commands to interact with the world.',
      '',
      'Built with Node.js and powered by imagination!',
      ''
    ].join('\n'));
  }
  
  async showTime() {
    const state = this.gameEngine.getGameState();
    return chalk.cyan(`⏰ You have been playing for ${state.gameTime} turns.`);
  }
}

module.exports = CommandParser;