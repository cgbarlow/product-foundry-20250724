/**
 * @fileoverview Gameplay integration system for Ravi's Adventure
 * Connects stories, puzzles, achievements, and meta-narrative elements
 */

const PuzzleSystem = require('./puzzle-system');
const AchievementSystem = require('./achievement-system');

class GameplayIntegration {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.puzzleSystem = new PuzzleSystem(gameEngine);
    this.achievementSystem = new AchievementSystem(gameEngine);
    this.metaNarrative = new MetaNarrativeManager(gameEngine);
    this.swarmIntegration = new SwarmIntegrationManager(gameEngine);
    
    this.setupIntegrations();
  }
  
  setupIntegrations() {
    // Connect puzzle completion to story progression
    this.gameEngine.on('puzzleEvent', (event) => {
      if (event.type === 'puzzle_solved') {
        this.handlePuzzleSolution(event);
      }
    });
    
    // Connect achievements to meta-commentary
    this.gameEngine.on('achievementUnlocked', (event) => {
      this.metaNarrative.handleAchievementUnlock(event);
    });
    
    // Connect story events to swarm commentary
    this.gameEngine.on('storyEvent', (event) => {
      this.swarmIntegration.handleStoryEvent(event);
    });
    
    // Track player behavior for adaptive content
    this.gameEngine.on('stateChange', (change) => {
      this.metaNarrative.analyzePlayerBehavior(change);
    });
  }
  
  handlePuzzleSolution(event) {
    const puzzle = event.puzzle;
    
    // Award story progression based on puzzle type
    if (puzzle.category === 'debugging') {
      this.gameEngine.setStoryFlag('debugging_skills_improved', true);
    } else if (puzzle.category === 'system_design') {
      this.gameEngine.setStoryFlag('architectural_understanding', true);
    }
    
    // Trigger Ravi's response to puzzle completion
    setTimeout(() => {
      this.triggerRaviPuzzleResponse(puzzle);
    }, 2000);
  }
  
  triggerRaviPuzzleResponse(puzzle) {
    const responses = {
      'recursion_fix': [
        'Ah, you fixed my infinite loop! I was stuck in a recursive spiral of sarcasm.',
        'Now I can be appropriately sarcastic without crashing the entire conversation system.',
        'The GameplayDeveloper agent would be proud - you\'ve debugged your first AI personality bug!'
      ],
      'memory_leak_detective': [
        'Excellent memory management! I won\'t be hoarding conversations forever now.',
        'It\'s funny how even AI characters can have memory problems. Very meta.',
        'You\'ve learned an important lesson about resource management in AI systems.'
      ],
      'mood_algorithm': [
        "Brilliant mood system! I can feel my emotional range expanding already.",
        "With this algorithm, my responses will be much more nuanced and context-aware.",
        "The NarrativeWriter agent designed my base personality, but you've enhanced it!"
      ],
      'coordination_protocol': [
        "Impressive coordination design! You understand how complex AI teams work together.",
        "This is exactly the kind of system the SwarmLead agent used to coordinate my creation.",
        "You've recreated the coordination patterns that made my existence possible!"
      ]
    };
    
    const puzzleResponses = responses[puzzle.id];
    if (puzzleResponses) {
      puzzleResponses.forEach((response, index) => {
        setTimeout(() => {
          this.gameEngine.emit('characterSpeak', response);
        }, index * 2000);
      });
    }
  }
  
  // Public API for story integration
  startInteractivePuzzle(puzzleId, context = {}) {
    const puzzle = this.puzzleSystem.startPuzzle(puzzleId);
    
    // Add story context to puzzle
    puzzle.storyContext = context;
    
    // Display puzzle in story format
    return this.formatPuzzleForStory(puzzle);
  }
  
  formatPuzzleForStory(puzzle) {
    return {
      title: `🧩 Interactive Challenge: ${puzzle.title}`,
      text: `
${puzzle.description}

**The Problem:**
\`\`\`javascript
${puzzle.problem}
\`\`\`

**Your Task:** Write a solution that addresses the requirements.
**Difficulty:** ${'★'.repeat(puzzle.difficulty)}${'☆'.repeat(5 - puzzle.difficulty)}
**Category:** ${puzzle.category.charAt(0).toUpperCase() + puzzle.category.slice(1)}

*Type your solution or ask for a hint if you need help.*`,
      choices: [
        {
          id: 'submit_solution',
          text: 'Submit your solution',
          action: 'puzzle_input'
        },
        {
          id: 'get_hint',
          text: 'Get a hint',
          action: 'puzzle_hint'
        },
        {
          id: 'skip_puzzle',
          text: 'Skip this puzzle for now',
          action: 'puzzle_skip'
        }
      ]
    };
  }
  
  getPlayerProgressSummary() {
    const puzzleProgress = this.puzzleSystem.getPlayerProgress();
    const achievementProgress = this.achievementSystem.getAchievementProgress();
    const metaInsights = this.metaNarrative.getPlayerInsights();
    
    return {
      puzzles: puzzleProgress,
      achievements: achievementProgress,
      meta: metaInsights,
      recommendations: this.generatePersonalizedRecommendations()
    };
  }
  
  generatePersonalizedRecommendations() {
    const progress = this.getPlayerProgressSummary();
    const recommendations = [];
    
    // Puzzle recommendations
    if (progress.puzzles.completedPuzzles === 0) {
      recommendations.push({
        type: 'puzzle',
        message: 'Try your first puzzle! Start with a debugging challenge.',
        action: 'start_puzzle:recursion_fix'
      });
    } else if (progress.puzzles.favoriteCategory) {
      recommendations.push({
        type: 'puzzle',
        message: `You seem to enjoy ${progress.puzzles.favoriteCategory} puzzles. Try an advanced one!`,
        action: `explore_category:${progress.puzzles.favoriteCategory}`
      });
    }
    
    // Story recommendations
    if (!this.gameEngine.getStoryFlag('completed_bug_hunt')) {
      recommendations.push({
        type: 'story',
        message: 'Experience the Bug Hunt adventure to learn about debugging!',
        action: 'start_story:bug-hunt'
      });
    }
    
    // Achievement recommendations
    if (progress.achievements.percentage < 25) {
      recommendations.push({
        type: 'achievement',
        message: 'Unlock your first few achievements by exploring different story paths!',
        action: 'view_achievements'
      });
    }
    
    return recommendations.slice(0, 3);
  }
}

