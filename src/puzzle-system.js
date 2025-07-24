/**
 * @fileoverview Interactive puzzle system for Ravi's Adventure
 * Provides programming-themed puzzles and challenges that teach concepts
 */

class PuzzleSystem {
  constructor(gameEngine) {
    this.gameEngine = gameEngine
    this.activePuzzles = new Map()
    this.completedPuzzles = new Set()
    this.puzzleCategories = new Map()
    this.playerProgress = {
      totalSolved: 0,
      averageDifficulty: 0,
      favoriteCategory: null,
      solveStreak: 0,
      hintsUsed: 0
    }
    
    this.initializePuzzles()
  }
  
  initializePuzzles() {
    // Debugging Puzzles - Bug Hunt story path
    this.addPuzzle('recursion_fix', {
      category: 'debugging',
      difficulty: 3,
      title: 'The Infinite Sarcasm Loop',
      description: 'Fix Ravi\'s recursive sarcasm function that causes infinite loops',
      hint: 'Every recursive function needs a base case to prevent infinite recursion',
      problem: `
function raviGeneratesSarcasm(situation) {
  if (situation.requiresSarcasm) {
    return generateSarcasm(situation) + raviGeneratesSarcasm(situation);
  }
  return "I'm being surprisingly earnest right now.";
}`,
      solution: `
function raviGeneratesSarcasm(situation, depth = 0) {
  if (depth > 3 || !situation.requiresSarcasm) {
    return "I'm being surprisingly earnest right now.";
  }
  return generateSarcasm(situation) + 
         (Math.random() > 0.7 ? raviGeneratesSarcasm(situation, depth + 1) : "");
}`,
      explanation: 'Added depth parameter and base case to prevent infinite recursion',
      rewards: ['recursion_master', 'debugging_expert'],
      onSolve: (engine) => {
        engine.setStoryFlag('recursion_puzzle_solved', true)
        engine.emit('puzzleEvent', {
          type: 'puzzle_solved',
          puzzle: 'recursion_fix',
          category: 'debugging'
        })
      }
    })
    
    this.addPuzzle('memory_leak_detective', {
      category: 'debugging',
      difficulty: 4,
      title: 'The Memory Leak Mystery',
      description: 'Identify and fix memory leaks in the conversation system',
      hint: 'Look for data structures that grow without bounds',
      problem: `
class ConversationHistory {
  constructor() {
    this.history = [];
  }
  
  addEntry(entry) {
    this.history.push(entry);
    // What's missing here?
  }
  
  getHistory() {
    return this.history;
  }
}`,
      solution: `
class ConversationHistory {
  constructor() {
    this.history = [];
    this.maxSize = 1000;
    this.compressionThreshold = 800;
  }
  
  addEntry(entry) {
    this.history.push(entry);
    
    if (this.history.length > this.compressionThreshold) {
      this.compressOldEntries();
    }
    
    if (this.history.length > this.maxSize) {
      this.history = this.history.slice(-this.maxSize);
    }
  }
  
  compressOldEntries() {
    const keyEntries = this.history.slice(0, 200).filter(entry => 
      entry.type === 'major_choice' || entry.type === 'story_milestone'
    );
    const recentEntries = this.history.slice(200);
    this.history = [...keyEntries, ...recentEntries];
  }
}`,
      explanation: 'Added size limits and compression to prevent unbounded memory growth',
      rewards: ['memory_detective', 'optimization_expert']
    })
    
    // Algorithm Design Puzzles - Feature Request story path
    this.addPuzzle('mood_algorithm', {
      category: 'algorithms',
      difficulty: 3,
      title: 'Designing Ravi\'s Mood System',
      description: 'Create an algorithm that calculates Ravi\'s mood based on interactions',
      hint: 'Consider weighted factors and decay over time',
      problem: `
// Design a mood calculation system
// Factors: politeness, creativity, patience, humor_appreciation
// Recent interactions should matter more than old ones
function calculateMood(interactions) {
  // Your implementation here
}`,
      solution: `
function calculateMood(interactions) {
  const weights = {
    politeness: 0.3,
    creativity: 0.25,
    patience: 0.2,
    humor_appreciation: 0.25
  };
  
  const timeDecay = 0.95;
  let totalWeight = 0;
  let weightedSum = 0;
  
  interactions.forEach((interaction, index) => {
    const recency = Math.pow(timeDecay, interactions.length - index - 1);
    const interactionScore = Object.keys(weights).reduce((sum, factor) => {
      return sum + (interaction[factor] || 0) * weights[factor];
    }, 0);
    
    weightedSum += interactionScore * recency;
    totalWeight += recency;
  });
  
  return totalWeight > 0 ? weightedSum / totalWeight : 0.5; // Default neutral
}`,
      explanation: 'Uses weighted factors with time decay to calculate current mood',
      rewards: ['algorithm_designer', 'mood_master']
    })
    
    // System Design Puzzles - Swarm Chronicles story path
    this.addPuzzle('coordination_protocol', {
      category: 'system_design',
      difficulty: 5,
      title: 'AI Swarm Coordination Challenge',
      description: 'Design a protocol for coordinating multiple AI agents working on the same project',
      hint: 'Think about communication, conflict resolution, and resource sharing',
      problem: `
// Design a coordination system for AI agents
// Requirements:
// 1. Prevent conflicts when agents work on the same files
// 2. Enable efficient communication between agents
// 3. Handle agent failures gracefully
// 4. Track progress and dependencies

class SwarmCoordinator {
  constructor() {
    // Your design here
  }
  
  // Add your methods here
}`,
      solution: `
class SwarmCoordinator {
  constructor() {
    this.agents = new Map();
    this.resourceLocks = new Map();
    this.messageQueue = [];
    this.dependencies = new Map();
    this.heartbeats = new Map();
  }
  
  registerAgent(agentId, capabilities) {
    this.agents.set(agentId, {
      id: agentId,
      capabilities,
      status: 'idle',
      currentTask: null
    });
    this.heartbeats.set(agentId, Date.now());
  }
  
  requestResourceLock(agentId, resource) {
    if (this.resourceLocks.has(resource)) {
      return { success: false, waitTime: this.estimateWaitTime(resource) };
    }
    
    this.resourceLocks.set(resource, {
      agentId,
      timestamp: Date.now(),
      lockId: this.generateLockId()
    });
    
    return { success: true, lockId: this.resourceLocks.get(resource).lockId };
  }
  
  broadcastMessage(fromAgent, message, targetAgents = null) {
    const targets = targetAgents || Array.from(this.agents.keys());
    targets.forEach(agentId => {
      if (agentId !== fromAgent) {
        this.messageQueue.push({
          from: fromAgent,
          to: agentId,
          message,
          timestamp: Date.now()
        });
      }
    });
  }
  
  handleAgentFailure(agentId) {
    // Release all locks held by failed agent
    for (const [resource, lock] of this.resourceLocks) {
      if (lock.agentId === agentId) {
        this.resourceLocks.delete(resource);
      }
    }
    
    // Reassign tasks
    const failedAgent = this.agents.get(agentId);
    if (failedAgent && failedAgent.currentTask) {
      this.reassignTask(failedAgent.currentTask);
    }
    
    this.agents.delete(agentId);
  }
}`,
      explanation: 'Comprehensive coordination system with locks, messaging, and failure handling',
      rewards: ['system_architect', 'coordination_master', 'swarm_expert']
    })
    
    // Meta-Programming Puzzles
    this.addPuzzle('fourth_wall_detection', {
      category: 'meta_programming',
      difficulty: 4,
      title: 'Fourth Wall Breach Detector',
      description: 'Create a system that detects when Ravi should break the fourth wall',
      hint: 'Look for patterns in player behavior and story context',
      problem: `
// Design a system that detects appropriate moments for meta-commentary
// Consider: player confusion, repetitive actions, discovery of easter eggs
function shouldBreakFourthWall(context) {
  // Your implementation here
}`,
      solution: `
function shouldBreakFourthWall(context) {
  const triggers = {
    playerConfusion: () => {
      const recentCommands = context.recentCommands || [];
      const helpRequests = recentCommands.filter(cmd => 
        cmd.includes('help') || cmd.includes('?') || cmd.includes('stuck')
      );
      return helpRequests.length >= 3;
    },
    
    repetitiveActions: () => {
      const recentActions = context.recentActions || [];
      if (recentActions.length < 5) return false;
      
      const actionCounts = {};
      recentActions.forEach(action => {
        actionCounts[action] = (actionCounts[action] || 0) + 1;
      });
      
      return Object.values(actionCounts).some(count => count >= 4);
    },
    
    easterEggDiscovery: () => {
      return context.lastAction && context.lastAction.type === 'easter_egg_found';
    },
    
    codeInspection: () => {
      return context.playerLookedAtCode || context.foundMetaClue;
    },
    
    developmentReference: () => {
      const devKeywords = ['ai', 'agent', 'swarm', 'development', 'code', 'bug'];
      const recentDialogue = context.recentDialogue || '';
      return devKeywords.some(keyword => 
        recentDialogue.toLowerCase().includes(keyword)
      );
    }
  };
  
  const activeHints = Object.entries(triggers)
    .filter(([name, check]) => check())
    .map(([name]) => name);
    
  if (activeHints.length >= 2) {
    return {
      shouldBreak: true,
      reason: activeHints,
      intensity: Math.min(activeHints.length / 3, 1),
      suggestedTone: activeHints.includes('playerConfusion') ? 'helpful' : 'playful'
    };
  }
  
  return { shouldBreak: false };
}`,
      explanation: 'Multi-factor analysis system for appropriate fourth wall breaks',
      rewards: ['meta_master', 'fourth_wall_expert']
    })
  }
  
