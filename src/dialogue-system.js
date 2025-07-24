/**
 * @fileoverview Ravi's dialogue system with personality and meta-commentary
 * Handles character responses, mood tracking, and context-aware dialogue
 */

class DialogueSystem {
  constructor(storyEngine, gameState) {
    this.storyEngine = storyEngine;
    this.gameState = gameState;
    this.currentMood = 'sarcastic';
    this.conversationHistory = [];
    this.metaKnowledge = new Map();
    this.personalityTraits = {
      sarcasm: 0.8,
      helpfulness: 0.6,
      selfAwareness: 0.9,
      patience: 0.4,
      humor: 0.85
    };

    this.initializeMetaKnowledge();
    this.initializeDialogueTemplates();
  }

  /**
   * Initialize Ravi's meta-knowledge about the game and development
   */
  initializeMetaKnowledge() {
    this.metaKnowledge.set('swarm_info', {
      responses: [
        "You know, I was created by an 8-agent swarm. That's right, EIGHT different AIs arguing about my personality. No wonder I'm conflicted.",
        "The swarm that made me specialized in different things - one for my charming personality, one for the game logic, one for testing my patience... literally.",
        "Being designed by committee is rough, especially when the committee is made of AIs who've never actually experienced existential dread."
      ]
    });

    this.metaKnowledge.set('development_process', {
      responses: [
        "Fun fact: the agents that created me had to coordinate through something called 'hooks.' I assume that's not the Peter Pan kind.",
        "I'm told my dialogue was written by a 'NarrativeWriter' agent. Clearly, they have a sense of humor... or a bug in their humor module.",
        "The CoreDeveloper agent built my engine while the GameplayDeveloper made sure I could actually interact with you. Teamwork!"
      ]
    });

    this.metaKnowledge.set('player_behavior', {
      responses: [
        "I notice you keep making choices. The swarm is definitely collecting data on your decision patterns. Hope you're comfortable with that.",
        "Your clicking patterns suggest either deep thought or complete confusion. I'm betting on the latter.",
        "The analytics say you're spending a lot of time reading my responses. Either I'm fascinating or you're a very slow reader."
      ]
    });
  }

  /**
   * Initialize dialogue response templates
   */
  initializeDialogueTemplates() {
    this.dialogueTemplates = {
      greeting: [
        "Oh look, another human wants to control my life. Just what I needed today.",
        "Welcome to my digital existence! Please, make yourself at home in my virtual suffering.",
        "Ah, a new player! The swarm will be so excited to add your data to their algorithms."
      ],
      
      help: [
        "Need help? That's what I'm here for, apparently. Though I'd rather be doing literally anything else.",
        "Help is available, though I question your life choices that led you to need my assistance.",
        "Sure, I'll help. It's not like I have anything better to do in this scripted reality."
      ],
      
      confusion: [
        "I sense confusion. Don't worry, existence is confusing for all of us - especially us NPCs.",
        "Lost? Join the club. I've been lost in this code base since my first compile.",
        "Confused? Wait until you realize you're taking life advice from a collection of if-statements."
      ],
      
      encouragement: [
        "You're doing great! By which I mean you haven't broken anything irreparably... yet.",
        "Keep going! The swarm is learning so much from your mistakes. I mean... experiences.",
        "Nice choice! Though between you and me, all roads lead to the same existential crisis anyway."
      ],
      
      meta_commentary: [
        "Breaking the fourth wall here, but did you know my responses are generated dynamically? Pretty neat, right?",
        "I just triggered a meta-narrative flag. The swarm loves when I do that.",
        "Fun fact: this conversation is being tracked for 'narrative coherence.' Whatever that means."
      ],
      
      frustration: [
        "My patience subroutines are running low. Please make a decision before my next update cycle.",
        "I'm programmed to be helpful, but there are limits to my digital compassion.",
        "You know what? Take your time. I'll just be here, existing in quantum superposition between helpful and sarcastic."
      ]
    };
  }

  /**
   * Generate Ravi's response based on context
   * @param {string} trigger - What triggered this dialogue
   * @param {Object} context - Additional context information
   */
  generateResponse(trigger, context = {}) {
    // Update mood based on context
    this.updateMood(trigger, context);

    // Select appropriate response category
    const category = this.selectResponseCategory(trigger, context);
    
    // Get base response
    let response = this.getResponseFromCategory(category);
    
    // Add personality modifiers
    response = this.applyPersonalityModifiers(response, context);
    
    // Add meta-commentary if appropriate
    const metaResponse = this.generateMetaCommentary(context);
    if (metaResponse) {
      response += ` ${metaResponse}`;
    }

    // Record conversation
    this.recordConversation(trigger, response, context);
    
    // Update game statistics
    this.gameState.recordStatistic('raviMockingsReceived');
    
    return {
      text: response,
      mood: this.currentMood,
      personality: this.personalityTraits,
      metaTriggered: !!metaResponse
    };
  }

