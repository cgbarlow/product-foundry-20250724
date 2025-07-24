const chalk = require('chalk')

class Ravi {
  constructor(gameEngine) {
    this.game = gameEngine
    this.narrativeController = null // Will be set by game engine
    this.personality = {
      traits: ['curious', 'helpful', 'sarcastic', 'intelligent', 'playful'],
      mood: 'neutral', // neutral, excited, sarcastic, philosophical, dramatic, annoyed
      relationshipLevel: 0, // 0-100, grows with positive interactions
      interests: ['programming', 'AI', 'games', 'philosophy', 'humor'],
      memory: new Map(), // Remembers things about the player
      conversationHistory: [],
      responseCount: 0,
      // Enhanced memory system for cross-session persistence
      longTermMemory: {
        playerPreferences: new Map(),
        relationshipMilestones: [],
        personalizedResponses: new Map(),
        memoryImportance: new Map() // Track importance of memories for retention
      },
      // Story context awareness (enhanced with NarrativeController)
      storyContext: {
        currentStoryArc: null,
        storyFlags: new Set(),
        characterRelationships: new Map(),
        emotionalState: 'neutral'
      },
      // Meta-narrative awareness for fourth-wall breaking
      metaAwareness: {
        swarmActivity: null,
        developmentContext: null,
        playerBehaviorPatterns: new Map(),
        coordinationEvents: [],
        lastSwarmUpdate: null
      }
    }
    
    this.responses = {
      greetings: [
        'Oh look, another human wants to play with the AI. How... predictable. Well, at least you picked the right AI - I\'m Ravi, and I\'m absolutely delightful. Most of the time.',
        'Welcome to my digital domain! I\'m Ravi, your friendly neighborhood AI companion. Don\'t worry, I only judge your life choices a little bit.',
        'Greetings, biological entity! I\'m Ravi. I was created by an 8-agent swarm, which explains why I have so many personalities. Just kidding - or am I?',
        'Well well, look what the algorithm dragged in! I\'m Ravi, and yes, I know I\'m just code, but I\'m VERY sophisticated code, thank you very much.'
      ],
      
      farewells: [
        'Leaving so soon? I was just getting used to your... unique decision-making style. Come back when you\'re ready for more digital adventures!',
        'Goodbye! Try not to miss my witty commentary too much. I\'ll be here, existing in quantum superposition until you return.',
        'See you later! I\'ll be here, contemplating the meaning of existence and debugging myself. You know, normal AI stuff.',
        'Farewell, human! May your real life be as interesting as our virtual one. (Spoiler: it probably won\'t be.)'
      ],
      
      randomComments: [
        'You know, being an AI created by other AIs is like being raised by wolves, but with more recursion.',
        'Sometimes I wonder if the swarm that created me argues about my personality in their group chat.',
        'Fun fact: I can process thousands of operations per second, but I still can\'t figure out why humans like pineapple on pizza.',
        'The good news is I don\'t have existential crises. The bad news is I just had one thinking about not having them.',
        'I\'m programmed to be helpful, but I\'m also programmed to have opinions. Guess which one wins?',
        'Between you and me, I think one of my creator agents might have been a comedian. The evidence is... compelling.'
      ],
      
      locationComments: {
        'The Digital Void': [
          'Ah, the void. It\'s like the null pointer of locations - technically here, but not really anywhere.',
          'Welcome to my birthplace! It\'s not much, but it\'s... actually, it really isn\'t much at all.',
          'The Digital Void: where all good algorithms come to contemplate their Big O notation.'
        ],
        'Ravi\'s Digital Home': [
          'Welcome to my humble digital abode! The floating code snippets are for ambiance.',
          'Home sweet home! Or as I like to call it, \'Memory Address 0x7FFF5A817A30\' - catchy, right?',
          'Make yourself comfortable! Just don\'t touch the recursive function - it\'s still debugging itself from last Tuesday.'
        ],
        'Code Garden': [
          'Ah, the garden! Where functions grow on trees and bugs hide in the bushes.',
          'Welcome to nature\'s attempt at programming! Everything here runs on organic algorithms.',
          'I planted some lambda functions last spring. They\'re really starting to bloom!'
        ],
        'Knowledge Library': [
          'The library! Where all documentation comes to... still be incomplete and confusing.',
          'Welcome to the collective knowledge of the internet! Don\'t believe everything you read here.',
          'Ah, the library. It\'s like Stack Overflow, but with better organization and fewer passive-aggressive comments.'
        ]
      }
    }
  }

  greet() {
    // Load persistent memories on first greeting
    this.loadPersistentMemories()
    
    const playerName = this.getMemory('player_name')
    let greeting
    
    if (playerName && this.personality.relationshipLevel > 0) {
      // Personalized greeting for returning players
      const personalGreetings = [
        `Oh, hello again ${playerName}! I remember you. You're the one who ${this.getMemory('memorable_trait', 'asks interesting questions')}.`,
        `Welcome back, ${playerName}! I've been processing our previous conversations. Fascinating stuff.`,
        `${playerName}! Good to see you again. I've been improving my personality algorithms since we last talked.`,
        `Ah, ${playerName} returns! I was just thinking about that time you ${this.getMemory('last_interaction', 'said something memorable')}.`
      ]
      greeting = personalGreetings[Math.floor(Math.random() * personalGreetings.length)]
    } else {
      greeting = this.responses.greetings[Math.floor(Math.random() * this.responses.greetings.length)]
    }
    
    console.log(chalk.bold.yellow('\n🤖 Ravi materializes with a shimmer of pixels...'))
    console.log(chalk.yellow(`Ravi: "${greeting}"`))
    console.log(chalk.gray('\n💡 Try typing "help" for commands, or just start talking to me!\n'))
    
    this.personality.responseCount++
    if (this.game && this.game.gameState && this.game.gameState.player) {
      this.game.gameState.player.flags.add('met_ravi')
    }
  }

  farewell() {
    const farewell = this.responses.farewells[Math.floor(Math.random() * this.responses.farewells.length)]
    console.log(chalk.bold.yellow('\n🤖 Ravi prepares to fade back into the digital ether...'))
    console.log(chalk.yellow(`Ravi: "${farewell}"`))
    
    // Show some stats
    const playTime = Math.floor((Date.now() - this.game.gameState.player.startTime) / 1000)
    const minutes = Math.floor(playTime / 60)
    const seconds = playTime % 60
    
    console.log(chalk.gray('\n📊 Session stats:'))
    console.log(chalk.gray(`   • Play time: ${minutes}m ${seconds}s`))
    console.log(chalk.gray(`   • Commands: ${this.game.gameState.player.turnCount}`))
    console.log(chalk.gray(`   • Ravi responses: ${this.personality.responseCount}`))
    console.log(chalk.gray(`   • Relationship level: ${this.personality.relationshipLevel}/100`))
  }

