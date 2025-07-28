#!/usr/bin/env node

import inquirer from 'inquirer';

console.log('Testing inquirer...');
console.log('TTY status:', process.stdin.isTTY, process.stdout.isTTY);

try {
  const { name } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'What is your name?',
      default: 'TestUser'
    }
  ]);
  
  console.log('You entered:', name);
} catch (error) {
  console.error('Inquirer error:', error.message);
}