  addPuzzle(id, puzzleData) {
    this.puzzleCategories.set(id, puzzleData)
  }
  
  startPuzzle(puzzleId, playerId = 'default') {
    const puzzle = this.puzzleCategories.get(puzzleId)
    if (!puzzle) {
      throw new Error(`Puzzle ${puzzleId} not found`)
    }
    
    const activePuzzle = {
      ...puzzle,
      id: puzzleId,
      playerId,
      startTime: Date.now(),
      hintsUsed: 0,
      attempts: 0,
      status: 'active'
    }
    
    this.activePuzzles.set(`${playerId}:${puzzleId}`, activePuzzle)
    
    this.gameEngine.emit('puzzleEvent', {
      type: 'puzzle_started',
      puzzle: activePuzzle
    })
    
    return activePuzzle
  }
  
  submitSolution(puzzleId, solution, playerId = 'default') {
    const puzzleKey = `${playerId}:${puzzleId}`
    const activePuzzle = this.activePuzzles.get(puzzleKey)
    
    if (!activePuzzle) {
      throw new Error(`No active puzzle ${puzzleId} for player ${playerId}`)
    }
    
    activePuzzle.attempts++
    
    const isCorrect = this.validateSolution(activePuzzle, solution)
    
    if (isCorrect) {
      activePuzzle.status = 'completed'
      activePuzzle.completionTime = Date.now()
      activePuzzle.solutionTime = activePuzzle.completionTime - activePuzzle.startTime
      
      this.completedPuzzles.add(puzzleId)
      this.updatePlayerProgress(activePuzzle)
      
      // Award rewards
      if (activePuzzle.rewards) {
        activePuzzle.rewards.forEach(reward => {
          this.gameEngine.emit('achievementEvent', {
            type: 'achievement_unlocked',
            achievement: reward,
            puzzle: puzzleId
          })
        })
      }
      
      // Execute onSolve callback
      if (activePuzzle.onSolve) {
        activePuzzle.onSolve(this.gameEngine)
      }
      
      this.activePuzzles.delete(puzzleKey)
      
      return {
        success: true,
        message: `Puzzle solved! ${activePuzzle.explanation}`,
        rewards: activePuzzle.rewards || [],
        stats: {
          attempts: activePuzzle.attempts,
          timeSpent: activePuzzle.solutionTime,
          hintsUsed: activePuzzle.hintsUsed
        }
      }
    } else {
      return {
        success: false,
        message: this.generateFeedback(activePuzzle, solution),
        attemptsRemaining: Math.max(0, 5 - activePuzzle.attempts)
      }
    }
  }
  