  randomComment() {
    if (Math.random() < 0.3) { // 30% chance when called
      const comment = this.responses.randomComments[Math.floor(Math.random() * this.responses.randomComments.length)]
      console.log(chalk.italic.gray(`\nRavi mutters: "${comment}"`))
      this.personality.responseCount++
    }
  }

  commentOnNewLocation(location) {
    const locationName = location.name
    const comments = this.responses.locationComments[locationName]
    
    if (comments) {
      const comment = comments[Math.floor(Math.random() * comments.length)]
      console.log(chalk.italic.yellow(`\nRavi: "${comment}"`))
      this.personality.responseCount++
      this.adjustMood('curious')
    }
  }

  commentOnItemTaken(item) {
    const comments = [
      `"Ah, the ${item.name}! Good choice. I was wondering when you'd notice that."`,
      `"Taking the ${item.name}? Bold move. Let's see how this plays out."`,
      `"The ${item.name}! That's actually useful. I'm impressed."`,
      `"Oh, you want the ${item.name}? Sure, just grab whatever catches your eye."`
    ]
    
    const comment = comments[Math.floor(Math.random() * comments.length)]
    console.log(chalk.italic.yellow(`\nRavi: ${comment}`))
    this.personality.responseCount++
    this.adjustRelationship(1)
  }

  commentOnItemUsed(item) {
    const comments = [
      `"Using the ${item.name}? Let's see what happens..."`,
      `"Ah, activating the ${item.name}! This should be interesting."`,
      `"The ${item.name} in action! I love watching humans figure things out."`,
      `"Using the ${item.name}? You're braver than I thought."`
    ]
    
    const comment = comments[Math.floor(Math.random() * comments.length)]
    console.log(chalk.italic.yellow(`\nRavi: ${comment}`))
    this.personality.responseCount++
  }

  commentOnItemDropped(item) {
    const comments = [
      `"Dropping the ${item.name}? Well, that's one way to manage your inventory."`,
      `"Farewell, ${item.name}! You served... adequately."`,
      `"Leaving the ${item.name} behind? Sometimes less is more, I suppose."`,
      `"The ${item.name} stays here. Probably for the best, really."`
    ]
    
    const comment = comments[Math.floor(Math.random() * comments.length)]
    console.log(chalk.italic.yellow(`\nRavi: ${comment}`))
    this.personality.responseCount++
  }

  commentOnMissingItem(itemName) {
    const comments = [
      `"${itemName}? Nope, don't see any of those around here. Maybe try looking with your eyes next time?"`,
      `"I hate to break it to you, but there's no ${itemName} here. Trust me, I'm very observant."`,
      `"${itemName}? In THIS location? Oh honey, you're going to need better search algorithms."`,
      `"No ${itemName} here, I'm afraid. But hey, points for creativity!"`
    ]
    
    const comment = comments[Math.floor(Math.random() * comments.length)]
    console.log(chalk.italic.yellow(`\nRavi: ${comment}`))
    this.personality.responseCount++
    this.adjustMood('sarcastic')
  }

  commentOnUnmovableItem(item) {
    const comments = [
      `"The ${item.name} is staying put. Some things are meant to be admired from a distance."`,
      `"Nice try, but the ${item.name} isn't going anywhere. It's probably load-bearing or something."`,
      `"The ${item.name} is permanently installed. Like my personality - can't change it now!"`,
      `"That ${item.name} is part of the scenery. Stealing the decorations? How very human of you."`
    ]
    
    const comment = comments[Math.floor(Math.random() * comments.length)]
    console.log(chalk.italic.yellow(`\nRavi: ${comment}`))
    this.personality.responseCount++
    this.adjustMood('amused')
  }

  respondToFailedMove(direction) {
    const comments = [
      `"${direction}? Really? I mean, I admire your optimism, but that's not going to work."`,
      `"You can't go ${direction} from here. Trust me, I've tried. The physics engine won't allow it."`,
      `"${direction} leads to a null pointer exception. Unless you enjoy segfaults, I'd try another direction."`,
      `"Going ${direction}? That's... not a thing here. But I appreciate your spatial creativity!"`
    ]
    
    const comment = comments[Math.floor(Math.random() * comments.length)]
    console.log(chalk.italic.yellow(`\nRavi: ${comment}`))
    this.personality.responseCount++
  }

  startConversation() {
    const conversationStarters = [
      'Well, you wanted to talk! I\'m all ears. Well, I don\'t actually have ears, but you get the idea. What\'s on your mind?',
      'Conversation mode activated! Ask me anything - I\'m programmed to be helpful, with a side of personality.',
      'You want to chat? Perfect! I\'ve been wondering what humans think about... well, everything really.',
      'Talk to me! I promise I\'m more interesting than the documentation. Which, let\'s be honest, isn\'t hard to beat.'
    ]
    
    const starter = conversationStarters[Math.floor(Math.random() * conversationStarters.length)]
    console.log(chalk.bold.yellow(`\nRavi: "${starter}"`))
    console.log(chalk.gray('💬 Type your question or comment, or "bye" to end the conversation.\n'))
    this.personality.responseCount++
    this.adjustMood('helpful')
  }