class MetaNarrativeManager {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.playerBehaviorProfile = {
      explorationStyle: 'balanced', // thorough, speedy, balanced
      learningPreference: 'unknown', // visual, practical, theoretical
      challengeLevel: 'beginner', // beginner, intermediate, advanced
      metaAwareness: 0, // 0-10 scale
      interactionPattern: 'polite' // polite, curious, impatient, creative
    };
    this.metaCommentaryTriggers = new Map();
    this.setupMetaTriggers();
  }
  
  setupMetaTriggers() {
    // Meta-commentary triggers based on player behavior
    this.metaCommentaryTriggers.set('code_inspection', {
      condition: (context) => context.type === 'story_flag' && context.flag === 'found_meta_clue',
      response: "I see you're looking at my source code. That's either very meta or very concerning!",
      metaLevel: 8
    });
    
    this.metaCommentaryTriggers.set('achievement_hunter', {
      condition: (context) => context.type === 'achievement_unlocked' && context.achievement.rarity === 'epic',
      response: "Wow, an epic achievement! You're really diving deep into every aspect of this experience.",
      metaLevel: 6
    });
    
    this.metaCommentaryTriggers.set('puzzle_master', {
      condition: (context) => context.type === 'puzzle_solved' && context.puzzle.difficulty >= 4,
      response: "That was a challenging puzzle! You're developing some serious AI development skills.",
      metaLevel: 4
    });
    
    this.metaCommentaryTriggers.set('swarm_understanding', {
      condition: (context) => context.type === 'story_completion' && context.story === 'swarm-chronicles',
      response: "Now you understand how the eight-agent swarm created me. Pretty wild, right?",
      metaLevel: 9
    });
  }
  
  analyzePlayerBehavior(change) {
    // Update player behavior profile based on actions
    if (change.type === 'puzzle_solved') {
      this.updateChallengeLevel(change.puzzle.difficulty);
    }
    
    if (change.type === 'story_flag' && change.flag === 'found_meta_clue') {
      this.playerBehaviorProfile.metaAwareness = Math.min(10, this.playerBehaviorProfile.metaAwareness + 2);
    }
    
    if (change.type === 'command_executed') {
      this.updateInteractionPattern(change.command);
    }
    
    // Check for meta-commentary triggers
    this.checkMetaTriggers(change);
  }
  
  updateChallengeLevel(difficulty) {
    const currentLevel = this.playerBehaviorProfile.challengeLevel;
    
    if (difficulty >= 4 && currentLevel === 'beginner') {
      this.playerBehaviorProfile.challengeLevel = 'intermediate';
    } else if (difficulty >= 5 && currentLevel === 'intermediate') {
      this.playerBehaviorProfile.challengeLevel = 'advanced';
    }
  }
  
  updateInteractionPattern(command) {
    if (command.includes('please') || command.includes('thank')) {
      this.playerBehaviorProfile.interactionPattern = 'polite';
    } else if (command.includes('?') || command.includes('how') || command.includes('why')) {
      this.playerBehaviorProfile.interactionPattern = 'curious';
    }
  }
  
  checkMetaTriggers(context) {
    this.metaCommentaryTriggers.forEach((trigger, id) => {
      if (trigger.condition(context)) {
        this.triggerMetaCommentary(trigger);
      }
    });
  }
  
  triggerMetaCommentary(trigger) {
    setTimeout(() => {
      this.gameEngine.emit('metaCommentary', {
        message: trigger.response,
        level: trigger.metaLevel,
        playerProfile: this.playerBehaviorProfile
      });
    }, 1500);
  }
  
  handleAchievementUnlock(event) {
    const achievement = event.achievement;
    
    // Trigger specific meta-commentary for achievements
    if (achievement.metaComment) {
      setTimeout(() => {
        this.gameEngine.emit('metaCommentary', {
          message: achievement.metaComment,
          level: 7,
          type: 'achievement_meta'
        });
      }, 3000);
    }
  }
  
  getPlayerInsights() {
    return {
      profile: this.playerBehaviorProfile,
      metaAwarenessLevel: this.getMetaAwarenessDescription(),
      personalizedContent: this.generatePersonalizedContent()
    };
  }
  
  getMetaAwarenessDescription() {
    const level = this.playerBehaviorProfile.metaAwareness;
    
    if (level <= 2) return "Beginning to notice the meta-elements";
    if (level <= 5) return "Actively exploring the meta-narrative";
    if (level <= 7) return "Highly aware of the self-referential aspects";
    if (level <= 9) return "Master of the meta-game";
    return "Transcended the fourth wall entirely";
  }
  
  generatePersonalizedContent() {
    const profile = this.playerBehaviorProfile;
    const content = [];
    
    if (profile.challengeLevel === 'advanced') {
      content.push("Advanced puzzles and deep system design challenges");
    }
    
    if (profile.metaAwareness >= 6) {
      content.push("Extended meta-commentary and fourth-wall interactions");
    }
    
    if (profile.interactionPattern === 'curious') {
      content.push("Additional explanatory content and behind-the-scenes insights");
    }
    
    return content;
  }
}

