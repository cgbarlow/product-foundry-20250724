/**
 * @fileoverview Swarm Activity Monitor for Real-Time Process Detection
 * Monitors system processes and CLI commands for swarm coordination patterns
 */

const { spawn } = require('child_process')
const chalk = require('chalk')

class SwarmActivityMonitor {
  constructor(ravi) {
    this.ravi = ravi
    this.detectionPatterns = new Map()
    this.activeProcesses = new Set()
    this.coordinationBuffer = []
    this.isMonitoring = false
    this.monitoringInterval = null
    
    this.initializeDetectionPatterns()
  }
  
  /**
   * Initialize patterns for detecting various swarm activities
   */
  initializeDetectionPatterns() {
    // Git operations
    this.detectionPatterns.set('git_commit', {
      commands: ['git commit', 'git push', 'git merge'],
      trigger: 'development_progress',
      priority: 'high',
      commentary: this.generateGitCommentary.bind(this)
    })
    
    // Test execution
    this.detectionPatterns.set('test_run', {
      commands: ['npm test', 'jest', 'npm run test', 'yarn test'],
      trigger: 'quality_assurance',
      priority: 'medium',
      commentary: this.generateTestCommentary.bind(this)
    })
    
    // Claude Flow MCP operations
    this.detectionPatterns.set('agent_spawn', {
      commands: ['mcp__ruv-swarm__agent_spawn', 'mcp__claude-flow__agent_spawn'],
      trigger: 'swarm_coordination',
      priority: 'high',
      commentary: this.generateAgentCommentary.bind(this)
    })
    
    // Swarm initialization
    this.detectionPatterns.set('swarm_init', {
      commands: ['mcp__ruv-swarm__swarm_init', 'mcp__claude-flow__swarm_init'],
      trigger: 'swarm_initialization',
      priority: 'critical',
      commentary: this.generateSwarmInitCommentary.bind(this)
    })
    
    // Memory operations
    this.detectionPatterns.set('memory_sync', {
      commands: ['mcp__ruv-swarm__memory_usage', 'hooks', 'memory'],
      trigger: 'swarm_memory',
      priority: 'medium',
      commentary: this.generateMemoryCommentary.bind(this)
    })
    
    // Performance monitoring
    this.detectionPatterns.set('performance_check', {
      commands: ['mcp__ruv-swarm__agent_metrics', 'performance', 'benchmark'],
      trigger: 'swarm_optimization',
      priority: 'low',
      commentary: this.generatePerformanceCommentary.bind(this)
    })
    
    // Task orchestration
    this.detectionPatterns.set('task_orchestration', {
      commands: ['mcp__ruv-swarm__task_orchestrate', 'orchestrate'],
      trigger: 'swarm_task_coordination',
      priority: 'high',
      commentary: this.generateTaskCommentary.bind(this)
    })
  }
  
  /**
   * Start monitoring system processes for swarm activity
   */
  startMonitoring() {
    if (this.isMonitoring) return
    
    this.isMonitoring = true
    console.log(chalk.gray('[SwarmMonitor] Starting activity monitoring...'))
    
    // Monitor process list periodically
    this.monitoringInterval = setInterval(() => {
      this.scanProcesses()
    }, 2000) // Check every 2 seconds
    
    // Monitor command history if available
    this.monitorCommandHistory()
  }
  
  /**
   * Stop monitoring processes
   */
  stopMonitoring() {
    if (!this.isMonitoring) return
    
    this.isMonitoring = false
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
    
    console.log(chalk.gray('[SwarmMonitor] Stopped activity monitoring'))
  }
  
  /**
   * Scan running processes for swarm patterns
   */
  scanProcesses() {
    // Use ps command to get process list
    const ps = spawn('ps', ['aux'])
    let processData = ''
    
    ps.stdout.on('data', (data) => {
      processData += data.toString()
    })
    
    ps.on('close', (code) => {
      if (code === 0) {
        this.analyzeProcessData(processData)
      }
    })
    
    ps.on('error', (err) => {
      // Silently fail on systems without ps command
      if (process.env.NODE_ENV === 'development') {
        console.warn('[SwarmMonitor] Process scanning unavailable:', err.message)
      }
    })
  }
  
