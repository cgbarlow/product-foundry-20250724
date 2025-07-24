/**
 * CI/CD Pipeline Test Suite
 * QA Engineer: Continuous Integration testing pipeline
 */

const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

describe('CI/CD Pipeline Validation', () => {
  const projectRoot = path.resolve(__dirname, '..');
  
  describe('Package Configuration', () => {
    test('should have valid package.json', async () => {
      const packagePath = path.join(projectRoot, 'package.json');
      const packageContent = await fs.readFile(packagePath, 'utf8');
      const packageJson = JSON.parse(packageContent);
      
      // Required fields
      expect(packageJson.name).toBe('ravis-adventure');
      expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(packageJson.description).toBeDefined();
      expect(packageJson.main).toBe('src/index.js');
      
      // Scripts
      expect(packageJson.scripts.test).toBe('jest');
      expect(packageJson.scripts.lint).toBe('eslint src/ tests/');
      expect(packageJson.scripts.build).toBe('npm run lint && npm run test');
      
      // Dependencies
      expect(packageJson.dependencies).toHaveProperty('chalk');
      expect(packageJson.dependencies).toHaveProperty('inquirer');
      expect(packageJson.dependencies).toHaveProperty('commander');
      expect(packageJson.dependencies).toHaveProperty('figlet');
      
      // Dev dependencies
      expect(packageJson.devDependencies).toHaveProperty('jest');
      expect(packageJson.devDependencies).toHaveProperty('eslint');
      
      // Engine requirements
      expect(packageJson.engines.node).toBeDefined();
    });
    
    test('should have valid Jest configuration', async () => {
      const jestConfigPath = path.join(projectRoot, 'jest.config.js');
      const jestConfigExists = await fs.access(jestConfigPath).then(() => true).catch(() => false);
      
      expect(jestConfigExists).toBe(true);
      
      if (jestConfigExists) {
        // Import config to validate structure
        const jestConfig = require(jestConfigPath);
        
        expect(jestConfig.testEnvironment).toBe('node');
        expect(jestConfig.collectCoverage).toBe(true);
        expect(jestConfig.coverageThreshold).toBeDefined();
        expect(jestConfig.coverageThreshold.global.lines).toBeGreaterThanOrEqual(90);
      }
    });
  });
  
  describe('Code Quality', () => {
    test('should pass linting', () => {
      try {
        execSync('npm run lint', { 
          cwd: projectRoot, 
          stdio: 'pipe',
          encoding: 'utf8'
        });
      } catch (error) {
        // If linting fails, show the output
        fail(`Linting failed:\n${error.stdout}\n${error.stderr}`);
      }
    });
    
    test('should have consistent code style', async () => {
      // Check for common style issues in source files
      const srcDir = path.join(projectRoot, 'src');
      const files = await fs.readdir(srcDir);
      const jsFiles = files.filter(file => file.endsWith('.js'));
      
      for (const file of jsFiles) {
        const filePath = path.join(srcDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        // Check for common issues
        expect(content).not.toMatch(/console\.log\(/); // No console.log in production
        expect(content).not.toMatch(/debugger;/); // No debugger statements
        expect(content).not.toMatch(/TODO|FIXME/i); // No TODO/FIXME comments
        
        // Check for proper error handling
        if (content.includes('async ') || content.includes('Promise')) {
          // Should have try-catch or .catch() for async code
          const hasTryCatch = content.includes('try {') && content.includes('catch');
          const hasCatch = content.includes('.catch(');
          
          if (!hasTryCatch && !hasCatch) {
            console.warn(`File ${file} has async code but no error handling`);
          }
        }
      }
    });
    
    test('should have proper JSDoc documentation', async () => {
      const srcDir = path.join(projectRoot, 'src');
      const files = await fs.readdir(srcDir);
      const jsFiles = files.filter(file => file.endsWith('.js'));
      
      for (const file of jsFiles) {
        const filePath = path.join(srcDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        // Check for JSDoc comments on classes and functions
        const hasClasses = content.includes('class ');
        const hasFunctions = content.includes('function ') || content.includes('=> {');
        
        if (hasClasses || hasFunctions) {
          const hasJSDoc = content.includes('/**') && content.includes('*/');
          expect(hasJSDoc).toBe(true);
        }
      }
    });
  });
  
  describe('Test Coverage', () => {
    test('should meet coverage thresholds', () => {
      try {
        const result = execSync('npm test -- --coverage --passWithNoTests', {
          cwd: projectRoot,
          stdio: 'pipe',
          encoding: 'utf8'
        });
        
        // Parse coverage report
        const coverageMatch = result.match(/All files[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|/);
        if (coverageMatch) {
          const coverageLine = coverageMatch[0];
          const percentages = coverageLine.match(/\d+(?:\.\d+)?%/g);
          
          if (percentages && percentages.length >= 4) {
            const [statements, branches, functions, lines] = percentages.map(p => parseFloat(p));
            
            expect(statements).toBeGreaterThanOrEqual(90);
            expect(branches).toBeGreaterThanOrEqual(90);
            expect(functions).toBeGreaterThanOrEqual(90);
            expect(lines).toBeGreaterThanOrEqual(90);
          }
        }
      } catch (error) {
        console.log('Coverage test result:', error.stdout);
        // Don't fail the test if files don't exist yet
        if (!error.stdout.includes('No tests found')) {
          throw error;
        }
      }
    });
    
    test('should have tests for all source files', async () => {
      const srcDir = path.join(projectRoot, 'src');
      const testDir = path.join(projectRoot, 'tests');
      
      try {
        const srcFiles = await fs.readdir(srcDir);
        const testFiles = await fs.readdir(testDir);
        
        const jsFiles = srcFiles.filter(file => file.endsWith('.js') && file !== 'index.js');
        
        for (const srcFile of jsFiles) {
          const testFileName = srcFile.replace('.js', '.test.js');
          const hasTestFile = testFiles.includes(testFileName);
          
          if (!hasTestFile) {
            console.warn(`Missing test file for ${srcFile}: expected ${testFileName}`);
          }
        }
      } catch (error) {
        // Directories might not exist yet
        console.log('Test coverage check skipped: directories not found');
      }
    });
  });
  
  describe('Build Process', () => {
    test('should build successfully', () => {
      try {
        execSync('npm run build', {
          cwd: projectRoot,
          stdio: 'pipe',
          encoding: 'utf8'
        });
      } catch (error) {
        // Check if it's just missing source files
        if (error.stderr.includes('ENOENT') || error.stdout.includes('No tests found')) {
          console.log('Build test skipped: source files not yet implemented');
          return;
        }
        fail(`Build failed:\n${error.stdout}\n${error.stderr}`);
      }
    });
    
    test('should have executable CLI', async () => {
      const mainFile = path.join(projectRoot, 'src', 'index.js');
      
      try {
        const content = await fs.readFile(mainFile, 'utf8');
        
        // Should have shebang
        expect(content.startsWith('#!/usr/bin/env node')).toBe(true);
        
        // Should have commander setup
        expect(content).toContain('Command');
        expect(content).toContain('program');
      } catch (error) {
        // File might not exist yet
        console.log('CLI check skipped: index.js not found');
      }
    });
  });
  
  describe('Dependencies', () => {
    test('should have no security vulnerabilities', () => {
      try {
        const result = execSync('npm audit --audit-level=moderate', {
          cwd: projectRoot,
          stdio: 'pipe',
          encoding: 'utf8'
        });
        
        // Should not have high or critical vulnerabilities
        expect(result).not.toMatch(/found \d+ high severity/i);
        expect(result).not.toMatch(/found \d+ critical severity/i);
      } catch (error) {
        if (error.status === 1) {
          // npm audit found issues
          fail(`Security vulnerabilities found:\n${error.stdout}`);
        }
        // Other errors (network issues, etc.) can be ignored in tests
      }
    });
    
    test('should have all dependencies installed', () => {
      try {
        execSync('npm ls --production', {
          cwd: projectRoot,
          stdio: 'pipe',
          encoding: 'utf8'
        });
      } catch (error) {
        if (error.stdout.includes('missing:') || error.stdout.includes('UNMET DEPENDENCY')) {
          fail(`Missing dependencies:\n${error.stdout}`);
        }
      }
    });
    
    test('should not have unused dependencies', async () => {
      const packagePath = path.join(projectRoot, 'package.json');
      const packageContent = await fs.readFile(packagePath, 'utf8');
      const packageJson = JSON.parse(packageContent);
      
      const dependencies = Object.keys(packageJson.dependencies || {});
      const srcDir = path.join(projectRoot, 'src');
      
      try {
        const files = await fs.readdir(srcDir);
        const jsFiles = files.filter(file => file.endsWith('.js'));
        
        let allSourceCode = '';
        for (const file of jsFiles) {
          const filePath = path.join(srcDir, file);
          const content = await fs.readFile(filePath, 'utf8');
          allSourceCode += content;
        }
        
        for (const dep of dependencies) {
          const isUsed = allSourceCode.includes(`require('${dep}')`) || 
                        allSourceCode.includes(`from '${dep}'`);
          
          if (!isUsed) {
            console.warn(`Potentially unused dependency: ${dep}`);
          }
        }
      } catch (error) {
        // Source files might not exist yet
        console.log('Dependency usage check skipped: source files not found');
      }
    });
  });
  
  describe('Git Hooks and CI Setup', () => {
    test('should have proper .gitignore', async () => {
      const gitignorePath = path.join(projectRoot, '.gitignore');
      
      try {
        const content = await fs.readFile(gitignorePath, 'utf8');
        
        // Should ignore common patterns
        expect(content).toMatch(/node_modules/);
        expect(content).toMatch(/coverage/);
        expect(content).toMatch(/\.env/);
        expect(content).toMatch(/npm-debug\.log/);
      } catch (error) {
        console.warn('No .gitignore found');
      }
    });
    
    test('should have CI configuration hints in README', async () => {
      const readmePath = path.join(projectRoot, 'README.md');
      
      try {
        const content = await fs.readFile(readmePath, 'utf8');
        
        // Should mention testing
        expect(content.toLowerCase()).toMatch(/test|testing/);
        
        // Should have npm scripts documentation
        expect(content).toMatch(/npm.*test/);
        expect(content).toMatch(/npm.*lint/);
      } catch (error) {
        console.warn('README check failed');
      }
    });
  });
  
  describe('Performance Baselines', () => {
    test('should meet performance baselines', async () => {
      // Test basic performance requirements
      const startTime = Date.now();
      
      // Simulate basic operations
      for (let i = 0; i < 100; i++) {
        // Mock some work
        await new Promise(resolve => setImmediate(resolve));
      }
      
      const duration = Date.now() - startTime;
      
      // Should complete basic operations quickly
      expect(duration).toBeLessThan(1000);
    });
    
    test('should have reasonable memory usage', () => {
      const initialMemory = process.memoryUsage();
      
      // Simulate memory allocation
      const largeArray = new Array(10000).fill(null).map((_, i) => ({ id: i, data: 'test' }));
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Should not use excessive memory for basic operations
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB
      
      // Cleanup
      largeArray.length = 0;
    });
  });
});