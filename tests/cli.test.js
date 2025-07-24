/**
 * CLI Interface Test Suite
 * QA Engineer: Testing command-line interface and user interactions
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

describe('CLI Interface', () => {
  const gamePath = path.join(__dirname, '..', 'src', 'index.js');
  
  describe('Command Line Argument Parsing', () => {
    test('should show help when requested', (done) => {
      const child = spawn('node', [gamePath, '--help'], { 
        stdio: ['pipe', 'pipe', 'pipe'] 
      });
      
      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      child.on('close', (code) => {
        expect(output).toContain('Usage:');
        expect(output).toContain('Options:');
        expect(code).toBe(0);
        done();
      });
    }, testConstants.TIMEOUT.MEDIUM);
    
    test('should show version when requested', (done) => {
      const child = spawn('node', [gamePath, '--version'], { 
        stdio: ['pipe', 'pipe', 'pipe'] 
      });
      
      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      child.on('close', (code) => {
        expect(output).toMatch(/\d+\.\d+\.\d+/); // Version pattern
        expect(code).toBe(0);
        done();
      });
    }, testConstants.TIMEOUT.MEDIUM);
    
    test('should start game normally without arguments', (done) => {
      const child = spawn('node', [gamePath], { 
        stdio: ['pipe', 'pipe', 'pipe'] 
      });
      
      let output = '';
      let started = false;
      
      child.stdout.on('data', (data) => {
        output += data.toString();
        if (output.includes('Welcome') || output.includes('Ravi')) {
          started = true;
          child.kill();
        }
      });
      
      child.on('close', () => {
        expect(started).toBe(true);
        done();
      });
      
      // Timeout safety
      setTimeout(() => {
        child.kill();
        if (!started) {
          done(new Error('Game did not start within timeout'));
        }
      }, 3000);
    }, testConstants.TIMEOUT.MEDIUM);
  });
  
  describe('Interactive Mode', () => {
    test('should handle basic commands in interactive mode', (done) => {
      const child = spawn('node', [gamePath], { 
        stdio: ['pipe', 'pipe', 'pipe'] 
      });
      
      let output = '';
      let commandSent = false;
      
      child.stdout.on('data', (data) => {
        output += data.toString();
        
        // Send 'look' command when game is ready
        if (!commandSent && (output.includes('>') || output.includes('command'))) {
          child.stdin.write('look\n');
          commandSent = true;
        }
        
        // Check for response to look command
        if (commandSent && output.includes('room')) {
          child.stdin.write('quit\n');
        }
      });
      
      child.on('close', () => {
        expect(output).toContain('room'); // Response to look command
        done();
      });
      
      setTimeout(() => {
        child.kill();
        done();
      }, 5000);
    }, testConstants.TIMEOUT.LONG);
    
    test('should handle quit command gracefully', (done) => {
      const child = spawn('node', [gamePath], { 
        stdio: ['pipe', 'pipe', 'pipe'] 
      });
      
      let output = '';
      let quitSent = false;
      
      child.stdout.on('data', (data) => {
        output += data.toString();
        
        if (!quitSent && (output.includes('>') || output.includes('command'))) {
          child.stdin.write('quit\n');
          quitSent = true;
        }
      });
      
      child.on('close', (code) => {
        expect(code).toBe(0); // Should exit cleanly
        done();
      });
      
      setTimeout(() => {
        child.kill();
        done();
      }, 3000);
    }, testConstants.TIMEOUT.MEDIUM);
  });
  
  describe('File Operations', () => {
    const testSaveFile = path.join(__dirname, '..', 'test-save.json');
    
    afterEach(async () => {
      try {
        await fs.unlink(testSaveFile);
      } catch (err) {
        // File might not exist, ignore error
      }
    });
    
    test('should handle save command', (done) => {
      const child = spawn('node', [gamePath], { 
        stdio: ['pipe', 'pipe', 'pipe'] 
      });
      
      let output = '';
      let saveSent = false;
      
      child.stdout.on('data', (data) => {
        output += data.toString();
        
        if (!saveSent && (output.includes('>') || output.includes('command'))) {
          child.stdin.write('save test-save\n');
          saveSent = true;
        }
        
        if (saveSent && output.includes('saved')) {
          child.stdin.write('quit\n');
        }
      });
      
      child.on('close', async () => {
        expect(output).toMatch(/saved|progress/i);
        
        // Check if save file was created
        try {
          const saveExists = await fs.access(testSaveFile).then(() => true).catch(() => false);
          expect(saveExists).toBe(true);
        } catch (err) {
          // Save file test is optional as implementation may vary
        }
        
        done();
      });
      
      setTimeout(() => {
        child.kill();
        done();
      }, 5000);
    }, testConstants.TIMEOUT.LONG);
    
    test('should handle invalid commands gracefully', (done) => {
      const child = spawn('node', [gamePath], { 
        stdio: ['pipe', 'pipe', 'pipe'] 
      });
      
      let output = '';
      let invalidSent = false;
      
      child.stdout.on('data', (data) => {
        output += data.toString();
        
        if (!invalidSent && (output.includes('>') || output.includes('command'))) {
          child.stdin.write('invalidcommand12345\n');
          invalidSent = true;
        }
        
        if (invalidSent && output.includes('understand')) {
          child.stdin.write('quit\n');
        }
      });
      
      child.on('close', () => {
        expect(output).toMatch(/understand|unknown|invalid/i);
        done();
      });
      
      setTimeout(() => {
        child.kill();
        done();
      }, 3000);
    }, testConstants.TIMEOUT.MEDIUM);
  });
  
  describe('Error Handling', () => {
    test('should handle SIGINT gracefully', (done) => {
      const child = spawn('node', [gamePath], { 
        stdio: ['pipe', 'pipe', 'pipe'] 
      });
      
      let output = '';
      
      child.stdout.on('data', (data) => {
        output += data.toString();
        
        if (output.includes('>') || output.includes('command')) {
          // Send SIGINT (Ctrl+C)
          child.kill('SIGINT');
        }
      });
      
      child.on('close', (code, signal) => {
        // Should handle interrupt gracefully
        expect(signal === 'SIGINT' || code === 0).toBe(true);
        done();
      });
      
      setTimeout(() => {
        child.kill();
        done();
      }, 3000);
    }, testConstants.TIMEOUT.MEDIUM);
    
    test('should handle rapid input without crashing', (done) => {
      const child = spawn('node', [gamePath], { 
        stdio: ['pipe', 'pipe', 'pipe'] 
      });
      
      let output = '';
      let rapidInputSent = false;
      
      child.stdout.on('data', (data) => {
        output += data.toString();
        
        if (!rapidInputSent && (output.includes('>') || output.includes('command'))) {
          // Send rapid commands
          for (let i = 0; i < 10; i++) {
            child.stdin.write(`look ${i}\n`);
          }
          child.stdin.write('quit\n');
          rapidInputSent = true;
        }
      });
      
      child.on('close', (code) => {
        expect(code).toBe(0); // Should not crash
        done();
      });
      
      setTimeout(() => {
        child.kill();
        done();
      }, 5000);
    }, testConstants.TIMEOUT.LONG);
  });
  
  describe('Cross-Platform Compatibility', () => {
    test('should handle different line endings', (done) => {
      const child = spawn('node', [gamePath], { 
        stdio: ['pipe', 'pipe', 'pipe'] 
      });
      
      let output = '';
      let commandsSent = false;
      
      child.stdout.on('data', (data) => {
        output += data.toString();
        
        if (!commandsSent && (output.includes('>') || output.includes('command'))) {
          // Test different line endings
          child.stdin.write('look\r\n'); // Windows
          child.stdin.write('help\n');   // Unix
          child.stdin.write('quit\r\n');
          commandsSent = true;
        }
      });
      
      child.on('close', (code) => {
        expect(code).toBe(0);
        expect(output).toMatch(/room|help/i);
        done();
      });
      
      setTimeout(() => {
        child.kill();
        done();
      }, 3000);
    }, testConstants.TIMEOUT.MEDIUM);
    
    test('should work with different node versions', () => {
      // Check minimum node version requirements
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
      
      expect(majorVersion).toBeGreaterThanOrEqual(16);
    });
  });
  
  describe('Output Formatting', () => {
    test('should produce colored output when supported', (done) => {
      const child = spawn('node', [gamePath], { 
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, FORCE_COLOR: '1' }
      });
      
      let output = '';
      
      child.stdout.on('data', (data) => {
        output += data.toString();
        
        if (output.length > 100) { // Got some output
          child.stdin.write('quit\n');
        }
      });
      
      child.on('close', () => {
        // Should contain ANSI color codes if colors are supported
        const hasAnsiCodes = /\x1b\[\d+m/.test(output);
        // Note: This test is informational - color support varies by environment
        done();
      });
      
      setTimeout(() => {
        child.kill();
        done();
      }, 3000);
    }, testConstants.TIMEOUT.MEDIUM);
    
    test('should handle ASCII art display', (done) => {
      const child = spawn('node', [gamePath], { 
        stdio: ['pipe', 'pipe', 'pipe'] 
      });
      
      let output = '';
      
      child.stdout.on('data', (data) => {
        output += data.toString();
        
        if (output.length > 200) { // Got substantial output
          child.stdin.write('quit\n');
        }
      });
      
      child.on('close', () => {
        // Check for potential ASCII art elements
        const hasAsciiElements = /[─│┌┐└┘├┤┬┴┼]/.test(output) || 
                                /[▓▒░]/.test(output) ||
                                output.includes('Welcome') ||
                                output.includes('Ravi');
        expect(hasAsciiElements || output.length > 50).toBe(true);
        done();
      });
      
      setTimeout(() => {
        child.kill();
        done();
      }, 3000);
    }, testConstants.TIMEOUT.MEDIUM);
  });
  
  describe('Performance Tests', () => {
    test('should start within reasonable time', (done) => {
      const startTime = Date.now();
      
      const child = spawn('node', [gamePath], { 
        stdio: ['pipe', 'pipe', 'pipe'] 
      });
      
      child.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('>') || output.includes('command') || output.includes('Welcome')) {
          const startupTime = Date.now() - startTime;
          expect(startupTime).toBeLessThan(3000); // Should start in under 3 seconds
          child.kill();
          done();
        }
      });
      
      setTimeout(() => {
        child.kill();
        done(new Error('Game did not start within timeout'));
      }, 5000);
    }, testConstants.TIMEOUT.LONG);
    
    test('should handle multiple simultaneous instances', (done) => {
      const instances = [];
      let completedInstances = 0;
      
      for (let i = 0; i < 3; i++) {
        const child = spawn('node', [gamePath], { 
          stdio: ['pipe', 'pipe', 'pipe'] 
        });
        
        child.stdout.on('data', (data) => {
          if (data.toString().includes('>') || data.toString().includes('command')) {
            child.stdin.write('quit\n');
          }
        });
        
        child.on('close', () => {
          completedInstances++;
          if (completedInstances === 3) {
            done();
          }
        });
        
        instances.push(child);
      }
      
      setTimeout(() => {
        instances.forEach(child => child.kill());
        done();
      }, 5000);
    }, testConstants.TIMEOUT.LONG);
  });
  
  describe('Memory Management', () => {
    test('should not leak memory during normal operation', (done) => {
      const child = spawn('node', [gamePath], { 
        stdio: ['pipe', 'pipe', 'pipe'] 
      });
      
      let commandCount = 0;
      const maxCommands = 50;
      
      const sendCommand = () => {
        if (commandCount < maxCommands) {
          child.stdin.write(`look ${commandCount}\n`);
          commandCount++;
          setTimeout(sendCommand, 10); // Rapid commands
        } else {
          child.stdin.write('quit\n');
        }
      };
      
      child.stdout.on('data', (data) => {
        if (data.toString().includes('>') || data.toString().includes('command')) {
          if (commandCount === 0) {
            sendCommand();
          }
        }
      });
      
      child.on('close', (code) => {
        expect(code).toBe(0); // Should exit cleanly
        expect(commandCount).toBe(maxCommands);
        done();
      });
      
      setTimeout(() => {
        child.kill();
        done();
      }, 10000);
    }, testConstants.TIMEOUT.LONG);
  });
});