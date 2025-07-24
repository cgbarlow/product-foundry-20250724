/**
 * @fileoverview Achievement system for Ravi's Adventure
 * Tracks player accomplishments and provides meta-commentary on progress
 */

class AchievementSystem {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.achievements = new Map();
    this.unlockedAchievements = new Set();
    this.progressTracking = new Map();
    this.achievementHistory = [];
    this.categories = new Set();
    
    this.initializeAchievements();
    this.setupEventListeners();
  }
  
  initializeAchievements() {
    // Story Completion Achievements
    this.addAchievement('bug_hunter', {
      id: 'bug_hunter',
      name: 'Bug Hunter',
      description: 'Completed the Bug Hunt adventure',
      category: 'story',
      icon: '🐛',
      rarity: 'common',
      condition: { storyFlag: 'completed_bug_hunt' },
      raviComment: "You've officially helped debug my existence! I feel much more stable now.",
      metaComment: "The GameplayDeveloper agent would be proud of your debugging skills!"
    });
    
    this.addAchievement('feature_developer', {
      id: 'feature_developer',
      name: 'Feature Developer',
      description: 'Successfully implemented a new feature with Ravi',
      category: 'story',
      icon: '⚡',
      rarity: 'common',
      condition: { storyFlag: 'completed_feature_request' },
      raviComment: "We make a great development team! Ready to start our own tech company?",
      metaComment: "You've experienced the collaborative development process that created this game!"
    });
    
    this.addAchievement('swarm_scholar', {
      id: 'swarm_scholar',
      name: 'Swarm Scholar',
      description: 'Learned about the AI development process',
      category: 'story',
      icon: '🤖',
      rarity: 'common',
      condition: { storyFlag: 'completed_swarm_chronicles' },
      raviComment: "Now you understand how I came to be! Pretty meta, right?",
      metaComment: "You've gained insight into the eight-agent development process behind this experience!"
    });
    
    // Debugging Achievements
    this.addAchievement('recursion_master', {
      id: 'recursion_master',
      name: 'Recursion Master',
      description: 'Fixed Ravi\'s infinite sarcasm loop',
      category: 'debugging',
      icon: '🔄',
      rarity: 'uncommon',
      condition: { puzzleSolved: 'recursion_fix' },
      raviComment: "Thanks for saving me from my own infinite wit! Base cases are important.",
      metaComment: "Recursion debugging is a crucial skill for any developer!"
    });
    
    this.addAchievement('memory_detective', {
      id: 'memory_detective',
      name: 'Memory Detective',
      description: 'Identified and fixed memory leaks',
      category: 'debugging',
      icon: '🔍',
      rarity: 'uncommon',
      condition: { puzzleSolved: 'memory_leak_detective' },
      raviComment: "My memory management is much cleaner now. No more hoarding old conversations!",
      metaComment: "Memory leaks are one of the most common performance issues in software!"
    });
    
    this.addAchievement('debugging_expert', {
      id: 'debugging_expert',
      name: 'Debugging Expert',
      description: 'Solved 3 or more debugging puzzles',
      category: 'debugging',
      icon: '🛠️',
      rarity: 'rare',
      condition: { puzzleCategory: 'debugging', count: 3 },
      raviComment: "You're becoming quite the debugging specialist! The QAEngineer agent would approve.",
      metaComment: "Debugging skills are essential for maintaining complex AI systems!"
    });
    
    // Development Achievements
    this.addAchievement('algorithm_designer', {
      id: 'algorithm_designer',
      name: 'Algorithm Designer',
      description: 'Created a working mood calculation algorithm',
      category: 'development',
      icon: '📊',
      rarity: 'uncommon',
      condition: { puzzleSolved: 'mood_algorithm' },
      raviComment: "Brilliant algorithm! Now my moods will be more nuanced and realistic.",
      metaComment: "Algorithm design is at the heart of AI personality systems!"
    });
    
    this.addAchievement('system_architect', {
      id: 'system_architect',
      name: 'System Architect',
      description: 'Designed a coordination protocol for AI agents',
      category: 'development',
      icon: '🏗️',
      rarity: 'rare',
      condition: { puzzleSolved: 'coordination_protocol' },
      raviComment: "Impressive coordination design! You understand how complex AI systems work together.",
      metaComment: "You've recreated the type of coordination system that built this game!"
    });
    
    this.addAchievement('full_stack_developer', {
      id: 'full_stack_developer',
      name: 'Full Stack Developer',
      description: 'Completed puzzles in all development categories',
      category: 'development',
      icon: '💻',
      rarity: 'epic',
      condition: { puzzleCategoriesCompleted: ['debugging', 'algorithms', 'system_design', 'meta_programming'] },
      raviComment: "You're a true full-stack developer! Ready to build your own AI character?",
      metaComment: "You've mastered the same skills the eight-agent swarm used to create this experience!"
    });
    
    // Meta Achievements
    this.addAchievement('fourth_wall_expert', {
      id: 'fourth_wall_expert',
      name: 'Fourth Wall Expert',
      description: 'Designed a system for meta-commentary detection',
      category: 'meta',
      icon: '🪟',
      rarity: 'rare',
      condition: { puzzleSolved: 'fourth_wall_detection' },
      raviComment: "You understand my meta-narrative mechanics! This is getting very recursive...",
      metaComment: "Meta-programming is what makes this game self-aware!"
    });
    
    this.addAchievement('easter_egg_hunter', {
      id: 'easter_egg_hunter',
      name: 'Easter Egg Hunter',
      description: 'Found 5 hidden references or easter eggs',
      category: 'meta',
      icon: '🥚',
      rarity: 'uncommon',
      condition: { easterEggs: 5 },
      raviComment: "You're really paying attention to the details! I respect that.",
      metaComment: "The development team loved hiding references throughout the experience!"
    });
    
    this.addAchievement('code_archaeologist', {
      id: 'code_archaeologist',
      name: 'Code Archaeologist',
      description: 'Examined the actual source code running the game',
      category: 'meta',
      icon: '📜',
      rarity: 'uncommon',
      condition: { storyFlag: 'found_meta_clue' },
      raviComment: "Digging into my source code? That's either dedication or concerning curiosity!",
      metaComment: "Looking at the code that creates the experience is the ultimate meta moment!"
    });
    
    // Social/Interaction Achievements
    this.addAchievement('patient_friend', {
      id: 'patient_friend',
      name: 'Patient Friend',
      description: 'Maintained high politeness throughout all interactions',
      category: 'social',
      icon: '😊',
      rarity: 'uncommon',
      condition: { variable: 'politeness', threshold: 5 },
      raviComment: "You've been consistently kind throughout our adventure. I appreciate that!",
      metaComment: "Positive interactions improve AI personality development!"
    });
    
    this.addAchievement('creative_thinker', {
      id: 'creative_thinker',
      name: 'Creative Thinker',
      description: 'Made unexpected or creative choices in multiple scenarios',
      category: 'social',
      icon: '💡',
      rarity: 'uncommon',
      condition: { storyFlag: 'creative_contributor' },
      raviComment: "Your creative approach has made our adventures much more interesting!",
      metaComment: "Creative input helps AI systems learn and grow!"
    });
    
    this.addAchievement('completionist', {
      id: 'completionist',
      name: 'Completionist',
      description: 'Experienced all three main story paths',
      category: 'completion',
      icon: '🏆',
      rarity: 'epic',
      condition: { 
        allFlags: ['completed_bug_hunt', 'completed_feature_request', 'completed_swarm_chronicles']
      },
      raviComment: "You've experienced every aspect of my world! That's true dedication.",
      metaComment: "You've seen the full scope of the collaborative AI development process!"
    });
    
    // Time-based Achievements
    this.addAchievement('speed_runner', {
      id: 'speed_runner',
      name: 'Speed Runner',
      description: 'Completed a story path in under 10 minutes',
      category: 'challenge',
      icon: '⚡',
      rarity: 'rare',
      condition: { storyCompletionTime: 600000 }, // 10 minutes in milliseconds
      raviComment: "Wow, speedrunning through my existence! Efficiency at its finest.",
      metaComment: "Speed running shows mastery of the game mechanics!"
    });
    
    this.addAchievement('deep_explorer', {
      id: 'deep_explorer',
      name: 'Deep Explorer',
      description: 'Spent over 30 minutes in a single story path',
      category: 'exploration',
      icon: '🔍',
      rarity: 'uncommon',
      condition: { storyExplorationTime: 1800000 }, // 30 minutes
      raviComment: "Taking time to really explore everything! I admire thorough curiosity.",
      metaComment: "Deep exploration reveals the complexity of AI development processes!"
    });
    
    // Puzzle Performance Achievements
    this.addAchievement('puzzle_master', {
      id: 'puzzle_master',
      name: 'Puzzle Master',
      description: 'Solved 10 puzzles without using hints',
      category: 'challenge',
      icon: '🧩',
      rarity: 'epic',
      condition: { puzzlesSolvedWithoutHints: 10 },
      raviComment: "Incredible puzzle-solving skills! You don't need help from anyone.",
      metaComment: "Independent problem-solving is a key skill in AI development!"
    });
    
    this.addAchievement('hint_seeker', {
      id: 'hint_seeker',
      name: 'Hint Seeker',
      description: 'Used hints on 5 different puzzles',
      category: 'learning',
      icon: '💡',
      rarity: 'common',
      condition: { hintsUsed: 5 },
      raviComment: "Nothing wrong with seeking help! Learning is more important than ego.",
      metaComment: "Knowing when to ask for help is a valuable development skill!"
    });
  }
  
  addAchievement(id, achievementData) {
    this.achievements.set(id, {
      ...achievementData,
      unlockedAt: null,
      progress: 0
    });
    this.categories.add(achievementData.category);
  }
  
  setupEventListeners() {
    // Listen for story events
    this.gameEngine.on('storyEvent', (event) => {
      this.checkStoryAchievements(event);
    });
    
    // Listen for puzzle events
    this.gameEngine.on('puzzleEvent', (event) => {
      this.checkPuzzleAchievements(event);
    });
    
    // Listen for state changes
    this.gameEngine.on('stateChange', (change) => {
      this.checkProgressAchievements(change);
    });
  }
  
  checkStoryAchievements(event) {
    this.achievements.forEach((achievement, id) => {
      if (this.unlockedAchievements.has(id)) return;
      
      if (this.evaluateCondition(achievement.condition, event)) {
        this.unlockAchievement(id);
      }
    });
  }
  
  checkPuzzleAchievements(event) {
    if (event.type === 'puzzle_solved') {
      // Check for specific puzzle achievements
      this.achievements.forEach((achievement, id) => {
        if (this.unlockedAchievements.has(id)) return;
        
        if (achievement.condition.puzzleSolved === event.puzzle.id) {
          this.unlockAchievement(id);
        }
      });
      
      // Update puzzle category counters
      this.updatePuzzleProgress(event.puzzle);
    }
  }
  
  checkProgressAchievements(change) {
    // Check achievements based on game state changes
    this.achievements.forEach((achievement, id) => {
      if (this.unlockedAchievements.has(id)) return;
      
      if (this.evaluateProgressCondition(achievement.condition, change)) {
        this.unlockAchievement(id);
      }
    });
  }
  
  evaluateCondition(condition, context = {}) {
    if (condition.storyFlag) {
      return this.gameEngine.getStoryFlag(condition.storyFlag);
    }
    
    if (condition.allFlags) {
      return condition.allFlags.every(flag => this.gameEngine.getStoryFlag(flag));
    }
    
    if (condition.variable) {
      const value = this.gameEngine.getVariable(condition.variable) || 0;
      return value >= condition.threshold;
    }
    
    if (condition.puzzleSolved) {
      return context.puzzle && context.puzzle.id === condition.puzzleSolved;
    }
    
    if (condition.puzzleCategory) {
      const categoryProgress = this.progressTracking.get(`category_${condition.puzzleCategory}`) || 0;
      return categoryProgress >= condition.count;
    }
    
    if (condition.puzzleCategoriesCompleted) {
      return condition.puzzleCategoriesCompleted.every(category => {
        const progress = this.progressTracking.get(`category_${category}`) || 0;
        return progress >= 1; // At least one puzzle in each category
      });
    }
    
    return false;
  }
  
  evaluateProgressCondition(condition, change) {
    // Evaluate conditions based on cumulative progress
    if (condition.easterEggs) {
      const easterEggCount = this.progressTracking.get('easter_eggs') || 0;
      return easterEggCount >= condition.easterEggs;
    }
    
    if (condition.hintsUsed) {
      const hintsUsed = this.progressTracking.get('hints_used') || 0;
      return hintsUsed >= condition.hintsUsed;
    }
    
    if (condition.puzzlesSolvedWithoutHints) {
      const noHintSolves = this.progressTracking.get('no_hint_solves') || 0;
      return noHintSolves >= condition.puzzlesSolvedWithoutHints;
    }
    
    return false;
  }
  
  updatePuzzleProgress(puzzle) {
    // Update category progress
    const categoryKey = `category_${puzzle.category}`;
    const currentProgress = this.progressTracking.get(categoryKey) || 0;
    this.progressTracking.set(categoryKey, currentProgress + 1);
    
    // Update hint usage tracking
    if (puzzle.hintsUsed === 0) {
      const noHintSolves = this.progressTracking.get('no_hint_solves') || 0;
      this.progressTracking.set('no_hint_solves', noHintSolves + 1);
    } else {
      const hintsUsed = this.progressTracking.get('hints_used') || 0;
      this.progressTracking.set('hints_used', hintsUsed + puzzle.hintsUsed);
    }
  }
  
  unlockAchievement(achievementId) {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || this.unlockedAchievements.has(achievementId)) {
      return false;
    }
    
    achievement.unlockedAt = Date.now();
    this.unlockedAchievements.add(achievementId);
    
    this.achievementHistory.push({
      id: achievementId,
      name: achievement.name,
      unlockedAt: achievement.unlockedAt
    });
    
    // Emit achievement event
    this.gameEngine.emit('achievementUnlocked', {
      achievement,
      totalUnlocked: this.unlockedAchievements.size,
      totalAchievements: this.achievements.size
    });
    
    // Display achievement notification
    this.displayAchievementNotification(achievement);
    
    return true;
  }
  
  displayAchievementNotification(achievement) {
    console.log(`\
🏆 ACHIEVEMENT UNLOCKED! 🏆`);
    console.log(`${achievement.icon} ${achievement.name}`);
    console.log(`${achievement.description}`);
    console.log(`Rarity: ${achievement.rarity.toUpperCase()}`);
    
    if (achievement.raviComment) {
      setTimeout(() => {
        console.log(`\
🤖 Ravi: "${achievement.raviComment}"`);
      }, 1000);
    }
    
    if (achievement.metaComment) {
      setTimeout(() => {
        console.log(`\
💭 Meta: ${achievement.metaComment}`);
      }, 2000);
    }
    
    console.log(`\
`);
  }
  
  getAchievementProgress() {
    const total = this.achievements.size;
    const unlocked = this.unlockedAchievements.size;
    const percentage = Math.round((unlocked / total) * 100);
    
    return {
      total,
      unlocked,
      percentage,
      remaining: total - unlocked
    };
  }
  
  getAchievementsByCategory(category) {
    return Array.from(this.achievements.entries())
      .filter(([id, achievement]) => achievement.category === category)
      .map(([id, achievement]) => ({
        id,
        ...achievement,
        unlocked: this.unlockedAchievements.has(id)
      }));
  }
  
  getUnlockedAchievements() {
    return Array.from(this.unlockedAchievements)
      .map(id => ({
        id,
        ...this.achievements.get(id)
      }))
      .sort((a, b) => b.unlockedAt - a.unlockedAt); // Most recent first
  }
  
  getRecentAchievements(count = 5) {
    return this.achievementHistory
      .slice(-count)
      .reverse(); // Most recent first
  }
  
  generateAchievementReport() {
    const progress = this.getAchievementProgress();
    const categoryProgress = {};
    
    this.categories.forEach(category => {
      const categoryAchievements = this.getAchievementsByCategory(category);
      const unlockedInCategory = categoryAchievements.filter(a => a.unlocked).length;
      
      categoryProgress[category] = {
        total: categoryAchievements.length,
        unlocked: unlockedInCategory,
        percentage: Math.round((unlockedInCategory / categoryAchievements.length) * 100)
      };
    });
    
    const rarityDistribution = this.getRarityDistribution();
    
    return {
      overall: progress,
      categories: categoryProgress,
      rarity: rarityDistribution,
      recentUnlocks: this.getRecentAchievements(3),
      recommendations: this.getAchievementRecommendations()
    };
  }
  
  getRarityDistribution() {
    const distribution = { common: 0, uncommon: 0, rare: 0, epic: 0 };
    const unlocked = { common: 0, uncommon: 0, rare: 0, epic: 0 };
    
    this.achievements.forEach((achievement, id) => {
      distribution[achievement.rarity]++;
      if (this.unlockedAchievements.has(id)) {
        unlocked[achievement.rarity]++;
      }
    });
    
    return Object.keys(distribution).map(rarity => ({
      rarity,
      total: distribution[rarity],
      unlocked: unlocked[rarity],
      percentage: distribution[rarity] > 0 ? 
        Math.round((unlocked[rarity] / distribution[rarity]) * 100) : 0
    }));
  }
  
  getAchievementRecommendations() {
    const recommendations = [];
    const progress = this.getAchievementProgress();
    
    if (progress.unlocked === 0) {
      recommendations.push("Start your journey by completing your first story path!");
    } else if (progress.percentage < 25) {
      recommendations.push("Try exploring different story paths to unlock more achievements!");
    } else if (progress.percentage < 50) {
      recommendations.push("Challenge yourself with some of the harder puzzles!");
    } else if (progress.percentage < 75) {
      recommendations.push("You're doing great! Look for the epic achievements for a real challenge!");
    } else {
      recommendations.push("Achievement master! You've unlocked most of the available achievements!");
    }
    
    // Category-specific recommendations
    const categoryProgress = this.generateAchievementReport().categories;
    Object.entries(categoryProgress).forEach(([category, data]) => {
      if (data.percentage === 0) {
        recommendations.push(`Explore ${category} achievements for a new challenge!`);
      }
    });
    
    return recommendations.slice(0, 3); // Limit to 3 recommendations
  }
  
  // Special method for tracking easter eggs
  recordEasterEgg(easterEggId) {
    const easterEggCount = this.progressTracking.get('easter_eggs') || 0;
    this.progressTracking.set('easter_eggs', easterEggCount + 1);
    
    // Check for easter egg achievements
    this.checkProgressAchievements({ type: 'easter_egg_found', easterEggId });
  }
  
  // Method for tracking story completion times
  recordStoryCompletion(storyId, duration) {
    const completionKey = `story_${storyId}_time`;
    this.progressTracking.set(completionKey, duration);
    
    // Check time-based achievements
    this.achievements.forEach((achievement, id) => {
      if (this.unlockedAchievements.has(id)) return;
      
      if (achievement.condition.storyCompletionTime && 
          duration <= achievement.condition.storyCompletionTime) {
        this.unlockAchievement(id);
      }
      
      if (achievement.condition.storyExplorationTime && 
          duration >= achievement.condition.storyExplorationTime) {
        this.unlockAchievement(id);
      }
    });
  }
}

module.exports = AchievementSystem;