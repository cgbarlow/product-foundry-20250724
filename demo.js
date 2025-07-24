#!/usr/bin/env node

// Demo script to showcase Ravi's Adventure game engine
const chalk = require('chalk');

console.log(chalk.cyan('🎮 Ravi\'s Adventure - Core Engine Demo\n'));

console.log(chalk.green('✅ Core Features Implemented:'));
console.log('  • CLI interface with Commander.js');
console.log('  • Event-driven game engine');
console.log('  • Ravi AI character with personality');
console.log('  • Command parser with natural language');
console.log('  • Save/load functionality');
console.log('  • Story system foundation');
console.log('  • Interactive mode with readline');

console.log(chalk.yellow('\n🎯 Key Commands Available:'));
console.log('  • ravis-adventure start       - Start new game');
console.log('  • ravis-adventure continue    - Load saved game');
console.log('  • ravis-adventure reset       - Reset game data');

console.log(chalk.blue('\n🤖 Ravi\'s Capabilities:'));
console.log('  • Natural conversation');
console.log('  • Helpful guidance');
console.log('  • Memory of interactions');
console.log('  • Location awareness');
console.log('  • Emotional responses');

console.log(chalk.magenta('\n🎮 In-Game Commands:'));
console.log('  • help                        - Show all commands');
console.log('  • talk/ask/tell              - Interact with Ravi');
console.log('  • go [location]              - Move around');
console.log('  • look/examine               - Explore environment');
console.log('  • inventory/stats/status     - Check progress');
console.log('  • save                       - Save progress');

console.log(chalk.cyan('\n🚀 Try it now:'));
console.log(chalk.white('  npx ravis-adventure start\n'));