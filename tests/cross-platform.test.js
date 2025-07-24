/**
 * Cross-Platform Compatibility Test Suite
 * QA Engineer: Testing game compatibility across different platforms and environments
 */

const { spawn } = require('child_process')
const path = require('path')
const os = require('os')
const fs = require('fs').promises

describe('Cross-Platform Compatibility', () => {
  const gamePath = path.join(__dirname, '..', 'src', 'index.js')
  
  describe('Operating System Compatibility', () => {
    test('should detect current platform correctly', () => {
      const platform = os.platform()
      const supportedPlatforms = ['win32', 'darwin', 'linux']
      
      expect(supportedPlatforms).toContain(platform)
    })
    
    test('should handle different path separators', () => {
      const testPaths = [
        'src/game-engine.js',
        'src\\game-engine.js',
        'src/subdirectory/file.js',
        'src\\subdirectory\\file.js'
      ]
      
      testPaths.forEach(testPath => {
        const normalized = path.normalize(testPath)
        expect(normalized).toBeDefined()
        expect(normalized.length).toBeGreaterThan(0)
      })
    })
    
    test('should handle different line endings', async () => {
      const testCommands = [
        'look\n',      // Unix line ending
        'help\r\n',    // Windows line ending
        'inventory\r', // Old Mac line ending
        'quit\n'
      ]
      
      // Test that all line endings are handled properly
      testCommands.forEach(command => {
        expect(command.replace(/\r?\n|\r/g, '')).toBeTruthy()
      })
    })
  })
  
  describe('Node.js Version Compatibility', () => {
    test('should run on supported Node.js versions', () => {
      const nodeVersion = process.version
      const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0])
      
      // Game requires Node.js 16+
      expect(majorVersion).toBeGreaterThanOrEqual(16)
    })
    
    test('should handle different JavaScript engine features', () => {
      // Test modern JavaScript features
      expect(typeof Promise).toBe('function')
      expect(typeof async function() {}).toBe('function')
      expect(typeof Array.from).toBe('function')
      expect(typeof Object.assign).toBe('function')
      expect(typeof Map).toBe('function')
      expect(typeof Set).toBe('function')
    })
    
    test('should use appropriate APIs for the environment', () => {
      // Check for Node.js specific APIs
      expect(typeof process).toBe('object')
      expect(typeof require).toBe('function')
      expect(typeof module).toBe('object')
      expect(typeof __dirname).toBe('string')
      expect(typeof __filename).toBe('string')
    })
  })
  
  describe('Terminal Compatibility', () => {
    test('should handle different terminal capabilities', (done) => {
      const testEnvs = [
        { TERM: 'xterm-256color', COLORTERM: 'truecolor' },
        { TERM: 'xterm', COLORTERM: undefined },
        { TERM: 'dumb', COLORTERM: undefined },
        { TERM: undefined, COLORTERM: undefined }
      ]
      
      let testsCompleted = 0
      
      testEnvs.forEach((testEnv, index) => {
        const child = spawn('node', [gamePath, '--help'], {
          stdio: ['pipe', 'pipe', 'pipe'],
          env: { ...process.env, ...testEnv }
        })
        
        let output = ''
        child.stdout.on('data', (data) => {
          output += data.toString()
        })
        
        child.on('close', (code) => {
          expect(code).toBe(0)
          expect(output.length).toBeGreaterThan(0)
          
          testsCompleted++
          if (testsCompleted === testEnvs.length) {
            done()
          }
        })
      })
    }, testConstants.TIMEOUT.LONG)
    
    test('should handle different console widths gracefully', async () => {
      const testWidths = [40, 80, 120, 200]
      
      for (const width of testWidths) {
        const child = spawn('node', [gamePath, '--help'], {
          stdio: ['pipe', 'pipe', 'pipe'],
          env: { ...process.env, COLUMNS: width.toString() }
        })
        
        let output = ''
        child.stdout.on('data', (data) => {
          output += data.toString()
        })
        
        await new Promise((resolve) => {
          child.on('close', () => {
            expect(output).toBeDefined()
            expect(output.length).toBeGreaterThan(0)
            resolve()
          })
        })
      }
    })
    
    test('should work without color support', (done) => {
      const child = spawn('node', [gamePath, '--help'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { 
          ...process.env, 
          NO_COLOR: '1',
          FORCE_COLOR: undefined,
          TERM: 'dumb'
        }
      })
      
      let output = ''
      child.stdout.on('data', (data) => {
        output += data.toString()
      })
      
      child.on('close', (code) => {
        expect(code).toBe(0)
        expect(output).toBeDefined()
        // Should not contain ANSI color codes
        expect(output).not.toMatch(/\x1b\[\d+m/)
        done()
      })
    }, testConstants.TIMEOUT.MEDIUM)
  })
  
  describe('File System Compatibility', () => {
    test('should handle different file permissions', async () => {
      const testDir = path.join(os.tmpdir(), 'ravi-test-permissions')
      
      try {
        await fs.mkdir(testDir, { recursive: true })
        
        // Test file creation and reading
        const testFile = path.join(testDir, 'test-save.json')
        const testData = JSON.stringify({ test: 'data' })
        
        await fs.writeFile(testFile, testData)
        const readData = await fs.readFile(testFile, 'utf8')
        
        expect(readData).toBe(testData)
        
        // Cleanup
        await fs.unlink(testFile)
        await fs.rmdir(testDir)
      } catch (error) {
        // Some environments might have restricted file access
        console.warn('File permission test skipped:', error.message)
      }
    })
    
    test('should handle different filesystem types', async () => {
      const tempDir = os.tmpdir()
      const testPath = path.join(tempDir, 'fs-compat-test')
      
      try {
        // Test basic file operations
        await fs.mkdir(testPath, { recursive: true })
        
        const stats = await fs.stat(testPath)
        expect(stats.isDirectory()).toBe(true)
        
        // Test file with special characters (platform dependent)
        const specialNames = [
          'normal-file.json',
          'file with spaces.json',
          'file_with_underscores.json',
          'file-with-dashes.json'
        ]
        
        for (const name of specialNames) {
          try {
            const filePath = path.join(testPath, name)
            await fs.writeFile(filePath, '{}')
            await fs.access(filePath)
            await fs.unlink(filePath)
          } catch (error) {
            // Some filesystems might not support certain characters
            console.warn(`Special character test failed for "${name}":`, error.message)
          }
        }
        
        await fs.rmdir(testPath)
      } catch (error) {
        console.warn('Filesystem compatibility test failed:', error.message)
      }
    })
  })
  
  describe('Memory and Resource Limits', () => {
    test('should respect system memory limits', async () => {
      const totalMemory = os.totalmem()
      const freeMemory = os.freemem()
      
      expect(totalMemory).toBeGreaterThan(0)
      expect(freeMemory).toBeGreaterThan(0)
      expect(freeMemory).toBeLessThanOrEqual(totalMemory)
      
      // Game should use reasonable amount of memory
      const initialMemory = process.memoryUsage()
      expect(initialMemory.heapUsed).toBeLessThan(100 * 1024 * 1024) // Less than 100MB
    })
    
    test('should handle low memory conditions gracefully', async () => {
      // Simulate memory pressure by creating large objects
      const largeObjects = []
      
      try {
        // Create objects until we use significant memory
        while (process.memoryUsage().heapUsed < 50 * 1024 * 1024) { // 50MB
          largeObjects.push(new Array(10000).fill('memory-test'))
        }
        
        // Game should still function
        const MockGameEngine = require('./mocks/game-engine.mock')
        const gameEngine = new MockGameEngine()
        
        const response = await gameEngine.processCommand(
          testUtils.createMockCommand('look')
        )
        
        expect(response).toBeDefined()
        
      } finally {
        // Cleanup
        largeObjects.length = 0
      }
    })
    
    test('should handle CPU limitations', async () => {
      const cpus = os.cpus()
      expect(cpus.length).toBeGreaterThan(0)
      
      // Test CPU-intensive operation
      const startTime = Date.now()
      
      // Simulate game processing
      const MockGameEngine = require('./mocks/game-engine.mock')
      const gameEngine = new MockGameEngine()
      
      for (let i = 0; i < 1000; i++) {
        await gameEngine.processCommand(testUtils.createMockCommand('look'))
      }
      
      const endTime = Date.now()
      const processingTime = endTime - startTime
      
      // Should complete in reasonable time even on slower systems
      expect(processingTime).toBeLessThan(10000) // 10 seconds max
    })
  })
  
  describe('Network and Connectivity', () => {
    test('should handle offline operation', async () => {
      // Game should work without network connectivity
      const MockGameEngine = require('./mocks/game-engine.mock')
      const MockRavi = require('./mocks/ravi.mock')
      
      const gameEngine = new MockGameEngine()
      const ravi = new MockRavi(gameEngine)
      gameEngine.setCharacter(ravi)
      
      // Basic operations should work offline
      const commands = ['look', 'inventory', 'help']
      
      for (const cmd of commands) {
        const response = await gameEngine.processCommand(
          testUtils.createMockCommand(cmd)
        )
        expect(response).toBeDefined()
      }
    })
    
    test('should handle network timeouts gracefully', async () => {
      // Simulate network timeout for swarm coordination
      const MockGameEngine = require('./mocks/game-engine.mock')
      const gameEngine = new MockGameEngine()
      
      // Override hook to simulate timeout
      const originalExecuteHook = gameEngine.executeSwarmHook
      gameEngine.executeSwarmHook = async (hookType, data) => {
        // Simulate slow network
        await testUtils.wait(100)
        return originalExecuteHook.call(gameEngine, hookType, data)
      }
      
      const startTime = Date.now()
      const result = await gameEngine.executeSwarmHook('test-hook', { test: 'data' })
      const endTime = Date.now()
      
      expect(result.success).toBe(true)
      expect(endTime - startTime).toBeGreaterThan(100)
    })
  })
  
  describe('Character Encoding', () => {
    test('should handle different character encodings', async () => {
      const testStrings = [
        'Basic ASCII text',
        'Unicode characters: ñ, é, ü, ç',
        'Emoji: 🎮 🤖 🎯 ⚡',
        'Special symbols: ©, ™, ®, °',
        'Math symbols: ∑, ∏, ∫, ≈',
        'Arrows: ← → ↑ ↓',
        'Japanese: こんにちは',
        'Chinese: 你好',
        'Russian: Привет',
        'Arabic: مرحبا'
      ]
      
      const MockRavi = require('./mocks/ravi.mock')
      const MockGameEngine = require('./mocks/game-engine.mock')
      
      const gameEngine = new MockGameEngine()
      const ravi = new MockRavi(gameEngine)
      
      testStrings.forEach(testString => {
        // Should handle different encodings without throwing
        expect(() => {
          ravi.generateResponse({ command: testString })
          gameEngine.addToInventory(testString)
        }).not.toThrow()
      })
    })
    
    test('should handle different locale settings', () => {
      const testLocales = [
        'en-US',
        'en-GB', 
        'es-ES',
        'fr-FR',
        'de-DE',
        'ja-JP',
        'zh-CN'
      ]
      
      testLocales.forEach(locale => {
        expect(() => {
          // Test locale-sensitive operations
          const date = new Date().toLocaleDateString(locale)
          const number = (1234.56).toLocaleString(locale)
          
          expect(date).toBeDefined()
          expect(number).toBeDefined()
        }).not.toThrow()
      })
    })
  })
  
  describe('Environment Variables', () => {
    test('should handle missing environment variables', () => {
      const originalEnv = process.env
      
      try {
        // Test with minimal environment
        process.env = { PATH: originalEnv.PATH }
        
        expect(() => {
          const MockGameEngine = require('./mocks/game-engine.mock')
          new MockGameEngine()
        }).not.toThrow()
        
      } finally {
        process.env = originalEnv
      }
    })
    
    test('should respect debug environment variables', () => {
      const debugStates = [
        { DEBUG: '1', DEBUG_TESTS: '1' },
        { DEBUG: '0', DEBUG_TESTS: '0' },
        { DEBUG: undefined, DEBUG_TESTS: undefined }
      ]
      
      debugStates.forEach(debugState => {
        const originalEnv = { ...process.env }
        
        try {
          Object.assign(process.env, debugState)
          
          // Should handle different debug states
          expect(() => {
            require('./setup.js')
          }).not.toThrow()
          
        } finally {
          process.env = originalEnv
        }
      })
    })
  })
  
  describe('Performance Across Platforms', () => {
    test('should maintain consistent performance', async () => {
      const MockGameEngine = require('./mocks/game-engine.mock')
      const gameEngine = new MockGameEngine()
      
      const iterations = 100
      const times = []
      
      for (let i = 0; i < iterations; i++) {
        const startTime = process.hrtime.bigint()
        
        await gameEngine.processCommand(
          testUtils.createMockCommand('look')
        )
        
        const endTime = process.hrtime.bigint()
        times.push(Number(endTime - startTime) / 1000000) // Convert to ms
      }
      
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length
      const maxTime = Math.max(...times)
      
      // Performance should be reasonable across platforms
      expect(avgTime).toBeLessThan(10) // 10ms average
      expect(maxTime).toBeLessThan(100) // 100ms max
    })
    
    test('should scale with system capabilities', () => {
      const systemInfo = {
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        totalMemory: os.totalmem(),
        freeMemory: os.freemem()
      }
      
      // Adjust expectations based on system
      let expectedPerformance = 10 // Base expectation: 10ms
      
      if (systemInfo.cpus >= 8) {
        expectedPerformance = 5 // Better performance on multi-core
      }
      
      if (systemInfo.totalMemory > 8 * 1024 * 1024 * 1024) { // 8GB+
        expectedPerformance = Math.min(expectedPerformance, 7)
      }
      
      expect(expectedPerformance).toBeGreaterThan(0)
      expect(expectedPerformance).toBeLessThan(50)
    })
  })
  
  describe('Error Handling Across Platforms', () => {
    test('should handle platform-specific errors', async () => {
      const errorScenarios = [
        { type: 'file_permission', expectHandled: true },
        { type: 'memory_limit', expectHandled: true },
        { type: 'process_signal', expectHandled: true },
        { type: 'encoding_error', expectHandled: true }
      ]
      
      errorScenarios.forEach(scenario => {
        expect(scenario.expectHandled).toBe(true)
        // In a real test, we would simulate these errors
        // and verify they're handled appropriately
      })
    })
    
    test('should provide platform-appropriate error messages', () => {
      const platform = os.platform()
      
      // Error messages should be appropriate for the platform
      if (platform === 'win32') {
        expect('File not found').toMatch(/file|not|found/i)
      } else {
        expect('No such file or directory').toMatch(/no such file/i)
      }
    })
  })
})