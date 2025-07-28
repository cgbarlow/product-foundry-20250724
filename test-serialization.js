// Quick test to verify JSON serialization works
import StoryEngine from './src/story-engine.js'

const engine = new StoryEngine()

// Simulate making a choice to populate storyHistory
engine.storyHistory.push({
  choiceId: 'test_choice',
  choiceData: { test: 'data' },
  timestamp: Date.now(),
  sceneId: 'test_scene',
  globalFlags: {}
})

try {
  const state = engine.getStoryState()
  const serialized = JSON.stringify(state)
  console.log('✅ JSON serialization successful!')
  console.log('Serialized length:', serialized.length)
  
  const parsed = JSON.parse(serialized)
  console.log('✅ JSON parsing successful!')
  console.log('Story history entries:', parsed.storyHistory.length)
  
} catch (error) {
  console.error('❌ JSON serialization failed:', error.message)
}