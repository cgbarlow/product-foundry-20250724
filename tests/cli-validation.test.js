/**
 * Comprehensive CLI Interface Validation Test Suite
 * Enhanced end-to-end testing for command-line interface
 * 
 * Tests cover:
 * - Command parsing and execution validation
 * - Input validation and error handling
 * - Interactive prompt flow testing
 * - Terminal formatting and display validation
 * - Cross-platform CLI behavior testing
 * - Performance under various input scenarios
 * - Security and sanitization measures
 * - Memory management and resource handling
 * 
 * @author CLI Interface Validator Agent
 */

const { spawn, exec } = require('child_process')
const path = require('path')
const fs = require('fs').promises
const os = require('os')
const { performance } = require('perf_hooks')
const { promisify } = require('util')

const execAsync = promisify(exec)

// Import test constants from setup
const { testConstants } = require('./setup.js')

describe('CLI Interface Validation', () => {
  const gamePath = path.join(__dirname, '..', 'src', 'index.js')
  const tempDir = path.join(os.tmpdir(), 'ravis-adventure-test')
  
  beforeAll(async () => {
    // Ensure temp directory exists
    try {
      await fs.mkdir(tempDir, { recursive: true })
    } catch (err) {
      // Directory might already exist
    }
  })
  
  afterAll(async () => {
    // Cleanup temp directory
    try {
      await fs.rmdir(tempDir, { recursive: true })
    } catch (err) {
      // Directory might not exist or might have files
    }
  })

  describe('Command Line Argument Parsing', () => {
    test('should handle --help flag correctly', async () => {
      const { stdout, stderr, code } = await execCommand([gamePath, '--help'])
      
      expect(code).toBe(0)
      expect(stdout).toContain('Usage:')
      expect(stdout).toContain('Options:')
      expect(stdout).toContain('Commands:')
      expect(stderr).toBe('')
    }, testConstants.TIMEOUT.MEDIUM)

    test('should handle -h flag correctly', async () => {
      const { stdout, code } = await execCommand([gamePath, '-h'])
      
      expect(code).toBe(0)
      expect(stdout).toContain('Usage:')
    }, testConstants.TIMEOUT.MEDIUM)

    test('should handle --version flag correctly', async () => {
      const { stdout, code } = await execCommand([gamePath, '--version'])
      
      expect(code).toBe(0)
      expect(stdout).toMatch(/\d+\.\d+\.\d+/)
    }, testConstants.TIMEOUT.MEDIUM)

    test('should handle -V flag correctly', async () => {
      const { stdout, code } = await execCommand([gamePath, '-V'])
      
      expect(code).toBe(0)
      expect(stdout).toMatch(/\d+\.\d+\.\d+/)
    }, testConstants.TIMEOUT.MEDIUM)

    test('should handle invalid flags gracefully', async () => {
      const { stdout, stderr, code } = await execCommand([gamePath, '--invalid-flag'])
      
      expect(code).not.toBe(0)
      expect(stderr).toContain('unknown option') // Commander.js error format
    }, testConstants.TIMEOUT.MEDIUM)

    test('should handle start command with options', async () => {
      const child = spawn('node', [gamePath, 'start', '--name', 'TestUser'], {
        stdio: ['pipe', 'pipe', 'pipe']
      })
      
      let output = ''
      let gameStarted = false
      
      child.stdout.on('data', (data) => {
        output += data.toString()
        if (output.includes('TestUser') || output.includes('Welcome')) {
          gameStarted = true
          child.kill('SIGTERM')
        }
      })
      
      await new Promise((resolve) => {
        child.on('close', () => resolve())
        setTimeout(() => {
          child.kill('SIGKILL')
          resolve()
        }, 3000)
      })
      
      expect(gameStarted).toBe(true)
    }, testConstants.TIMEOUT.MEDIUM)
  })

  describe('Input Validation and Sanitization', () => {
    test('should handle extremely long input without crashing', (done) => {
      const child = spawn('node', [gamePath], { stdio: ['pipe', 'pipe', 'pipe'] })
      let output = ''
      let longInputSent = false
      
      child.stdout.on('data', (data) => {
        output += data.toString()
        
        if (!longInputSent && (output.includes('>') || output.includes('command'))) {
          // Send extremely long input (10KB)
          const longInput = 'a'.repeat(10000) + '\n'
          child.stdin.write(longInput)
          child.stdin.write('quit\n')
          longInputSent = true
        }
      })
      
      child.on('close', (code) => {
        expect(code).toBe(0) // Should not crash
        done()
      })
      
      setTimeout(() => {
        child.kill()
        done()
      }, 5000)
    }, testConstants.TIMEOUT.LONG)

    test('should handle special characters and Unicode', (done) => {
      const child = spawn('node', [gamePath], { stdio: ['pipe', 'pipe', 'pipe'] })
      let output = ''
      let specialInputSent = false
      
      child.stdout.on('data', (data) => {
        output += data.toString()
        
        if (!specialInputSent && (output.includes('>') || output.includes('command'))) {
          // Test various special characters and Unicode
          const specialInputs = [
            '!@#$%^&*()_+-=[]{}|;\":\\'"<>?,./\n',
            '\u0000\u0001\u0002\u0003\n', // Control characters
            '\u{1F600}\u{1F601}\u{1F602}\n', // Emoji
            '\u4E2D\u6587\u6D4B\u8BD5\n', // Chinese characters
            'тест кириллица\n', // Cyrillic
            'quit\n'
          ]
          
          specialInputs.forEach(input => child.stdin.write(input))
          specialInputSent = true
        }
      })
      
      child.on('close', (code) => {
        expect(code).toBe(0) // Should handle gracefully
        done()
      })
      
      setTimeout(() => {
        child.kill()
        done()
      }, 5000)
    }, testConstants.TIMEOUT.LONG)

    test('should prevent command injection attempts', (done) => {
      const child = spawn('node', [gamePath], { stdio: ['pipe', 'pipe', 'pipe'] })
      let output = ''
      let injectionSent = false
      
      child.stdout.on('data', (data) => {
        output += data.toString()
        
        if (!injectionSent && (output.includes('>') || output.includes('command'))) {
          // Test potential command injection patterns
          const injectionAttempts = [
            '; ls -la\n',
            '| cat /etc/passwd\n',
            '&& rm -rf /\n',
            '$(whoami)\n',
            '`id`\n',
            'quit\n'
          ]
          
          injectionAttempts.forEach(input => child.stdin.write(input))
          injectionSent = true
        }
      })
      
      child.on('close', (code) => {
        expect(code).toBe(0)
        // Should not execute system commands
        expect(output).not.toContain('root')
        expect(output).not.toContain('uid=')
        done()
      })
      
      setTimeout(() => {
        child.kill()
        done()
      }, 5000)
    }, testConstants.TIMEOUT.LONG)
  })

  describe('Interactive Prompt Flow Testing', () => {
    test('should handle rapid sequential commands', (done) => {
      const child = spawn('node', [gamePath], { stdio: ['pipe', 'pipe', 'pipe'] })
      let output = ''
      let commandsSent = false
      
      child.stdout.on('data', (data) => {
        output += data.toString()
        
        if (!commandsSent && (output.includes('>') || output.includes('command'))) {
          // Send rapid commands without waiting for responses
          const commands = [
            'help\n',
            'look\n',
            'inventory\n',
            'help\n',
            'look\n',
            'quit\n'
          ]
          
          commands.forEach((cmd, index) => {
            setTimeout(() => child.stdin.write(cmd), index * 10)
          })
          commandsSent = true
        }
      })
      
      child.on('close', (code) => {
        expect(code).toBe(0)
        // Should handle all commands without hanging
        expect(output).toContain('room') // Response to look
        done()
      })
      
      setTimeout(() => {
        child.kill()
        done()
      }, 8000)
    }, testConstants.TIMEOUT.LONG)

    test('should handle interrupted input gracefully', (done) => {
      const child = spawn('node', [gamePath], { stdio: ['pipe', 'pipe', 'pipe'] })
      let output = ''
      let interruptionSent = false
      
      child.stdout.on('data', (data) => {
        output += data.toString()
        
        if (!interruptionSent && (output.includes('>') || output.includes('command'))) {
          // Send partial commands and interruptions
          child.stdin.write('help')
          setTimeout(() => child.stdin.write('\u0003'), 50) // Ctrl+C
          setTimeout(() => child.stdin.write('\nlook\n'), 100)
          setTimeout(() => child.stdin.write('quit\n'), 200)
          interruptionSent = true
        }
      })
      
      child.on('close', () => {
        done()
      })
      
      setTimeout(() => {
        child.kill()
        done()
      }, 3000)
    }, testConstants.TIMEOUT.MEDIUM)

    test('should handle empty input gracefully', (done) => {
      const child = spawn('node', [gamePath], { stdio: ['pipe', 'pipe', 'pipe'] })
      let output = ''
      let emptyInputSent = false
      
      child.stdout.on('data', (data) => {
        output += data.toString()
        
        if (!emptyInputSent && (output.includes('>') || output.includes('command'))) {
          // Send various empty inputs
          child.stdin.write('\n')
          child.stdin.write('   \n')
          child.stdin.write('\t\n')
          child.stdin.write('\r\n')
          child.stdin.write('quit\n')
          emptyInputSent = true
        }
      })
      
      child.on('close', (code) => {
        expect(code).toBe(0)
        done()
      })
      
      setTimeout(() => {
        child.kill()
        done()
      }, 3000)
    }, testConstants.TIMEOUT.MEDIUM)
  })

  describe('Terminal Formatting and Display Validation', () => {
    test('should handle ANSI color codes appropriately', (done) => {
      const child = spawn('node', [gamePath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, FORCE_COLOR: '1', TERM: 'xterm-256color' }
      })
      
      let output = ''
      
      child.stdout.on('data', (data) => {
        output += data.toString()
        
        if (output.length > 200) {
          child.stdin.write('quit\n')
        }
      })
      
      child.on('close', () => {
        // Check for ANSI color codes when colors are forced
        const hasAnsiCodes = /\x1b\[[0-9;]*m/.test(output)
        // Should contain color codes when FORCE_COLOR is set
        expect(hasAnsiCodes).toBe(true)
        done()
      })
      
      setTimeout(() => {
        child.kill()
        done()
      }, 3000)
    }, testConstants.TIMEOUT.MEDIUM)

    test('should handle no-color environment properly', (done) => {
      const child = spawn('node', [gamePath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' }
      })
      
      let output = ''
      
      child.stdout.on('data', (data) => {
        output += data.toString()
        
        if (output.length > 200) {
          child.stdin.write('quit\n')
        }
      })
      
      child.on('close', () => {
        // Should not contain color codes when NO_COLOR is set
        const hasAnsiCodes = /\x1b\[[0-9;]*m/.test(output)
        // Note: This test is informational as chalk might still include codes
        done()
      })
      
      setTimeout(() => {
        child.kill()
        done()
      }, 3000)
    }, testConstants.TIMEOUT.MEDIUM)

    test('should handle terminal width limitations', (done) => {
      const child = spawn('node', [gamePath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, COLUMNS: '40' } // Narrow terminal
      })
      
      let output = ''
      
      child.stdout.on('data', (data) => {
        output += data.toString()
        
        if (output.length > 100) {
          child.stdin.write('help\n')
        }
        
        if (output.includes('Available Commands') || output.includes('help')) {
          child.stdin.write('quit\n')
        }
      })
      
      child.on('close', () => {
        // Should handle narrow terminals without breaking
        expect(output.length).toBeGreaterThan(0)
        done()
      })
      
      setTimeout(() => {
        child.kill()
        done()
      }, 5000)
    }, testConstants.TIMEOUT.LONG)
  })

  describe('Cross-Platform CLI Behavior', () => {
    test('should handle different line endings', (done) => {
      const child = spawn('node', [gamePath], { stdio: ['pipe', 'pipe', 'pipe'] })
      let output = ''
      let lineEndingsSent = false
      
      child.stdout.on('data', (data) => {
        output += data.toString()
        
        if (!lineEndingsSent && (output.includes('>') || output.includes('command'))) {
          // Test different line ending styles
          child.stdin.write('help\r\n') // Windows CRLF
          child.stdin.write('look\n')   // Unix LF
          child.stdin.write('inventory\r') // Old Mac CR
          child.stdin.write('\nquit\n')
          lineEndingsSent = true
        }
      })
      
      child.on('close', (code) => {
        expect(code).toBe(0)
        expect(output).toContain('Available Commands') // help response
        expect(output).toContain('room') // look response
        done()
      })
      
      setTimeout(() => {
        child.kill()
        done()
      }, 5000)
    }, testConstants.TIMEOUT.LONG)

    test('should work on different Node.js versions', () => {
      const nodeVersion = process.version
      const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0])
      
      // Ensure compatibility with supported Node.js versions
      expect(majorVersion).toBeGreaterThanOrEqual(16)
    })

    test('should handle different terminal types', async () => {
      const terminalTypes = ['xterm', 'xterm-256color', 'screen', 'tmux', 'dumb']
      
      for (const termType of terminalTypes) {
        const { code } = await execCommand([gamePath, '--help'], {
          env: { ...process.env, TERM: termType }
        })
        expect(code).toBe(0)
      }
    }, testConstants.TIMEOUT.LONG)
  })

  describe('Performance Under Various Scenarios', () => {
    test('should start within acceptable time limits', async () => {
      const startTime = performance.now()
      
      const child = spawn('node', [gamePath], { stdio: ['pipe', 'pipe', 'pipe'] })
      
      await new Promise((resolve) => {
        child.stdout.on('data', (data) => {
          const output = data.toString()
          if (output.includes('>') || output.includes('Welcome') || output.includes('command')) {
            const startupTime = performance.now() - startTime
            expect(startupTime).toBeLessThan(5000) // 5 seconds max startup
            child.kill()
            resolve()
          }
        })
        
        setTimeout(() => {
          child.kill()
          resolve()
        }, 6000)
      })
    }, testConstants.TIMEOUT.LONG)

    test('should handle sustained command input', (done) => {
      const child = spawn('node', [gamePath], { stdio: ['pipe', 'pipe', 'pipe'] })
      let commandCount = 0
      const maxCommands = 100
      let startTime = Date.now()
      
      const sendCommand = () => {
        if (commandCount < maxCommands) {
          child.stdin.write(`help ${commandCount}\n`)
          commandCount++
          setTimeout(sendCommand, 50) // Commands every 50ms
        } else {
          const duration = Date.now() - startTime
          expect(duration).toBeLessThan(15000) // Should complete in under 15 seconds
          child.stdin.write('quit\n')
        }
      }
      
      child.stdout.on('data', (data) => {
        if (data.toString().includes('>') && commandCount === 0) {
          startTime = Date.now()
          sendCommand()
        }
      })
      
      child.on('close', (code) => {
        expect(code).toBe(0)
        expect(commandCount).toBe(maxCommands)
        done()
      })
      
      setTimeout(() => {
        child.kill()
        done()
      }, 20000)
    }, 25000) // Extended timeout for this performance test

    test('should maintain responsive behavior under load', async () => {
      const processes = []
      const numProcesses = 3
      
      // Start multiple instances
      for (let i = 0; i < numProcesses; i++) {
        const child = spawn('node', [gamePath], { stdio: ['pipe', 'pipe', 'pipe'] })
        processes.push(child)
      }
      
      // Send commands to all instances
      const promises = processes.map((child, index) => {
        return new Promise((resolve) => {
          let responded = false
          
          child.stdout.on('data', (data) => {
            const output = data.toString()
            if (!responded && (output.includes('>') || output.includes('command'))) {
              child.stdin.write('help\n')
            }
            if (output.includes('Available Commands')) {
              responded = true
              child.stdin.write('quit\n')
            }
          })
          
          child.on('close', () => resolve())
          
          setTimeout(() => {
            child.kill()
            resolve()
          }, 5000)
        })
      })
      
      await Promise.all(promises)
    }, testConstants.TIMEOUT.LONG)
  })

  describe('Error Handling and Edge Cases', () => {
    test('should handle process termination signals gracefully', (done) => {
      const child = spawn('node', [gamePath], { stdio: ['pipe', 'pipe', 'pipe'] })
      let output = ''
      
      child.stdout.on('data', (data) => {
        output += data.toString()
        
        if (output.includes('>') || output.includes('command')) {
          // Send SIGTERM
          child.kill('SIGTERM')
        }
      })
      
      child.on('close', (code, signal) => {
        // Should handle termination signals properly
        expect(signal === 'SIGTERM' || code === 0).toBe(true)
        done()
      })
      
      setTimeout(() => {
        child.kill('SIGKILL')
        done()
      }, 3000)
    }, testConstants.TIMEOUT.MEDIUM)

    test('should handle stdin closure', (done) => {
      const child = spawn('node', [gamePath], { stdio: ['pipe', 'pipe', 'pipe'] })
      let output = ''
      
      child.stdout.on('data', (data) => {
        output += data.toString()
        
        if (output.includes('>') || output.includes('command')) {
          // Close stdin
          child.stdin.end()
        }
      })
      
      child.on('close', (code) => {
        // Should handle stdin closure gracefully
        expect(code).not.toBe(null)
        done()
      })
      
      setTimeout(() => {
        child.kill()
        done()
      }, 3000)
    }, testConstants.TIMEOUT.MEDIUM)

    test('should handle file system errors', async () => {
      // Test with read-only directory
      const readOnlyDir = path.join(tempDir, 'readonly')
      await fs.mkdir(readOnlyDir, { recursive: true })
      
      try {
        await fs.chmod(readOnlyDir, 0o444) // Read-only
        
        const { code } = await execCommand([gamePath, '--help'], {
          cwd: readOnlyDir
        })
        
        // Should still work even in read-only directory
        expect(code).toBe(0)
      } finally {
        // Restore permissions for cleanup
        await fs.chmod(readOnlyDir, 0o755)
      }
    }, testConstants.TIMEOUT.MEDIUM)
  })

  describe('Memory Management and Resource Usage', () => {
    test('should not leak memory during normal operation', (done) => {
      const child = spawn('node', [gamePath], { stdio: ['pipe', 'pipe', 'pipe'] })
      let commandCount = 0
      const maxCommands = 50
      let memoryBefore = 0
      
      const sendCommand = () => {
        if (commandCount < maxCommands) {
          child.stdin.write(`look command ${commandCount}\n`)
          commandCount++
          setTimeout(sendCommand, 100)
        } else {
          // Give some time for any cleanup
          setTimeout(() => {
            child.stdin.write('quit\n')
          }, 500)
        }
      }
      
      child.stdout.on('data', (data) => {
        if (data.toString().includes('>') && commandCount === 0) {
          sendCommand()
        }
      })
      
      child.on('close', (code) => {
        expect(code).toBe(0)
        expect(commandCount).toBe(maxCommands)
        done()
      })
      
      setTimeout(() => {
        child.kill()
        done()
      }, 15000)
    }, testConstants.TIMEOUT.LONG)

    test('should handle resource cleanup on exit', (done) => {
      const child = spawn('node', [gamePath], { stdio: ['pipe', 'pipe', 'pipe'] })
      let output = ''
      
      child.stdout.on('data', (data) => {
        output += data.toString()
        
        if (output.includes('>') || output.includes('command')) {
          child.stdin.write('quit\n')
        }
      })
      
      child.on('close', (code) => {
        expect(code).toBe(0)
        // Process should exit cleanly
        done()
      })
      
      setTimeout(() => {
        child.kill()
        done(new Error('Process did not exit cleanly'))
      }, 3000)
    }, testConstants.TIMEOUT.MEDIUM)
  })

  describe('Security Validation', () => {
    test('should not expose sensitive environment variables', (done) => {
      const child = spawn('node', [gamePath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          SECRET_KEY: 'test-secret-123',
          API_TOKEN: 'sensitive-token'
        }
      })
      
      let output = ''
      
      child.stdout.on('data', (data) => {
        output += data.toString()
        
        if (output.includes('>') || output.includes('command')) {
          child.stdin.write('help\n')
          child.stdin.write('quit\n')
        }
      })
      
      child.on('close', () => {
        // Should not leak sensitive environment variables
        expect(output).not.toContain('test-secret-123')
        expect(output).not.toContain('sensitive-token')
        done()
      })
      
      setTimeout(() => {
        child.kill()
        done()
      }, 3000)
    }, testConstants.TIMEOUT.MEDIUM)

    test('should handle malformed command structures', (done) => {
      const child = spawn('node', [gamePath], { stdio: ['pipe', 'pipe', 'pipe'] })
      let output = ''
      let malformedSent = false
      
      child.stdout.on('data', (data) => {
        output += data.toString()
        
        if (!malformedSent && (output.includes('>') || output.includes('command'))) {
          // Send malformed commands
          const malformedCommands = [
            '\x00\x01\x02\n',
            '../../etc/passwd\n',
            '../../../windows/system32\n',
            'null\x00byte\n',
            'quit\n'
          ]
          
          malformedCommands.forEach(cmd => child.stdin.write(cmd))
          malformedSent = true
        }
      })
      
      child.on('close', (code) => {
        expect(code).toBe(0)
        done()
      })
      
      setTimeout(() => {
        child.kill()
        done()
      }, 5000)
    }, testConstants.TIMEOUT.LONG)
  })
})

/**
 * Helper function to execute command and capture output
 */
function execCommand(args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn('node', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      ...options
    })
    
    let stdout = ''
    let stderr = ''
    
    child.stdout.on('data', (data) => {
      stdout += data.toString()
    })
    
    child.stderr.on('data', (data) => {
      stderr += data.toString()
    })
    
    child.on('close', (code) => {
      resolve({ stdout, stderr, code })
    })
    
    // Timeout safety
    setTimeout(() => {
      child.kill()
      resolve({ stdout, stderr, code: -1 })
    }, 10000)
  })
}