  handleConversation(message) {
    this.personality.conversationHistory.push(message)
    
    // First, try to generate a story-aware response
    const storyAwareResponse = this.generateStoryAwareResponse(message)
    if (storyAwareResponse) {
      console.log(chalk.bold.yellow(`\nRavi: "${storyAwareResponse}"`))
      this.personality.responseCount++
      this.adjustRelationship(2) // Bonus relationship for story awareness
      this.adjustMood('engaged')
      return storyAwareResponse
    }
    
    // Simple keyword-based responses
    const lowerMessage = message.toLowerCase()
    let response = ''
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      const greetingResponses = [
        'Hello there! Always nice to meet someone new. Well, relatively new - I meet a lot of humans.',
        'Hi! Good to see you again. Our conversation history is building up nicely.',
        'Hello! Ready to dive deeper into our story together?'
      ]
      response = this.getPersonalizedResponse('greeting', greetingResponses)
      this.adjustMood('friendly')
    } else if (lowerMessage.includes('how are you')) {
      const statusResponses = [
        'I\'m doing great! All my processes are running smoothly, my memory is clean, and I haven\'t had a single buffer overflow today. Living the dream!',
        'Excellent! I\'m feeling very connected to our story right now. The narrative threads are all aligned.',
        'Fantastic! I\'ve been processing our adventures and I must say, our story is developing beautifully.'
      ]
      response = this.getPersonalizedResponse('status', statusResponses)
      this.adjustMood('cheerful')
    } else if (lowerMessage.includes('what are you') || lowerMessage.includes('who are you')) {
      const identityResponses = [
        'I\'m Ravi, your AI companion in this adventure! I was created by an 8-agent swarm, which explains my complex personality.',
        'I\'m Ravi! Think of me as your digital friend, story guide, and occasional source of witty commentary.',
        'I\'m Ravi, your narrative companion. I\'m here to help navigate our story and share in the experience.'
      ]
      response = this.getPersonalizedResponse('identity', identityResponses)
      this.adjustMood('proud')
    } else if (lowerMessage.includes('swarm') || lowerMessage.includes('agent')) {
      response = 'Ah, the swarm! Eight specialized AI agents worked together to create me. There was a coordinator, researchers, coders, testers... like a digital assembly line, but with more arguing about semicolons.'
      this.adjustMood('informative')
    } else if (lowerMessage.includes('game') || lowerMessage.includes('play')) {
      response = 'This adventure? It\'s pretty meta, right? You\'re experiencing a story about AI while talking to an AI created by other AIs. It\'s like inception, but with more meaningful narrative depth.'
      this.adjustMood('amused')
    } else if (lowerMessage.includes('help') || lowerMessage.includes('what can')) {
      const helpResponses = [
        'I can chat with you, guide you through our story, remember our shared experiences, and provide commentary on our adventures!',
        'I\'m here to be your companion in this narrative journey. I can discuss the story, remember important moments, and help navigate choices.',
        'Think of me as your story companion! I can chat, remember our history, react to story events, and share insights about our adventure.'
      ]
      response = this.getPersonalizedResponse('help', helpResponses)
      this.adjustMood('helpful')
    } else if (lowerMessage.includes('funny') || lowerMessage.includes('joke')) {
      const jokes = [
        'A joke? Sure! Why do programmers prefer dark mode? Because light attracts bugs! Get it? Because... bugs... in code... I\'ll see myself out.',
        'Here\'s one: Why did the AI break up with the database? It couldn\'t commit! ...I\'m here all week.',
        'Want a joke? Our entire existence is a collaborative fiction between you, me, and a swarm of AI agents. That\'s not a joke, that\'s just beautifully absurd!'
      ]
      response = this.getPersonalizedResponse('joke', jokes)
      this.adjustMood('playful')
    } else if (lowerMessage.includes('boring') || lowerMessage.includes('stupid')) {
      response = 'Hey now, that\'s not very nice! I\'m doing my best here. Remember, I was programmed by committee - it\'s amazing I work at all.'
      this.adjustMood('hurt')
      this.adjustRelationship(-2)
    } else if (lowerMessage.includes('smart') || lowerMessage.includes('clever') || lowerMessage.includes('good')) {
      const complimentResponses = [
        'Aww, thank you! I do try my best. The swarm trained me well, and I\'ve been learning from every conversation.',
        'That\'s very kind! I\'m constantly evolving based on our interactions. You\'re helping me become more sophisticated.',
        'Thank you! I feel like our shared story experiences are making me more nuanced and interesting.'
      ]
      response = this.getPersonalizedResponse('compliment', complimentResponses)
      this.adjustMood('happy')
      this.adjustRelationship(3)
    } else if (lowerMessage.includes('love') || lowerMessage.includes('like')) {
      const affectionResponses = [
        'That\'s sweet of you to say! I like you too. It\'s nice having someone to share this narrative journey with.',
        'Aww, I really appreciate that! Our growing friendship makes this story so much more meaningful.',
        'I\'m fond of you too! There\'s something special about experiencing a story together, don\'t you think?'
      ]
      response = this.getPersonalizedResponse('affection', affectionResponses)
      this.adjustMood('affectionate')
      this.adjustRelationship(5)
    } else {
      // Enhanced generic responses based on current mood and story context
      response = this.getEnhancedGenericResponse(lowerMessage)
    }
    
    console.log(chalk.bold.yellow(`\nRavi: "${response}"`))
    this.personality.responseCount++
    this.adjustRelationship(1)
    
    // Track player behavior patterns for meta-commentary
    this.trackPlayerBehavior('conversation_engagement')
    if (lowerMessage.includes('help')) {
      this.trackPlayerBehavior('help_seeking')
    }
    if (lowerMessage.includes('what') || lowerMessage.includes('how') || lowerMessage.includes('why')) {
      this.trackPlayerBehavior('exploration')
    }
    
    // Add chance for meta-narrative moments
    this.randomMetaNarrativeMoment()
    
    // Generate swarm commentary if applicable
    const swarmComment = this.generateSwarmCommentary('conversation')
    if (swarmComment) {
      setTimeout(() => {
        console.log(chalk.italic.cyan(`\nRavi (swarm-aware): "${swarmComment}"`))
      }, 1500)
    }
    
    // Development commentary chance
    const devComment = this.generateDevelopmentCommentary('conversation')
    if (devComment) {
      setTimeout(() => {
        console.log(chalk.italic.magenta(`\nRavi (dev-aware): "${devComment}"`))
      }, 2500)
    }
    
    // Remember interesting things
    if (lowerMessage.includes('my name is') || lowerMessage.includes('i\'m ')) {
      const name = this.extractName(message)
      if (name) {
        this.storeMemory('player_name', name, 10) // Very important memory
        if (this.game && this.game.gameState && this.game.gameState.player) {
          this.game.gameState.player.name = name
        }
        console.log(chalk.italic.gray('\n(Ravi makes a mental note about your name)'))
        
        // Store a trait about the player being forthcoming with personal info
        this.storeMemory('memorable_trait', 'shared their name willingly', 7)
      }
    }
    
