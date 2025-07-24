/**
 * @fileoverview Unified Narrative Controller for Ravi's Adventure
 * Integrates DialogueSystem, StoryEngine, Character Management, and Story Progression
 * Provides centralized API for all narrative interactions and cross-system event handling
 */

import DialogueSystem from './dialogue-system.js'
import StoryEngine from './story-engine.js'

/**
 * Central controller for all narrative systems in Ravi's Adventure
 * Coordinates between DialogueSystem, StoryEngine, Character (Ravi), and StoryManager
 */
class NarrativeController {
  constructor(gameEngine) {
    this.gameEngine = gameEngine
    this.gameState = gameEngine.gameState
    
    // Initialize core systems
    this.storyEngine = new StoryEngine()
    this.dialogueSystem = new DialogueSystem(this.storyEngine, this.gameState)
    
    // Character and story manager will be injected from gameEngine
    this.characterManager = null // Will be set to gameEngine.ravi
    this.storyManager = null     // Will be set to gameEngine.storyManager
    
    // Event system for cross-system communication
    this.eventListeners = new Map()
    this.eventQueue = []
    
    // Narrative state tracking
    this.narrativeFlags = new Map()
    this.activeConversation = null
    this.currentNarrativeContext = {}
    
    // Integration hooks
    this.initializeEventSystem()
    this.setupCrossSystemIntegration()
  }

  /**
   * Initialize the narrative controller with external systems
   * @param {Object} ravi - Ravi character instance 
   * @param {Object} storyManager - Story manager instance
   */
  initialize(ravi, storyManager) {
    this.characterManager = ravi
    this.storyManager = storyManager
    
    // Setup bidirectional communication
    this.setupCharacterIntegration()
    this.setupStoryProgressionIntegration()
    
    this.emit('narrative-controller-initialized', {
      systems: ['DialogueSystem', 'StoryEngine', 'CharacterManager', 'StoryManager']
    })
  }

  /**
   * Initialize the event system for cross-system communication
   */
  initializeEventSystem() {
    // Core narrative events
    this.addEventListener('dialogue-triggered', this.handleDialogueEvent.bind(this))
    this.addEventListener('story-choice-made', this.handleStoryChoiceEvent.bind(this))
    this.addEventListener('character-relationship-changed', this.handleRelationshipEvent.bind(this))
    this.addEventListener('story-progress-updated', this.handleStoryProgressEvent.bind(this))
    this.addEventListener('narrative-context-changed', this.handleContextChangeEvent.bind(this))
  }

  /**
   * Setup cross-system integration patterns
   */
  setupCrossSystemIntegration() {
    // Story engine integration with dialogue system
    this.storyEngine.registerChoiceCallback('dialogue_response', async (choiceData) => {
      return this.generateContextualDialogue(choiceData)
    })
    
    // Dialogue system personality updates affect story progression
    this.storyEngine.registerChoiceCallback('personality_update', async (choiceData) => {
      return this.updatePersonalityFromStory(choiceData)
    })
  }

  /**
   * Setup character integration with narrative systems
   */
  setupCharacterIntegration() {
    if (!this.characterManager) return
    
    // Enhance Ravi's responses with story context
    const originalHandleConversation = this.characterManager.handleConversation.bind(this.characterManager)
    this.characterManager.handleConversation = (message) => {
      // Get enhanced response with story context
      const enhancedResponse = this.generateStoryAwareResponse(message)
      if (enhancedResponse) {
        return enhancedResponse
      }
      return originalHandleConversation(message)
    }
    
    // Track relationship changes for story impact
    const originalAdjustRelationship = this.characterManager.adjustRelationship.bind(this.characterManager)
    this.characterManager.adjustRelationship = (amount) => {
      const oldLevel = this.characterManager.personality.relationshipLevel
      originalAdjustRelationship(amount)
      const newLevel = this.characterManager.personality.relationshipLevel
      
      this.emit('character-relationship-changed', {
        oldLevel,
        newLevel,
        change: amount,
        character: 'ravi'
      })
    }
  }

