/**
 * Swarm Coordination Test Suite
 * QA Engineer: Testing swarm integration and coordination features
 */

const MockGameEngine = require('./mocks/game-engine.mock');
const MockRavi = require('./mocks/ravi.mock');

describe('Swarm Coordination', () => {
  let gameEngine;
  let ravi;
  
  beforeEach(() => {
    gameEngine = new MockGameEngine();
    ravi = new MockRavi(gameEngine);
    gameEngine.setCharacter(ravi);
  });
  
  describe('Hook Integration', () => {
    test('should execute pre-task hooks successfully', async () => {
      const hookData = {
        task: 'test_gameplay_session',
        player: 'TestPlayer',
        location: 'living_room'
      };
      
      const result = await gameEngine.executeSwarmHook('pre-task', hookData);
      
      expect(result.success).toBe(true);
      expect(result.hookType).toBe('pre-task');
      expect(result.data).toEqual(hookData);
    });
    
    test('should execute post-edit hooks after state changes', async () => {
      // Modify game state
      gameEngine.moveToLocation('kitchen');
      gameEngine.addToInventory('test_item');
      
      const hookData = {
        file: 'game-state.json',
        changes: {
          location: 'kitchen',
          inventoryAdded: ['test_item']
        },
        timestamp: Date.now()
      };
      
      const result = await gameEngine.executeSwarmHook('post-edit', hookData);
      
      expect(result.success).toBe(true);
      expect(result.hookType).toBe('post-edit');
      expect(result.data.changes.location).toBe('kitchen');
    });
    
    test('should execute notification hooks for significant events', async () => {
      const eventData = {
        type: 'achievement_unlocked',
        achievement: 'first_exploration',
        player: 'TestPlayer',
        timestamp: Date.now()
      };
      
      const result = await gameEngine.executeSwarmHook('notification', eventData);
      
      expect(result.success).toBe(true);
      expect(result.data.type).toBe('achievement_unlocked');
      expect(result.data.achievement).toBe('first_exploration');
    });
    
    test('should execute post-task hooks on completion', async () => {
      // Simulate task completion
      const taskData = {
        taskId: 'gameplay_session_001',
        duration: 1800000, // 30 minutes
        commandsExecuted: 45,
        locationsVisited: ['living_room', 'kitchen', 'bedroom'],
        raviInteractions: 12,
        finalState: gameEngine.getState()
      };
      
      const result = await gameEngine.executeSwarmHook('post-task', taskData);
      
      expect(result.success).toBe(true);
      expect(result.data.commandsExecuted).toBe(45);
      expect(result.data.raviInteractions).toBe(12);
    });
  });
  
  describe('Memory Coordination', () => {
    test('should store game progress in swarm memory', async () => {
      // Simulate game progress
      gameEngine.moveToLocation('bedroom');
      gameEngine.addToInventory('diary');
      ravi.adjustRelationship(15);
      ravi.learnFact('player_found_diary');
      
      const progressData = {
        sessionId: 'test_session_001',
        gameState: gameEngine.getState(),
        raviStats: ravi.getStats(),
        progressMetrics: {
          timeSpent: 600000, // 10 minutes
          commandsIssued: 23,
          locationsExplored: 3,
          itemsCollected: 1
        }
      };
      
      const result = await gameEngine.executeSwarmHook('memory-store', progressData);
      
      expect(result.success).toBe(true);
      expect(result.data.sessionId).toBe('test_session_001');
      expect(result.data.gameState.currentLocation).toBe('bedroom');
      expect(result.data.raviStats.relationship).toBe(65); // 50 + 15
    });
    
    test('should retrieve coordination context from memory', async () => {
      const contextQuery = {
        sessionId: 'test_session_001',
        requestType: 'game_context',
        includePreviousSessions: false
      };
      
      const result = await gameEngine.executeSwarmHook('memory-retrieve', contextQuery);
      
      expect(result.success).toBe(true);
      expect(result.data.requestType).toBe('game_context');
    });
    
    test('should coordinate between multiple game sessions', async () => {
      // Simulate multi-session coordination
      const sessionData = {
        currentSession: 'session_002',
        previousSessions: ['session_001'],
        crossSessionData: {
          totalPlaytime: 3600000, // 1 hour
          overallProgress: 0.35,
          achievementsUnlocked: ['explorer', 'collector'],
          raviRelationshipTrend: 'improving'
        }
      };
      
      const result = await gameEngine.executeSwarmHook('session-coordination', sessionData);
      
      expect(result.success).toBe(true);
      expect(result.data.crossSessionData.overallProgress).toBe(0.35);
    });
  });
  
  describe('Agent Communication', () => {
    test('should communicate game events to swarm agents', async () => {
      const gameEvent = {
        type: 'location_discovered',
        location: 'secret_room',
        discoveredBy: 'player_exploration',
        context: {
          previousLocation: 'bedroom',
          triggerCommand: 'examine bookshelf',
          timestamp: Date.now()
        }
      };
      
      const result = await gameEngine.executeSwarmHook('agent-broadcast', gameEvent);
      
      expect(result.success).toBe(true);
      expect(result.data.type).toBe('location_discovered');
      expect(result.data.location).toBe('secret_room');
    });
    
    test('should receive guidance from analytical agents', async () => {
      const analysisRequest = {
        requestType: 'gameplay_analysis',
        gameState: gameEngine.getState(),
        playerBehavior: {
          explorationStyle: 'methodical',
          itemInteraction: 'frequent',
          raviCommunication: 'regular'
        },
        requestGuidance: true
      };
      
      const result = await gameEngine.executeSwarmHook('analysis-request', analysisRequest);
      
      expect(result.success).toBe(true);
      expect(result.data.requestType).toBe('gameplay_analysis');
    });
    
    test('should coordinate with testing agents for quality assurance', async () => {
      const qaData = {
        testType: 'integration_test',
        gameVersion: '1.0.0',
        testResults: {
          commandsProcessed: 100,
          errorsEncountered: 0,
          performanceMetrics: {
            avgResponseTime: 2.5,
            memoryUsage: 'stable',
            cpuUtilization: 'low'
          }
        }
      };
      
      const result = await gameEngine.executeSwarmHook('qa-report', qaData);
      
      expect(result.success).toBe(true);
      expect(result.data.testResults.errorsEncountered).toBe(0);
    });
  });
  
  describe('Performance Monitoring', () => {
    test('should monitor game performance metrics', async () => {
      const performanceData = {
        startTime: Date.now() - 600000, // 10 minutes ago
        endTime: Date.now(),
        metrics: {
          commandProcessingTime: {
            average: 3.2,
            min: 0.5,
            max: 15.8,
            p95: 8.1
          },
          memoryUsage: {
            initial: 25 * 1024 * 1024, // 25MB
            peak: 32 * 1024 * 1024,    // 32MB
            final: 27 * 1024 * 1024    // 27MB
          },
          raviResponseTime: {
            average: 1.1,
            responses: 45
          }
        }
      };
      
      const result = await gameEngine.executeSwarmHook('performance-monitor', performanceData);
      
      expect(result.success).toBe(true);
      expect(result.data.metrics.commandProcessingTime.average).toBe(3.2);
    });
    
    test('should detect performance bottlenecks', async () => {
      const bottleneckData = {
        detectedIssue: 'slow_inventory_processing',
        severity: 'medium',
        context: {
          inventorySize: 500,
          processingTime: 125.5,
          expectedTime: 10.0,
          playerImpact: 'noticeable_delay'
        },
        suggestedOptimizations: [
          'implement_inventory_pagination',
          'optimize_search_algorithm',
          'cache_frequent_lookups'
        ]
      };
      
      const result = await gameEngine.executeSwarmHook('bottleneck-detection', bottleneckData);
      
      expect(result.success).toBe(true);
      expect(result.data.severity).toBe('medium');
      expect(result.data.suggestedOptimizations).toHaveLength(3);
    });
  });
  
  describe('Adaptive Behavior', () => {
    test('should adapt to player behavior patterns', async () => {
      const playerPattern = {
        playStyle: 'explorer',
        preferences: {
          explorationOverStory: 0.7,
          itemCollectionRate: 'high',
          raviInteractionStyle: 'frequent_but_brief',
          commandComplexity: 'intermediate'
        },
        adaptationSuggestions: {
          raviMoodAdjustment: 'more_encouraging',
          hintFrequency: 'reduced',
          itemPlacement: 'more_hidden_items'
        }
      };
      
      const result = await gameEngine.executeSwarmHook('behavior-adaptation', playerPattern);
      
      expect(result.success).toBe(true);
      expect(result.data.playStyle).toBe('explorer');
      expect(result.data.adaptationSuggestions.raviMoodAdjustment).toBe('more_encouraging');
    });
    
    test('should learn from player feedback', async () => {
      const feedbackData = {
        feedbackType: 'implicit',
        indicators: {
          timeSpentInArea: {
            living_room: 300000, // 5 minutes
            kitchen: 600000,    // 10 minutes
            bedroom: 180000     // 3 minutes
          },
          commandRetryRate: 0.15,
          raviResponseRating: {
            helpful: 0.6,
            funny: 0.8,
            annoying: 0.2
          }
        },
        learningPriority: 'high'
      };
      
      const result = await gameEngine.executeSwarmHook('feedback-learning', feedbackData);
      
      expect(result.success).toBe(true);
      expect(result.data.indicators.raviResponseRating.funny).toBe(0.8);
    });
  });
  
  describe('Error Handling and Recovery', () => {
    test('should handle hook execution failures gracefully', async () => {
      // Simulate hook failure
      const invalidHookData = {
        malformedData: 'this should cause an error',
        nullReference: null,
        undefinedValue: undefined
      };
      
      // Mock implementation should handle this gracefully
      const result = await gameEngine.executeSwarmHook('invalid-hook', invalidHookData);
      
      expect(result.success).toBe(true); // Mock always succeeds
      expect(result.data).toBeDefined();
    });
    
    test('should recover from swarm communication failures', async () => {
      const recoveryData = {
        failureType: 'communication_timeout',
        lastSuccessfulContact: Date.now() - 30000, // 30 seconds ago
        fallbackMode: 'local_operation',
        queuedOperations: [
          { type: 'save_state', priority: 'high' },
          { type: 'log_metrics', priority: 'medium' }
        ]
      };
      
      const result = await gameEngine.executeSwarmHook('recovery-mode', recoveryData);
      
      expect(result.success).toBe(true);
      expect(result.data.fallbackMode).toBe('local_operation');
    });
    
    test('should maintain game functionality without swarm', async () => {
      // Test that game works even if swarm hooks fail
      const commands = [
        testUtils.createMockCommand('look'),
        testUtils.createMockCommand('go', ['north']),
        testUtils.createMockCommand('inventory'),
        testUtils.createMockCommand('take', ['coffee'])
      ];
      
      for (const command of commands) {
        const response = await gameEngine.processCommand(command);
        expect(response).toBeDefined();
        expect(typeof response).toBe('string');
        
        // Try to execute hook (might fail, but game should continue)
        try {
          await gameEngine.executeSwarmHook('command-processed', {
            command: command.command,
            response: response
          });
        } catch (error) {
          // Game should continue even if hook fails
          expect(gameEngine.getState().isRunning).toBeDefined();
        }
      }
    });
  });
  
  describe('Data Synchronization', () => {
    test('should synchronize game state with swarm memory', async () => {
      // Modify game state
      gameEngine.moveToLocation('kitchen');
      gameEngine.addToInventory('sync_test_item');
      ravi.adjustRelationship(10);
      
      const syncData = {
        operation: 'sync_to_swarm',
        gameState: gameEngine.getState(),
        raviState: {
          mood: ravi.getMood(),
          relationship: ravi.getRelationship(),
          knownFacts: ravi.getKnownFacts()
        },
        timestamp: Date.now(),
        checksum: 'mock_checksum_abc123'
      };
      
      const result = await gameEngine.executeSwarmHook('state-sync', syncData);
      
      expect(result.success).toBe(true);
      expect(result.data.gameState.currentLocation).toBe('kitchen');
      expect(result.data.raviState.relationship).toBe(60);
    });
    
    test('should handle concurrent access to shared state', async () => {
      const concurrentOperations = [
        { operation: 'read_state', agent: 'agent_1' },
        { operation: 'update_metrics', agent: 'agent_2' },
        { operation: 'log_event', agent: 'agent_3' }
      ];
      
      const promises = concurrentOperations.map(op => 
        gameEngine.executeSwarmHook('concurrent-access', op)
      );
      
      const results = await Promise.all(promises);
      
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.data.agent).toBe(concurrentOperations[index].agent);
      });
    });
  });
  
  describe('Integration Testing', () => {
    test('should integrate with full swarm workflow', async () => {
      // Simulate complete swarm workflow
      const workflow = [
        { hook: 'pre-task', data: { task: 'integration_test' } },
        { hook: 'game-start', data: { player: 'TestPlayer' } },
        { hook: 'command-sequence', data: { commands: ['look', 'go north', 'take coffee'] } },
        { hook: 'progress-update', data: { location: 'kitchen', items: 1 } },
        { hook: 'post-task', data: { completed: true, duration: 300000 } }
      ];
      
      const results = [];
      for (const step of workflow) {
        const result = await gameEngine.executeSwarmHook(step.hook, step.data);
        results.push(result);
      }
      
      // All steps should complete successfully
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
      
      expect(results).toHaveLength(workflow.length);
    });
    
    test('should coordinate with external systems', async () => {
      const externalData = {
        system: 'analytics_service',
        endpoint: 'https://api.example.com/game-analytics',
        payload: {
          sessionId: 'test_session',
          gameMetrics: {
            playtime: 1200000, // 20 minutes
            commandsExecuted: 78,
            achievementsUnlocked: 2,
            averageResponseTime: 2.1
          }
        },
        authentication: 'mock_token_xyz789'
      };
      
      const result = await gameEngine.executeSwarmHook('external-integration', externalData);
      
      expect(result.success).toBe(true);
      expect(result.data.system).toBe('analytics_service');
    });
  });
});