#!/usr/bin/env node

console.log('Starting CLI debug...');

import { Command } from 'commander';
console.log('Commander imported');

const program = new Command();
console.log('Program created');

program
  .name('debug-cli')
  .version('1.0.0')
  .command('start')
  .description('Test start command')
  .action(async () => {
    console.log('Start command executed!');
    
    try {
      // Test figlet
      const figlet = await import('figlet');
      console.log('Figlet loaded');
      
      const banner = figlet.default('Test', { font: 'Standard' });
      console.log('Banner created:', banner);
      
    } catch (error) {
      console.error('Error:', error.message);
    }
  });

console.log('About to parse arguments:', process.argv);
program.parse();
console.log('Parse completed');