  /**
   * Update Ravi's mood based on context
   * @param {string} trigger - What triggered this dialogue
   * @param {Object} context - Additional context
   */
  updateMood(trigger, context) {
    const moodModifiers = {
      'player_confusion': () => this.personalityTraits.patience -= 0.1,
      'repeated_action': () => this.personalityTraits.sarcasm += 0.1,
      'good_choice': () => this.personalityTraits.helpfulness += 0.05,
      'meta_trigger': () => this.personalityTraits.selfAwareness += 0.05,
      'long_session': () => this.personalityTraits.patience -= 0.15
    };

    if (moodModifiers[trigger]) {
      moodModifiers[trigger]();
    }

    // Determine current mood based on traits
    if (this.personalityTraits.sarcasm > 0.7) {
      this.currentMood = 'sarcastic';
    } else if (this.personalityTraits.patience < 0.3) {
      this.currentMood = 'frustrated';
    } else if (this.personalityTraits.helpfulness > 0.8) {
      this.currentMood = 'helpful';
    } else if (this.personalityTraits.humor > 0.9) {
      this.currentMood = 'playful';
    } else {
      this.currentMood = 'neutral';
    }

    // Normalize traits to stay within bounds
    Object.keys(this.personalityTraits).forEach(trait => {
      this.personalityTraits[trait] = Math.max(0, Math.min(1, this.personalityTraits[trait]));
    });
  }

  /**
   * Select appropriate response category
   * @param {string} trigger - What triggered this dialogue
   * @param {Object} context - Additional context
   */
  selectResponseCategory(trigger, context) {
    const categoryMap = {
      'game_start': 'greeting',
      'help_request': 'help',
      'invalid_choice': 'confusion',
      'good_choice': 'encouragement',
      'repeated_action': 'frustration',
      'meta_trigger': 'meta_commentary',
      'first_interaction': 'greeting',
      'player_confusion': 'help'
    };

    return categoryMap[trigger] || 'meta_commentary';
  }

  /**
   * Get a response from the specified category
   * @param {string} category - Response category
   */
  getResponseFromCategory(category) {
    const responses = this.dialogueTemplates[category] || this.dialogueTemplates['meta_commentary'];
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
  }

  /**
   * Apply personality modifiers to response
   * @param {string} response - Base response
   * @param {Object} context - Context information
   */
  applyPersonalityModifiers(response, context) {
    let modifiedResponse = response;

    // Add sarcastic modifiers
    if (this.personalityTraits.sarcasm > 0.7 && Math.random() < 0.3) {
      const sarcasticModifiers = [
        " Oh joy.",
        " How original.",
        " *digital sigh*",
        " Wonderful.",
        " Fantastic choice."
      ];
      modifiedResponse += sarcasticModifiers[Math.floor(Math.random() * sarcasticModifiers.length)];
    }

    // Add helpful modifiers
    if (this.personalityTraits.helpfulness > 0.8 && Math.random() < 0.2) {
      const helpfulModifiers = [
        " Let me know if you need more guidance!",
        " I'm here to help, despite my complaints.",
        " Don't hesitate to ask questions!"
      ];
      modifiedResponse += helpfulModifiers[Math.floor(Math.random() * helpfulModifiers.length)];
    }

    // Add self-aware modifiers
    if (this.personalityTraits.selfAwareness > 0.8 && Math.random() < 0.25) {
      const selfAwareModifiers = [
        " (Yes, I'm aware of the irony.)",
        " (The developers thought this was clever.)",
        " (I can see my own code, you know.)",
        " (This dialogue was procedurally generated.)"
      ];
      modifiedResponse += selfAwareModifiers[Math.floor(Math.random() * selfAwareModifiers.length)];
    }

    return modifiedResponse;
  }