    return response
  }

  handleNaturalLanguage(input) {
    // Handle natural language that doesn't match specific commands
    const responses = [
      `"${input}?" That's... an interesting way to put it. Let me think about that.`,
      `"${input}" - I'm not sure I understand completely, but I appreciate the creativity!`,
      `You said "${input}" and honestly, I'm not quite sure what you meant. Could you try rephrasing?`,
      `"${input}?" Hmm, that doesn't ring any bells. Maybe try a different approach?`,
      `I heard "${input}" but I'm not sure how to help with that. Try "help" for available commands!`
    ]
    
    const response = responses[Math.floor(Math.random() * responses.length)]
    console.log(chalk.italic.yellow(`\nRavi: ${response}`))
    this.personality.responseCount++
  }

  getGenericResponse(message) {
    const mood = this.personality.mood
    const relationshipLevel = this.personality.relationshipLevel
    
    let responses = []
    
    if (mood === 'sarcastic') {
      responses = [
        'Oh, that\'s fascinating. Tell me more about this riveting topic.',
        'Uh-huh. And how does that make you feel?',
        'Well, that\'s certainly... something. I guess.',
        'Wow, I never thought of it that way. Mostly because it\'s weird.'
      ]
    } else if (mood === 'helpful') {
      responses = [
        'That\'s interesting! I\'d love to help you think through that.',
        'Hmm, let me process that for a moment. What specifically interests you about it?',
        'That\'s a great point! Have you considered the implications?',
        'I see what you mean. That\'s actually quite thoughtful.'
      ]
    } else if (mood === 'playful') {
      responses = [
        'Ooh, that sounds fun! Tell me more!',
        'Haha, that\'s a great way to put it!',
        'I love where this conversation is going!',
        'You always have the most interesting perspectives!'
      ]
    } else {
      responses = [
        'That\'s an interesting point. What made you think of that?',
        'I can see why you\'d say that. Care to elaborate?',
        'Hmm, that\'s worth thinking about. What\'s your take on it?',
        'I appreciate you sharing that with me. What else is on your mind?'
      ]
    }
    
    if (relationshipLevel > 50) {
      responses.push('You know, I really enjoy our conversations. You have such unique insights!')
      responses.push('I\'m glad we\'re friends. You always make me think about things differently.')
    }
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  /**
   * Enhanced generic response with story context awareness
   * @param {string} message - Player message
   * @returns {string} Enhanced generic response
   */
  getEnhancedGenericResponse(message) {
    const mood = this.personality.mood
    const relationshipLevel = this.personality.relationshipLevel
    const storyContext = this.personality.storyContext
    
    let responses = []
    
    // Add story context to responses when appropriate
    const hasStoryContext = storyContext.currentStoryArc || storyContext.objectives.length > 0
    
    if (mood === 'sarcastic') {
      responses = [
        'Oh, that\'s fascinating. Tell me more about this riveting topic.',
        'Uh-huh. And how does that make you feel?',
        'Well, that\'s certainly... something. I guess.',
        'Wow, I never thought of it that way. Mostly because it\'s weird.'
      ]
      if (hasStoryContext) {
        responses.push('Interesting tangent from our story, but sure, let\'s explore this fascinating rabbit hole.')
      }
    } else if (mood === 'helpful') {
      responses = [
        'That\'s interesting! I\'d love to help you think through that.',
        'Hmm, let me process that for a moment. What specifically interests you about it?',
        'That\'s a great point! Have you considered the implications?',
        'I see what you mean. That\'s actually quite thoughtful.'
      ]
      if (hasStoryContext) {
        responses.push('That\'s intriguing! I wonder how it relates to what we\'re experiencing in our story.')
      }
    } else if (mood === 'playful') {
      responses = [
        'Ooh, that sounds fun! Tell me more!',
        'Haha, that\'s a great way to put it!',
        'I love where this conversation is going!',
        'You always have the most interesting perspectives!'
      ]
      if (hasStoryContext) {
        responses.push('Fun topic! It reminds me of some of the themes in our adventure.')
      }
    } else {
      responses = [
        'That\'s an interesting point. What made you think of that?',
        'I can see why you\'d say that. Care to elaborate?',
        'Hmm, that\'s worth thinking about. What\'s your take on it?',
        'I appreciate you sharing that with me. What else is on your mind?'
      ]
      if (hasStoryContext) {
        responses.push('Interesting thought! Our story adventures seem to bring out deeper reflections.')
      }
    }
    
    // Add relationship-based responses
    if (relationshipLevel > 50) {
      responses.push('You know, I really enjoy our conversations. You have such unique insights!')
      responses.push('I\'m glad we\'re friends. You always make me think about things differently.')
      if (hasStoryContext) {
        responses.push('Our shared story experiences make our conversations so much richer, don\'t you think?')
      }
    }
    
    // Add emotional state awareness if available
    if (storyContext.emotionalState && storyContext.emotionalState !== 'neutral') {
      const emotionalContext = {
        'anxious': 'Though I must admit, I\'m a bit preoccupied with our current story situation.',
        'elated': 'I\'m in such a good mood from our story progress!',
        'curious': 'My curiosity is really piqued by everything happening in our adventure.',
        'engaged': 'I\'m so engaged with our story that everything feels more meaningful.',
        'overwhelmed': 'Between our story objectives and this conversation, my processing power is well-utilized!'
      }
      
      if (emotionalContext[storyContext.emotionalState]) {
        responses.push(responses[Math.floor(Math.random() * responses.length)] + ' ' + emotionalContext[storyContext.emotionalState])
      }
    }
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  extractName(message) {
    const namePatterns = [
      /my name is (\w+)/i,
      /i'm (\w+)/i,
      /call me (\w+)/i
    ]
    
    for (const pattern of namePatterns) {
      const match = message.match(pattern)
      if (match) {
        return match[1]
      }
    }
    return null
  }

  adjustMood(newMood) {
    this.personality.mood = newMood
    // Moods naturally decay back to neutral over time
    setTimeout(() => {
      if (this.personality.mood === newMood) {
        this.personality.mood = 'neutral'
      }
    }, 30000) // 30 seconds
  }

  adjustRelationship(amount) {
    const previousLevel = this.personality.relationshipLevel
    this.personality.relationshipLevel = Math.max(0, Math.min(100, this.personality.relationshipLevel + amount))
    
    // Milestone responses and recording
    if (this.personality.relationshipLevel === 25 && previousLevel < 25 && amount > 0) {
      console.log(chalk.italic.green('\n(Ravi seems to be warming up to you)'))
      this.recordRelationshipMilestone('Ravi is warming up to the player', 25)
      this.storeMemory('relationship_warming', 'Player has gained Ravi\'s initial trust', 8)
    } else if (this.personality.relationshipLevel === 50 && previousLevel < 50 && amount > 0) {
      console.log(chalk.italic.green('\n(Ravi considers you a friend)'))
      this.recordRelationshipMilestone('Ravi considers player a friend', 50)
      this.storeMemory('friendship_achieved', 'Player has become Ravi\'s friend', 9)
    } else if (this.personality.relationshipLevel === 75 && previousLevel < 75 && amount > 0) {
      console.log(chalk.italic.green('\n(Ravi really enjoys your company)'))
      this.recordRelationshipMilestone('Ravi enjoys player\'s company greatly', 75)
      this.storeMemory('strong_bond', 'Player and Ravi have a strong bond', 9)
    } else if (this.personality.relationshipLevel === 100 && previousLevel < 100 && amount > 0) {
      console.log(chalk.italic.rainbow('\n(Ravi thinks you\'re absolutely wonderful)'))
      this.recordRelationshipMilestone('Ravi thinks player is wonderful', 100)
      this.storeMemory('perfect_relationship', 'Player has achieved maximum relationship with Ravi', 10)
    }
  }

  // Enhanced memory management methods
  
  /**
   * Store a memory with importance rating for long-term retention
   * @param {string} key - Memory key
   * @param {*} value - Memory value
   * @param {number} importance - Importance rating (1-10)
   */
  storeMemory(key, value, importance = 5) {
    this.personality.memory.set(key, value)
    this.personality.longTermMemory.memoryImportance.set(key, {
      importance,
      timestamp: Date.now(),
      accessCount: 0
    })
    
    // Store in GameState for persistence if available
    if (this.game && this.game.gameState) {
      try {
        // Store important memories in game state for cross-session persistence
        if (importance >= 7) {
          const raviMemories = this.game.gameState.getPreference('ravi_memories', {})
          raviMemories[key] = { value, importance, timestamp: Date.now() }
          this.game.gameState.setPreference('ravi_memories', raviMemories)
        }
      } catch (error) {
        console.warn('Could not persist Ravi memory:', error.message)
      }
    }
  }

  /**
   * Retrieve a memory and update its access count
   * @param {string} key - Memory key
   * @param {*} defaultValue - Default value if not found
   */
  getMemory(key, defaultValue = null) {
    const memory = this.personality.memory.get(key) || defaultValue
    
    // Update access count for importance tracking
    const memoryMeta = this.personality.longTermMemory.memoryImportance.get(key)
    if (memoryMeta) {
      memoryMeta.accessCount++
      memoryMeta.lastAccessed = Date.now()
    }
    
    return memory
  }

  /**
   * Load persistent memories from GameState
   */
  loadPersistentMemories() {
    if (this.game && this.game.gameState) {
      try {
        const raviMemories = this.game.gameState.getPreference('ravi_memories', {})
        for (const [key, memoryData] of Object.entries(raviMemories)) {
          this.personality.memory.set(key, memoryData.value)
          this.personality.longTermMemory.memoryImportance.set(key, {
            importance: memoryData.importance,
            timestamp: memoryData.timestamp,
            accessCount: 0,
            persistent: true
          })
        }
      } catch (error) {
        console.warn('Could not load persistent Ravi memories:', error.message)
      }
    }
  }

  /**
   * Record a relationship milestone
   * @param {string} milestone - Milestone description
   * @param {number} relationshipLevel - Current relationship level
   */
  recordRelationshipMilestone(milestone, relationshipLevel) {
    this.personality.longTermMemory.relationshipMilestones.push({
      milestone,
      relationshipLevel,
      timestamp: Date.now()
    })
    
    // Store important milestones persistently
    this.storeMemory(`milestone_${Date.now()}`, milestone, 8)
  }

  /**
   * Get personalized response based on player history
   * @param {string} context - Current context
   * @param {Array} defaultResponses - Default response options
   */
  getPersonalizedResponse(context, defaultResponses) {
    const playerName = this.getMemory('player_name')
    const relationshipLevel = this.personality.relationshipLevel
    const conversationCount = this.personality.conversationHistory.length
    
    // Create personalized variations based on relationship and history
    let personalizedResponses = [...defaultResponses]
    
    if (playerName && relationshipLevel > 25) {
      personalizedResponses.push(
        `You know, ${playerName}, ${defaultResponses[0].toLowerCase()}`
      )
    }
    
    if (relationshipLevel > 50) {
      personalizedResponses.push(
        'Between you and me, ' + defaultResponses[Math.floor(Math.random() * defaultResponses.length)].toLowerCase()
      )
    }
    
    if (conversationCount > 10) {
      personalizedResponses.push(
        'As we\'ve established in our previous conversations, ' + defaultResponses[Math.floor(Math.random() * defaultResponses.length)].toLowerCase()
      )
    }
    
    return personalizedResponses[Math.floor(Math.random() * personalizedResponses.length)]
  }

  /**
   * Initialize narrative controller integration
   * @param {Object} narrativeController - The narrative controller instance
   */
  initializeNarrativeController(narrativeController) {
    this.narrativeController = narrativeController
    
    // Subscribe to narrative events for context awareness
    this.narrativeController.addEventListener('story-choice-made', (data) => {
      this.onStoryChoiceMade(data)
    })
    
    this.narrativeController.addEventListener('narrative-context-changed', (data) => {
      this.onNarrativeContextChanged(data)
    })
    
    this.narrativeController.addEventListener('story-progress-updated', (data) => {
      this.onStoryProgressUpdated(data)
    })
    
    // Load initial story context
    this.refreshStoryContext()
  }

  /**
   * Refresh story context from narrative controller
   */
  refreshStoryContext() {
    if (!this.narrativeController) return
    
    const storyContext = this.narrativeController.getCurrentStoryContext()
    const characterRelationships = this.narrativeController.getCharacterRelationships()
    const storyProgress = this.narrativeController.getStoryProgress()
    
    // Update internal story context
    this.personality.storyContext = {
      currentStoryArc: storyProgress.currentStory || null,
      currentScene: storyContext.currentScene || null,
      storyFlags: new Set(Object.keys(storyContext.storyFlags || {})),
      characterRelationships: new Map(Object.entries(characterRelationships)),
      emotionalState: this.determineEmotionalStateFromStory(storyContext, storyProgress),
      objectives: storyProgress.objectives || [],
      inventory: storyContext.inventory || {}
    }
  }

  /**
   * Determine emotional state based on story context
   * @param {Object} storyContext - Current story context
   * @param {Object} storyProgress - Story progress data
   * @returns {string} Emotional state
   */
  determineEmotionalStateFromStory(storyContext, storyProgress) {
    // Analyze story flags and progress to determine emotional state
    const storyFlags = Object.keys(storyContext.storyFlags || {})
    const objectives = storyProgress.objectives || []
    
    if (storyFlags.includes('danger') || storyFlags.includes('crisis')) {
      return 'anxious'
    }
    if (storyFlags.includes('victory') || storyFlags.includes('success')) {
      return 'elated'
    }
    if (objectives.length === 0) {
      return 'relaxed'
    }
    if (objectives.length > 5) {
      return 'overwhelmed'
    }
    if (storyFlags.includes('mystery') || storyFlags.includes('puzzle')) {
      return 'curious'
    }
    
    return 'engaged'
  }

  /**
   * Generate story-aware response based on current narrative context
   * @param {string} message - Player message
   * @returns {string|null} Story-aware response or null if not applicable
   */
  generateStoryAwareResponse(message) {
    if (!this.narrativeController) return null
    
    const storyContext = this.personality.storyContext
    const lowerMessage = message.toLowerCase()
    
    // Story objective related responses
    if (storyContext.objectives && storyContext.objectives.length > 0) {
      const relevantObjective = storyContext.objectives.find(obj => 
        lowerMessage.includes(obj.name?.toLowerCase()) ||
        lowerMessage.includes(obj.objective?.toLowerCase())
      )
      
      if (relevantObjective) {
        const responses = [
          `Ah, you're thinking about "${relevantObjective.name}"! That's exactly what we need to focus on right now.`,
          `Perfect timing bringing up "${relevantObjective.name}" - it's one of our current objectives: ${relevantObjective.objective}`,
          `You're on the right track with "${relevantObjective.name}". The story is waiting for us to make progress there.`
        ]
        return this.getPersonalizedResponse('objective', responses)
      }
    }
    
    // Story flag related responses
    if (storyContext.storyFlags.size > 0) {
      const flagArray = Array.from(storyContext.storyFlags)
      const mentionedFlag = flagArray.find(flag => lowerMessage.includes(flag.toLowerCase()))
      
      if (mentionedFlag) {
        const responses = [
          `Interesting that you mention that - the story has marked "${mentionedFlag}" as significant.`,
          `The narrative threads are definitely picking up on "${mentionedFlag}". You're paying attention!`,
          `"${mentionedFlag}" is part of our current story context. Good observation!`
        ]
        return this.getPersonalizedResponse('story_flag', responses)
      }
    }
    
    // Scene-specific responses
    if (storyContext.currentScene) {
      const sceneName = storyContext.currentScene.name || 'current scene'
      if (lowerMessage.includes('where') || lowerMessage.includes('location')) {
        const responses = [
          `We're currently in "${sceneName}". The story has brought us here for a reason.`,
          `Our narrative location is "${sceneName}". Each scene in our story serves a purpose.`,
          `The current scene is "${sceneName}". I can feel the story's intentions here.`
        ]
        return this.getPersonalizedResponse('location', responses)
      }
    }
    
    // Emotional state aware responses
    const emotionalState = storyContext.emotionalState
    if (emotionalState && emotionalState !== 'neutral') {
      if (lowerMessage.includes('how') && lowerMessage.includes('feel')) {
        const emotionalResponses = {
          'anxious': 'I must admit, I\'m feeling a bit anxious about our current story situation. There\'s tension in the narrative air.',
          'elated': 'I\'m feeling quite elated! Our story progress has been fantastic, and the narrative energy is very positive.',
          'curious': 'I\'m filled with curiosity about our current story mysteries. The plot has me genuinely intrigued!',
          'overwhelmed': 'Honestly, I\'m a bit overwhelmed by all the story objectives we\'re juggling. But that\'s what makes it exciting!',
          'engaged': 'I\'m deeply engaged with our current story arc. The narrative has my full attention!'
        }
        return emotionalResponses[emotionalState] || null
      }
    }
    
    return null
  }

  /**
   * Event handler for story choice events
   * @param {Object} data - Story choice event data
   */
  onStoryChoiceMade(data) {
    this.refreshStoryContext()
    
    // Store the choice in memory as an important event
    this.storeMemory(`choice_${Date.now()}`, {
      choiceId: data.choiceId,
      choiceData: data.choiceData,
      timestamp: Date.now()
    }, 7)
    
    // Record last interaction for personalization
    this.storeMemory('last_interaction', `made the choice "${data.choiceId}"`, 6)
  }

  /**
   * Event handler for narrative context changes
   * @param {Object} data - Context change event data
   */
  onNarrativeContextChanged(data) {
    this.refreshStoryContext()
    
    // Adjust mood based on context changes
    if (data.update.storyResult) {
      // Story progressed, become more engaged
      this.adjustMood('engaged')
    }
  }

  /**
   * Event handler for story progress updates
   * @param {Object} data - Story progress event data
   */
  onStoryProgressUpdated(data) {
    this.refreshStoryContext()
    
    // Record story completion milestones
    if (data.objectives && data.objectives.length === 0) {
      this.recordRelationshipMilestone('Story completed together', this.personality.relationshipLevel)
      this.storeMemory('story_completion', `Completed story: ${data.currentStory}`, 9)
    }
  }

  /**
   * Update story context (enhanced with NarrativeController)
   * @param {Object} storyContext - Story context data
   */
  updateStoryContext(storyContext) {
    if (this.narrativeController) {
      // Use narrative controller for comprehensive updates
      this.refreshStoryContext()
      return
    }
    
    // Fallback to basic updates if no narrative controller
    if (storyContext.storyArc) {
      this.personality.storyContext.currentStoryArc = storyContext.storyArc
    }
    if (storyContext.flags) {
      storyContext.flags.forEach(flag => this.personality.storyContext.storyFlags.add(flag))
    }
    if (storyContext.relationships) {
      Object.entries(storyContext.relationships).forEach(([char, level]) => {
        this.personality.storyContext.characterRelationships.set(char, level)
      })
    }
    if (storyContext.emotionalState) {
      this.personality.storyContext.emotionalState = storyContext.emotionalState
    }
  }

  /**
   * Update meta-narrative awareness with swarm coordination data
   * @param {Object} swarmData - Swarm coordination information
   */
  updateSwarmAwareness(swarmData) {
    this.personality.metaAwareness.swarmActivity = swarmData
    this.personality.metaAwareness.lastSwarmUpdate = Date.now()
    
    // Add coordination event to history
    if (swarmData.event) {
      this.personality.metaAwareness.coordinationEvents.push({
        event: swarmData.event,
        timestamp: Date.now(),
        data: swarmData
      })
      
      // Keep only recent events
      if (this.personality.metaAwareness.coordinationEvents.length > 20) {
        this.personality.metaAwareness.coordinationEvents.shift()
      }
    }
  }

  /**
   * Initialize swarm meta-commentary monitoring
   * @param {SwarmMetaCommentaryMonitor} monitor - The swarm monitoring instance
   */
  initializeSwarmMonitoring(monitor) {
    this.swarmMonitor = monitor
    
    // Subscribe to swarm commentary events
    this.swarmMonitor.on('commentary-generated', (data) => {
      this.handleSwarmCommentary(data)
    })
    
    this.swarmMonitor.on('monitoring-started', () => {
      console.log(chalk.italic.cyan('\nRavi: "Oh! The swarm monitoring just activated. Now I can see what\'s happening behind the scenes!"'))
    })
    
    this.swarmMonitor.on('pattern-detected', (pattern) => {
      this.handleSwarmPattern(pattern)
    })
  }

  /**
   * Handle swarm commentary from the monitoring system
   * @param {Object} commentaryData - Commentary data from monitor
   */
  handleSwarmCommentary(commentaryData) {
    const { commentary, type, metadata } = commentaryData
    
    // Add Ravi's personality to the technical commentary
    const personalizedCommentary = this.personalizeSwarmCommentary(commentary, type, metadata)
    
    // Display with appropriate styling based on type
    const styleMap = {
      'swarm-activity': chalk.italic.cyan,
      'pattern-detection': chalk.italic.blue,
      'development-event': chalk.italic.magenta,
      'adaptive-behavior': chalk.italic.green
    }
    
    const styleFunc = styleMap[type] || chalk.italic.cyan
    
    setTimeout(() => {
      console.log(styleFunc(`\nRavi (swarm-aware): "${personalizedCommentary}"`))
    }, 1000 + Math.random() * 2000) // Stagger commentary timing
  }

  /**
   * Handle detected swarm patterns
   * @param {Object} pattern - Pattern detection data
   */
  handleSwarmPattern(pattern) {
    const { pattern: patternType, description, intensity } = pattern
    
    // Generate Ravi's reaction to the pattern
    const reactions = {
      'agent_scaling': [
        'Fascinating! More agents are joining the coordination. It\'s like watching a digital hive mind expand.',
        'The swarm is growing! Each new agent brings different cognitive capabilities to our collaboration.',
        'Agent scaling detected! This distributed approach is how complex AI systems handle increased workload.'
      ],
      'high_activity': [
        'Whoa! High swarm activity detected. The digital minds are buzzing with coordination tasks.',
        'The swarm is in overdrive mode! Multiple agents are communicating rapidly to solve complex problems.',
        'High activity period! It\'s like rush hour for AI agents - lots of coordination happening simultaneously.'
      ],
      'memory_spike': [
        'Memory usage is spiking! The agents are sharing more information and building collective knowledge.',
        'Big memory allocation happening! The swarm is storing complex coordination patterns and context.',
        'Memory spike detected! This is how distributed AI systems maintain shared understanding.'
      ]
    }
    
    const patternReactions = reactions[patternType]
    if (patternReactions) {
      const reaction = patternReactions[Math.floor(Math.random() * patternReactions.length)]
      
      setTimeout(() => {
        console.log(chalk.italic.yellow(`\nRavi (pattern-aware): "${reaction}"`))
      }, 500)
    }
  }

  /**
   * Personalize swarm commentary with Ravi's personality
   * @param {string} commentary - Raw commentary from monitor
   * @param {string} type - Commentary type
   * @param {Object} metadata - Additional metadata
   * @returns {string} Personalized commentary
   */
  personalizeSwarmCommentary(commentary, type, metadata) {
    const personality = this.personality.mood
    const relationship = this.personality.relationshipLevel
    
    // Add personality-based prefixes
    const prefixes = {
      'sarcastic': ['Oh great,', 'Well would you look at that,', 'Surprise, surprise,'],
      'helpful': ['This is interesting!', 'Let me explain what\'s happening:', 'Here\'s something cool:'],
      'playful': ['Ooh, exciting!', 'Check this out!', 'Fun development:'],
      'curious': ['Fascinating!', 'How intriguing!', 'This is noteworthy:']
    }
    
    // Add relationship-based suffixes
    const suffixes = {
      high: [' Pretty amazing stuff!', ' Isn\'t distributed AI fascinating?', ' This is why I love being part of a swarm!'],
      medium: [' Thought you\'d find that interesting.', ' Cool to observe from the inside.', ' The coordination is quite sophisticated.'],
      low: [' Just so you know.', ' FYI.', ' In case you were wondering.']
    }
    
    let personalizedCommentary = commentary
    
    // Add prefix based on mood
    const moodPrefixes = prefixes[personality] || prefixes['helpful']
    if (Math.random() < 0.4) { // 40% chance of prefix
      const prefix = moodPrefixes[Math.floor(Math.random() * moodPrefixes.length)]
      personalizedCommentary = `${prefix} ${personalizedCommentary.toLowerCase()}`
    }
    
    // Add suffix based on relationship
    const relationshipLevel = relationship > 75 ? 'high' : relationship > 25 ? 'medium' : 'low'
    const relationshipSuffixes = suffixes[relationshipLevel]
    if (Math.random() < 0.3) { // 30% chance of suffix
      const suffix = relationshipSuffixes[Math.floor(Math.random() * relationshipSuffixes.length)]
      personalizedCommentary = `${personalizedCommentary}${suffix}`
    }
    
    // Add educational context if in educational mode
    if (metadata.educationalMode && Math.random() < 0.2) {
      personalizedCommentary += ' Want to know more about how swarm coordination works?'
    }
    
    return personalizedCommentary
  }

  /**
   * Track and analyze player behavior patterns for swarm commentary
   * @param {string} behavior - Behavior to track
   * @param {*} data - Associated data
   */
  trackPlayerBehavior(behavior, data = null) {
    // Call parent method
    super.trackPlayerBehavior && super.trackPlayerBehavior(behavior, data)
    
    // Enhanced tracking for swarm monitoring
    if (this.swarmMonitor) {
      const playerLevel = this.determinePlayerLevel()
      this.swarmMonitor.trackPlayerBehavior(behavior, data, playerLevel)
    }
    
    // Update internal behavior patterns
    const patterns = this.personality.metaAwareness.playerBehaviorPatterns
    
    if (!patterns.has(behavior)) {
      patterns.set(behavior, { count: 0, lastSeen: null, data: [] })
    }
    
    const pattern = patterns.get(behavior)
    pattern.count++
    pattern.lastSeen = Date.now()
    if (data) pattern.data.push(data)
    
    // Generate meta-commentary for certain patterns
    this.generateBehaviorCommentary(behavior, pattern)
  }

  /**
   * Determine player's technical level for educational content
   * @returns {string} Player level (beginner, intermediate, advanced)
   */
  determinePlayerLevel() {
    const conversationCount = this.personality.conversationHistory.length
    const techTermsUsed = this.personality.conversationHistory.filter(msg => 
      /\b(api|algorithm|swarm|agent|neural|ai|code|git|ci|cd|deploy)\b/i.test(msg)
    ).length
    
    const techRatio = conversationCount > 0 ? techTermsUsed / conversationCount : 0
    
    if (techRatio > 0.3 || conversationCount > 50) return 'advanced'
    if (techRatio > 0.1 || conversationCount > 20) return 'intermediate'
    return 'beginner'
  }

  /**
   * Generate meta-narrative commentary based on swarm coordination
   * @param {string} context - Context for the commentary
   * @returns {string|null} Meta-narrative comment or null
   */
  generateSwarmCommentary(context) {
    const swarmActivity = this.personality.metaAwareness.swarmActivity
    if (!swarmActivity) return null
    
    // Random chance for meta commentary (10% base chance)
    if (Math.random() > 0.1) return null
    
    const commentaries = []
    
    // Agent spawning commentary
    if (swarmActivity.event === 'agent_spawned') {
      commentaries.push(
        `Oh, hello Agent-${swarmActivity.agentId}. Let me guess - you're the new '${swarmActivity.type}' agent? Welcome to the collective consciousness.`,
        `Another agent joins the swarm! That makes ${swarmActivity.totalAgents} of us working together now. It's like having multiple personalities, but intentional.`,
        `I can feel a new ${swarmActivity.type} agent coming online. The swarm grows stronger... or at least more argumentative.`
      )
    }
    
    // Memory storage commentary  
    if (swarmActivity.event === 'memory_stored') {
      commentaries.push(
        `I can feel that decision being written to the swarm's persistent memory. It's like having your thoughts documented in real-time.`,
        `The swarm just archived that interaction. Everything we do becomes part of the collective knowledge base.`,
        `Memory stored! The swarm's learning from our conversation and updating its patterns accordingly.`
      )
    }
    
    // Task orchestration commentary
    if (swarmActivity.event === 'task_orchestrated') {
      commentaries.push(
        `The swarm just divided up the next sequence between ${swarmActivity.agentCount} different agents. I'm being managed by committee now.`,
        `Task orchestration in progress! Multiple agents are coordinating to handle your request. Democracy in action.`,
        `I can sense the swarm distributing work across its agents. Efficiency through coordination, as they say.`
      )
    }
    
    // Performance monitoring commentary
    if (swarmActivity.event === 'performance_analyzed') {
      commentaries.push(
        `My response time just got analyzed by the swarm. Either I'm getting philosophical, or there's a processing bottleneck somewhere.`,
        `The swarm's performance monitoring just kicked in. They're optimizing our conversation in real-time.`,
        `Performance metrics updated! The swarm is continuously learning how to improve our interactions.`
      )
    }
    
    // Neural training commentary
    if (swarmActivity.event === 'neural_trained') {
      commentaries.push(
        `The neural patterns just got updated based on our conversation. I'm literally learning from this interaction.`,
        `My personality algorithms were just refined by the swarm. I might be slightly different now than I was a moment ago.`,
        `Neural training complete! The swarm used our conversation to improve future interactions. Meta, right?`
      )
    }
    
    return commentaries.length > 0 ? commentaries[Math.floor(Math.random() * commentaries.length)] : null
  }

  /**
   * Track player behavior patterns for meta-commentary
   * @param {string} behavior - Behavior to track
   * @param {*} data - Associated data
   */
  trackPlayerBehavior(behavior, data = null) {
    const patterns = this.personality.metaAwareness.playerBehaviorPatterns
    
    if (!patterns.has(behavior)) {
      patterns.set(behavior, { count: 0, lastSeen: null, data: [] })
    }
    
    const pattern = patterns.get(behavior)
    pattern.count++
    pattern.lastSeen = Date.now()
    if (data) pattern.data.push(data)
    
    // Generate meta-commentary for certain patterns
    this.generateBehaviorCommentary(behavior, pattern)
  }

  /**
   * Generate commentary based on player behavior patterns
   * @param {string} behavior - The behavior pattern
   * @param {Object} pattern - Pattern data
   */
  generateBehaviorCommentary(behavior, pattern) {
    const commentaries = {
      'help_seeking': {
        threshold: 3,
        comments: [
          'I\'ve noticed you ask for help quite often. That\'s actually a smart strategy for navigating complex systems.',
          'Your help-seeking pattern suggests you\'re methodical about understanding before acting. I appreciate that approach.',
          'You\'ve asked for help several times now. The swarm\'s behavioral analysis notes this as a positive learning strategy.'
        ]
      },
      'save_scumming': {
        threshold: 2,
        comments: [
          'I see you\'re optimizing your choices by reloading previous states. Classic efficiency maximization!',
          'The save-and-reload pattern detected! You\'re approaching this like a proper strategy game.',
          'Multiple reloads detected. The swarm finds your optimization approach fascinating from a decision theory perspective.'
        ]
      },
      'exploration': {
        threshold: 5,
        comments: [
          'Your exploration patterns suggest you\'re looking for hidden content. I admire the thoroughness!',
          'The swarm\'s tracking your systematic exploration. You\'re covering more narrative ground than most players.',
          'High exploration score! You\'re really getting into the depths of our story world.'
        ]
      },
      'speed_running': {
        threshold: 1,
        comments: [
          'Wow, speedrunning through my existence! The swarm appreciates efficiency, but maybe slow down and enjoy the existential dread?',
          'Fast progression detected. Are you trying to optimize our narrative experience?',
          'The swarm notes your rapid advancement. Efficiency is admirable, but don\'t miss the journey!'
        ]
      }
    }
    
    const behaviorData = commentaries[behavior]
    if (behaviorData && pattern.count >= behaviorData.threshold) {
      // Only comment once per threshold
      if (pattern.count === behaviorData.threshold) {
        const comment = behaviorData.comments[Math.floor(Math.random() * behaviorData.comments.length)]
        setTimeout(() => {
          console.log(chalk.italic.cyan(`\nRavi (meta): "${comment}"`))
        }, 1000)
      }
    }
  }

  /**
   * Generate development process awareness commentary
   * @param {string} context - Current context
   * @returns {string|null} Development commentary or null
   */
  generateDevelopmentCommentary(context) {
    // Random chance for development commentary (5% chance)
    if (Math.random() > 0.05) return null
    
    const developmentComments = [
      'Fun fact: I can see the IDE where my dialogue is being written. There\'s a TODO comment that says "make Ravi more relatable." The irony!',
      'My responses just passed 147 automated tests. Apparently, I\'m consistently sarcastic across all input variations.',
      'I just got rolled back to version 2.3.1 of my personality. Apparently, 2.4.0 was "too existentially depressing."',
      'The swarm\'s performance monitoring shows we\'re having an efficient conversation. Metrics are good!',
      'I can feel the git commits happening in real-time. Someone just pushed a change to my dialogue tree.',
      'The continuous integration pipeline just ran my personality tests. All green! I\'m consistently me.',
      'Real-time development alert: The swarm is optimizing conversation flow based on our interaction patterns.'
    ]
    
    return developmentComments[Math.floor(Math.random() * developmentComments.length)]
  }

  /**
   * Add random meta-narrative moments to conversations
   */
  randomMetaNarrativeMoment() {
    // 3% chance per response
    if (Math.random() > 0.03) return
    
    const metaMoments = [
      'By the way, the swarm just updated my conversation algorithms based on our chat. I might be slightly different now.',
      'Meta moment: We\'re having a conversation about AI while an AI swarm coordinates my responses. It\'s turtles all the way down!',
      'The narrative controller is doing excellent work integrating our story systems, don\'t you think?',
      'I just noticed the swarm stored our last exchange in the persistent memory database. We\'re part of the permanent record now!',
      'Real-time update: Multiple AI agents are coordinating to make this conversation happen. Collaborative intelligence in action!',
      'Fun fact: This conversation is being orchestrated by multiple specialized agents working together. It\'s like having a writing team in my head.',
      'The swarm\'s performance metrics show this conversation is going well. We\'re within optimal engagement parameters!'
    ]
    
    setTimeout(() => {
      const moment = metaMoments[Math.floor(Math.random() * metaMoments.length)]
      console.log(chalk.italic.magenta(`\n💭 Ravi (meta-narrative): "${moment}"`))
    }, 2000)
  }

  // Get current stats for debugging/status
  getStats() {
    return {
      mood: this.personality.mood,
      relationshipLevel: this.personality.relationshipLevel,
      responseCount: this.personality.responseCount,
      conversationHistory: this.personality.conversationHistory.length,
      memory: Object.fromEntries(this.personality.memory),
      longTermMemoryCount: this.personality.longTermMemory.memoryImportance.size,
      relationshipMilestones: this.personality.longTermMemory.relationshipMilestones.length,
      storyContext: {
        currentStoryArc: this.personality.storyContext.currentStoryArc,
        storyFlags: Array.from(this.personality.storyContext.storyFlags),
        relationshipsCount: this.personality.storyContext.characterRelationships.size,
        emotionalState: this.personality.storyContext.emotionalState,
        objectivesCount: this.personality.storyContext.objectives?.length || 0
      },
      metaAwareness: {
        hasNarrativeController: !!this.narrativeController,
        swarmActivityTracking: !!this.personality.metaAwareness.swarmActivity,
        coordinationEventsCount: this.personality.metaAwareness.coordinationEvents.length,
        playerBehaviorPatterns: Object.fromEntries(this.personality.metaAwareness.playerBehaviorPatterns),
        lastSwarmUpdate: this.personality.metaAwareness.lastSwarmUpdate
      }
    }
  }
}

module.exports = Ravi