  /**
   * Setup story progression integration
   */
  setupStoryProgressionIntegration() {
    if (!this.storyManager) return
    
    // Enhanced story progression with narrative context
    const originalUpdateProgress = this.storyManager.updateProgress.bind(this.storyManager)
    this.storyManager.updateProgress = () => {
      const progressMade = originalUpdateProgress()
      
      if (progressMade) {
        this.emit('story-progress-updated', {
          currentStory: this.storyManager.currentStory,
          objectives: this.storyManager.getCurrentObjectives(),
          timestamp: Date.now()
        })
      }
      
      return progressMade
    }
  }

  /**
   * Generate dialogue response with full narrative context
   * @param {string} trigger - Dialogue trigger
   * @param {Object} context - Additional context information
   * @returns {Object} Enhanced dialogue response
   */
  generateDialogue(trigger, context = {}) {
    // Enrich context with narrative state
    const enrichedContext = {
      ...context,
      storyProgress: this.getStoryProgress(),
      characterRelationships: this.getCharacterRelationships(),
      narrativeFlags: Object.fromEntries(this.narrativeFlags),
      currentStoryContext: this.getCurrentStoryContext()
    }
    
    // Generate base dialogue response
    const dialogueResponse = this.dialogueSystem.generateResponse(trigger, enrichedContext)
    
    // Enhance with story-specific elements
    const storyEnhancement = this.getStorySpecificDialogue(trigger, enrichedContext)
    if (storyEnhancement) {
      dialogueResponse.text += ` ${storyEnhancement}`
      dialogueResponse.storyEnhanced = true
    }
    
    // Add meta-narrative elements if appropriate
    const metaElements = this.generateMetaNarrativeElements(trigger, enrichedContext)
    if (metaElements) {
      dialogueResponse.metaElements = metaElements
    }
    
    this.emit('dialogue-generated', {
      trigger,
      response: dialogueResponse,
      context: enrichedContext
    })
    
    return dialogueResponse
  }

  /**
   * Process story choice with full narrative integration
   * @param {string} choiceId - Choice identifier
   * @param {Object} choiceData - Choice data and context
   * @returns {Object} Choice result with narrative consequences
   */
  async processStoryChoice(choiceId, choiceData = {}) {
    // Pre-choice narrative context
    const preChoiceContext = this.getCurrentNarrativeContext()
    
    // Make the choice through story engine
    const storyResult = await this.storyEngine.makeChoice(choiceId, choiceData)
    
    // Generate dialogue response to choice
    const dialogueResponse = this.generateDialogue('story_choice_made', {
      choiceId,
      choiceData,
      storyResult,
      preChoiceContext
    })
    
    // Update narrative context
    this.updateNarrativeContext({
      lastChoice: { choiceId, choiceData, timestamp: Date.now() },
      storyResult,
      dialogueResponse
    })
    
    // Emit integrated event
    this.emit('story-choice-made', {
      choiceId,
      choiceData,
      storyResult,
      dialogueResponse,
      narrativeContext: this.getCurrentNarrativeContext()
    })
    
    // Update story progression
    if (this.storyManager) {
      this.storyManager.updateProgress()
    }
    
    return {
      storyResult,
      dialogueResponse,
      narrativeContext: this.getCurrentNarrativeContext()
    }
  }

  /**
   * Handle game events with full narrative response
   * @param {string} eventType - Type of game event
   * @param {Object} eventData - Event-specific data
   * @returns {Object} Comprehensive narrative response
   */
  handleGameEvent(eventType, eventData = {}) {
    const responses = []
    
    // Get dialogue system response
    const dialogueResponse = this.dialogueSystem.respondToGameEvent(eventType, eventData)
    if (dialogueResponse) {
      responses.push({
        type: 'dialogue',
        source: 'DialogueSystem',
        response: dialogueResponse
      })
    }
    
    // Get character-specific response if available
    if (this.characterManager && this.characterManager.respondToGameEvent) {
      const characterResponse = this.characterManager.respondToGameEvent(eventType, eventData)
      if (characterResponse) {
        responses.push({
          type: 'character',
          source: 'CharacterManager',
          response: characterResponse
        })
      }
    }
    
    // Check for story-specific reactions
    const storyReaction = this.getStoryReactionToEvent(eventType, eventData)
    if (storyReaction) {
      responses.push({
        type: 'story',
        source: 'StoryEngine',
        response: storyReaction
      })
    }
    
    // Emit comprehensive event
    this.emit('game-event-processed', {
      eventType,
      eventData,
      responses,
      timestamp: Date.now()
    })
    
    return {
      eventType,
      responses,
      primary: responses[0] || null
    }
  }

