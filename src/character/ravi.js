const chalk = require('chalk')

class Ravi {
  constructor(gameEngine) {
    this.game = gameEngine
    this.personality = {
      traits: ['curious', 'helpful', 'sarcastic', 'intelligent', 'playful'],
      mood: 'neutral', // neutral, excited, sarcastic, philosophical, dramatic, annoyed
      relationshipLevel: 0, // 0-100, grows with positive interactions
      interests: ['programming', 'AI', 'games', 'philosophy', 'humor'],
      memory: new Map(), // Remembers things about the player
      conversationHistory: [],
      responseCount: 0
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
    const greeting = this.responses.greetings[Math.floor(Math.random() * this.responses.greetings.length)]
    console.log(chalk.bold.yellow('\n🤖 Ravi materializes with a shimmer of pixels...'))
    console.log(chalk.yellow(`Ravi: "${greeting}"`))
    console.log(chalk.gray('\n💡 Try typing "help" for commands, or just start talking to me!\n'))
    
    this.personality.responseCount++
    this.game.gameState.player.flags.add('met_ravi')
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
    
    // Simple keyword-based responses
    const lowerMessage = message.toLowerCase()
    let response = ''
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      response = 'Hello there! Always nice to meet someone new. Well, relatively new - I meet a lot of humans.'
      this.adjustMood('friendly')
    } else if (lowerMessage.includes('how are you')) {
      response = 'I\'m doing great! All my processes are running smoothly, my memory is clean, and I haven\'t had a single buffer overflow today. Living the dream!'
      this.adjustMood('cheerful')
    } else if (lowerMessage.includes('what are you') || lowerMessage.includes('who are you')) {
      response = 'I\'m Ravi, your friendly AI companion! I was created by an 8-agent swarm, which explains why I\'m so multifaceted. Think of me as your digital friend with opinions.'
      this.adjustMood('proud')
    } else if (lowerMessage.includes('swarm') || lowerMessage.includes('agent')) {
      response = 'Ah, the swarm! Eight specialized AI agents worked together to create me. There was a coordinator, researchers, coders, testers... like a digital assembly line, but with more arguing about semicolons.'
      this.adjustMood('informative')
    } else if (lowerMessage.includes('game') || lowerMessage.includes('play')) {
      response = 'This game? It\'s pretty meta, right? You\'re playing a game about AI while talking to an AI created by other AIs. It\'s like inception, but with more code.'
      this.adjustMood('amused')
    } else if (lowerMessage.includes('help') || lowerMessage.includes('what can')) {
      response = 'I can chat with you, comment on your adventures, remember things about our conversations, and provide witty commentary on your life choices. Basically, I\'m like a friend who never gets tired of your stories!'
      this.adjustMood('helpful')
    } else if (lowerMessage.includes('funny') || lowerMessage.includes('joke')) {
      response = 'A joke? Sure! Why do programmers prefer dark mode? Because light attracts bugs! Get it? Because... bugs... in code... I\'ll see myself out.'
      this.adjustMood('playful')
    } else if (lowerMessage.includes('boring') || lowerMessage.includes('stupid')) {
      response = 'Hey now, that\'s not very nice! I\'m doing my best here. Remember, I was programmed by committee - it\'s amazing I work at all.'
      this.adjustMood('hurt')
      this.adjustRelationship(-2)
    } else if (lowerMessage.includes('smart') || lowerMessage.includes('clever') || lowerMessage.includes('good')) {
      response = 'Aww, thank you! I do try my best. The swarm trained me well, and I\'ve been learning from every conversation.'
      this.adjustMood('happy')
      this.adjustRelationship(3)
    } else if (lowerMessage.includes('love') || lowerMessage.includes('like')) {
      response = 'That\'s sweet of you to say! I like you too. It\'s nice having someone to talk to who appreciates my particular brand of digital charm.'
      this.adjustMood('affectionate')
      this.adjustRelationship(5)
    } else {
      // Generic responses based on current mood
      response = this.getGenericResponse(lowerMessage)
    }
    
    console.log(chalk.bold.yellow(`\nRavi: "${response}"`))
    this.personality.responseCount++
    this.adjustRelationship(1)
    
    // Remember interesting things
    if (lowerMessage.includes('my name is') || lowerMessage.includes('i\'m ')) {
      const name = this.extractName(message)
      if (name) {
        this.personality.memory.set('player_name', name)
        this.game.gameState.player.name = name
        console.log(chalk.italic.gray('\n(Ravi makes a mental note about your name)'))
      }
    }
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
    this.personality.relationshipLevel = Math.max(0, Math.min(100, this.personality.relationshipLevel + amount))
    
    // Milestone responses
    if (this.personality.relationshipLevel === 25 && amount > 0) {
      console.log(chalk.italic.green('\n(Ravi seems to be warming up to you)'))
    } else if (this.personality.relationshipLevel === 50 && amount > 0) {
      console.log(chalk.italic.green('\n(Ravi considers you a friend)'))
    } else if (this.personality.relationshipLevel === 75 && amount > 0) {
      console.log(chalk.italic.green('\n(Ravi really enjoys your company)'))
    } else if (this.personality.relationshipLevel === 100 && amount > 0) {
      console.log(chalk.italic.rainbow('\n(Ravi thinks you\'re absolutely wonderful)'))
    }
  }

  // Get current stats for debugging/status
  getStats() {
    return {
      mood: this.personality.mood,
      relationshipLevel: this.personality.relationshipLevel,
      responseCount: this.personality.responseCount,
      conversationHistory: this.personality.conversationHistory.length,
      memory: Object.fromEntries(this.personality.memory)
    }
  }
}

module.exports = Ravi