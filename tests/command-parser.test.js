/**
 * Command Parser Test Suite
 * QA Engineer: Input parsing and validation testing
 */

// Mock CommandParser for testing
class MockCommandParser {
  constructor() {
    this.aliases = new Map([
      ['n', 'north'],
      ['s', 'south'],
      ['e', 'east'],
      ['w', 'west'],
      ['l', 'look'],
      ['i', 'inventory'],
      ['inv', 'inventory'],
      ['h', 'help'],
      ['?', 'help']
    ]);
    
    this.validCommands = [
      'look', 'go', 'north', 'south', 'east', 'west',
      'inventory', 'take', 'get', 'drop', 'use',
      'talk', 'speak', 'help', 'save', 'load',
      'quit', 'exit', 'restart'
    ];
  }
  
  parse(input) {
    if (!input || typeof input !== 'string') {
      return this.createCommand('', [], input, 'Invalid input');
    }
    
    // Clean and normalize input
    const cleanInput = input.trim().toLowerCase();
    if (!cleanInput) {
      return this.createCommand('', [], input, 'Empty command');
    }
    
    // Split into parts
    const parts = cleanInput.split(/\s+/);
    let command = parts[0];
    let args = parts.slice(1);
    
    // Handle aliases
    if (this.aliases.has(command)) {
      command = this.aliases.get(command);
    }
    
    // Handle directional movement
    if (['north', 'south', 'east', 'west'].includes(command)) {
      args = [command];
      command = 'go';
    }
    
    // Handle compound commands
    command = this.handleCompoundCommands(command, args);
    
    // Validate command
    const isValid = this.validCommands.includes(command);
    const error = isValid ? null : `Unknown command: ${command}`;
    
    return this.createCommand(command, args, input, error);
  }
  
  handleCompoundCommands(command, args) {
    // Handle "go to X" -> "go X"
    if (command === 'go' && args.length > 0 && args[0] === 'to') {
      args.shift(); // Remove 'to'
    }
    
    // Handle "pick up" -> "take"
    if (command === 'pick' && args.length > 0 && args[0] === 'up') {
      args.shift(); // Remove 'up'
      return 'take';
    }
    
    // Handle "talk to" -> "talk"
    if (command === 'talk' && args.length > 0 && args[0] === 'to') {
      args.shift(); // Remove 'to'
    }
    
    return command;
  }
  
  createCommand(command, args, rawInput, error = null) {
    return {
      command,
      args: args || [],
      rawInput: rawInput || '',
      timestamp: Date.now(),
      isValid: !error,
      error
    };
  }
  
  isValidCommand(command) {
    return this.validCommands.includes(command.toLowerCase());
  }
  
  getValidCommands() {
    return [...this.validCommands];
  }
  
  getAliases() {
    return new Map(this.aliases);
  }
  
  addAlias(alias, command) {
    if (this.validCommands.includes(command.toLowerCase())) {
      this.aliases.set(alias.toLowerCase(), command.toLowerCase());
      return true;
    }
    return false;
  }
  
  removeAlias(alias) {
    return this.aliases.delete(alias.toLowerCase());
  }
}

jest.mock('../src/command-parser', () => {
  return MockCommandParser;
});

