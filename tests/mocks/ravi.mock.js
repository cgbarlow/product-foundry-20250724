/**
 * Ravi Character Mock
 * QA Engineer: Mock Ravi for predictable testing
 */

class MockRavi {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.mood = 'sarcastic';
    this.relationship = 50;
    this.knownFacts = [];
    this.responseCount = 0;
    this.lastCommand = null;
  }
  
  // Core response generation
  generateResponse(context) {
    this.responseCount++;
    this.lastCommand = context.command;
    
    const responses = this.getResponsesForMood();
    const responseIndex = this.responseCount % responses.length;
    
    return {
      text: responses[responseIndex],
      mood: this.mood,
      relationship: this.relationship,
      context: context
    };
  }
  
  // Mood-based responses
  getResponsesForMood() {
    const responses = {
      sarcastic: [
        "Oh wonderful, another command. Let me guess, you want me to do something 'fun'?",
        "Right, because that worked out so well last time.",
        "Sure, I'll get right on that. *digital eye roll*",
        "Oh, the things I do for entertainment value."
      ],
      helpful: [
        "I'd be happy to help with that!",
        "Let me see what I can do for you.",
        "That sounds like a reasonable request.",
        "I'll take care of that right away."
      ],
      annoyed: [
        "Seriously? THAT'S what you want to do?",
        "I can't believe I have to deal with this.",
        "This is getting ridiculous.",
        "My patience is wearing thin."
      ],
      excited: [
        "Oh, this is going to be AMAZING!",
        "Finally, something interesting!",
        "I LOVE where this is going!",
        "This is exactly what I was hoping for!"
      ],
      philosophical: [
        "You know, this makes me think about the nature of choice...",
        "Isn't it interesting how we define reality?",
        "There's a deeper meaning to all of this, don't you think?",
        "Sometimes I wonder about the purpose of existence."
      ],
      dramatic: [
        "OH NO! This is TERRIBLE!",
        "The DRAMA! The SUSPENSE!",
        "THIS CHANGES EVERYTHING!",
        "I can't bear to watch... but I will!"
      ]
    };
    
    return responses[this.mood] || responses.sarcastic;
  }
  
  // Mood management
  setMood(newMood) {
    const validMoods = ['sarcastic', 'helpful', 'annoyed', 'excited', 'philosophical', 'dramatic'];
    if (validMoods.includes(newMood)) {
      this.mood = newMood;
      return true;
    }
    return false;
  }
  
  getMood() {
    return this.mood;
  }
  
  // Relationship management
  adjustRelationship(amount) {
    this.relationship = Math.max(0, Math.min(100, this.relationship + amount));
    
    // Mood changes based on relationship
    if (this.relationship < 25) {
      this.mood = 'annoyed';
    } else if (this.relationship > 75) {
      this.mood = 'helpful';
    }
    
    return this.relationship;
  }
  
  getRelationship() {
    return this.relationship;
  }
  
  // Knowledge management
  learnFact(fact) {
    if (!this.knownFacts.includes(fact)) {
      this.knownFacts.push(fact);
      return true;
    }
    return false;
  }
  
  knowsFact(fact) {
    return this.knownFacts.includes(fact);
  }
  
  getKnownFacts() {
    return [...this.knownFacts];
  }
  
  // Context-aware responses
  respondToCommand(command) {
    const context = {
      command: command.command,
      args: command.args,
      gameState: this.gameEngine.getState(),
      timestamp: Date.now()
    };
    
    return this.generateResponse(context);
  }
  
  respondToLocation(location) {
    const locationResponses = {
      living_room: "Ah, back to the living room. How... lived in.",
      kitchen: "The kitchen! Maybe you'll actually make something edible this time.",
      bedroom: "The bedroom. Don't get any weird ideas.",
      office: "Time to get some work done? Revolutionary concept.",
      garden: "Nature! How refreshingly analog.",
      basement: "Down we go into the depths. How symbolic.",
      attic: "The attic. Where old memories go to gather dust."
    };
    
    return locationResponses[location] || "Well, this is... a place.";
  }
  
  respondToInventoryChange(action, item) {
    if (action === 'take') {
      return `Oh good, more stuff to carry around. The ${item} will surely save the day.`;
    } else if (action === 'drop') {
      return `Finally! Getting rid of that ${item}. About time.`;
    }
    return "Things are changing. How unexpected.";
  }
  
  // Game event responses
  respondToGameEvent(eventType, data) {
    switch (eventType) {
      case 'game_start':
        return "Well well, another adventure begins. Try not to mess it up this time.";
      
      case 'game_save':
        return "Progress saved! Because apparently you can't finish this in one sitting.";
      
      case 'game_load':
        return "Back again? I suppose consistency is a virtue.";
      
      case 'achievement_unlocked':
        return `Congratulations! You unlocked '${data.achievement}'. I'm so proud.`;
      
      case 'chapter_complete':
        return "Chapter complete! Only several more to go. Pace yourself.";
      
      default:
        return "Something happened. How thrilling.";
    }
  }
  
  // Testing utilities
  getStats() {
    return {
      mood: this.mood,
      relationship: this.relationship,
      knownFacts: this.knownFacts.length,
      responseCount: this.responseCount,
      lastCommand: this.lastCommand
    };
  }
  
  resetStats() {
    this.responseCount = 0;
    this.lastCommand = null;
    this.knownFacts = [];
    this.relationship = 50;
    this.mood = 'sarcastic';
  }
}

module.exports = MockRavi;