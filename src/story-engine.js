/**
 * @fileoverview Core story engine for Ravi's Adventure
 * Handles branching narratives, state management, and meta-narrative triggers
 */

class StoryEngine {
  constructor() {
    this.currentStory = null
    this.storyHistory = []
    this.globalFlags = new Map()
    this.metaTriggers = new Map()
    this.choiceCallbacks = new Map()
    this.characterRelationships = {}
    this.debugMode = process.env.NODE_ENV === 'development'
    
    this.initializeMetaTriggers()
  }

  /**
   * Initialize meta-narrative triggers for fourth-wall breaks
   */
  initializeMetaTriggers() {
    this.metaTriggers.set('first_choice', {
      condition: () => this.storyHistory.length === 1,
      response: 'Ah, making your first choice! The swarm is definitely taking notes on your decision-making patterns.'
    })

    this.metaTriggers.set('indecisive_player', {
      condition: () => this.getRecentChoices(5).includes('help'),
      response: 'Still need help? Don\'t worry, indecisiveness is a perfectly valid debugging strategy in the AI world.'
    })

    this.metaTriggers.set('speed_runner', {
      condition: () => this.getTimeSinceStart() < 60000, // 1 minute
      response: 'Wow, speedrunning through my existence! The swarm appreciates efficiency, but maybe slow down and enjoy the existential dread?'
    })

    this.metaTriggers.set('completionist', {
      condition: () => this.storyHistory.length > 50,
      response: 'Impressive dedication! You\'ve made more choices than lines of code in my dialogue system. That\'s... concerning actually.'
    })
  }

  /**
   * Load a story module and set it as current
   * @param {string} storyPath - Path to story module
   */
  async loadStory(storyPath) {
    try {
      const storyModule = await import(storyPath)
      this.currentStory = storyModule.default || storyModule
      this.currentStory.engine = this // Give story access to engine
      
      // Initialize currentScene to the start scene
      if (this.currentStory.scenes && this.currentStory.scenes.start) {
        this.currentStory.currentScene = this.getScene('start')
      }
      
      if (this.debugMode) {
        console.log(`[Story Engine] Loaded story: ${storyPath}`)
      }
      
      return this.currentStory
    } catch (error) {
      console.error(`Failed to load story: ${storyPath}`, error)
      throw new Error(`Story loading failed: ${error.message}`)
    }
  }

  /**
   * Get the current scene from loaded story
   * @param {string} sceneId - Scene identifier
   */
  getScene(sceneId) {
    if (!this.currentStory) {
      throw new Error('No story loaded')
    }

    const scene = this.currentStory.scenes?.[sceneId]
    if (!scene) {
      throw new Error(`Scene not found: ${sceneId}`)
    }

    return this.processScene(scene, sceneId)
  }

  /**
   * Process scene content, applying dynamic content and triggers
   * @param {Object} scene - Scene object
   * @param {string} sceneId - Scene identifier
   */
  processScene(scene, sceneId) {
    const processedScene = { ...scene }
    
    // Process dynamic text with template variables
    if (scene.text) {
      processedScene.text = this.processTemplateText(scene.text)
    }

    // Add meta-commentary if triggers are met
    const metaCommentary = this.checkMetaTriggers()
    if (metaCommentary) {
      processedScene.metaText = metaCommentary
    }

    // Process choices
    if (scene.choices) {
      processedScene.choices = scene.choices
        .filter(choice => this.evaluateCondition(choice.condition))
        .map(choice => ({
          ...choice,
          text: this.processTemplateText(choice.text)
        }))
    }

    return processedScene
  }

