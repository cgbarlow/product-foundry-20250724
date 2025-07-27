/**
 * Extended Performance Test Suite
 * Performance Analyst: Comprehensive load testing and resource monitoring
 * 
 * This suite tests:
 * - Startup time and initialization benchmarks
 * - Memory usage profiling during gameplay
 * - Story loading performance with large narratives
 * - CLI responsiveness under sustained load
 * - Resource utilization monitoring
 * - Stress testing with edge case scenarios
 * - Real-world simulation testing
 */

const fs = require('fs').promises
const path = require('path')
const MockGameEngine = require('./mocks/game-engine.mock')
const MockRavi = require('./mocks/ravi.mock')
const { gameTestHelpers } = require('./utils/test-helpers')

describe('Extended Performance Testing', () => {
  let gameEngine
  let ravi
  let performanceMetrics = []
  
  beforeAll(async () => {
    // Clear any existing performance logs
    await gameTestHelpers.clearPerformanceLogs()
    
    // Initialize baseline metrics
    performanceMetrics = []
  })
  
  beforeEach(() => {
    gameEngine = new MockGameEngine()
    ravi = new MockRavi(gameEngine)
    gameEngine.setCharacter(ravi)
  })
  
  afterAll(async () => {
    // Generate comprehensive performance report
    await gameTestHelpers.generatePerformanceReport(performanceMetrics)
  })

  describe('Startup Performance Benchmarks', () => {
    test('should initialize game engine within acceptable time limits', async () => {
      const initMetrics = await gameTestHelpers.measurePerformance(async () => {
        const testEngine = new MockGameEngine()
        await testEngine.initialize()
        return testEngine
      }, 10)
      
      performanceMetrics.push({
        category: 'startup',
        test: 'game_engine_init',
        metrics: initMetrics
      })
      
      expect(initMetrics.avg).toBeLessThan(50) // Under 50ms average
      expect(initMetrics.max).toBeLessThan(200) // No init over 200ms
      expect(initMetrics.p95).toBeLessThan(100) // 95th percentile under 100ms
    })
    
    test('should load character data efficiently on startup', async () => {
      const characterLoadMetrics = await gameTestHelpers.measurePerformance(async () => {
        const testRavi = new MockRavi(gameEngine)
        await testRavi.initialize()
        return testRavi
      }, 10)
      
      performanceMetrics.push({
        category: 'startup',
        test: 'character_load',
        metrics: characterLoadMetrics
      })
      
      expect(characterLoadMetrics.avg).toBeLessThan(25) // Under 25ms average
      expect(characterLoadMetrics.max).toBeLessThan(100) // No load over 100ms
    })
    
    test('should establish swarm connections within timeout', async () => {
      const swarmInitMetrics = await gameTestHelpers.measurePerformance(async () => {
        // Simulate swarm initialization
        await gameEngine.initializeSwarm()
        return gameEngine.getSwarmStatus()
      }, 5)
      
      performanceMetrics.push({
        category: 'startup',
        test: 'swarm_init',
        metrics: swarmInitMetrics
      })
      
      expect(swarmInitMetrics.avg).toBeLessThan(100) // Under 100ms average
      expect(swarmInitMetrics.max).toBeLessThan(500) // No init over 500ms
    })
    
    test('should load save game data efficiently', async () => {
      // Create a realistic save file
      const largeSaveData = gameTestHelpers.generateLargeSaveData(5000)
      await gameEngine.writeSaveData(largeSaveData)
      
      const loadMetrics = await gameTestHelpers.measurePerformance(async () => {
        await gameEngine.resetGame()
        await gameEngine.loadGame('large_save')
      }, 10)
      
      performanceMetrics.push({
        category: 'startup',
        test: 'save_load',
        metrics: loadMetrics
      })
      
      expect(loadMetrics.avg).toBeLessThan(150) // Under 150ms for large saves
      expect(loadMetrics.max).toBeLessThan(1000) // No load over 1 second
    })
  })

  describe('Memory Usage Profiling During Gameplay', () => {
    test('should maintain stable memory usage during extended gameplay', async () => {
      const memoryProfile = []
      const testDuration = 60000 // 1 minute of simulated gameplay
      const sampleInterval = 1000 // Sample every second
      
      const startTime = Date.now()
      const endTime = startTime + testDuration
      
      // Simulate continuous gameplay
      const gameplaySimulation = setInterval(async () => {
        try {
          // Execute random game actions
          const actions = [
            () => gameEngine.processCommand(testUtils.createMockCommand('look')),
            () => gameEngine.processCommand(testUtils.createMockCommand('inventory')),
            () => ravi.generateResponse({ command: 'test' }),
            () => gameEngine.addToInventory(`item_${Date.now()}`),
            () => ravi.adjustRelationship(Math.random() > 0.5 ? 1 : -1)
          ]
          
          const randomAction = actions[Math.floor(Math.random() * actions.length)]
          await randomAction()
          
          // Sample memory usage
          if (Date.now() % sampleInterval < 100) {
            const memUsage = process.memoryUsage()
            memoryProfile.push({
              timestamp: Date.now() - startTime,
              heapUsed: memUsage.heapUsed,
              heapTotal: memUsage.heapTotal,
              external: memUsage.external,
              rss: memUsage.rss
            })
          }
        } catch (error) {
          // Handle simulation errors gracefully
        }
      }, 50) // Execute actions every 50ms
      
      // Wait for test duration
      await new Promise(resolve => setTimeout(resolve, testDuration))
      clearInterval(gameplaySimulation)
      
      // Analyze memory stability
      const heapGrowth = memoryProfile[memoryProfile.length - 1].heapUsed - memoryProfile[0].heapUsed
      const memoryLeakRate = heapGrowth / testDuration * 1000 // bytes per second
      
      performanceMetrics.push({
        category: 'memory',
        test: 'extended_gameplay',
        metrics: {
          memoryProfile,
          heapGrowth,
          memoryLeakRate,
          maxHeapUsed: Math.max(...memoryProfile.map(p => p.heapUsed))
        }
      })
      
      expect(memoryLeakRate).toBeLessThan(1024 * 100) // Less than 100KB/sec growth
      expect(heapGrowth).toBeLessThan(50 * 1024 * 1024) // Less than 50MB total growth
    })
    
    test('should handle memory spikes during complex operations', async () => {
      const memorySpikes = []
      
      // Test memory usage during complex operations
      const complexOperations = [
        async () => {
          // Load large story with many branches
          const largeStory = gameTestHelpers.generateComplexStory(1000)
          await gameEngine.loadStory(largeStory)
        },
        async () => {
          // Generate large inventory
          const items = gameTestHelpers.generateLargeInventory(5000)
          items.forEach(item => gameEngine.addToInventory(item))
        },
        async () => {
          // Process many commands rapidly
          const commands = Array.from({ length: 500 }, (_, i) => 
            testUtils.createMockCommand(`command_${i}`)
          )
          for (const cmd of commands) {
            await gameEngine.processCommand(cmd)
          }
        }
      ]
      
      for (const operation of complexOperations) {
        const beforeMem = process.memoryUsage().heapUsed
        await operation()
        const afterMem = process.memoryUsage().heapUsed
        const spike = afterMem - beforeMem
        
        memorySpikes.push(spike)
        
        // Force cleanup
        if (global.gc) {
          global.gc()
        }
      }
      
      performanceMetrics.push({
        category: 'memory',
        test: 'complex_operations',
        metrics: { memorySpikes }
      })
      
      // No single operation should use more than 100MB
      memorySpikes.forEach(spike => {
        expect(spike).toBeLessThan(100 * 1024 * 1024)
      })
    })
  })

  describe('Story Loading Performance Testing', () => {
    test('should load small stories efficiently', async () => {
      const smallStoryMetrics = await gameTestHelpers.measurePerformance(async () => {
        const story = gameTestHelpers.generateSimpleStory(10) // 10 scenes
        await gameEngine.loadStory(story)
      }, 20)
      
      performanceMetrics.push({
        category: 'story_loading',
        test: 'small_stories',
        metrics: smallStoryMetrics
      })
      
      expect(smallStoryMetrics.avg).toBeLessThan(10) // Under 10ms for small stories
      expect(smallStoryMetrics.max).toBeLessThan(50) // No load over 50ms
    })
    
    test('should scale well with large narrative structures', async () => {
      const storySizes = [50, 100, 500, 1000] // Number of scenes
      const loadingTimes = []
      
      for (const size of storySizes) {
        const story = gameTestHelpers.generateComplexStory(size)
        
        const loadTime = await gameTestHelpers.measurePerformance(async () => {
          await gameEngine.loadStory(story)
        }, 5)
        
        loadingTimes.push({
          size,
          avgTime: loadTime.avg,
          maxTime: loadTime.max
        })
      }
      
      performanceMetrics.push({
        category: 'story_loading',
        test: 'scaling_performance',
        metrics: { loadingTimes }
      })
      
      // Check that loading time scales reasonably (not exponentially)
      const timeRatios = []
      for (let i = 1; i < loadingTimes.length; i++) {
        const ratio = loadingTimes[i].avgTime / loadingTimes[i-1].avgTime
        timeRatios.push(ratio)
      }
      
      // Time ratios should not exceed 3x between size increases
      timeRatios.forEach(ratio => {
        expect(ratio).toBeLessThan(3)
      })
    })
    
    test('should handle story parsing efficiently', async () => {
      const complexStory = gameTestHelpers.generateStoryWithComplexStructures()
      
      const parsingMetrics = await gameTestHelpers.measurePerformance(async () => {
        await gameEngine.parseStoryStructure(complexStory)
        await gameEngine.validateStoryIntegrity(complexStory)
        await gameEngine.optimizeStoryGraph(complexStory)
      }, 10)
      
      performanceMetrics.push({
        category: 'story_loading',
        test: 'complex_parsing',
        metrics: parsingMetrics
      })
      
      expect(parsingMetrics.avg).toBeLessThan(100) // Under 100ms for complex parsing
      expect(parsingMetrics.max).toBeLessThan(500) // No parsing over 500ms
    })
  })

  describe('CLI Responsiveness Under Load', () => {
    test('should maintain responsiveness during high command frequency', async () => {
      const responseTimes = []
      const commandFrequency = 10 // Commands per second
      const testDuration = 10000 // 10 seconds
      const totalCommands = (testDuration / 1000) * commandFrequency
      
      const startTime = Date.now()
      
      for (let i = 0; i < totalCommands; i++) {
        const commandStart = Date.now()
        
        await gameEngine.processCommand(testUtils.createMockCommand(`load_test_${i}`))
        
        const commandEnd = Date.now()
        responseTimes.push(commandEnd - commandStart)
        
        // Maintain command frequency
        const targetTime = startTime + (i * (1000 / commandFrequency))
        const currentTime = Date.now()
        if (currentTime < targetTime) {
          await new Promise(resolve => setTimeout(resolve, targetTime - currentTime))
        }
      }
      
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      const maxResponseTime = Math.max(...responseTimes)
      const p95ResponseTime = responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length * 0.95)]
      
      performanceMetrics.push({
        category: 'cli_responsiveness',
        test: 'high_frequency',
        metrics: {
          avgResponseTime,
          maxResponseTime,
          p95ResponseTime,
          totalCommands: responseTimes.length
        }
      })
      
      expect(avgResponseTime).toBeLessThan(20) // Average under 20ms
      expect(p95ResponseTime).toBeLessThan(50) // 95th percentile under 50ms
      expect(maxResponseTime).toBeLessThan(200) // No command over 200ms
    })
    
    test('should handle concurrent command processing', async () => {
      const concurrentCommands = 50
      const commands = Array.from({ length: concurrentCommands }, (_, i) =>
        testUtils.createMockCommand(`concurrent_${i}`)
      )
      
      const startTime = Date.now()
      
      const results = await Promise.all(
        commands.map(async (command, index) => {
          const commandStart = Date.now()
          await gameEngine.processCommand(command)
          return Date.now() - commandStart
        })
      )
      
      const totalTime = Date.now() - startTime
      const avgConcurrentTime = results.reduce((a, b) => a + b, 0) / results.length
      
      performanceMetrics.push({
        category: 'cli_responsiveness',
        test: 'concurrent_processing',
        metrics: {
          totalTime,
          avgConcurrentTime,
          concurrentCommands,
          throughput: concurrentCommands / (totalTime / 1000)
        }
      })
      
      expect(totalTime).toBeLessThan(2000) // All concurrent commands under 2 seconds
      expect(avgConcurrentTime).toBeLessThan(100) // Average concurrent time under 100ms
    })
    
    test('should maintain performance under mixed workload', async () => {
      const workloadTypes = [
        { name: 'simple_commands', weight: 0.6, executor: () => gameEngine.processCommand(testUtils.createMockCommand('look')) },
        { name: 'complex_commands', weight: 0.2, executor: () => gameEngine.processCommand(testUtils.createMockCommand('inventory detailed')) },
        { name: 'ravi_interactions', weight: 0.15, executor: () => ravi.generateResponse({ command: 'complex question' }) },
        { name: 'state_operations', weight: 0.05, executor: () => gameEngine.saveGame() }
      ]
      
      const workloadMetrics = []
      const testDuration = 30000 // 30 seconds
      const startTime = Date.now()
      
      while (Date.now() - startTime < testDuration) {
        const random = Math.random()
        let cumulativeWeight = 0
        
        for (const workload of workloadTypes) {
          cumulativeWeight += workload.weight
          if (random <= cumulativeWeight) {
            const operationStart = Date.now()
            await workload.executor()
            const operationTime = Date.now() - operationStart
            
            workloadMetrics.push({
              type: workload.name,
              time: operationTime,
              timestamp: Date.now() - startTime
            })
            break
          }
        }
        
        // Small delay to prevent overwhelming
        await new Promise(resolve => setTimeout(resolve, 10))
      }
      
      // Analyze performance by workload type
      const performanceByType = {}
      workloadTypes.forEach(workload => {
        const typedMetrics = workloadMetrics.filter(m => m.type === workload.name)
        if (typedMetrics.length > 0) {
          performanceByType[workload.name] = {
            count: typedMetrics.length,
            avgTime: typedMetrics.reduce((a, b) => a + b.time, 0) / typedMetrics.length,
            maxTime: Math.max(...typedMetrics.map(m => m.time))
          }
        }
      })
      
      performanceMetrics.push({
        category: 'cli_responsiveness',
        test: 'mixed_workload',
        metrics: {
          totalOperations: workloadMetrics.length,
          performanceByType,
          testDuration
        }
      })
      
      // Verify performance thresholds for each workload type
      expect(performanceByType.simple_commands?.avgTime || 0).toBeLessThan(5)
      expect(performanceByType.complex_commands?.avgTime || 0).toBeLessThan(20)
      expect(performanceByType.ravi_interactions?.avgTime || 0).toBeLessThan(10)
      expect(performanceByType.state_operations?.avgTime || 0).toBeLessThan(100)
    })
  })

  describe('Resource Utilization Monitoring', () => {
    test('should track CPU usage during intensive operations', async () => {
      const cpuUsageProfile = []
      
      // Start CPU monitoring
      const cpuMonitor = setInterval(() => {
        const usage = process.cpuUsage()
        cpuUsageProfile.push({
          timestamp: Date.now(),
          user: usage.user,
          system: usage.system
        })
      }, 100) // Sample every 100ms
      
      // Perform CPU-intensive operations
      await gameTestHelpers.performCpuIntensiveOperations(gameEngine, ravi)
      
      clearInterval(cpuMonitor)
      
      // Analyze CPU usage patterns
      const maxUserCpu = Math.max(...cpuUsageProfile.map(p => p.user))
      const maxSystemCpu = Math.max(...cpuUsageProfile.map(p => p.system))
      const avgUserCpu = cpuUsageProfile.reduce((a, b) => a + b.user, 0) / cpuUsageProfile.length
      
      performanceMetrics.push({
        category: 'resource_utilization',
        test: 'cpu_usage',
        metrics: {
          maxUserCpu,
          maxSystemCpu,
          avgUserCpu,
          sampleCount: cpuUsageProfile.length
        }
      })
      
      // CPU usage should be reasonable (values in microseconds)
      expect(avgUserCpu).toBeLessThan(1000000) // Less than 1 second of user CPU time
    })
    
    test('should monitor file system usage', async () => {
      const fsOperations = []
      
      // Simulate file operations
      for (let i = 0; i < 100; i++) {
        const operationStart = Date.now()
        
        // Write temporary file
        const tempFile = path.join(process.cwd(), `temp_${i}.json`)
        await fs.writeFile(tempFile, JSON.stringify({ data: `test_${i}` }))
        
        // Read file back
        const data = await fs.readFile(tempFile, 'utf8')
        
        // Delete file
        await fs.unlink(tempFile)
        
        fsOperations.push(Date.now() - operationStart)
      }
      
      const avgFsTime = fsOperations.reduce((a, b) => a + b, 0) / fsOperations.length
      const maxFsTime = Math.max(...fsOperations)
      
      performanceMetrics.push({
        category: 'resource_utilization',
        test: 'file_system',
        metrics: {
          avgFsTime,
          maxFsTime,
          operationCount: fsOperations.length
        }
      })
      
      expect(avgFsTime).toBeLessThan(50) // Average FS operation under 50ms
      expect(maxFsTime).toBeLessThan(200) // No FS operation over 200ms
    })
  })

  describe('Stress Testing with Edge Cases', () => {
    test('should handle extreme input scenarios', async () => {
      const extremeInputs = [
        { name: 'empty_string', input: '' },
        { name: 'very_long_string', input: 'a'.repeat(100000) },
        { name: 'unicode_characters', input: '🎮🤖🚀💻🎯🔥⚡🎨🎭🎪'.repeat(1000) },
        { name: 'special_characters', input: '!@#$%^&*()_+-=[]{}|;:,.<>?'.repeat(1000) },
        { name: 'mixed_case', input: 'aBcDeFgHiJkLmNoPqRsTuVwXyZ'.repeat(1000) },
        { name: 'json_injection', input: '{"malicious": "code", "eval": "process.exit()"}' },
        { name: 'sql_injection', input: "'; DROP TABLE users; --" },
        { name: 'null_bytes', input: 'test\x00null\x00bytes' }
      ]
      
      const stressResults = []
      
      for (const testCase of extremeInputs) {
        const stressStart = Date.now()
        let success = false
        let error = null
        
        try {
          await gameEngine.processCommand(testUtils.createMockCommand(testCase.input))
          await ravi.generateResponse({ command: testCase.input })
          success = true
        } catch (err) {
          error = err.message
        }
        
        const stressTime = Date.now() - stressStart
        
        stressResults.push({
          name: testCase.name,
          input: testCase.input.substring(0, 100) + (testCase.input.length > 100 ? '...' : ''),
          time: stressTime,
          success,
          error
        })
        
        // Even extreme inputs should be handled within reasonable time
        expect(stressTime).toBeLessThan(1000)
      }
      
      performanceMetrics.push({
        category: 'stress_testing',
        test: 'extreme_inputs',
        metrics: { stressResults }
      })
    })
    
    test('should maintain stability under memory pressure', async () => {
      const memoryPressureResults = []
      
      // Create memory pressure scenarios
      const pressureScenarios = [
        {
          name: 'massive_inventory',
          operation: () => {
            for (let i = 0; i < 100000; i++) {
              gameEngine.addToInventory(`pressure_item_${i}`)
            }
          }
        },
        {
          name: 'large_knowledge_base',
          operation: () => {
            for (let i = 0; i < 50000; i++) {
              ravi.learnFact(`pressure_fact_${i}_${Math.random()}`)
            }
          }
        },
        {
          name: 'rapid_commands',
          operation: async () => {
            const promises = []
            for (let i = 0; i < 10000; i++) {
              promises.push(gameEngine.processCommand(testUtils.createMockCommand(`pressure_${i}`)))
            }
            await Promise.all(promises)
          }
        }
      ]
      
      for (const scenario of pressureScenarios) {
        const beforeMem = process.memoryUsage()
        const scenarioStart = Date.now()
        
        await scenario.operation()
        
        const afterMem = process.memoryUsage()
        const scenarioTime = Date.now() - scenarioStart
        
        memoryPressureResults.push({
          scenario: scenario.name,
          time: scenarioTime,
          memoryIncrease: afterMem.heapUsed - beforeMem.heapUsed,
          finalHeapUsed: afterMem.heapUsed
        })
        
        // Force cleanup
        await gameEngine.resetGame()
        ravi.resetStats()
        if (global.gc) {
          global.gc()
        }
      }
      
      performanceMetrics.push({
        category: 'stress_testing',
        test: 'memory_pressure',
        metrics: { memoryPressureResults }
      })
      
      // Verify scenarios complete within reasonable time
      memoryPressureResults.forEach(result => {
        expect(result.time).toBeLessThan(30000) // Under 30 seconds
        expect(result.memoryIncrease).toBeLessThan(500 * 1024 * 1024) // Under 500MB increase
      })
    })
    
    test('should handle system resource exhaustion gracefully', async () => {
      const resourceExhaustionResults = []
      
      // Test file descriptor limits
      const fileHandles = []
      try {
        for (let i = 0; i < 1000; i++) {
          const tempFile = path.join(process.cwd(), `fd_test_${i}.tmp`)
          await fs.writeFile(tempFile, 'test')
          fileHandles.push(tempFile)
        }
      } catch (error) {
        resourceExhaustionResults.push({
          test: 'file_descriptors',
          filesCreated: fileHandles.length,
          error: error.message
        })
      }
      
      // Cleanup
      for (const file of fileHandles) {
        try {
          await fs.unlink(file)
        } catch {
          // Ignore cleanup errors
        }
      }
      
      performanceMetrics.push({
        category: 'stress_testing',
        test: 'resource_exhaustion',
        metrics: { resourceExhaustionResults }
      })
      
      // Should handle at least 100 files
      expect(fileHandles.length).toBeGreaterThan(100)
    })
  })

  describe('Real-World Simulation Testing', () => {
    test('should simulate typical user gameplay session', async () => {
      const sessionMetrics = []
      const sessionDuration = 120000 // 2 minutes
      const startTime = Date.now()
      
      // Simulate realistic user behavior patterns
      const userActions = [
        { action: 'look_around', weight: 0.3, avgDelay: 5000 },
        { action: 'check_inventory', weight: 0.15, avgDelay: 8000 },
        { action: 'talk_to_ravi', weight: 0.25, avgDelay: 3000 },
        { action: 'explore_location', weight: 0.15, avgDelay: 10000 },
        { action: 'use_item', weight: 0.1, avgDelay: 7000 },
        { action: 'save_game', weight: 0.05, avgDelay: 30000 }
      ]
      
      while (Date.now() - startTime < sessionDuration) {
        const random = Math.random()
        let cumulativeWeight = 0
        
        for (const userAction of userActions) {
          cumulativeWeight += userAction.weight
          if (random <= cumulativeWeight) {
            const actionStart = Date.now()
            
            try {
              switch (userAction.action) {
              case 'look_around':
                await gameEngine.processCommand(testUtils.createMockCommand('look'))
                break
              case 'check_inventory':
                await gameEngine.processCommand(testUtils.createMockCommand('inventory'))
                break
              case 'talk_to_ravi':
                await ravi.generateResponse({ command: 'tell me something interesting' })
                break
              case 'explore_location':
                await gameEngine.processCommand(testUtils.createMockCommand('explore'))
                break
              case 'use_item':
                await gameEngine.processCommand(testUtils.createMockCommand('use laptop'))
                break
              case 'save_game':
                await gameEngine.saveGame('simulation_save')
                break
              }
            } catch (error) {
              // Log but continue simulation
            }
            
            const actionTime = Date.now() - actionStart
            sessionMetrics.push({
              action: userAction.action,
              time: actionTime,
              timestamp: Date.now() - startTime
            })
            
            // Simulate user think time
            const thinkTime = Math.random() * userAction.avgDelay
            await new Promise(resolve => setTimeout(resolve, thinkTime))
            break
          }
        }
      }
      
      // Analyze session performance
      const actionsByType = {}
      userActions.forEach(ua => {
        const actionsOfType = sessionMetrics.filter(sm => sm.action === ua.action)
        if (actionsOfType.length > 0) {
          actionsByType[ua.action] = {
            count: actionsOfType.length,
            avgTime: actionsOfType.reduce((a, b) => a + b.time, 0) / actionsOfType.length,
            maxTime: Math.max(...actionsOfType.map(a => a.time))
          }
        }
      })
      
      performanceMetrics.push({
        category: 'real_world_simulation',
        test: 'typical_gameplay_session',
        metrics: {
          sessionDuration,
          totalActions: sessionMetrics.length,
          actionsByType
        }
      })
      
      // Verify realistic performance expectations
      expect(actionsByType.look_around?.avgTime || 0).toBeLessThan(10)
      expect(actionsByType.check_inventory?.avgTime || 0).toBeLessThan(20)
      expect(actionsByType.talk_to_ravi?.avgTime || 0).toBeLessThan(15)
      expect(actionsByType.save_game?.avgTime || 0).toBeLessThan(200)
    })
    
    test('should handle multiple concurrent players simulation', async () => {
      const playerCount = 10
      const sessionDuration = 60000 // 1 minute per player
      
      const playerSimulations = Array.from({ length: playerCount }, (_, playerId) => {
        return async () => {
          const playerEngine = new MockGameEngine()
          const playerRavi = new MockRavi(playerEngine)
          playerEngine.setCharacter(playerRavi)
          
          const playerMetrics = []
          const startTime = Date.now()
          
          while (Date.now() - startTime < sessionDuration) {
            const actionStart = Date.now()
            
            // Random action for this player
            const actions = [
              () => playerEngine.processCommand(testUtils.createMockCommand(`player_${playerId}_look`)),
              () => playerRavi.generateResponse({ command: `player_${playerId}_question` }),
              () => playerEngine.addToInventory(`player_${playerId}_item_${Date.now()}`),
              () => playerEngine.saveGame(`player_${playerId}_save`)
            ]
            
            const randomAction = actions[Math.floor(Math.random() * actions.length)]
            await randomAction()
            
            const actionTime = Date.now() - actionStart
            playerMetrics.push(actionTime)
            
            // Player think time
            await new Promise(resolve => setTimeout(resolve, Math.random() * 2000))
          }
          
          return {
            playerId,
            actionCount: playerMetrics.length,
            avgActionTime: playerMetrics.reduce((a, b) => a + b, 0) / playerMetrics.length,
            maxActionTime: Math.max(...playerMetrics)
          }
        }
      })
      
      const concurrentStart = Date.now()
      const playerResults = await Promise.all(playerSimulations.map(sim => sim()))
      const totalConcurrentTime = Date.now() - concurrentStart
      
      const overallAvgActionTime = playerResults.reduce((sum, p) => sum + p.avgActionTime, 0) / playerResults.length
      const maxPlayerActionTime = Math.max(...playerResults.map(p => p.maxActionTime))
      
      performanceMetrics.push({
        category: 'real_world_simulation',
        test: 'concurrent_players',
        metrics: {
          playerCount,
          totalConcurrentTime,
          overallAvgActionTime,
          maxPlayerActionTime,
          playerResults
        }
      })
      
      // Verify performance doesn't degrade significantly with concurrent players
      expect(overallAvgActionTime).toBeLessThan(50) // Under 50ms average per action
      expect(maxPlayerActionTime).toBeLessThan(500) // No action over 500ms
      expect(totalConcurrentTime).toBeLessThan(playerCount * sessionDuration * 1.2) // Within 20% of sequential time
    })
  })
})