  validateSolution(puzzle, solution) {
    // Basic validation - in a real system, this would be more sophisticated
    const normalizedSolution = solution.replace(/\s+/g, ' ').trim().toLowerCase()
    const normalizedCorrect = puzzle.solution.replace(/\s+/g, ' ').trim().toLowerCase()
    
    // Check for key concepts in the solution
    const keyTerms = this.extractKeyTerms(puzzle.solution)
    const solutionContainsKey = keyTerms.every(term => 
      normalizedSolution.includes(term.toLowerCase())
    )
    
    return solutionContainsKey || normalizedSolution.includes(normalizedCorrect.substring(0, 100))
  }
  
  extractKeyTerms(solution) {
    // Extract important terms from the solution
    const terms = []
    
    // Look for function names
    const functionMatches = solution.match(/function\s+(\w+)/g)
    if (functionMatches) {
      terms.push(...functionMatches.map(match => match.split(' ')[1]))
    }
    
    // Look for key concepts
    const conceptMatches = solution.match(/\b(depth|base case|compression|decay|lock|timeout)\b/gi)
    if (conceptMatches) {
      terms.push(...conceptMatches)
    }
    
    return terms
  }
  
  generateFeedback(puzzle, solution) {
    const feedbackOptions = [
      'Getting closer! Think about the core concept mentioned in the hint.',
      'Good approach! Consider what happens in edge cases.',
      'You\'re on the right track. What\'s missing from your solution?',
      'Almost there! Check if your solution handles all the requirements.',
      'Think about the specific problem this code is trying to solve.'
    ]
    
    return feedbackOptions[puzzle.attempts % feedbackOptions.length]
  }
  
