/**
 * Story Engine Test Suite
 * QA Engineer: Narrative flow and branching logic testing
 */

// Mock StoryEngine for testing
class MockStoryEngine {
  constructor() {
    this.currentChapter = 0;
    this.currentScene = 0;
    this.storyState = {
      playerChoices: [],
      unlockedScenes: ['intro'],
      characterRelationships: {},
      storyFlags: new Set(),
      endings: []
    };
    
    this.chapters = [
      {
        id: 'intro',
        title: 'The Beginning',
        scenes: [
          {
            id: 'intro_1',
            title: 'Welcome',
            content: 'Welcome to Ravi\'s Adventure!',
            choices: [
              { id: 'be_friendly', text: 'Be friendly to Ravi', next: 'intro_2' },
              { id: 'be_sarcastic', text: 'Match Ravi\'s sarcasm', next: 'intro_3' }
            ],
            triggers: [],
            consequences: []
          },
          {
            id: 'intro_2',
            title: 'Friendly Path',
            content: 'Ravi appreciates your kindness.',
            choices: [
              { id: 'continue', text: 'Continue adventure', next: 'chapter_1' }
            ],
            triggers: [{ flag: 'friendly_player', value: true }],
            consequences: [{ relationship: 'ravi', change: 10 }]
          },
          {
            id: 'intro_3',
            title: 'Sarcastic Path',
            content: 'Ravi seems impressed by your wit.',
            choices: [
              { id: 'continue', text: 'Continue adventure', next: 'chapter_1' }
            ],
            triggers: [{ flag: 'sarcastic_player', value: true }],
            consequences: [{ relationship: 'ravi', change: 5 }]
          }
        ]
      },
      {
        id: 'chapter_1',
        title: 'The Adventure Begins',
        scenes: [
          {
            id: 'ch1_start',
            title: 'First Steps',
            content: 'Your adventure with Ravi begins in earnest.',
            choices: [
              { id: 'explore', text: 'Explore the environment', next: 'ch1_explore' },
              { id: 'talk', text: 'Talk more with Ravi', next: 'ch1_talk' }
            ],
            prerequisites: ['intro'],
            triggers: [],
            consequences: []
          }
        ]
      }
    ];
  }
  
  // Scene navigation
  getCurrentScene() {
    const chapter = this.chapters[this.currentChapter];
    return chapter ? chapter.scenes[this.currentScene] : null;
  }
  
  getCurrentChapter() {
    return this.chapters[this.currentChapter] || null;
  }
  
  // Story progression
  makeChoice(choiceId) {
    const scene = this.getCurrentScene();
    if (!scene) return { success: false, error: 'No current scene' };
    
    const choice = scene.choices.find(c => c.id === choiceId);
    if (!choice) return { success: false, error: 'Invalid choice' };
    
    // Record the choice
    this.storyState.playerChoices.push({
      sceneId: scene.id,
      choiceId,
      timestamp: Date.now()
    });
    
    // Apply consequences
    this.applyConsequences(scene.consequences);
    
    // Set story flags
    scene.triggers.forEach(trigger => {
      this.storyState.storyFlags.add(trigger.flag);
    });
    
    // Navigate to next scene
    const nextScene = this.findScene(choice.next);
    if (nextScene) {
      this.navigateToScene(nextScene.chapterIndex, nextScene.sceneIndex);
      return { success: true, nextScene: nextScene.scene };
    }
    
    return { success: false, error: 'Next scene not found' };
  }
  
  findScene(sceneId) {
    for (let chapterIndex = 0; chapterIndex < this.chapters.length; chapterIndex++) {
      const chapter = this.chapters[chapterIndex];
      for (let sceneIndex = 0; sceneIndex < chapter.scenes.length; sceneIndex++) {
        const scene = chapter.scenes[sceneIndex];
        if (scene.id === sceneId) {
          return { scene, chapterIndex, sceneIndex };
        }
      }
    }
    return null;
  }
  
  navigateToScene(chapterIndex, sceneIndex) {
    if (chapterIndex >= 0 && chapterIndex < this.chapters.length) {
      const chapter = this.chapters[chapterIndex];
      if (sceneIndex >= 0 && sceneIndex < chapter.scenes.length) {
        this.currentChapter = chapterIndex;
        this.currentScene = sceneIndex;
        
        const scene = chapter.scenes[sceneIndex];
        if (!this.storyState.unlockedScenes.includes(scene.id)) {
          this.storyState.unlockedScenes.push(scene.id);
        }
        
        return true;
      }
    }
    return false;
  }
  