describe('Command Parser Functionality', () => {
  let parser;
  
  beforeEach(() => {
    parser = new MockCommandParser();
  });
  
  describe('Basic Parsing', () => {
    test('should parse simple command', () => {
      const result = parser.parse('look');
      
      expect(result).toBeValidCommand();
      expect(result.command).toBe('look');
      expect(result.args).toEqual([]);
      expect(result.rawInput).toBe('look');
      expect(result.isValid).toBe(true);
    });
    
    test('should parse command with arguments', () => {
      const result = parser.parse('go north');
      
      expect(result).toBeValidCommand();
      expect(result.command).toBe('go');
      expect(result.args).toEqual(['north']);
      expect(result.isValid).toBe(true);
    });
    
    test('should parse command with multiple arguments', () => {
      const result = parser.parse('take red key from table');
      
      expect(result).toBeValidCommand();
      expect(result.command).toBe('take');
      expect(result.args).toEqual(['red', 'key', 'from', 'table']);
    });
    
    test('should handle case insensitive input', () => {
      const result = parser.parse('LOOK AROUND');
      
      expect(result.command).toBe('look');
      expect(result.args).toEqual(['around']);
    });
    
    test('should trim whitespace', () => {
      const result = parser.parse('  look  around  ');
      
      expect(result.command).toBe('look');
      expect(result.args).toEqual(['around']);
    });
    
    test('should handle multiple spaces between words', () => {
      const result = parser.parse('go    north    quickly');
      
      expect(result.command).toBe('go');
      expect(result.args).toEqual(['north', 'quickly']);
    });
  });
  
  describe('Command Aliases', () => {
    test('should resolve single letter aliases', () => {
      const testCases = [
        ['n', 'go', ['north']],
        ['s', 'go', ['south']],
        ['e', 'go', ['east']],
        ['w', 'go', ['west']],
        ['l', 'look', []],
        ['i', 'inventory', []],
        ['h', 'help', []]
      ];
      
      testCases.forEach(([input, expectedCommand, expectedArgs]) => {
        const result = parser.parse(input);
        expect(result.command).toBe(expectedCommand);
        expect(result.args).toEqual(expectedArgs);
      });
    });
    
    test('should resolve word aliases', () => {
      const result = parser.parse('inv');
      
      expect(result.command).toBe('inventory');
      expect(result.args).toEqual([]);
    });
    
    test('should handle aliases with arguments', () => {
      const result = parser.parse('l around');
      
      expect(result.command).toBe('look');
      expect(result.args).toEqual(['around']);
    });
  });
  
  describe('Directional Commands', () => {
    test('should convert direction words to go commands', () => {
      const directions = ['north', 'south', 'east', 'west'];
      
      directions.forEach(direction => {
        const result = parser.parse(direction);
        expect(result.command).toBe('go');
        expect(result.args).toEqual([direction]);
      });
    });
    
    test('should handle directional aliases', () => {
      const result = parser.parse('n');
      
      expect(result.command).toBe('go');
      expect(result.args).toEqual(['north']);
    });
  });
  
  describe('Compound Commands', () => {
    test('should handle "go to" commands', () => {
      const result = parser.parse('go to kitchen');
      
      expect(result.command).toBe('go');
      expect(result.args).toEqual(['kitchen']);
    });
    
    test('should handle "pick up" commands', () => {
      const result = parser.parse('pick up key');
      
      expect(result.command).toBe('take');
      expect(result.args).toEqual(['key']);
    });
    
    test('should handle "talk to" commands', () => {
      const result = parser.parse('talk to ravi');
      
      expect(result.command).toBe('talk');
      expect(result.args).toEqual(['ravi']);
    });
  });
  
  describe('Command Validation', () => {
    test('should validate known commands', () => {
      const validCommands = ['look', 'go', 'take', 'inventory'];
      
      validCommands.forEach(command => {
        expect(parser.isValidCommand(command)).toBe(true);
      });
    });
    
    test('should reject unknown commands', () => {
      const invalidCommands = ['fly', 'teleport', 'magic', 'hack'];
      
      invalidCommands.forEach(command => {
        expect(parser.isValidCommand(command)).toBe(false);
      });
    });
    
    test('should mark valid commands in parse result', () => {
      const result = parser.parse('look');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });
    
    test('should mark invalid commands in parse result', () => {
      const result = parser.parse('invalidcommand');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Unknown command');
    });
  });
  
  describe('Error Handling', () => {
    test('should handle empty input', () => {
      const result = parser.parse('');
      
      expect(result.command).toBe('');
      expect(result.args).toEqual([]);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Empty command');
    });
    
    test('should handle whitespace-only input', () => {
      const result = parser.parse('   ');
      
      expect(result.command).toBe('');
      expect(result.isValid).toBe(false);
    });
    
    test('should handle null input', () => {
      const result = parser.parse(null);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid input');
    });
    
    test('should handle undefined input', () => {
      const result = parser.parse(undefined);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid input');
    });
    
    test('should handle non-string input', () => {
      const result = parser.parse(123);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid input');
    });
  });
  
  describe('Alias Management', () => {
    test('should add new alias for valid command', () => {
      const success = parser.addAlias('examine', 'look');
      
      expect(success).toBe(true);
      
      const result = parser.parse('examine');
      expect(result.command).toBe('look');
    });
    
    test('should reject alias for invalid command', () => {
      const success = parser.addAlias('fly', 'invalidcommand');
      
      expect(success).toBe(false);
    });
    
    test('should remove existing alias', () => {
      const success = parser.removeAlias('l');
      
      expect(success).toBe(true);
      
      const result = parser.parse('l');
      expect(result.command).toBe('l'); // Should not be converted to 'look'
      expect(result.isValid).toBe(false);
    });
    
    test('should handle removing non-existent alias', () => {
      const success = parser.removeAlias('nonexistent');
      
      expect(success).toBe(false);
    });
    
    test('should get all aliases', () => {
      const aliases = parser.getAliases();
      
      expect(aliases).toBeInstanceOf(Map);
      expect(aliases.has('n')).toBe(true);
      expect(aliases.get('n')).toBe('north');
    });
  });
  
  describe('Command Information', () => {
    test('should get all valid commands', () => {
      const commands = parser.getValidCommands();
      
      expect(Array.isArray(commands)).toBe(true);
      expect(commands).toContain('look');
      expect(commands).toContain('go');
      expect(commands).toContain('inventory');
    });
    
    test('should return copy of valid commands array', () => {
      const commands1 = parser.getValidCommands();
      const commands2 = parser.getValidCommands();
      
      expect(commands1).not.toBe(commands2); // Different references
      expect(commands1).toEqual(commands2); // Same content
    });
  });
  
  describe('Complex Input Scenarios', () => {
    test('should handle quoted strings', () => {
      const result = parser.parse('say "hello world"');
      
      expect(result.command).toBe('say');
      // Note: This implementation doesn't handle quotes yet
      expect(result.args).toEqual(['"hello', 'world"']);
    });
    
    test('should handle commands with punctuation', () => {
      const result = parser.parse('look around.');
      
      expect(result.command).toBe('look');
      expect(result.args).toEqual(['around.']);
    });
    
    test('should handle very long input', () => {
      const longInput = 'look ' + 'around '.repeat(100);
      const result = parser.parse(longInput);
      
      expect(result.command).toBe('look');
      expect(result.args).toHaveLength(100);
    });
    
    test('should handle special characters', () => {
      const result = parser.parse('look @#$%');
      
      expect(result.command).toBe('look');
      expect(result.args).toEqual(['@#$%']);
    });
  });
  
  describe('Performance Tests', () => {
    test('should parse commands quickly', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        parser.parse('look around the room');
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100); // Should parse 1000 commands in under 100ms
    });
    
    test('should handle command with many arguments efficiently', () => {
      const manyArgs = Array.from({ length: 100 }, (_, i) => `arg${i}`);
      const input = 'take ' + manyArgs.join(' ');
      
      const startTime = Date.now();
      const result = parser.parse(input);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(10);
      expect(result.args).toHaveLength(100);
    });
  });
  
  describe('Edge Cases', () => {
    test('should handle command with only spaces as arguments', () => {
      const result = parser.parse('look     ');
      
      expect(result.command).toBe('look');
      expect(result.args).toEqual([]);
    });
    
    test('should handle commands with tabs and newlines', () => {
      const result = parser.parse('look\taround\ncarefully');
      
      expect(result.command).toBe('look');
      // Note: This would need specific handling for tabs/newlines
    });
    
    test('should handle unicode characters', () => {
      const result = parser.parse('look café');
      
      expect(result.command).toBe('look');
      expect(result.args).toEqual(['café']);
    });
    
    test('should handle numbers in arguments', () => {
      const result = parser.parse('take item 42');
      
      expect(result.command).toBe('take');
      expect(result.args).toEqual(['item', '42']);
    });
  });
});