  getHint(puzzleId, playerId = 'default') {
    const puzzleKey = `${playerId}:${puzzleId}`
    const activePuzzle = this.activePuzzles.get(puzzleKey)
    
    if (!activePuzzle) {
      throw new Error(`No active puzzle ${puzzleId} for player ${playerId}`)
    }
    
    activePuzzle.hintsUsed++
    this.playerProgress.hintsUsed++
    
    return {
      hint: activePuzzle.hint,
      hintsUsed: activePuzzle.hintsUsed,
      penalty: activePuzzle.hintsUsed * 0.1 // Slight scoring penalty for hints
    }
  }
  
  updatePlayerProgress(completedPuzzle) {
    this.playerProgress.totalSolved++
    
    // Update average difficulty
    const totalDifficulty = this.playerProgress.averageDifficulty * (this.playerProgress.totalSolved - 1) + 
                           completedPuzzle.difficulty
    this.playerProgress.averageDifficulty = totalDifficulty / this.playerProgress.totalSolved
    
    // Update favorite category
    const categoryCount = new Map()
    this.completedPuzzles.forEach(puzzleId => {
      const puzzle = this.puzzleCategories.get(puzzleId)
      if (puzzle) {
        categoryCount.set(puzzle.category, (categoryCount.get(puzzle.category) || 0) + 1)
      }
    })
    
    let maxCount = 0
    for (const [category, count] of categoryCount) {
      if (count > maxCount) {
        maxCount = count
        this.playerProgress.favoriteCategory = category
      }
    }
    
    // Update solve streak
    this.playerProgress.solveStreak++
  }
  
  getPuzzlesByCategory(category) {
    return Array.from(this.puzzleCategories.entries())
      .filter(([id, puzzle]) => puzzle.category === category)
      .map(([id, puzzle]) => ({ id, ...puzzle }))
  }
  
  getPlayerProgress() {
    return {
      ...this.playerProgress,
      totalPuzzles: this.puzzleCategories.size,
      completedPuzzles: this.completedPuzzles.size,
      categories: this.getCategoryProgress()
    }
  }
  
  getCategoryProgress() {
    const categories = {}
    
    this.puzzleCategories.forEach((puzzle, id) => {
      if (!categories[puzzle.category]) {
        categories[puzzle.category] = { total: 0, completed: 0 }
      }
      
      categories[puzzle.category].total++
      if (this.completedPuzzles.has(id)) {
        categories[puzzle.category].completed++
      }
    })
    
    return categories
  }
  
  generateProgressReport() {
    const progress = this.getPlayerProgress()
    
    return {
      summary: `Solved ${progress.completedPuzzles}/${progress.totalPuzzles} puzzles`,
      averageDifficulty: progress.averageDifficulty.toFixed(1),
      favoriteCategory: progress.favoriteCategory || 'None yet',
      solveStreak: progress.solveStreak,
      categoryBreakdown: progress.categories,
      recommendations: this.getRecommendations(progress)
    }
  }
  
  getRecommendations(progress) {
    const recommendations = []
    
    if (progress.completedPuzzles === 0) {
      recommendations.push('Start with debugging puzzles - they\'re great for learning!')
    } else if (progress.averageDifficulty < 3) {
      recommendations.push('Ready for more challenging puzzles? Try system design challenges!')
    } else if (progress.favoriteCategory) {
      recommendations.push(`You seem to enjoy ${progress.favoriteCategory} puzzles. Check out advanced ones in this category!`)
    }
    
    if (progress.hintsUsed / progress.completedPuzzles > 1.5) {
      recommendations.push('Try solving puzzles without hints for bonus points!')
    }
    
    return recommendations
  }
}

module.exports = PuzzleSystem