  /**
   * Start an interactive conversation with narrative context
   * @param {Object} conversationOptions - Conversation configuration
   */
  startConversation(conversationOptions = {}) {
    const context = {
      ...conversationOptions,
      storyContext: this.getCurrentStoryContext(),
      characterState: this.getCharacterState(),
      narrativeHistory: this.getNarrativeHistory()
    }
    
    this.activeConversation = {
      startTime: Date.now(),
      context,
      messages: []
    }
    
    // Generate context-aware conversation starter
    const starter = this.generateContextualConversationStarter(context)
    
    this.emit('conversation-started', {
      context,
      starter
    })
    
    return starter
  }

  /**
   * Process conversation message with full narrative integration
   * @param {string} message - User message
   * @returns {Object} Integrated conversation response
   */
  processConversationMessage(message) {
    if (!this.activeConversation) {
      this.startConversation()
    }
    
    // Record message
    this.activeConversation.messages.push({
      type: 'user',
      message,
      timestamp: Date.now()
    })
    
    // Generate integrated response
    const dialogueResponse = this.generateDialogue('conversation', {
      message,
      conversationHistory: this.activeConversation.messages,
      storyContext: this.getCurrentStoryContext()
    })
    
    // Get character response if different system
    let characterResponse = null
    if (this.characterManager && this.characterManager.handleConversation) {
      characterResponse = this.characterManager.handleConversation(message)
    }
    
    // Combine responses intelligently
    const integratedResponse = this.integrateConversationResponses(
      dialogueResponse,
      characterResponse,
      message
    )
    
    // Record response
    this.activeConversation.messages.push({
      type: 'system',
      response: integratedResponse,
      timestamp: Date.now()
    })
    
    this.emit('conversation-message-processed', {
      message,
      response: integratedResponse,
      conversationState: this.activeConversation
    })
    
    return integratedResponse
  }

  /**
   * Get current story progress information
   * @returns {Object} Story progress data
   */
  getStoryProgress() {
    if (!this.storyManager) return {}
    
    return {
      currentStory: this.storyManager.currentStory,
      objectives: this.storyManager.getCurrentObjectives(),
      availableStories: this.storyManager.getAvailableStories(),
      storyState: this.storyManager.getStoryState(),
      storyEngineState: this.storyEngine.getStoryState()
    }
  }

  /**
   * Get character relationship information
   * @returns {Object} Character relationship data
   */
  getCharacterRelationships() {
    const relationships = {}
    
    if (this.characterManager) {
      relationships.ravi = {
        level: this.characterManager.personality.relationshipLevel,
        mood: this.characterManager.personality.mood,
        traits: this.characterManager.personality.traits,
        memory: Object.fromEntries(this.characterManager.personality.memory || new Map())
      }
    }
    
    // Include story engine character relationships
    if (this.storyEngine.characterRelationships) {
      Object.assign(relationships, this.storyEngine.characterRelationships)
    }
    
    return relationships
  }

  /**
   * Get current story context for narrative decisions
   * @returns {Object} Current story context
   */
  getCurrentStoryContext() {
    return {
      currentScene: this.storyEngine.getCurrentScene(),
      storyFlags: Object.fromEntries(this.storyEngine.globalFlags || new Map()),
      storyHistory: this.storyEngine.storyHistory || [],
      inventory: this.storyEngine.getInventory ? this.storyEngine.getInventory() : {},
      narrativeFlags: Object.fromEntries(this.narrativeFlags)
    }
  }

  /**
   * Get comprehensive character state
   * @returns {Object} Character state information
   */
  getCharacterState() {
    if (!this.characterManager) return {}
    
    return {
      personality: this.characterManager.personality,
      stats: this.characterManager.getStats ? this.characterManager.getStats() : {},
      dialogueState: this.dialogueSystem.getPersonalityState()
    }
  }

  /**
   * Get narrative history for context
   * @returns {Array} Narrative history events
   */
  getNarrativeHistory() {
    return [
      ...(this.dialogueSystem.getConversationHistory ? this.dialogueSystem.getConversationHistory(20) : []),
      ...(this.storyEngine.storyHistory || []).slice(-10),
      ...this.eventQueue.slice(-10)
    ].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
  }

