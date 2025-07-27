/**
 * Command Parser Test Suite - PRODUCTION CODE ONLY
 * Testing real CommandParserSync implementation
 */

const CommandParserSync = require('../src/command-parser-sync')
const RealGameEngine = require('../src/real-game-engine')

let parser, gameEngine

beforeEach(async () => {
  gameEngine = new RealGameEngine()
  await gameEngine.initialize()
  parser = new CommandParserSync(gameEngine)
})

describe('Command Parser Functionality', () => {
  describe('Basic Parsing', () => {
    test('should parse simple command', () => {
      const result = parser.parseCommand('help')
      
      expect(result.command).toBe('help')
      expect(result.args).toEqual([])
      expect(result.isValid).toBe(true)
    })

    test('should parse command with arguments', () => {
      const result = parser.parseCommand('go north')
      
      expect(result.command).toBe('go')
      expect(result.args).toEqual(['north'])
      expect(result.isValid).toBe(true)
    })

    test('should parse command with multiple arguments', () => {
      const result = parser.parseCommand('take mysterious key')
      
      expect(result.command).toBe('take')
      expect(result.args).toEqual(['mysterious', 'key'])
      expect(result.isValid).toBe(true)
    })

    test('should handle case insensitive input', () => {
      const result = parser.parseCommand('HELP')
      
      expect(result.command).toBe('help')
      expect(result.isValid).toBe(true)
    })

    test('should trim whitespace', () => {
      const result = parser.parseCommand('  help  ')
      
      expect(result.command).toBe('help')
      expect(result.isValid).toBe(true)
    })

    test('should handle multiple spaces between words', () => {
      const result = parser.parseCommand('go    north')
      
      expect(result.command).toBe('go')
      expect(result.args).toEqual(['north'])
      expect(result.isValid).toBe(true)
    })
  })

  describe('Command Aliases', () => {
    test('should resolve single letter aliases', () => {
      const result = parser.parseCommand('h')
      
      expect(result.command).toBe('help')
      expect(result.isValid).toBe(true)
    })

    test('should resolve word aliases', () => {
      const result = parser.parseCommand('inv')
      
      expect(result.command).toBe('inventory')
      expect(result.isValid).toBe(true)
    })

    test('should handle aliases with arguments', () => {
      const result = parser.parseCommand('n')
      
      expect(result.command).toBe('go')
      expect(result.args).toEqual(['north'])
      expect(result.isValid).toBe(true)
    })
  })

  describe('Directional Commands', () => {
    test('should convert direction words to go commands', () => {
      const result = parser.parseCommand('north')
      
      expect(result.command).toBe('go')
      expect(result.args).toEqual(['north'])
      expect(result.isValid).toBe(true)
    })

    test('should handle directional aliases', () => {
      const result = parser.parseCommand('n')
      
      expect(result.command).toBe('go')
      expect(result.args).toEqual(['north'])
      expect(result.isValid).toBe(true)
    })
  })

  describe('Command Validation', () => {
    test('should validate known commands', () => {
      const result = parser.parseCommand('help')
      
      expect(result.isValid).toBe(true)
      expect(result.error).toBeNull()
    })

    test('should reject unknown commands', () => {
      const result = parser.parseCommand('unknowncommand')
      
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Unknown command')
    })

    test('should mark valid commands in parse result', () => {
      const result = parser.parseCommand('inventory')
      
      expect(result.isValid).toBe(true)
    })

    test('should mark invalid commands in parse result', () => {
      const result = parser.parseCommand('invalidcommand')
      
      expect(result.isValid).toBe(false)
    })
  })

  describe('Error Handling', () => {
    test('should handle empty input', () => {
      const result = parser.parseCommand('')
      
      expect(result.command).toBe('')
      expect(result.args).toEqual([])
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Empty command')
    })
    
    test('should handle whitespace-only input', () => {
      const result = parser.parseCommand('   ')
      
      expect(result.command).toBe('')
      expect(result.args).toEqual([])
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Empty command')
    })

    test('should handle null input', () => {
      const result = parser.parseCommand(null)
      
      expect(result.command).toBe('')
      expect(result.args).toEqual([])
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Invalid input')
    })

    test('should handle undefined input', () => {
      const result = parser.parseCommand(undefined)
      
      expect(result.command).toBe('')
      expect(result.args).toEqual([])
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Invalid input')
    })

    test('should handle non-string input', () => {
      const result = parser.parseCommand(123)
      
      expect(result.command).toBe('')
      expect(result.args).toEqual([])
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Invalid input')
    })
  })

  describe('Alias Management', () => {
    test('should add new alias for valid command', () => {
      const success = parser.addAlias('test', 'help')
      
      expect(success).toBe(true)
      
      const result = parser.parseCommand('test')
      expect(result.command).toBe('help')
      expect(result.isValid).toBe(true)
    })

    test('should reject alias for invalid command', () => {
      const success = parser.addAlias('test', 'invalidcommand')
      
      expect(success).toBe(false)
    })

    test('should remove existing alias', () => {
      parser.addAlias('test', 'help')
      const success = parser.removeAlias('test')
      
      expect(success).toBe(true)
      
      const result = parser.parseCommand('test')
      expect(result.isValid).toBe(false)
    })

    test('should handle removing non-existent alias', () => {
      const success = parser.removeAlias('nonexistent')
      
      expect(success).toBe(false)
    })

    test('should get all aliases', () => {
      const aliases = parser.getAllAliases()
      
      expect(aliases).toBeInstanceOf(Map)
      expect(aliases.has('h')).toBe(true)
      expect(aliases.get('h')).toBe('help')
    })
  })

  describe('Command Information', () => {
    test('should get all valid commands', () => {
      const commands = parser.getValidCommands()
      
      expect(Array.isArray(commands)).toBe(true)
      expect(commands).toContain('help')
      expect(commands).toContain('inventory')
      expect(commands).toContain('go')
    })

    test('should return copy of valid commands array', () => {
      const commands1 = parser.getValidCommands()
      const commands2 = parser.getValidCommands()
      
      expect(commands1).not.toBe(commands2) // Different array instances
      expect(commands1).toEqual(commands2) // Same content
    })
  })

  describe('Complex Input Scenarios', () => {
    test('should handle quoted strings', () => {
      const result = parser.parseCommand('take "mysterious key"')
      
      expect(result.command).toBe('take')
      expect(result.args).toEqual(['"mysterious', 'key"'])
      expect(result.isValid).toBe(true)
    })

    test('should handle commands with punctuation', () => {
      const result = parser.parseCommand('help!')
      
      expect(result.command).toBe('help!')
      expect(result.isValid).toBe(false) // Invalid because of punctuation
    })

    test('should handle very long input', () => {
      const longInput = 'go ' + 'north '.repeat(100)
      const result = parser.parseCommand(longInput)
      
      expect(result.command).toBe('go')
      expect(result.args.length).toBeGreaterThan(0)
    })

    test('should handle special characters', () => {
      const result = parser.parseCommand('help @#$')
      
      expect(result.command).toBe('help')
      expect(result.args).toEqual(['@#$'])
      expect(result.isValid).toBe(true)
    })
  })

  describe('Performance Tests', () => {
    test('should parse commands quickly', () => {
      const start = Date.now()
      
      for (let i = 0; i < 1000; i++) {
        parser.parseCommand('help')
      }
      
      const end = Date.now()
      expect(end - start).toBeLessThan(100) // Should complete in less than 100ms
    })

    test('should handle command with many arguments efficiently', () => {
      const manyArgs = Array(100).fill('arg').join(' ')
      const input = `take ${manyArgs}`
      
      const start = Date.now()
      const result = parser.parseCommand(input)
      const end = Date.now()
      
      expect(result.command).toBe('take')
      expect(result.args.length).toBe(100)
      expect(end - start).toBeLessThan(50)
    })
  })

  describe('Edge Cases', () => {
    test('should handle command with only spaces as arguments', () => {
      const result = parser.parseCommand('go   ')
      
      expect(result.command).toBe('go')
      expect(result.args).toEqual([])
      expect(result.isValid).toBe(true)
    })

    test('should handle commands with tabs and newlines', () => {
      const result = parser.parseCommand('help\t\n')
      
      expect(result.command).toBe('help')
      expect(result.isValid).toBe(true)
    })

    test('should handle unicode characters', () => {
      const result = parser.parseCommand('help 🎮')
      
      expect(result.command).toBe('help')
      expect(result.args).toEqual(['🎮'])
      expect(result.isValid).toBe(true)
    })

    test('should handle numbers in arguments', () => {
      const result = parser.parseCommand('use item123')
      
      expect(result.command).toBe('use')
      expect(result.args).toEqual(['item123'])
      expect(result.isValid).toBe(true)
    })
  })

  describe('Command Execution', () => {
    test('should execute valid commands', () => {
      const result = parser.executeCommand('help')
      
      expect(result.success).toBe(true)
      expect(result.response).toContain('Available Commands')
    })

    test('should handle invalid command execution', () => {
      const result = parser.executeCommand('invalidcommand')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Unknown command')
    })

    test('should execute commands with arguments', () => {
      const result = parser.executeCommand('look')
      
      expect(result.success).toBe(true)
      expect(result.response).toContain('digital')
    })
  })
})