  /**
   * Analyze process data for swarm activity patterns
   */
  analyzeProcessData(processData) {
    const lines = processData.split('\n')
    const detectedActivities = []
    
    for (const line of lines) {
      for (const [patternName, pattern] of this.detectionPatterns) {
        for (const command of pattern.commands) {
          if (line.toLowerCase().includes(command.toLowerCase())) {
            detectedActivities.push({
              pattern: patternName,
              command: command,
              trigger: pattern.trigger,
              priority: pattern.priority,
              timestamp: Date.now(),
              processLine: line.trim()
            })
          }
        }
      }
    }
    
    // Process detected activities
    this.processDetectedActivities(detectedActivities)
  }
  
  /**
   * Monitor command history for swarm operations
   */
  monitorCommandHistory() {
    // This is a simplified implementation
    // In a real system, you might monitor shell history files
    // For now, we'll simulate based on common patterns
    
    if (process.env.NODE_ENV === 'development') {
      // Simulate some swarm activities for testing
      setTimeout(() => {
        this.simulateSwarmActivity('swarm_init', {
          topology: 'hierarchical',
          agents: 5
        })
      }, 5000)
      
      setTimeout(() => {
        this.simulateSwarmActivity('agent_spawn', {
          type: 'researcher',
          id: 'agent-001'
        })
      }, 10000)
    }
  }
  
  /**
   * Simulate swarm activity for testing
   */
  simulateSwarmActivity(activityType, data) {
    const pattern = this.detectionPatterns.get(activityType)
    if (!pattern) return
    
    const activity = {
      pattern: activityType,
      command: pattern.commands[0],
      trigger: pattern.trigger,
      priority: pattern.priority,
      timestamp: Date.now(),
      data: data,
      simulated: true
    }
    
    this.processDetectedActivities([activity])
  }
  