  /**
   * Update narrative context
   * @param {Object} contextUpdate - Context updates to apply
   */
  updateNarrativeContext(contextUpdate) {
    this.currentNarrativeContext = {
      ...this.currentNarrativeContext,
      ...contextUpdate,
      lastUpdated: Date.now()
    }
    
    this.emit('narrative-context-changed', {
      update: contextUpdate,
      fullContext: this.currentNarrativeContext
    })
  }

  /**
   * Get current comprehensive narrative context
   * @returns {Object} Complete narrative context
   */
  getCurrentNarrativeContext() {
    return {
      ...this.currentNarrativeContext,
      story: this.getCurrentStoryContext(),
      character: this.getCharacterState(),
      dialogue: {
        mood: this.dialogueSystem.currentMood,
        history: this.dialogueSystem.getConversationHistory ? this.dialogueSystem.getConversationHistory(5) : []
      },
      timestamp: Date.now()
    }
  }

  // Event system methods
  addEventListener(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event).push(callback)
  }

  removeEventListener(event, callback) {
    if (this.eventListeners.has(event)) {
      const callbacks = this.eventListeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    // Queue event for history
    this.eventQueue.push({
      event,
      data,
      timestamp: Date.now()
    })
    
    // Keep queue manageable
    if (this.eventQueue.length > 100) {
      this.eventQueue.shift()
    }
    
    // Execute listeners
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error)
        }
      })
    }
  }

  // Helper methods for narrative enhancement
  generateStoryAwareResponse(message) {
    const storyContext = this.getCurrentStoryContext()
    const objectives = this.storyManager ? this.storyManager.getCurrentObjectives() : []
    
    // Check if message relates to current objectives
    const relevantObjective = objectives.find(obj => 
      message.toLowerCase().includes(obj.name.toLowerCase()) ||
      message.toLowerCase().includes(obj.objective.toLowerCase())
    )
    
    if (relevantObjective) {
      return this.generateObjectiveRelatedResponse(message, relevantObjective)
    }
    
    return null
  }

  generateObjectiveRelatedResponse(message, objective) {
    const responses = [
      `Ah, speaking of "${objective.name}"! That's actually one of our current objectives: ${objective.objective}`,
      `Interesting that you mention that - it relates to what we're working on: ${objective.objective}`,
      `You're thinking about "${objective.name}"? Perfect timing! That's exactly what we need to focus on.`
    ]
    
    const response = responses[Math.floor(Math.random() * responses.length)]
    
    if (this.characterManager) {
      console.log(`\nRavi: "${response}"`)
      this.characterManager.personality.responseCount++
      this.characterManager.adjustRelationship(2)
    }
    
    return {
      text: response,
      objectiveRelated: true,
      objective
    }
  }

  getStorySpecificDialogue(trigger, context) {
    if (!this.storyManager) return null
    
    const currentStory = this.storyManager.currentStory
    const storySpecificResponses = {
      'tutorial': {
        'help_request': 'Since we\'re just getting started, don\'t worry about making mistakes. This tutorial is all about learning!',
        'good_choice': 'You\'re getting the hang of this tutorial really well!'
      },
      'bug-hunt': {
        'confusion': 'Confusion is normal when hunting bugs - they\'re sneaky little things!',
        'help_request': 'Bug hunting requires patience. Let\'s methodically work through this.'
      }
    }
    
    return storySpecificResponses[currentStory]?.[trigger] || null
  }

  generateMetaNarrativeElements(trigger, context) {
    // Add meta-narrative elements based on narrative controller state
    const elements = []
    
    // Integration awareness
    if (Math.random() < 0.1) {
      elements.push('(The narrative systems are working together seamlessly)')
    }
    
    // Context awareness
    if (context.storyProgress && Math.random() < 0.15) {
      elements.push(`(Currently tracking ${context.storyProgress.objectives?.length || 0} objectives)`)
    }
    
    return elements.length > 0 ? elements : null
  }

  getStoryReactionToEvent(eventType, eventData) {
    // Generate story-specific reactions to game events
    const currentScene = this.storyEngine.getCurrentScene()
    if (!currentScene) return null
    
    const reactions = {
      'achievement_unlocked': () => `The story world acknowledges your achievement: "${eventData.achievementName}"`,
      'inventory_full': () => 'The narrative weight of your possessions is becoming quite heavy...',
      'save_game': () => 'Your story progress has been preserved in the digital archives.'
    }
    
    const reactionGenerator = reactions[eventType]
    return reactionGenerator ? { text: reactionGenerator() } : null
  }

  generateContextualConversationStarter(context) {
    const starters = [
      'Given everything that\'s happening in our story, what\'s on your mind?',
      'With all the narrative threads we\'re following, I\'m curious about your thoughts.',
      'Considering our current objectives and story progress, what would you like to discuss?'
    ]
    
    return {
      text: starters[Math.floor(Math.random() * starters.length)],
      contextual: true,
      context
    }
  }

  integrateConversationResponses(dialogueResponse, characterResponse, message) {
    // Intelligently combine responses from different systems
    if (!characterResponse) return dialogueResponse
    
    // Prefer character response for personal interactions
    if (message.toLowerCase().includes('you') || message.toLowerCase().includes('your')) {
      return characterResponse
    }
    
    // Prefer dialogue response for story-related topics
    if (dialogueResponse.storyEnhanced) {
      return dialogueResponse
    }
    
    // Default to character response
    return characterResponse
  }

  // Event handlers
  handleDialogueEvent(data) {
    this.updateNarrativeContext({
      lastDialogue: data,
      dialogueCount: (this.currentNarrativeContext.dialogueCount || 0) + 1
    })
  }

  handleStoryChoiceEvent(data) {
    this.updateNarrativeContext({
      lastChoice: data,
      choiceCount: (this.currentNarrativeContext.choiceCount || 0) + 1
    })
  }

  handleRelationshipEvent(data) {
    // Potentially trigger story events based on relationship changes
    if (data.newLevel >= 50 && data.oldLevel < 50) {
      this.storyEngine.setFlag('ravi_friendship_achieved', true)
    }
    if (data.newLevel >= 75 && data.oldLevel < 75) {
      this.storyEngine.setFlag('ravi_close_bond', true)
    }
  }

  handleStoryProgressEvent(data) {
    // Update dialogue system with story progress
    this.dialogueSystem.metaKnowledge.set('current_progress', {
      responses: [
        `We're making great progress on "${data.currentStory}"!`,
        `${data.objectives.length} objectives remaining in our current story.`,
        'The story is evolving based on our choices and interactions.'
      ]
    })
  }

  handleContextChangeEvent(data) {
    // React to narrative context changes
    console.log(`[NarrativeController] Context updated: ${Object.keys(data.update).join(', ')}`)
  }

  // Save/Load support
  getNarrativeState() {
    return {
      narrativeFlags: Object.fromEntries(this.narrativeFlags),
      currentNarrativeContext: this.currentNarrativeContext,
      activeConversation: this.activeConversation,
      eventHistory: this.eventQueue.slice(-20), // Keep recent events
      dialogueState: this.dialogueSystem.getPersonalityState ? this.dialogueSystem.getPersonalityState() : {},
      storyEngineState: this.storyEngine.getStoryState()
    }
  }

  async loadNarrativeState(state) {
    if (!state) return
    
    this.narrativeFlags = new Map(Object.entries(state.narrativeFlags || {}))
    this.currentNarrativeContext = state.currentNarrativeContext || {}
    this.activeConversation = state.activeConversation || null
    this.eventQueue = state.eventHistory || []
    
    // Restore dialogue system state
    if (state.dialogueState && this.dialogueSystem.resetPersonality) {
      this.dialogueSystem.resetPersonality()
      if (state.dialogueState.traits) {
        Object.assign(this.dialogueSystem.personalityTraits, state.dialogueState.traits)
      }
      if (state.dialogueState.mood) {
        this.dialogueSystem.currentMood = state.dialogueState.mood
      }
    }
    
    // Restore story engine state
    if (state.storyEngineState) {
      await this.storyEngine.loadStoryState(state.storyEngineState)
    }
    
    this.emit('narrative-state-loaded', { state })
  }
}

export default NarrativeController