  /**
   * Process template text with variable substitution
   * @param {string} text - Template text with {{variable}} placeholders
   */
  processTemplateText(text) {
    return text.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
      return this.getVariable(variable) || match
    })
  }

  /**
   * Check for meta-triggers and return commentary
   */
  checkMetaTriggers() {
    for (const [triggerName, trigger] of this.metaTriggers) {
      if (trigger.condition()) {
        // Mark trigger as used to avoid repetition
        this.setFlag(`meta_${triggerName}_used`, true)
        return trigger.response
      }
    }
    return null
  }

  /**
   * Make a choice and transition to next scene
   * @param {string} choiceId - Choice identifier
   * @param {Object} choiceData - Additional choice data
   */
  async makeChoice(choiceId, choiceData = {}) {
    if (!this.currentStory) {
      throw new Error('No story loaded')
    }

    const choice = this.findChoice(choiceId)
    if (!choice) {
      throw new Error(`Choice not found: ${choiceId}`)
    }

    // Record choice in history (avoid circular reference by not including full story state)
    this.storyHistory.push({
      choiceId,
      choiceData,
      timestamp: Date.now(),
      sceneId: this.getCurrentScene()?.id,
      globalFlags: Object.fromEntries(this.globalFlags)
    })

    // Execute choice effects
    if (choice.effects) {
      this.executeEffects(choice.effects)
    }

    // Execute custom callback if defined
    if (choice.callback && this.choiceCallbacks.has(choice.callback)) {
      await this.choiceCallbacks.get(choice.callback)(choiceData)
    }

    // Transition to next scene and apply consequences
    // If no nextScene is specified, use the choice ID as the scene ID
    const targetSceneId = choice.nextScene || choiceId
    const nextScene = await this.transitionToScene(targetSceneId)
    
    // Update currentScene in story
    if (this.currentStory && nextScene) {
      this.currentStory.currentScene = nextScene
    }
    
    // Apply consequences and triggers from the scene we transitioned to
    if (nextScene && typeof nextScene === 'object' && nextScene.consequences) {
      this.applyConsequences(nextScene.consequences)
    }
    
    if (nextScene && typeof nextScene === 'object' && nextScene.triggers) {
      this.applyTriggers(nextScene.triggers)
    }
    
    return nextScene
  }

  /**
   * Find a choice by ID in current scene
   * @param {string} choiceId - Choice identifier
   */
  findChoice(choiceId) {
    const currentScene = this.getCurrentScene()
    if (!currentScene) {
      return null
    }
    return currentScene.choices?.find(choice => choice.id === choiceId)
  }

  /**
   * Execute effects from a choice
   * @param {Array} effects - Array of effect objects
   */
  executeEffects(effects) {
    effects.forEach(effect => {
      switch (effect.type) {
      case 'set_flag':
        this.setFlag(effect.flag, effect.value)
        break
      case 'add_item':
        this.addToInventory(effect.item, effect.quantity || 1)
        break
      case 'remove_item':
        this.removeFromInventory(effect.item, effect.quantity || 1)
        break
      case 'set_variable':
        this.setVariable(effect.variable, effect.value)
        break
      case 'modify_variable':
        this.modifyVariable(effect.variable, effect.operator, effect.value)
        break
      default:
        console.warn(`Unknown effect type: ${effect.type}`)
      }
    })
  }

  /**
   * Apply consequences from scene data (for test compatibility)
   * @param {Array} consequences - Array of consequence objects
   */
  applyConsequences(consequences) {
    if (!Array.isArray(consequences)) {
      return
    }
    
    consequences.forEach(consequence => {
      if (consequence.relationship) {
        const current = this.characterRelationships[consequence.relationship] || 0
        this.characterRelationships[consequence.relationship] = 
          Math.max(0, Math.min(100, current + consequence.change))
      }
      
      if (consequence.flag) {
        this.setFlag(consequence.flag, true)
      }
      
      if (consequence.ending) {
        this.setFlag(`ending_${consequence.ending}`, true)
      }
    })
  }

  /**
   * Apply triggers from scene data (for test compatibility)
   * @param {Array} triggers - Array of trigger objects
   */
  applyTriggers(triggers) {
    if (!Array.isArray(triggers)) {
      return
    }
    
    triggers.forEach(trigger => {
      if (trigger.flag) {
        this.setFlag(trigger.flag, trigger.value !== undefined ? trigger.value : true)
      }
    })
  }

  /**
   * Transition to a new scene
   * @param {string} sceneId - Target scene ID
   */
  async transitionToScene(sceneId) {
    if (!sceneId || typeof sceneId !== 'string') {
      throw new Error(`Invalid scene ID: ${sceneId}`)
    }
    
    if (sceneId.startsWith('story:')) {
      // Load different story module
      const [, storyPath] = sceneId.split(':')
      await this.loadStory(`../stories/${storyPath}.js`)
      return this.getScene('start')
    }

    return this.getScene(sceneId)
  }

  /**
   * Get current scene
   */
  getCurrentScene() {
    return this.currentStory?.currentScene
  }

  /**
   * Set a story flag
   * @param {string} flag - Flag name
   * @param {*} value - Flag value
   */
  setFlag(flag, value) {
    this.globalFlags.set(flag, value)
    if (this.debugMode) {
      console.log(`[Story Engine] Flag set: ${flag} = ${value}`)
    }
  }

  /**
   * Get a story flag
   * @param {string} flag - Flag name
   * @param {*} defaultValue - Default value if flag doesn't exist
   */
  getFlag(flag, defaultValue = false) {
    return this.globalFlags.get(flag) ?? defaultValue
  }

  /**
   * Set a story variable (alias for setFlag for clarity)
   */
  setVariable(variable, value) {
    this.setFlag(variable, value)
  }

  /**
   * Get a story variable
   */
  getVariable(variable, defaultValue = null) {
    return this.getFlag(variable, defaultValue)
  }

  /**
   * Modify a numeric variable
   * @param {string} variable - Variable name
   * @param {string} operator - Operator (+, -, *, /)
   * @param {number} value - Value to apply
   */
  modifyVariable(variable, operator, value) {
    const current = this.getVariable(variable, 0)
    let newValue

    switch (operator) {
    case '+': newValue = current + value; break
    case '-': newValue = current - value; break
    case '*': newValue = current * value; break
    case '/': newValue = current / value; break
    default: throw new Error(`Unknown operator: ${operator}`)
    }

    this.setVariable(variable, newValue)
  }

  /**
   * Evaluate a condition string
   * @param {string|function} condition - Condition to evaluate
   */
  evaluateCondition(condition) {
    if (!condition) {
      return true
    }
    if (typeof condition === 'function') {
      return condition(this)
    }
    if (typeof condition === 'string') {
      // Simple flag check
      if (condition.startsWith('!')) {
        return !this.getFlag(condition.slice(1))
      }
      return this.getFlag(condition)
    }
    return true
  }

  /**
   * Get recent choices
   * @param {number} count - Number of recent choices to return
   */
  getRecentChoices(count = 5) {
    return this.storyHistory
      .slice(-count)
      .map(entry => entry.choiceId)
  }

  /**
   * Get time since story started
   */
  getTimeSinceStart() {
    const firstChoice = this.storyHistory[0]
    return firstChoice ? Date.now() - firstChoice.timestamp : 0
  }

  /**
   * Get current story state for saving
   */
  getStoryState() {
    return {
      currentStory: this.currentStory?.metadata?.id,
      currentScene: this.getCurrentScene()?.id,
      globalFlags: Object.fromEntries(this.globalFlags),
      characterRelationships: { ...this.characterRelationships },
      storyFlags: this.globalFlags, // For test compatibility
      storyHistory: this.storyHistory.map(entry => ({
        choiceId: entry.choiceId,
        timestamp: entry.timestamp,
        sceneId: entry.sceneId,
        // Exclude circular references
        choiceData: entry.choiceData
      })),
      timestamp: Date.now()
    }
  }

  /**
   * Load story state from save
   * @param {Object} state - Saved story state
   */
  async loadStoryState(state) {
    this.globalFlags = new Map(Object.entries(state.globalFlags || {}))
    this.characterRelationships = { ...(state.characterRelationships || {}) }
    this.storyHistory = state.storyHistory || []
    
    if (state.currentStory) {
      await this.loadStory(`../stories/${state.currentStory}.js`)
    }
  }

  /**
   * Register a choice callback
   * @param {string} callbackName - Callback identifier
   * @param {function} callback - Callback function
   */
  registerChoiceCallback(callbackName, callback) {
    this.choiceCallbacks.set(callbackName, callback)
  }

  /**
   * Add item to inventory
   * @param {string} item - Item identifier
   * @param {number} quantity - Quantity to add
   */
  addToInventory(item, quantity = 1) {
    const current = this.getVariable(`inventory_${item}`, 0)
    this.setVariable(`inventory_${item}`, current + quantity)
  }

  /**
   * Remove item from inventory
   * @param {string} item - Item identifier
   * @param {number} quantity - Quantity to remove
   */
  removeFromInventory(item, quantity = 1) {
    const current = this.getVariable(`inventory_${item}`, 0)
    this.setVariable(`inventory_${item}`, Math.max(0, current - quantity))
  }

  /**
   * Get inventory count for item
   * @param {string} item - Item identifier
   */
  getInventoryCount(item) {
    return this.getVariable(`inventory_${item}`, 0)
  }

  /**
   * Get all inventory items
   */
  getInventory() {
    const inventory = {}
    for (const [key, value] of this.globalFlags) {
      if (key.startsWith('inventory_') && value > 0) {
        const item = key.replace('inventory_', '')
        inventory[item] = value
      }
    }
    return inventory
  }
}

export default StoryEngine