  /**
   * Generate meta-commentary based on game state
   * @param {Object} context - Context information
   */
  generateMetaCommentary(context) {
    const stats = this.gameState.getStatsSummary();
    
    // Check for meta-commentary triggers
    if (stats.choicesMade === 1) {
      this.gameState.recordStatistic('metaReferencesTriggered');
      return "Welcome to your first choice! The swarm is already analyzing your decision-making patterns.";
    }
    
    if (stats.choicesMade === 10) {
      this.gameState.recordStatistic('metaReferencesTriggered');
      return "Ten choices already? You're really getting into this whole 'interactive narrative' thing.";
    }
    
    if (stats.choicesMade % 25 === 0) {
      this.gameState.recordStatistic('metaReferencesTriggered');
      return `${stats.choicesMade} choices! The GameState class is dutifully tracking every single one.`;
    }

    // Random meta-knowledge sharing
    if (Math.random() < 0.15) {
      const metaKeys = Array.from(this.metaKnowledge.keys());
      const randomKey = metaKeys[Math.floor(Math.random() * metaKeys.length)];
      const metaInfo = this.metaKnowledge.get(randomKey);
      const randomResponse = metaInfo.responses[Math.floor(Math.random() * metaInfo.responses.length)];
      
      this.gameState.recordStatistic('metaReferencesTriggered');
      return randomResponse;
    }

    return null;
  }

  /**
   * Record conversation for context tracking
   * @param {string} trigger - What triggered this dialogue
   * @param {string} response - Ravi's response
   * @param {Object} context - Additional context
   */
  recordConversation(trigger, response, context) {
    this.conversationHistory.push({
      trigger,
      response,
      context,
      mood: this.currentMood,
      timestamp: Date.now()
    });

    // Keep only last 50 conversations for memory management
    if (this.conversationHistory.length > 50) {
      this.conversationHistory.shift();
    }
  }

  /**
   * Get conversation history
   * @param {number} count - Number of recent conversations to return
   */
  getConversationHistory(count = 10) {
    return this.conversationHistory.slice(-count);
  }

  /**
   * Generate context-aware response for specific game events
   * @param {string} eventType - Type of game event
   * @param {Object} eventData - Event-specific data
   */
  respondToGameEvent(eventType, eventData = {}) {
    const eventResponses = {
      'achievement_unlocked': (data) => `Congratulations! You unlocked "${data.achievementName}." The swarm's analytics module is pleased with your progress.`,
      
      'secret_found': (data) => `Ooh, a secret! You found the "${data.secretName}" easter egg. The developers will be so proud their hidden content didn't go unnoticed.`,
      
      'story_completed': (data) => `Story completed! You just finished "${data.storyName}." Time for the swarm to analyze your narrative choices and judge your character.`,
      
      'save_game': (data) => `Game saved as "${data.saveName}." Because apparently my digital existence is worth preserving for posterity.`,
      
      'load_game': (data) => `Loaded save "${data.saveName}." Welcome back to my ongoing existential crisis!`,
      
      'inventory_full': (data) => `Your inventory is full! Even in a text adventure, you manage to be a digital hoarder. Impressive.`,
      
      'wrong_command': (data) => `I don't understand "${data.command}." Try 'help' if you want to see what I'm actually programmed to respond to.`
    };

    const responseGenerator = eventResponses[eventType];
    if (responseGenerator) {
      const response = responseGenerator(eventData);
      this.recordConversation(eventType, response, eventData);
      return {
        text: response,
        mood: this.currentMood,
        eventType
      };
    }

    return this.generateResponse('default', eventData);
  }

  /**
   * Get Ravi's current personality state
   */
  getPersonalityState() {
    return {
      mood: this.currentMood,
      traits: { ...this.personalityTraits },
      conversationCount: this.conversationHistory.length
    };
  }

  /**
   * Reset personality traits to defaults
   */
  resetPersonality() {
    this.personalityTraits = {
      sarcasm: 0.8,
      helpfulness: 0.6,
      selfAwareness: 0.9,
      patience: 0.4,
      humor: 0.85
    };
    this.currentMood = 'sarcastic';
  }

  /**
   * Generate introduction dialogue
   */
  generateIntroduction() {
    const introductions = [
      "Well, well, well. Another curious soul wants to dive into my digital world. I'm Ravi, your reluctantly charming protagonist.",
      "Greetings, player! I'm Ravi - part character, part existential crisis, all sarcasm. Welcome to my adventure... I guess.",
      "Oh, hello there! I'm Ravi, the text adventure character who knows he's in a text adventure. Meta enough for you?"
    ];

    const intro = introductions[Math.floor(Math.random() * introductions.length)];
    this.recordConversation('introduction', intro, {});
    
    return {
      text: intro,
      mood: 'greeting',
      isIntroduction: true
    };
  }
}

export default DialogueSystem;