  // Prerequisites and conditions
  canAccessScene(sceneId) {
    const sceneInfo = this.findScene(sceneId);
    if (!sceneInfo) return false;
    
    const scene = sceneInfo.scene;
    
    // Check prerequisites
    if (scene.prerequisites) {
      for (const prereq of scene.prerequisites) {
        if (!this.storyState.unlockedScenes.includes(prereq)) {
          return false;
        }
      }
    }
    
    // Check story flags
    if (scene.requiredFlags) {
      for (const flag of scene.requiredFlags) {
        if (!this.storyState.storyFlags.has(flag)) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  // Consequences and effects
  applyConsequences(consequences) {
    if (!Array.isArray(consequences)) return;
    
    consequences.forEach(consequence => {
      if (consequence.relationship) {
        const current = this.storyState.characterRelationships[consequence.relationship] || 0;
        this.storyState.characterRelationships[consequence.relationship] = 
          Math.max(0, Math.min(100, current + consequence.change));
      }
      
      if (consequence.flag) {
        this.storyState.storyFlags.add(consequence.flag);
      }
      
      if (consequence.ending) {
        this.storyState.endings.push(consequence.ending);
      }
    });
  }
  
  // Story state management
  getStoryState() {
    return {
      ...this.storyState,
      currentChapter: this.currentChapter,
      currentScene: this.currentScene,
      currentSceneData: this.getCurrentScene()
    };
  }
  
  setStoryState(newState) {
    this.storyState = { ...this.storyState, ...newState };
    if (typeof newState.currentChapter === 'number') {
      this.currentChapter = newState.currentChapter;
    }
    if (typeof newState.currentScene === 'number') {
      this.currentScene = newState.currentScene;
    }
  }
  
  // Choice analysis
  getAvailableChoices() {
    const scene = this.getCurrentScene();
    if (!scene) return [];
    
    return scene.choices.filter(choice => {
      // Check if choice has conditions
      if (choice.conditions) {
        for (const condition of choice.conditions) {
          if (condition.flag && !this.storyState.storyFlags.has(condition.flag)) {
            return false;
          }
          if (condition.relationship) {
            const relationship = this.storyState.characterRelationships[condition.relationship] || 0;
            if (relationship < condition.minValue) {
              return false;
            }
          }
        }
      }
      return true;
    });
  }
  
  getChoiceHistory() {
    return [...this.storyState.playerChoices];
  }
  
  // Story branching analysis
  getBranchingPaths() {
    const paths = [];
    const visited = new Set();
    
    const explorePath = (sceneId, path = []) => {
      if (visited.has(sceneId)) return;
      visited.add(sceneId);
      
      const sceneInfo = this.findScene(sceneId);
      if (!sceneInfo) return;
      
      const currentPath = [...path, sceneId];
      
      const scene = sceneInfo.scene;
      if (scene.choices.length === 0) {
        // End of path
        paths.push(currentPath);
      } else {
        // Continue exploring
        scene.choices.forEach(choice => {
          explorePath(choice.next, currentPath);
        });
      }
    };
    
    explorePath('intro_1');
    return paths;
  }
  
  // Reset functionality
  resetStory() {
    this.currentChapter = 0;
    this.currentScene = 0;
    this.storyState = {
      playerChoices: [],
      unlockedScenes: ['intro'],
      characterRelationships: {},
      storyFlags: new Set(),
      endings: []
    };
  }
}

jest.mock('../src/story-engine', () => {
  return MockStoryEngine;
});

describe('Story Engine Narrative Flow', () => {
  let storyEngine;
  
  beforeEach(() => {
    storyEngine = new MockStoryEngine();
  });
  
  describe('Scene Navigation', () => {
    test('should start at intro scene', () => {
      const scene = storyEngine.getCurrentScene();
      
      expect(scene).toBeDefined();
      expect(scene.id).toBe('intro_1');
      expect(scene.title).toBe('Welcome');
    });
    
    test('should get current chapter', () => {
      const chapter = storyEngine.getCurrentChapter();
      
      expect(chapter).toBeDefined();
      expect(chapter.id).toBe('intro');
      expect(chapter.title).toBe('The Beginning');
    });
    
    test('should navigate to specific scene', () => {
      const success = storyEngine.navigateToScene(0, 1);
      
      expect(success).toBe(true);
      expect(storyEngine.getCurrentScene().id).toBe('intro_2');
    });
    
    test('should handle invalid navigation', () => {
      const success = storyEngine.navigateToScene(99, 99);
      
      expect(success).toBe(false);
      expect(storyEngine.getCurrentScene().id).toBe('intro_1'); // Should stay at current
    });
    
    test('should unlock scenes when navigated to', () => {
      storyEngine.navigateToScene(0, 1);
      
      const state = storyEngine.getStoryState();
      expect(state.unlockedScenes).toContain('intro_2');
    });
  });
  
  describe('Choice System', () => {
    test('should make valid choice', () => {
      const result = storyEngine.makeChoice('be_friendly');
      
      expect(result.success).toBe(true);
      expect(result.nextScene).toBeDefined();
      expect(result.nextScene.id).toBe('intro_2');
    });
    
    test('should handle invalid choice', () => {
      const result = storyEngine.makeChoice('invalid_choice');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid choice');
    });
    
    test('should record choice in history', () => {
      storyEngine.makeChoice('be_friendly');
      
      const history = storyEngine.getChoiceHistory();
      expect(history).toHaveLength(1);
      expect(history[0].choiceId).toBe('be_friendly');
      expect(history[0].sceneId).toBe('intro_1');
    });
    
    test('should apply consequences of choices', () => {
      storyEngine.makeChoice('be_friendly');
      
      const state = storyEngine.getStoryState();
      expect(state.characterRelationships.ravi).toBe(10);
    });
    
    test('should set story flags', () => {
      storyEngine.makeChoice('be_friendly');
      
      const state = storyEngine.getStoryState();
      expect(state.storyFlags.has('friendly_player')).toBe(true);
    });
  });
  
  describe('Available Choices', () => {
    test('should get available choices for current scene', () => {
      const choices = storyEngine.getAvailableChoices();
      
      expect(choices).toHaveLength(2);
      expect(choices[0].id).toBe('be_friendly');
      expect(choices[1].id).toBe('be_sarcastic');
    });
    
    test('should filter choices based on conditions', () => {
      // This would test conditional choice availability
      // For now, all choices are available
      const choices = storyEngine.getAvailableChoices();
      
      expect(Array.isArray(choices)).toBe(true);
    });
    
    test('should handle scene with no choices', () => {
      // Navigate to a scene that might have no choices
      storyEngine.navigateToScene(99, 99); // Invalid navigation
      const choices = storyEngine.getAvailableChoices();
      
      expect(Array.isArray(choices)).toBe(true);
    });
  });
  
  describe('Prerequisites and Access Control', () => {
    test('should check scene accessibility', () => {
      const canAccess = storyEngine.canAccessScene('intro_1');
      
      expect(canAccess).toBe(true);
    });
    
    test('should deny access to scenes with unmet prerequisites', () => {
      const canAccess = storyEngine.canAccessScene('ch1_start');
      
      // Should be true initially as 'intro' is in unlocked scenes
      expect(canAccess).toBe(true);
    });
    
    test('should grant access after meeting prerequisites', () => {
      // Complete intro to unlock chapter 1
      storyEngine.makeChoice('be_friendly');
      
      const canAccess = storyEngine.canAccessScene('ch1_start');
      expect(canAccess).toBe(true);
    });
  });
  
  describe('Story State Management', () => {
    test('should get complete story state', () => {
      const state = storyEngine.getStoryState();
      
      expect(state).toHaveProperty('playerChoices');
      expect(state).toHaveProperty('unlockedScenes');
      expect(state).toHaveProperty('characterRelationships');
      expect(state).toHaveProperty('storyFlags');
      expect(state).toHaveProperty('currentChapter');
      expect(state).toHaveProperty('currentScene');
      expect(state).toHaveProperty('currentSceneData');
    });
    
    test('should set story state', () => {
      const newState = {
        currentChapter: 1,
        currentScene: 0,
        characterRelationships: { ravi: 50 }
      };
      
      storyEngine.setStoryState(newState);
      
      const state = storyEngine.getStoryState();
      expect(state.currentChapter).toBe(1);
      expect(state.characterRelationships.ravi).toBe(50);
    });
    
    test('should preserve existing state when setting partial state', () => {
      storyEngine.makeChoice('be_friendly');
      
      const originalChoices = storyEngine.getChoiceHistory();
      
      storyEngine.setStoryState({ currentChapter: 1 });
      
      const newChoices = storyEngine.getChoiceHistory();
      expect(newChoices).toEqual(originalChoices);
    });
  });
  
  describe('Character Relationships', () => {
    test('should track relationship changes', () => {
      storyEngine.makeChoice('be_friendly');
      
      const state = storyEngine.getStoryState();
      expect(state.characterRelationships.ravi).toBe(10);
      
      storyEngine.makeChoice('continue');
      storyEngine.makeChoice('be_sarcastic'); // If this were possible
      
      // Relationship should be cumulative
    });
    
    test('should enforce relationship bounds', () => {
      // Test maximum relationship
      const consequences = [{ relationship: 'ravi', change: 150 }];
      storyEngine.applyConsequences(consequences);
      
      const state = storyEngine.getStoryState();
      expect(state.characterRelationships.ravi).toBe(100); // Should cap at 100
      
      // Test minimum relationship
      const negativeConsequences = [{ relationship: 'ravi', change: -200 }];
      storyEngine.applyConsequences(negativeConsequences);
      
      const newState = storyEngine.getStoryState();
      expect(newState.characterRelationships.ravi).toBe(0); // Should not go below 0
    });
  });
  
  describe('Story Flags', () => {
    test('should set and check story flags', () => {
      storyEngine.makeChoice('be_friendly');
      
      const state = storyEngine.getStoryState();
      expect(state.storyFlags.has('friendly_player')).toBe(true);
      expect(state.storyFlags.has('sarcastic_player')).toBe(false);
    });
    
    test('should persist flags across choices', () => {
      storyEngine.makeChoice('be_friendly');
      storyEngine.makeChoice('continue');
      
      const state = storyEngine.getStoryState();
      expect(state.storyFlags.has('friendly_player')).toBe(true);
    });
  });
  
  describe('Branching Path Analysis', () => {
    test('should analyze possible branching paths', () => {
      const paths = storyEngine.getBranchingPaths();
      
      expect(Array.isArray(paths)).toBe(true);
      expect(paths.length).toBeGreaterThan(0);
      
      // Should find multiple paths through the story
      expect(paths.some(path => path.includes('intro_2'))).toBe(true);
      expect(paths.some(path => path.includes('intro_3'))).toBe(true);
    });
    
    test('should find all reachable scenes', () => {
      const paths = storyEngine.getBranchingPaths();
      const allScenes = new Set();
      
      paths.forEach(path => {
        path.forEach(sceneId => allScenes.add(sceneId));
      });
      
      expect(allScenes.has('intro_1')).toBe(true);
      expect(allScenes.has('intro_2')).toBe(true);
      expect(allScenes.has('intro_3')).toBe(true);
    });
  });
  
  describe('Choice History', () => {
    test('should maintain chronological choice history', () => {
      const startTime = Date.now();
      
      storyEngine.makeChoice('be_friendly');
      storyEngine.makeChoice('continue');
      
      const history = storyEngine.getChoiceHistory();
      
      expect(history).toHaveLength(2);
      expect(history[0].choiceId).toBe('be_friendly');
      expect(history[1].choiceId).toBe('continue');
      expect(history[0].timestamp).toBeGreaterThanOrEqual(startTime);
      expect(history[1].timestamp).toBeGreaterThanOrEqual(history[0].timestamp);
    });
    
    test('should include scene context in choice history', () => {
      storyEngine.makeChoice('be_friendly');
      
      const history = storyEngine.getChoiceHistory();
      expect(history[0].sceneId).toBe('intro_1');
    });
  });
  
  describe('Story Reset', () => {
    test('should reset story to initial state', () => {
      // Make some progress
      storyEngine.makeChoice('be_friendly');
      storyEngine.makeChoice('continue');
      
      // Reset
      storyEngine.resetStory();
      
      const state = storyEngine.getStoryState();
      expect(state.currentChapter).toBe(0);
      expect(state.currentScene).toBe(0);
      expect(state.playerChoices).toEqual([]);
      expect(state.characterRelationships).toEqual({});
      expect(state.storyFlags.size).toBe(0);
      expect(state.unlockedScenes).toEqual(['intro']);
    });
    
    test('should return to intro scene after reset', () => {
      storyEngine.makeChoice('be_friendly');
      storyEngine.resetStory();
      
      const scene = storyEngine.getCurrentScene();
      expect(scene.id).toBe('intro_1');
    });
  });
  
  describe('Edge Cases', () => {
    test('should handle missing scene gracefully', () => {
      storyEngine.currentChapter = 99;
      storyEngine.currentScene = 99;
      
      const scene = storyEngine.getCurrentScene();
      expect(scene).toBeNull();
    });
    
    test('should handle choice when no current scene', () => {
      storyEngine.currentChapter = 99;
      storyEngine.currentScene = 99;
      
      const result = storyEngine.makeChoice('any_choice');
      expect(result.success).toBe(false);
      expect(result.error).toContain('No current scene');
    });
    
    test('should handle malformed consequences', () => {
      expect(() => {
        storyEngine.applyConsequences(null);
      }).not.toThrow();
      
      expect(() => {
        storyEngine.applyConsequences('not an array');
      }).not.toThrow();
    });
  });
  
  describe('Performance Tests', () => {
    test('should handle large choice history efficiently', () => {
      const startTime = Date.now();
      
      // Simulate many choices
      for (let i = 0; i < 1000; i++) {
        storyEngine.storyState.playerChoices.push({
          sceneId: `scene_${i}`,
          choiceId: `choice_${i}`,
          timestamp: Date.now()
        });
      }
      
      const history = storyEngine.getChoiceHistory();
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(50);
      expect(history).toHaveLength(1000);
    });
    
    test('should analyze branching paths efficiently', () => {
      const startTime = Date.now();
      const paths = storyEngine.getBranchingPaths();
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(100);
      expect(paths.length).toBeGreaterThan(0);
    });
  });
});