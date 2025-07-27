/**
 * Story System Integration Test Suite
 * Comprehensive end-to-end testing for story loading, progression, and validation
 * Story Integration Tester Agent: Comprehensive narrative flow testing
 */

const StoryEngine = require('../src/story-engine')
const fs = require('fs').promises
const path = require('path')

describe('Story System Integration Tests', () => {
  let storyEngine
  let originalConsoleLog

  beforeEach(async () => {
    storyEngine = new StoryEngine()
    // Suppress debug output during tests
    originalConsoleLog = console.log
    console.log = jest.fn()
  })

  afterEach(() => {
    console.log = originalConsoleLog
  })

  describe('Story Loading and Parsing Validation', () => {
    test('should load intro story successfully', async () => {
      const storyPath = '../stories/intro.js'
      const story = await storyEngine.loadStory(storyPath)
      
      expect(story).toBeDefined()
      expect(story.id).toBe('intro')
      expect(story.title).toBe('Ravi\'s Adventure: The Beginning')
      expect(story.scenes).toBeDefined()
      expect(story.scenes.start).toBeDefined()
    })

    test('should validate story structure and metadata', async () => {
      await storyEngine.loadStory('../stories/intro.js')
      const story = storyEngine.currentStory
      
      // Validate required story metadata
      expect(story.id).toBeTruthy()
      expect(story.title).toBeTruthy()
      expect(story.scenes).toBeInstanceOf(Object)
      
      // Validate scene structure
      Object.values(story.scenes).forEach(scene => {
        expect(scene.id).toBeTruthy()
        expect(scene.title).toBeTruthy()
        expect(scene.text).toBeTruthy()
        expect(Array.isArray(scene.choices)).toBe(true)
      })
    })

    test('should handle story loading errors gracefully', async () => {
      await expect(storyEngine.loadStory('../stories/nonexistent.js'))
        .rejects.toThrow('Story loading failed')
    })

    test('should validate choice structure in all scenes', async () => {
      await storyEngine.loadStory('../stories/intro.js')
      const story = storyEngine.currentStory
      
      Object.values(story.scenes).forEach(scene => {
        scene.choices.forEach(choice => {
          expect(choice.id).toBeTruthy()
          expect(choice.text).toBeTruthy()
          // nextScene is optional for some choices
        })
      })
    })

    test('should validate scene connectivity', async () => {
      await storyEngine.loadStory('../stories/intro.js')
      const story = storyEngine.currentStory
      const sceneIds = Object.keys(story.scenes)
      
      // Check that all choice destinations exist
      Object.values(story.scenes).forEach(scene => {
        scene.choices.forEach(choice => {
          if (choice.nextScene && !choice.nextScene.startsWith('story:')) {
            expect(sceneIds).toContain(choice.nextScene)
          }
        })
      })
    })
  })

  describe('Scene Progression and Choice Handling', () => {
    beforeEach(async () => {
      await storyEngine.loadStory('../stories/intro.js')
    })

    test('should get initial scene correctly', () => {
      const scene = storyEngine.getScene('start')
      
      expect(scene.id).toBe('start')
      expect(scene.title).toBe('Welcome to the Digital Realm')
      expect(scene.text).toContain('Welcome to my digital world')
      expect(scene.choices.length).toBeGreaterThan(0)
    })

    test('should process scene content with template variables', () => {
      storyEngine.setVariable('playerName', 'TestPlayer')
      
      // Mock a scene with template variables
      const mockScene = {
        id: 'test',
        title: 'Test Scene',
        text: 'Hello {{playerName}}!',
        choices: []
      }
      
      const processed = storyEngine.processScene(mockScene, 'test')
      expect(processed.text).toBe('Hello TestPlayer!')
    })

    test('should handle scene choices and transitions', async () => {
      const initialScene = storyEngine.getScene('start')
      const choice = initialScene.choices.find(c => c.id === 'look_around')
      
      expect(choice).toBeDefined()
      
      // Mock nextScene for choice (since intro story doesn't have nextScene)
      choice.nextScene = 'look_around'
      
      const result = await storyEngine.makeChoice('look_around')
      expect(result).toBeDefined()
    })

    test('should record choice history correctly', async () => {
      const choice = { id: 'test_choice', nextScene: 'start' }
      storyEngine.currentStory.scenes.start.choices.push(choice)
      
      await storyEngine.makeChoice('test_choice')
      
      const history = storyEngine.storyHistory
      expect(history.length).toBe(1)
      expect(history[0].choiceId).toBe('test_choice')
      expect(history[0].timestamp).toBeDefined()
    })

    test('should filter choices based on conditions', () => {
      storyEngine.setFlag('test_flag', true)
      
      const mockScene = {
        id: 'conditional_test',
        title: 'Test Scene',
        text: 'Test',
        choices: [
          { id: 'always_available', text: 'Always Available' },
          { id: 'conditional', text: 'Conditional', condition: 'test_flag' },
          { id: 'never_available', text: 'Never Available', condition: '!test_flag' }
        ]
      }
      
      const processed = storyEngine.processScene(mockScene, 'conditional_test')
      expect(processed.choices.length).toBe(2) // always_available and conditional
      expect(processed.choices.find(c => c.id === 'conditional')).toBeDefined()
      expect(processed.choices.find(c => c.id === 'never_available')).toBeUndefined()
    })

    test('should handle choice effects correctly', async () => {
      const mockChoice = {
        id: 'effect_test',
        nextScene: 'start',
        effects: [
          { type: 'set_flag', flag: 'test_flag', value: true },
          { type: 'add_item', item: 'test_item', quantity: 2 },
          { type: 'set_variable', variable: 'test_var', value: 42 }
        ]
      }
      
      storyEngine.currentStory.scenes.start.choices.push(mockChoice)
      
      await storyEngine.makeChoice('effect_test')
      
      expect(storyEngine.getFlag('test_flag')).toBe(true)
      expect(storyEngine.getInventoryCount('test_item')).toBe(2)
      expect(storyEngine.getVariable('test_var')).toBe(42)
    })
  })

  describe('Dynamic Content Generation Testing', () => {
    beforeEach(async () => {
      await storyEngine.loadStory('../stories/intro.js')
    })

    test('should process template text with multiple variables', () => {
      storyEngine.setVariable('playerName', 'Alice')
      storyEngine.setVariable('currentLocation', 'Digital Garden')
      storyEngine.setVariable('health', 85)
      
      const templateText = 'Hello {{playerName}}! You are in {{currentLocation}} with {{health}}% health.'
      const processed = storyEngine.processTemplateText(templateText)
      
      expect(processed).toBe('Hello Alice! You are in Digital Garden with 85% health.')
    })

    test('should handle missing template variables gracefully', () => {
      const templateText = 'Hello {{playerName}}! You have {{unknownVar}} items.'
      const processed = storyEngine.processTemplateText(templateText)
      
      expect(processed).toBe('Hello {{playerName}}! You have {{unknownVar}} items.')
    })

    test('should add meta-commentary when triggers are met', () => {
      // Trigger first_choice meta trigger
      storyEngine.storyHistory.push({ choiceId: 'test', timestamp: Date.now() })
      
      const scene = storyEngine.getScene('start')
      expect(scene.metaText).toContain('first choice')
    })

    test('should validate meta-trigger conditions', () => {
      // Test speed_runner trigger
      const recentTime = Date.now() - 30000 // 30 seconds ago
      storyEngine.storyHistory.push({ timestamp: recentTime })
      
      const metaText = storyEngine.checkMetaTriggers()
      expect(metaText).toContain('speedrunning')
    })

    test('should prevent meta-trigger repetition', () => {
      storyEngine.storyHistory.push({ choiceId: 'test', timestamp: Date.now() })
      
      // First check should return meta text
      const firstCheck = storyEngine.checkMetaTriggers()
      expect(firstCheck).toBeTruthy()
      
      // Second check should not repeat
      const secondCheck = storyEngine.checkMetaTriggers()
      expect(secondCheck).toBeNull()
    })
  })

  describe('Story State Persistence Verification', () => {
    beforeEach(async () => {
      await storyEngine.loadStory('../stories/intro.js')
    })

    test('should capture complete story state', () => {
      storyEngine.setFlag('test_flag', true)
      storyEngine.setVariable('test_var', 'test_value')
      storyEngine.characterRelationships.ravi = 50
      storyEngine.storyHistory.push({ choiceId: 'test', timestamp: Date.now() })
      
      const state = storyEngine.getStoryState()
      
      expect(state.globalFlags.test_flag).toBe(true)
      expect(state.globalFlags.test_var).toBe('test_value')
      expect(state.characterRelationships.ravi).toBe(50)
      expect(state.storyHistory.length).toBe(1)
      expect(state.timestamp).toBeDefined()
    })

    test('should restore story state accurately', async () => {
      const mockState = {
        globalFlags: { 'test_flag': true, 'test_var': 'restored' },
        characterRelationships: { 'ravi': 75 },
        storyHistory: [{ choiceId: 'restored_choice', timestamp: Date.now() }],
        currentStory: 'intro'
      }
      
      await storyEngine.loadStoryState(mockState)
      
      expect(storyEngine.getFlag('test_flag')).toBe(true)
      expect(storyEngine.getVariable('test_var')).toBe('restored')
      expect(storyEngine.characterRelationships.ravi).toBe(75)
      expect(storyEngine.storyHistory.length).toBe(1)
    })

    test('should handle inventory persistence', () => {
      storyEngine.addToInventory('magic_sword', 1)
      storyEngine.addToInventory('health_potion', 3)
      
      const state = storyEngine.getStoryState()
      const newEngine = new StoryEngine()
      newEngine.loadStoryState(state)
      
      expect(newEngine.getInventoryCount('magic_sword')).toBe(1)
      expect(newEngine.getInventoryCount('health_potion')).toBe(3)
    })

    test('should validate state consistency after save/load cycle', async () => {
      // Set up complex state
      storyEngine.setFlag('complex_flag', true)
      storyEngine.setVariable('player_level', 5)
      storyEngine.addToInventory('rare_item', 2)
      storyEngine.characterRelationships.npc1 = 80
      
      const originalState = storyEngine.getStoryState()
      
      // Create new engine and restore state
      const newEngine = new StoryEngine()
      await newEngine.loadStoryState(originalState)
      
      const restoredState = newEngine.getStoryState()
      
      // Compare critical state elements
      expect(restoredState.globalFlags).toEqual(originalState.globalFlags)
      expect(restoredState.characterRelationships).toEqual(originalState.characterRelationships)
    })
  })

  describe('Cross-Story Navigation Testing', () => {
    test('should handle story transitions with story: prefix', async () => {
      await storyEngine.loadStory('../stories/intro.js')
      
      // Mock a choice that transitions to another story
      const mockChoice = {
        id: 'story_transition',
        nextScene: 'story:chapter1'
      }
      
      storyEngine.currentStory.scenes.start.choices.push(mockChoice)
      
      // Note: This will fail gracefully since chapter1 doesn't exist
      await expect(storyEngine.makeChoice('story_transition'))
        .rejects.toThrow()
    })

    test('should validate cross-story references', async () => {
      await storyEngine.loadStory('../stories/intro.js')
      
      // Check for any story: references in current story
      const storyReferences = []
      Object.values(storyEngine.currentStory.scenes).forEach(scene => {
        scene.choices.forEach(choice => {
          if (choice.nextScene && choice.nextScene.startsWith('story:')) {
            storyReferences.push(choice.nextScene)
          }
        })
      })
      
      // For intro story, should not have story references
      expect(storyReferences.length).toBe(0)
    })

    test('should maintain state across story transitions', async () => {
      await storyEngine.loadStory('../stories/intro.js')
      
      // Set some state
      storyEngine.setFlag('carried_flag', true)
      storyEngine.addToInventory('cross_story_item', 1)
      
      // Even after story transition failure, state should be preserved
      try {
        await storyEngine.transitionToScene('story:nonexistent')
      } catch (error) {
        // Expected to fail
      }
      
      expect(storyEngine.getFlag('carried_flag')).toBe(true)
      expect(storyEngine.getInventoryCount('cross_story_item')).toBe(1)
    })
  })

  describe('Story Metadata and Validation Testing', () => {
    test('should validate story file structure', async () => {
      const storyPath = path.join(__dirname, '../stories/intro.js')
      
      // Check if story file exists and is readable
      const stats = await fs.stat(storyPath)
      expect(stats.isFile()).toBe(true)
      
      // Load and validate structure
      await storyEngine.loadStory('../stories/intro.js')
      const story = storyEngine.currentStory
      
      expect(story).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        scenes: expect.any(Object)
      })
    })

    test('should validate choice callback system', async () => {
      await storyEngine.loadStory('../stories/intro.js')
      
      let callbackExecuted = false
      const testCallback = async () => {
        callbackExecuted = true
      }
      
      storyEngine.registerChoiceCallback('test_callback', testCallback)
      
      // Mock a choice with callback
      const mockChoice = {
        id: 'callback_test',
        nextScene: 'start',
        callback: 'test_callback'
      }
      
      storyEngine.currentStory.scenes.start.choices.push(mockChoice)
      
      await storyEngine.makeChoice('callback_test')
      expect(callbackExecuted).toBe(true)
    })

    test('should validate inventory system integration', () => {
      storyEngine.addToInventory('test_item', 5)
      expect(storyEngine.getInventoryCount('test_item')).toBe(5)
      
      storyEngine.removeFromInventory('test_item', 2)
      expect(storyEngine.getInventoryCount('test_item')).toBe(3)
      
      storyEngine.removeFromInventory('test_item', 10) // More than available
      expect(storyEngine.getInventoryCount('test_item')).toBe(0) // Should not go negative
      
      const inventory = storyEngine.getInventory()
      expect(inventory.test_item).toBeUndefined() // Should not include items with 0 count
    })

    test('should validate character relationship bounds', () => {
      // Test maximum bounds
      storyEngine.applyConsequences([{ relationship: 'test_char', change: 150 }])
      expect(storyEngine.characterRelationships.test_char).toBe(100)
      
      // Test minimum bounds
      storyEngine.applyConsequences([{ relationship: 'test_char', change: -200 }])
      expect(storyEngine.characterRelationships.test_char).toBe(0)
      
      // Test normal operation
      storyEngine.applyConsequences([{ relationship: 'test_char', change: 50 }])
      expect(storyEngine.characterRelationships.test_char).toBe(50)
    })
  })

  describe('Error Handling and Edge Cases', () => {
    test('should handle missing story gracefully', () => {
      expect(() => storyEngine.getScene('nonexistent'))
        .toThrow('No story loaded')
    })

    test('should handle missing scene gracefully', async () => {
      await storyEngine.loadStory('../stories/intro.js')
      
      expect(() => storyEngine.getScene('nonexistent_scene'))
        .toThrow('Scene not found: nonexistent_scene')
    })

    test('should handle missing choice gracefully', async () => {
      await storyEngine.loadStory('../stories/intro.js')
      
      await expect(storyEngine.makeChoice('nonexistent_choice'))
        .rejects.toThrow('Choice not found: nonexistent_choice')
    })

    test('should handle malformed story data gracefully', () => {
      storyEngine.currentStory = {
        id: 'malformed',
        scenes: {
          bad_scene: {
            id: 'bad_scene',
            title: null, // Invalid
            text: '', // Empty
            choices: 'not_an_array' // Invalid type
          }
        }
      }
      
      expect(() => storyEngine.getScene('bad_scene')).not.toThrow()
    })

    test('should handle unknown effect types gracefully', async () => {
      await storyEngine.loadStory('../stories/intro.js')
      
      const mockChoice = {
        id: 'unknown_effect',
        nextScene: 'start',
        effects: [
          { type: 'unknown_effect_type', data: 'test' }
        ]
      }
      
      storyEngine.currentStory.scenes.start.choices.push(mockChoice)
      
      // Should not throw, just warn
      await expect(storyEngine.makeChoice('unknown_effect')).resolves.toBeDefined()
    })

    test('should handle circular story references', () => {
      const mockStory = {
        id: 'circular',
        scenes: {
          scene1: {
            id: 'scene1',
            title: 'Scene 1',
            text: 'First scene',
            choices: [{ id: 'go_to_2', text: 'Go to 2', nextScene: 'scene2' }]
          },
          scene2: {
            id: 'scene2',
            title: 'Scene 2',
            text: 'Second scene',
            choices: [{ id: 'go_to_1', text: 'Go to 1', nextScene: 'scene1' }]
          }
        }
      }
      
      storyEngine.currentStory = mockStory
      
      // Should handle circular references without infinite loops
      expect(() => storyEngine.getScene('scene1')).not.toThrow()
      expect(() => storyEngine.getScene('scene2')).not.toThrow()
    })
  })

  describe('Performance and Stress Testing', () => {
    test('should handle large story histories efficiently', async () => {
      await storyEngine.loadStory('../stories/intro.js')
      
      const startTime = Date.now()
      
      // Add 1000 story entries
      for (let i = 0; i < 1000; i++) {
        storyEngine.storyHistory.push({
          choiceId: `choice_${i}`,
          timestamp: Date.now(),
          storyState: {}
        })
      }
      
      // Operations should still be fast
      const recentChoices = storyEngine.getRecentChoices(10)
      const timeSinceStart = storyEngine.getTimeSinceStart()
      
      const endTime = Date.now()
      
      expect(endTime - startTime).toBeLessThan(100) // Less than 100ms
      expect(recentChoices.length).toBe(10)
      expect(timeSinceStart).toBeGreaterThan(0)
    })

    test('should handle complex state efficiently', () => {
      const startTime = Date.now()
      
      // Create complex state
      for (let i = 0; i < 100; i++) {
        storyEngine.setFlag(`flag_${i}`, true)
        storyEngine.setVariable(`var_${i}`, i)
        storyEngine.addToInventory(`item_${i}`, i)
        storyEngine.characterRelationships[`char_${i}`] = i
      }
      
      const state = storyEngine.getStoryState()
      const endTime = Date.now()
      
      expect(endTime - startTime).toBeLessThan(200) // Less than 200ms
      expect(Object.keys(state.globalFlags).length).toBeGreaterThan(190) // flags + vars
      expect(Object.keys(state.characterRelationships).length).toBe(100)
    })

    test('should handle concurrent choice processing', async () => {
      await storyEngine.loadStory('../stories/intro.js')
      
      // Add multiple valid choices
      const mockChoices = Array(10).fill().map((_, i) => ({
        id: `concurrent_${i}`,
        nextScene: 'start',
        effects: [{ type: 'set_flag', flag: `concurrent_flag_${i}`, value: true }]
      }))
      
      storyEngine.currentStory.scenes.start.choices.push(...mockChoices)
      
      // Process choices concurrently (though this might not be realistic)
      const promises = mockChoices.map((choice, i) => 
        storyEngine.makeChoice(`concurrent_${i}`)
      )
      
      // At least one should succeed
      const results = await Promise.allSettled(promises)
      const successes = results.filter(r => r.status === 'fulfilled')
      expect(successes.length).toBeGreaterThan(0)
    })
  })
})