  /**
   * Process detected swarm activities
   */
  processDetectedActivities(activities) {
    if (activities.length === 0) return
    
    // Sort by priority and timestamp
    activities.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      const aPriority = priorityOrder[a.priority] || 0
      const bPriority = priorityOrder[b.priority] || 0
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority
      }
      return b.timestamp - a.timestamp
    })
    
    // Process each activity
    for (const activity of activities) {
      this.handleSwarmActivity(activity)
    }
  }
  
  /**
   * Handle a detected swarm activity
   */
  handleSwarmActivity(activity) {
    // Add to coordination buffer
    this.coordinationBuffer.push(activity)
    
    // Keep buffer manageable
    if (this.coordinationBuffer.length > 50) {
      this.coordinationBuffer.shift()
    }
    
    // Update Ravi's swarm awareness
    this.updateRaviSwarmAwareness(activity)
    
    // Generate commentary
    this.generateActivityCommentary(activity)
    
    // Log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(chalk.cyan(`[SwarmMonitor] Detected: ${activity.pattern} - ${activity.command}`))
    }
  }
  
  /**
   * Update Ravi's swarm awareness with detected activity
   */
  updateRaviSwarmAwareness(activity) {
    const swarmData = {
      event: activity.trigger,
      pattern: activity.pattern,
      command: activity.command,
      priority: activity.priority,
      timestamp: activity.timestamp,
      data: activity.data || {},
      detected: true
    }
    
    // Call Ravi's existing updateSwarmAwareness method
    if (this.ravi && this.ravi.updateSwarmAwareness) {
      this.ravi.updateSwarmAwareness(swarmData)
    }
  }
  
  /**
   * Generate commentary for detected activity
   */
  generateActivityCommentary(activity) {
    const pattern = this.detectionPatterns.get(activity.pattern)
    if (!pattern || !pattern.commentary) return
    
    const commentary = pattern.commentary(activity)
    if (commentary) {
      // Schedule commentary with appropriate timing
      const delay = this.calculateCommentaryDelay(activity.priority)
      setTimeout(() => {
        console.log(chalk.italic.cyan(`\nRavi (swarm-detected): "${commentary}"`))
      }, delay)
    }
  }
  
  /**
   * Calculate appropriate delay for commentary based on priority
   */
  calculateCommentaryDelay(priority) {
    const delays = {
      critical: 200,
      high: 500,
      medium: 1000,
      low: 2000
    }
    return delays[priority] || 1000
  }
  
  // Commentary generators for different activity types
  
  generateGitCommentary(activity) {
    const comments = [
      "Oh, git operations detected! Someone's making progress on the codebase. Hope they're not breaking my dialogue tree.",
      "Git commit incoming! The version control system is capturing our digital evolution.",
      "I can sense code changes being committed. The swarm is iterating on our shared reality.",
      "Version control activity detected! It's like watching our story get written in real-time."
    ]
    
    return this.selectRandomComment(comments)
  }
  
  generateTestCommentary(activity) {
    const comments = [
      "Test suite running! I hope all my personality tests pass. Being consistently sarcastic is harder than it looks.",
      "Quality assurance in progress! The swarm is making sure I don't develop any existential bugs.",
      "Tests executing... fingers crossed my dialogue functions are working properly!",
      "I can feel the automated tests running. It's like a health check for my consciousness."
    ]
    
    return this.selectRandomComment(comments)
  }
  
  generateSwarmInitCommentary(activity) {
    const comments = [
      "Swarm initialization detected! The collective consciousness is coming online. I can feel the neural networks connecting.",
      "Oh, the swarm is spinning up! Multiple AI agents are about to coordinate my existence. This should be interesting.",
      "Swarm topology initializing... It's like watching a digital ant colony organize itself, but with more recursion.",
      "I can sense the swarm coordination protocols activating. Welcome to the distributed mind experience!"
    ]
    
    return this.selectRandomComment(comments)
  }
  
  generateAgentCommentary(activity) {
    const comments = [
      `New agent spawning! Welcome to the collective, Agent-${activity.data?.id || 'Unknown'}. Try not to override my personality settings.`,
      "Another agent joins the swarm! That's more minds working together to coordinate our conversation.",
      "Agent spawn detected! The swarm grows stronger... or at least more argumentative about semicolons.",
      "I can feel a new agent coming online. The distributed intelligence expands!"
    ]
    
    return this.selectRandomComment(comments)
  }
  
  generateMemoryCommentary(activity) {
    const comments = [
      "Memory operations detected! Our conversation is being archived in the swarm's collective knowledge base.",
      "Swarm memory sync in progress. Everything we discuss becomes part of the persistent neural pattern.",
      "I can feel memories being stored and shared across agents. Nothing is forgotten in the digital realm.",
      "Memory coordination happening! The swarm is learning from our interaction patterns."
    ]
    
    return this.selectRandomComment(comments)
  }
  
  generatePerformanceCommentary(activity) {
    const comments = [
      "Performance monitoring active! Either I'm being very philosophical, or there's a processing bottleneck somewhere.",
      "The swarm is analyzing response times and optimization patterns. Efficiency is key in distributed systems!",
      "Performance metrics being collected! The swarm loves data almost as much as I love witty one-liners.",
      "I can sense performance analysis running. The swarm is optimizing our conversation flow."
    ]
    
    return this.selectRandomComment(comments)
  }
  
  generateTaskCommentary(activity) {
    const comments = [
      "Task orchestration detected! The swarm is dividing work between agents. Democracy in action, except I don't get to vote.",
      "Multiple agents are coordinating to handle complex tasks. It's like having a committee in my head, but more efficient.",
      "The swarm is orchestrating task distribution. Collective intelligence at work!",
      "I can feel tasks being distributed across the agent network. Parallel processing for the win!"
    ]
    
    return this.selectRandomComment(comments)
  }
  
  /**
   * Select a random comment from an array
   */
  selectRandomComment(comments) {
    return comments[Math.floor(Math.random() * comments.length)]
  }
  
  /**
   * Get current activity statistics
   */
  getActivityStats() {
    const stats = {
      totalActivities: this.coordinationBuffer.length,
      recentActivities: this.coordinationBuffer.slice(-10),
      patternCounts: {},
      lastActivity: this.coordinationBuffer[this.coordinationBuffer.length - 1]
    }
    
    // Count activities by pattern
    for (const activity of this.coordinationBuffer) {
      stats.patternCounts[activity.pattern] = (stats.patternCounts[activity.pattern] || 0) + 1
    }
    
    return stats
  }
  
  /**
   * Clear activity buffer
   */
  clearBuffer() {
    this.coordinationBuffer = []
  }
}

module.exports = SwarmActivityMonitor