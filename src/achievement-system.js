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
      description: 'Fixed Ravi\\'s infinite sarcasm loop',
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
      id: 'creative_thinker',\n      name: 'Creative Thinker',\n      description: 'Made unexpected or creative choices in multiple scenarios',\n      category: 'social',\n      icon: '💡',\n      rarity: 'uncommon',\n      condition: { storyFlag: 'creative_contributor' },\n      raviComment: \"Your creative approach has made our adventures much more interesting!\",\n      metaComment: \"Creative input helps AI systems learn and grow!\"\n    });\n    \n    this.addAchievement('completionist', {\n      id: 'completionist',\n      name: 'Completionist',\n      description: 'Experienced all three main story paths',\n      category: 'completion',\n      icon: '🏆',\n      rarity: 'epic',\n      condition: { \n        allFlags: ['completed_bug_hunt', 'completed_feature_request', 'completed_swarm_chronicles']\n      },\n      raviComment: \"You've experienced every aspect of my world! That's true dedication.\",\n      metaComment: \"You've seen the full scope of the collaborative AI development process!\"\n    });\n    \n    // Time-based Achievements\n    this.addAchievement('speed_runner', {\n      id: 'speed_runner',\n      name: 'Speed Runner',\n      description: 'Completed a story path in under 10 minutes',\n      category: 'challenge',\n      icon: '⚡',\n      rarity: 'rare',\n      condition: { storyCompletionTime: 600000 }, // 10 minutes in milliseconds\n      raviComment: \"Wow, speedrunning through my existence! Efficiency at its finest.\",\n      metaComment: \"Speed running shows mastery of the game mechanics!\"\n    });\n    \n    this.addAchievement('deep_explorer', {\n      id: 'deep_explorer',\n      name: 'Deep Explorer',\n      description: 'Spent over 30 minutes in a single story path',\n      category: 'exploration',\n      icon: '🔍',\n      rarity: 'uncommon',\n      condition: { storyExplorationTime: 1800000 }, // 30 minutes\n      raviComment: \"Taking time to really explore everything! I admire thorough curiosity.\",\n      metaComment: \"Deep exploration reveals the complexity of AI development processes!\"\n    });\n    \n    // Puzzle Performance Achievements\n    this.addAchievement('puzzle_master', {\n      id: 'puzzle_master',\n      name: 'Puzzle Master',\n      description: 'Solved 10 puzzles without using hints',\n      category: 'challenge',\n      icon: '🧩',\n      rarity: 'epic',\n      condition: { puzzlesSolvedWithoutHints: 10 },\n      raviComment: \"Incredible puzzle-solving skills! You don't need help from anyone.\",\n      metaComment: \"Independent problem-solving is a key skill in AI development!\"\n    });\n    \n    this.addAchievement('hint_seeker', {\n      id: 'hint_seeker',\n      name: 'Hint Seeker',\n      description: 'Used hints on 5 different puzzles',\n      category: 'learning',\n      icon: '💡',\n      rarity: 'common',\n      condition: { hintsUsed: 5 },\n      raviComment: \"Nothing wrong with seeking help! Learning is more important than ego.\",\n      metaComment: \"Knowing when to ask for help is a valuable development skill!\"\n    });\n  }\n  \n  addAchievement(id, achievementData) {\n    this.achievements.set(id, {\n      ...achievementData,\n      unlockedAt: null,\n      progress: 0\n    });\n    this.categories.add(achievementData.category);\n  }\n  \n  setupEventListeners() {\n    // Listen for story events\n    this.gameEngine.on('storyEvent', (event) => {\n      this.checkStoryAchievements(event);\n    });\n    \n    // Listen for puzzle events\n    this.gameEngine.on('puzzleEvent', (event) => {\n      this.checkPuzzleAchievements(event);\n    });\n    \n    // Listen for state changes\n    this.gameEngine.on('stateChange', (change) => {\n      this.checkProgressAchievements(change);\n    });\n  }\n  \n  checkStoryAchievements(event) {\n    this.achievements.forEach((achievement, id) => {\n      if (this.unlockedAchievements.has(id)) return;\n      \n      if (this.evaluateCondition(achievement.condition, event)) {\n        this.unlockAchievement(id);\n      }\n    });\n  }\n  \n  checkPuzzleAchievements(event) {\n    if (event.type === 'puzzle_solved') {\n      // Check for specific puzzle achievements\n      this.achievements.forEach((achievement, id) => {\n        if (this.unlockedAchievements.has(id)) return;\n        \n        if (achievement.condition.puzzleSolved === event.puzzle.id) {\n          this.unlockAchievement(id);\n        }\n      });\n      \n      // Update puzzle category counters\n      this.updatePuzzleProgress(event.puzzle);\n    }\n  }\n  \n  checkProgressAchievements(change) {\n    // Check achievements based on game state changes\n    this.achievements.forEach((achievement, id) => {\n      if (this.unlockedAchievements.has(id)) return;\n      \n      if (this.evaluateProgressCondition(achievement.condition, change)) {\n        this.unlockAchievement(id);\n      }\n    });\n  }\n  \n  evaluateCondition(condition, context = {}) {\n    if (condition.storyFlag) {\n      return this.gameEngine.getStoryFlag(condition.storyFlag);\n    }\n    \n    if (condition.allFlags) {\n      return condition.allFlags.every(flag => this.gameEngine.getStoryFlag(flag));\n    }\n    \n    if (condition.variable) {\n      const value = this.gameEngine.getVariable(condition.variable) || 0;\n      return value >= condition.threshold;\n    }\n    \n    if (condition.puzzleSolved) {\n      return context.puzzle && context.puzzle.id === condition.puzzleSolved;\n    }\n    \n    if (condition.puzzleCategory) {\n      const categoryProgress = this.progressTracking.get(`category_${condition.puzzleCategory}`) || 0;\n      return categoryProgress >= condition.count;\n    }\n    \n    if (condition.puzzleCategoriesCompleted) {\n      return condition.puzzleCategoriesCompleted.every(category => {\n        const progress = this.progressTracking.get(`category_${category}`) || 0;\n        return progress >= 1; // At least one puzzle in each category\n      });\n    }\n    \n    return false;\n  }\n  \n  evaluateProgressCondition(condition, change) {\n    // Evaluate conditions based on cumulative progress\n    if (condition.easterEggs) {\n      const easterEggCount = this.progressTracking.get('easter_eggs') || 0;\n      return easterEggCount >= condition.easterEggs;\n    }\n    \n    if (condition.hintsUsed) {\n      const hintsUsed = this.progressTracking.get('hints_used') || 0;\n      return hintsUsed >= condition.hintsUsed;\n    }\n    \n    if (condition.puzzlesSolvedWithoutHints) {\n      const noHintSolves = this.progressTracking.get('no_hint_solves') || 0;\n      return noHintSolves >= condition.puzzlesSolvedWithoutHints;\n    }\n    \n    return false;\n  }\n  \n  updatePuzzleProgress(puzzle) {\n    // Update category progress\n    const categoryKey = `category_${puzzle.category}`;\n    const currentProgress = this.progressTracking.get(categoryKey) || 0;\n    this.progressTracking.set(categoryKey, currentProgress + 1);\n    \n    // Update hint usage tracking\n    if (puzzle.hintsUsed === 0) {\n      const noHintSolves = this.progressTracking.get('no_hint_solves') || 0;\n      this.progressTracking.set('no_hint_solves', noHintSolves + 1);\n    } else {\n      const hintsUsed = this.progressTracking.get('hints_used') || 0;\n      this.progressTracking.set('hints_used', hintsUsed + puzzle.hintsUsed);\n    }\n  }\n  \n  unlockAchievement(achievementId) {\n    const achievement = this.achievements.get(achievementId);\n    if (!achievement || this.unlockedAchievements.has(achievementId)) {\n      return false;\n    }\n    \n    achievement.unlockedAt = Date.now();\n    this.unlockedAchievements.add(achievementId);\n    \n    this.achievementHistory.push({\n      id: achievementId,\n      name: achievement.name,\n      unlockedAt: achievement.unlockedAt\n    });\n    \n    // Emit achievement event\n    this.gameEngine.emit('achievementUnlocked', {\n      achievement,\n      totalUnlocked: this.unlockedAchievements.size,\n      totalAchievements: this.achievements.size\n    });\n    \n    // Display achievement notification\n    this.displayAchievementNotification(achievement);\n    \n    return true;\n  }\n  \n  displayAchievementNotification(achievement) {\n    console.log(`\\n🏆 ACHIEVEMENT UNLOCKED! 🏆`);\n    console.log(`${achievement.icon} ${achievement.name}`);\n    console.log(`${achievement.description}`);\n    console.log(`Rarity: ${achievement.rarity.toUpperCase()}`);\n    \n    if (achievement.raviComment) {\n      setTimeout(() => {\n        console.log(`\\n🤖 Ravi: \"${achievement.raviComment}\"`);\n      }, 1000);\n    }\n    \n    if (achievement.metaComment) {\n      setTimeout(() => {\n        console.log(`\\n💭 Meta: ${achievement.metaComment}`);\n      }, 2000);\n    }\n    \n    console.log(`\\n`);\n  }\n  \n  getAchievementProgress() {\n    const total = this.achievements.size;\n    const unlocked = this.unlockedAchievements.size;\n    const percentage = Math.round((unlocked / total) * 100);\n    \n    return {\n      total,\n      unlocked,\n      percentage,\n      remaining: total - unlocked\n    };\n  }\n  \n  getAchievementsByCategory(category) {\n    return Array.from(this.achievements.entries())\n      .filter(([id, achievement]) => achievement.category === category)\n      .map(([id, achievement]) => ({\n        id,\n        ...achievement,\n        unlocked: this.unlockedAchievements.has(id)\n      }));\n  }\n  \n  getUnlockedAchievements() {\n    return Array.from(this.unlockedAchievements)\n      .map(id => ({\n        id,\n        ...this.achievements.get(id)\n      }))\n      .sort((a, b) => b.unlockedAt - a.unlockedAt); // Most recent first\n  }\n  \n  getRecentAchievements(count = 5) {\n    return this.achievementHistory\n      .slice(-count)\n      .reverse(); // Most recent first\n  }\n  \n  generateAchievementReport() {\n    const progress = this.getAchievementProgress();\n    const categoryProgress = {};\n    \n    this.categories.forEach(category => {\n      const categoryAchievements = this.getAchievementsByCategory(category);\n      const unlockedInCategory = categoryAchievements.filter(a => a.unlocked).length;\n      \n      categoryProgress[category] = {\n        total: categoryAchievements.length,\n        unlocked: unlockedInCategory,\n        percentage: Math.round((unlockedInCategory / categoryAchievements.length) * 100)\n      };\n    });\n    \n    const rarityDistribution = this.getRarityDistribution();\n    \n    return {\n      overall: progress,\n      categories: categoryProgress,\n      rarity: rarityDistribution,\n      recentUnlocks: this.getRecentAchievements(3),\n      recommendations: this.getAchievementRecommendations()\n    };\n  }\n  \n  getRarityDistribution() {\n    const distribution = { common: 0, uncommon: 0, rare: 0, epic: 0 };\n    const unlocked = { common: 0, uncommon: 0, rare: 0, epic: 0 };\n    \n    this.achievements.forEach((achievement, id) => {\n      distribution[achievement.rarity]++;\n      if (this.unlockedAchievements.has(id)) {\n        unlocked[achievement.rarity]++;\n      }\n    });\n    \n    return Object.keys(distribution).map(rarity => ({\n      rarity,\n      total: distribution[rarity],\n      unlocked: unlocked[rarity],\n      percentage: distribution[rarity] > 0 ? \n        Math.round((unlocked[rarity] / distribution[rarity]) * 100) : 0\n    }));\n  }\n  \n  getAchievementRecommendations() {\n    const recommendations = [];\n    const progress = this.getAchievementProgress();\n    \n    if (progress.unlocked === 0) {\n      recommendations.push(\"Start your journey by completing your first story path!\");\n    } else if (progress.percentage < 25) {\n      recommendations.push(\"Try exploring different story paths to unlock more achievements!\");\n    } else if (progress.percentage < 50) {\n      recommendations.push(\"Challenge yourself with some of the harder puzzles!\");\n    } else if (progress.percentage < 75) {\n      recommendations.push(\"You're doing great! Look for the epic achievements for a real challenge!\");\n    } else {\n      recommendations.push(\"Achievement master! You've unlocked most of the available achievements!\");\n    }\n    \n    // Category-specific recommendations\n    const categoryProgress = this.generateAchievementReport().categories;\n    Object.entries(categoryProgress).forEach(([category, data]) => {\n      if (data.percentage === 0) {\n        recommendations.push(`Explore ${category} achievements for a new challenge!`);\n      }\n    });\n    \n    return recommendations.slice(0, 3); // Limit to 3 recommendations\n  }\n  \n  // Special method for tracking easter eggs\n  recordEasterEgg(easterEggId) {\n    const easterEggCount = this.progressTracking.get('easter_eggs') || 0;\n    this.progressTracking.set('easter_eggs', easterEggCount + 1);\n    \n    // Check for easter egg achievements\n    this.checkProgressAchievements({ type: 'easter_egg_found', easterEggId });\n  }\n  \n  // Method for tracking story completion times\n  recordStoryCompletion(storyId, duration) {\n    const completionKey = `story_${storyId}_time`;\n    this.progressTracking.set(completionKey, duration);\n    \n    // Check time-based achievements\n    this.achievements.forEach((achievement, id) => {\n      if (this.unlockedAchievements.has(id)) return;\n      \n      if (achievement.condition.storyCompletionTime && \n          duration <= achievement.condition.storyCompletionTime) {\n        this.unlockAchievement(id);\n      }\n      \n      if (achievement.condition.storyExplorationTime && \n          duration >= achievement.condition.storyExplorationTime) {\n        this.unlockAchievement(id);\n      }\n    });\n  }\n}\n\nmodule.exports = AchievementSystem;"