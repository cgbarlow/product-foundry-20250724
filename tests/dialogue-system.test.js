/**
 * Dialogue System Test Suite
 * QA Engineer: Testing character dialogue and conversation flow
 */

const MockRavi = require('./mocks/ravi.mock');
const MockGameEngine = require('./mocks/game-engine.mock');

describe('Dialogue System', () => {
  let ravi;
  let gameEngine;
  
  beforeEach(() => {
    gameEngine = new MockGameEngine();
    ravi = new MockRavi(gameEngine);
  });
  
  describe('Basic Dialogue Generation', () => {
    test('should generate responses based on mood', () => {
      ravi.setMood('sarcastic');
      const response = ravi.generateResponse({ command: 'test' });
      
      expect(response.text).toHaveRaviResponse();
      expect(response.mood).toBe('sarcastic');
      expect(response.text).toMatch(/wonderful|eye roll|things I do/i);
    });
    
    test('should cycle through different responses', () => {
      const responses = [];
      for (let i = 0; i < 10; i++) {
        const response = ravi.generateResponse({ command: 'test' });
        responses.push(response.text);
      }
      
      // Should have at least 2 different responses
      const uniqueResponses = new Set(responses);
      expect(uniqueResponses.size).toBeGreaterThan(1);
    });
    
    test('should include context in response', () => {
      const context = { command: 'look', gameState: { location: 'kitchen' } };
      const response = ravi.generateResponse(context);
      
      expect(response.context).toEqual(context);
      expect(response.relationship).toBe(50);
    });
  });
  
  describe('Mood System', () => {
    test('should set valid moods', () => {
      const validMoods = ['sarcastic', 'helpful', 'annoyed', 'excited', 'philosophical', 'dramatic'];
      
      validMoods.forEach(mood => {
        expect(ravi.setMood(mood)).toBe(true);
        expect(ravi.getMood()).toBe(mood);
      });
    });
    
    test('should reject invalid moods', () => {
      expect(ravi.setMood('invalid_mood')).toBe(false);
      expect(ravi.getMood()).toBe('sarcastic'); // Should remain unchanged
    });
    
    test('should generate mood-appropriate responses', () => {
      ravi.setMood('helpful');
      const helpfulResponse = ravi.generateResponse({ command: 'test' });
      expect(helpfulResponse.text).toMatch(/happy|help|reasonable/i);
      
      ravi.setMood('annoyed');
      const annoyedResponse = ravi.generateResponse({ command: 'test' });
      expect(annoyedResponse.text).toMatch(/seriously|ridiculous|patience/i);
      
      ravi.setMood('excited');
      const excitedResponse = ravi.generateResponse({ command: 'test' });
      expect(excitedResponse.text).toMatch(/amazing|love|interesting/i);
    });
    
    test('should change mood based on relationship', () => {
      // Low relationship should trigger annoyed mood
      ravi.adjustRelationship(-30); // 50 - 30 = 20
      expect(ravi.getRelationship()).toBe(20);
      expect(ravi.getMood()).toBe('annoyed');
      
      // High relationship should trigger helpful mood
      ravi.adjustRelationship(60); // 20 + 60 = 80
      expect(ravi.getRelationship()).toBe(80);
      expect(ravi.getMood()).toBe('helpful');
    });
  });
  
  describe('Relationship System', () => {
    test('should adjust relationship within bounds', () => {
      // Test positive adjustment
      ravi.adjustRelationship(30);
      expect(ravi.getRelationship()).toBe(80);
      
      // Test negative adjustment
      ravi.adjustRelationship(-40);
      expect(ravi.getRelationship()).toBe(40);
    });
    
    test('should cap relationship at 0 and 100', () => {
      // Test lower bound
      ravi.adjustRelationship(-100);
      expect(ravi.getRelationship()).toBe(0);
      
      // Test upper bound
      ravi.adjustRelationship(150);
      expect(ravi.getRelationship()).toBe(100);
    });
    
    test('should return current relationship after adjustment', () => {
      const newRelationship = ravi.adjustRelationship(25);
      expect(newRelationship).toBe(75);
      expect(ravi.getRelationship()).toBe(75);
    });
  });
  
  describe('Knowledge System', () => {
    test('should learn new facts', () => {
      expect(ravi.learnFact('player_likes_coffee')).toBe(true);
      expect(ravi.knowsFact('player_likes_coffee')).toBe(true);
    });
    
    test('should not learn duplicate facts', () => {
      ravi.learnFact('test_fact');
      expect(ravi.learnFact('test_fact')).toBe(false);
      
      const facts = ravi.getKnownFacts();
      expect(facts.filter(f => f === 'test_fact')).toHaveLength(1);
    });
    
    test('should maintain fact list', () => {
      const facts = ['fact1', 'fact2', 'fact3'];
      facts.forEach(fact => ravi.learnFact(fact));
      
      const knownFacts = ravi.getKnownFacts();
      expect(knownFacts).toEqual(expect.arrayContaining(facts));
      expect(knownFacts).toHaveLength(3);
    });
    
    test('should return copy of facts array', () => {
      ravi.learnFact('original_fact');
      const facts = ravi.getKnownFacts();
      facts.push('modified_fact');
      
      expect(ravi.getKnownFacts()).not.toContain('modified_fact');
      expect(ravi.getKnownFacts()).toHaveLength(1);
    });
  });
  
  describe('Context-Aware Responses', () => {
    test('should respond to commands with context', () => {
      const command = testUtils.createMockCommand('look', ['around']);
      const response = ravi.respondToCommand(command);
      
      expect(response.text).toHaveRaviResponse();
      expect(response.context.command).toBe('look');
      expect(response.context.args).toEqual(['around']);
      expect(response.context.gameState).toBeDefined();
    });
    
    test('should respond to location changes', () => {
      const kitchenResponse = ravi.respondToLocation('kitchen');
      expect(kitchenResponse).toContain('kitchen');
      expect(kitchenResponse).toContain('edible');
      
      const bedroomResponse = ravi.respondToLocation('bedroom');
      expect(bedroomResponse).toContain('bedroom');
      
      const unknownResponse = ravi.respondToLocation('unknown_location');
      expect(unknownResponse).toContain('place');
    });
    
    test('should respond to inventory changes', () => {
      const takeResponse = ravi.respondToInventoryChange('take', 'coffee');
      expect(takeResponse).toContain('coffee');
      expect(takeResponse).toMatch(/stuff|carry|save/i);
      
      const dropResponse = ravi.respondToInventoryChange('drop', 'junk');
      expect(dropResponse).toContain('junk');
      expect(dropResponse).toMatch(/rid|time/i);
      
      const otherResponse = ravi.respondToInventoryChange('use', 'item');
      expect(otherResponse).toContain('changing');
    });
  });
  
  describe('Game Event Responses', () => {
    test('should respond to game start', () => {
      const response = ravi.respondToGameEvent('game_start');
      expect(response).toMatch(/adventure|begins|mess/i);
    });
    
    test('should respond to save events', () => {
      const response = ravi.respondToGameEvent('game_save');
      expect(response).toMatch(/saved|sitting/i);
    });
    
    test('should respond to load events', () => {
      const response = ravi.respondToGameEvent('game_load');
      expect(response).toMatch(/back|consistency/i);
    });
    
    test('should respond to achievements', () => {
      const response = ravi.respondToGameEvent('achievement_unlocked', { 
        achievement: 'First Steps' 
      });
      expect(response).toContain('First Steps');
      expect(response).toMatch(/congratulations|proud/i);
    });
    
    test('should respond to chapter completion', () => {
      const response = ravi.respondToGameEvent('chapter_complete');
      expect(response).toMatch(/chapter|complete|pace/i);
    });
    
    test('should handle unknown events', () => {
      const response = ravi.respondToGameEvent('unknown_event');
      expect(response).toMatch(/something|happened|thrilling/i);
    });
  });
  
  describe('Statistical Tracking', () => {
    test('should track response count', () => {
      expect(ravi.getStats().responseCount).toBe(0);
      
      ravi.generateResponse({ command: 'test' });
      expect(ravi.getStats().responseCount).toBe(1);
      
      ravi.generateResponse({ command: 'test2' });
      expect(ravi.getStats().responseCount).toBe(2);
    });
    
    test('should track last command', () => {
      expect(ravi.getStats().lastCommand).toBeNull();
      
      ravi.generateResponse({ command: 'look' });
      expect(ravi.getStats().lastCommand).toBe('look');
      
      ravi.generateResponse({ command: 'go' });
      expect(ravi.getStats().lastCommand).toBe('go');
    });
    
    test('should provide comprehensive stats', () => {
      ravi.learnFact('test_fact');
      ravi.adjustRelationship(20);
      ravi.setMood('excited');
      ravi.generateResponse({ command: 'test' });
      
      const stats = ravi.getStats();
      expect(stats.mood).toBe('excited');
      expect(stats.relationship).toBe(70);
      expect(stats.knownFacts).toBe(1);
      expect(stats.responseCount).toBe(1);
      expect(stats.lastCommand).toBe('test');
    });
    
    test('should reset stats completely', () => {
      // Set up some state
      ravi.learnFact('fact1');
      ravi.learnFact('fact2');
      ravi.adjustRelationship(30);
      ravi.setMood('helpful');
      ravi.generateResponse({ command: 'test' });
      
      // Reset
      ravi.resetStats();
      
      const stats = ravi.getStats();
      expect(stats.mood).toBe('sarcastic');
      expect(stats.relationship).toBe(50);
      expect(stats.knownFacts).toBe(0);
      expect(stats.responseCount).toBe(0);
      expect(stats.lastCommand).toBeNull();
    });
  });
  
  describe('Edge Cases and Error Handling', () => {
    test('should handle undefined context', () => {
      expect(() => ravi.generateResponse(undefined)).not.toThrow();
      const response = ravi.generateResponse(undefined);
      expect(response.text).toHaveRaviResponse();
    });
    
    test('should handle null parameters', () => {
      expect(() => ravi.learnFact(null)).not.toThrow();
      expect(() => ravi.setMood(null)).not.toThrow();
      expect(() => ravi.adjustRelationship(null)).not.toThrow();
    });
    
    test('should handle extreme relationship adjustments', () => {
      ravi.adjustRelationship(Number.MAX_SAFE_INTEGER);
      expect(ravi.getRelationship()).toBe(100);
      
      ravi.adjustRelationship(-Number.MAX_SAFE_INTEGER);
      expect(ravi.getRelationship()).toBe(0);
    });
    
    test('should handle empty command responses', () => {
      const response = ravi.respondToCommand({ command: '', args: [] });
      expect(response.text).toHaveRaviResponse();
      expect(response.context.command).toBe('');
    });
  });
  
  describe('Performance Tests', () => {
    test('should generate responses quickly', async () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        ravi.generateResponse({ command: `test_${i}` });
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100); // Should generate 1000 responses in under 100ms
    });
    
    test('should handle large fact collections efficiently', () => {
      const startTime = Date.now();
      
      // Learn many facts
      for (let i = 0; i < 10000; i++) {
        ravi.learnFact(`fact_${i}`);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // Should handle 10k facts in under 1 second
      expect(ravi.getKnownFacts()).toHaveLength(10000);
    });
    
    test('should maintain consistent response times', async () => {
      const times = [];
      
      for (let i = 0; i < 100; i++) {
        const start = Date.now();
        ravi.generateResponse({ command: `test_${i}` });
        const end = Date.now();
        times.push(end - start);
      }
      
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);
      
      expect(avgTime).toBeLessThan(1); // Average under 1ms
      expect(maxTime).toBeLessThan(10); // No single response over 10ms
    });
  });
});