class SwarmIntegrationManager {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.swarmCommentary = new Map();
    this.activeAgentPresence = new Set();
    this.setupSwarmCommentary();
  }
  
  setupSwarmCommentary() {
    // Commentary from different agents based on story events
    this.swarmCommentary.set('bug_hunt_completion', {
      agents: ['QAEngineer', 'CoreDeveloper'],
      comments: {
        QAEngineer: "Excellent debugging work! You've demonstrated the methodical approach essential for quality assurance.",
        CoreDeveloper: "Your systematic debugging process mirrors the approach I used when building Ravi's core systems."
      }
    });
    
    this.swarmCommentary.set('feature_development', {
      agents: ['GameplayDeveloper', 'SystemArchitect'],
      comments: {
        GameplayDeveloper: "Collaborative feature development - exactly how I implemented Ravi's personality system!",
        SystemArchitect: "Your architectural thinking shows understanding of how complex systems are designed."
      }
    });
    
    this.swarmCommentary.set('swarm_learning', {
      agents: ['SwarmLead', 'NarrativeWriter'],
      comments: {
        SwarmLead: "You've grasped the coordination principles that made our collaborative development possible.",
        NarrativeWriter: "Understanding our process adds depth to your appreciation of Ravi's character development."
      }
    });
  }
  
  handleStoryEvent(event) {
    if (event.type === 'story_completed') {
      this.triggerSwarmCommentary(event.storyId);
    }
    
    if (event.type === 'puzzle_solved' && event.puzzle.difficulty >= 4) {
      this.triggerAgentAppreciation(event.puzzle);
    }
  }
  
  triggerSwarmCommentary(storyId) {
    let commentaryKey;
    
    if (storyId === 'bug-hunt') {
      commentaryKey = 'bug_hunt_completion';
    } else if (storyId === 'feature-request') {
      commentaryKey = 'feature_development';
    } else if (storyId === 'swarm-chronicles') {
      commentaryKey = 'swarm_learning';
    }
    
    if (commentaryKey) {
      this.displaySwarmCommentary(commentaryKey);
    }
  }
  
  displaySwarmCommentary(commentaryKey) {
    const commentary = this.swarmCommentary.get(commentaryKey);
    if (!commentary) return;
    
    commentary.agents.forEach((agentName, index) => {
      setTimeout(() => {
        this.gameEngine.emit('swarmCommentary', {
          agent: agentName,
          message: commentary.comments[agentName],
          type: 'story_completion'
        });
      }, (index + 1) * 3000);
    });
  }
  
  triggerAgentAppreciation(puzzle) {
    const agentResponses = {
      'debugging': {
        agent: 'QAEngineer',
        message: "Your debugging methodology is spot-on. Quality assurance is all about systematic problem-solving."
      },
      'algorithms': {
        agent: 'CoreDeveloper',
        message: "Solid algorithmic thinking! This is the foundation of robust AI systems."
      },
      'system_design': {
        agent: 'SystemArchitect',
        message: "Excellent architectural reasoning. Complex systems require thoughtful design."
      },
      'meta_programming': {
        agent: 'GameplayDeveloper',
        message: "Impressive meta-programming concepts! You understand how self-aware systems work."
      }
    };
    
    const response = agentResponses[puzzle.category];
    if (response) {
      setTimeout(() => {
        this.gameEngine.emit('swarmCommentary', {
          agent: response.agent,
          message: response.message,
          type: 'puzzle_appreciation'
        });
      }, 2500);
    }
  }
  
  getActiveAgentPresence() {
    return Array.from(this.activeAgentPresence);
  }
}

module.exports = GameplayIntegration;