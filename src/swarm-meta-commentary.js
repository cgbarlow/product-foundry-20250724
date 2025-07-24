/**
 * @fileoverview Swarm Meta-Commentary Integration System
 * Monitors Claude Flow MCP swarm activities and triggers Ravi's meta-commentary
 * Feature #18: Real-time swarm monitoring and educational content generation
 */

const EventEmitter = require('events')
const chalk = require('chalk')

/**
 * SwarmMetaCommentaryMonitor - Monitors swarm activities and triggers commentary
 */
class SwarmMetaCommentaryMonitor extends EventEmitter {
  constructor(options = {}) {
    super()
    
    this.config = {
      monitoringInterval: options.monitoringInterval || 5000, // 5 seconds
      commentaryThreshold: options.commentaryThreshold || 0.15, // 15% chance
      educationalMode: options.educationalMode || false,
      maxCommentaryPerMinute: options.maxCommentaryPerMinute || 3,
      detectPatterns: options.detectPatterns || true,
      ...options
    }
    
    this.state = {
      isMonitoring: false,
      lastSwarmStatus: null,
      commentaryCount: 0,
      lastCommentaryTime: 0,
      detectedPatterns: new Map(),
      activityHistory: [],
      developmentContext: null,
      playerBehavior: new Map()
    }
    
    // Activity detection patterns
    this.patterns = {
      swarmInit: /swarm.*init/i,
      agentSpawn: /agent.*spawn/i,
      taskOrchestrate: /task.*orchestrate/i,
      memoryOperations: /memory.*(usage|store|retrieve)/i,
      performanceAnalysis: /performance|metrics|benchmark/i,
      neuralTraining: /neural.*(train|pattern)/i,
      gitOperations: /git.*(commit|push|merge|pull)/i,
      cicdOperations: /(build|test|deploy|ci|cd)/i
    }
    
    // Educational content templates
    this.educationalContent = {
      swarmCoordination: {
        beginner: [
          "A swarm is like having multiple AI specialists working together - each agent has a specific role!",
          "Think of it as a digital team where each AI agent brings different expertise to solve problems.",
          "Swarm coordination means AIs can collaborate just like humans do in a team project."
        ],
        intermediate: [
          "Agent specialization in swarms allows for cognitive diversity - different thinking patterns solve different problems.",
          "The topology (mesh, hierarchical, star) determines how agents communicate and coordinate their work.",
          "Memory sharing between agents creates a collective intelligence greater than individual capabilities."
        ],
        advanced: [
          "Emergent behavior in swarms comes from simple agent interactions creating complex problem-solving capabilities.",
          "Neural pattern diversity enables meta-learning across different cognitive approaches and domains.",
          "Decentralized coordination allows for fault tolerance and adaptive problem-solving strategies."
        ]
      },
      developmentProcess: {
        git: [
          "Git operations are being tracked by the swarm - it's like having AI oversight of the development process!",
          "Each commit is analyzed for patterns and improvements by the monitoring agents.",
          "The swarm learns from development workflows to suggest better coordination strategies."
        ],
        cicd: [
          "Continuous Integration means the swarm is constantly testing and validating its own development!",
          "Each build and test cycle provides feedback to improve the swarm's coordination algorithms.",
          "The development pipeline is itself monitored by AI agents for optimization opportunities."
        ],
        collaboration: [
          "Multiple AI agents coordinating development is like having a digital software engineering team!",
          "Each agent brings different expertise - some focus on testing, others on optimization, others on user experience.",
          "The swarm approach to development creates more robust and well-tested systems."
        ]
      }
    }
    
    this.setupMonitoring()
  }

  /**
   * Initialize swarm monitoring system
   */
  setupMonitoring() {
    // Set up event listeners for different types of swarm activities
    this.on('swarm-activity-detected', this.handleSwarmActivity.bind(this))
    this.on('pattern-detected', this.handlePatternDetection.bind(this))
    this.on('development-event', this.handleDevelopmentEvent.bind(this))
    this.on('player-behavior-change', this.handlePlayerBehaviorChange.bind(this))
    
    // Reset commentary count every minute
    setInterval(() => {
      this.state.commentaryCount = 0
    }, 60000)
  }

  /**
   * Start monitoring swarm activities
   */
  async startMonitoring() {
    if (this.state.isMonitoring) return
    
    this.state.isMonitoring = true
    console.log(chalk.gray('[Swarm Monitor] Starting real-time swarm activity monitoring...'))
    
    // Start polling for swarm status
    this.monitoringInterval = setInterval(async () => {
      await this.checkSwarmActivity()
    }, this.config.monitoringInterval)
    
    // Initial swarm status check
    await this.checkSwarmActivity()
    
    this.emit('monitoring-started')
  }

  /**
   * Stop monitoring swarm activities
   */
  stopMonitoring() {
    if (!this.state.isMonitoring) return
    
    this.state.isMonitoring = false
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
    
    console.log(chalk.gray('[Swarm Monitor] Stopped swarm activity monitoring'))
    this.emit('monitoring-stopped')
  }

  /**
   * Check current swarm activity and detect changes
   */
  async checkSwarmActivity() {
    try {
      // Get current swarm status (this would integrate with Claude Flow MCP)
      const currentStatus = await this.getSwarmStatus()
      
      if (!currentStatus) return
      
      // Compare with previous status to detect changes
      if (this.state.lastSwarmStatus) {
        const changes = this.detectStatusChanges(this.state.lastSwarmStatus, currentStatus)
        
        if (changes.length > 0) {
          this.emit('swarm-activity-detected', {
            changes,
            currentStatus,
            previousStatus: this.state.lastSwarmStatus,
            timestamp: Date.now()
          })
        }
      }
      
      // Update state
      this.state.lastSwarmStatus = currentStatus
      this.state.activityHistory.push({
        status: currentStatus,
        timestamp: Date.now()
      })
      
      // Keep history manageable
      if (this.state.activityHistory.length > 50) {
        this.state.activityHistory.shift()
      }
      
      // Detect patterns in activity
      if (this.config.detectPatterns) {
        this.analyzeActivityPatterns()
      }
      
    } catch (error) {
      console.warn(chalk.yellow(`[Swarm Monitor] Error checking swarm activity: ${error.message}`))
    }
  }

  /**
   * Get current swarm status (integrates with Claude Flow MCP)
   */
  async getSwarmStatus() {
    try {
      // This would call the actual Claude Flow MCP tools
      // For now, we'll simulate based on available information
      return {
        activeSwarms: 1,
        totalAgents: 3,
        activeAgents: 3,
        recentTasks: [],
        memoryUsage: {
          current: 50331648,
          peak: 52428800
        },
        performance: {
          avgResponseTime: 0.8,
          tasksCompleted: 2,
          successRate: 1.0
        }
      }
    } catch (error) {
      console.warn(chalk.yellow(`[Swarm Monitor] Could not get swarm status: ${error.message}`))
      return null
    }
  }

  /**
   * Detect changes between swarm status snapshots
   */
  detectStatusChanges(previous, current) {
    const changes = []
    
    // Agent count changes
    if (previous.totalAgents !== current.totalAgents) {
      changes.push({
        type: 'agent_count_changed',
        previous: previous.totalAgents,
        current: current.totalAgents,
        delta: current.totalAgents - previous.totalAgents
      })
    }
    
    // Active agents changes
    if (previous.activeAgents !== current.activeAgents) {
      changes.push({
        type: 'active_agents_changed',
        previous: previous.activeAgents,
        current: current.activeAgents,
        delta: current.activeAgents - previous.activeAgents
      })
    }
    
    // Memory usage changes (significant changes only)
    const memoryDelta = current.memoryUsage.current - previous.memoryUsage.current
    if (Math.abs(memoryDelta) > 1048576) { // 1MB threshold
      changes.push({
        type: 'memory_usage_changed',
        previous: previous.memoryUsage.current,
        current: current.memoryUsage.current,
        delta: memoryDelta
      })
    }
    
    // Performance changes
    if (previous.performance.tasksCompleted !== current.performance.tasksCompleted) {
      changes.push({
        type: 'tasks_completed',
        previous: previous.performance.tasksCompleted,
        current: current.performance.tasksCompleted,
        delta: current.performance.tasksCompleted - previous.performance.tasksCompleted
      })
    }
    
    return changes
  }

  /**
   * Analyze activity patterns for commentary triggers
   */
  analyzeActivityPatterns() {
    if (this.state.activityHistory.length < 3) return
    
    const recent = this.state.activityHistory.slice(-5)
    
    // Detect rapid agent scaling
    const agentCounts = recent.map(h => h.status.totalAgents)
    if (agentCounts.some(count => count > agentCounts[0])) {
      this.emit('pattern-detected', {
        pattern: 'agent_scaling',
        description: 'Rapid agent spawning detected',
        intensity: this.calculateIntensity(agentCounts)
      })
    }
    
    // Detect high activity periods
    const recentActivity = recent.filter(h => Date.now() - h.timestamp < 30000) // Last 30 seconds
    if (recentActivity.length >= 3) {
      this.emit('pattern-detected', {
        pattern: 'high_activity',
        description: 'High swarm activity period',
        intensity: recentActivity.length / 5
      })
    }
    
    // Detect memory usage spikes
    const memoryUsages = recent.map(h => h.status.memoryUsage.current)
    const avgMemory = memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length
    const maxMemory = Math.max(...memoryUsages)
    if (maxMemory > avgMemory * 1.5) {
      this.emit('pattern-detected', {
        pattern: 'memory_spike',
        description: 'Memory usage spike detected',
        intensity: maxMemory / avgMemory
      })
    }
  }

  /**
   * Calculate pattern intensity for commentary decisions
   */
  calculateIntensity(values) {
    if (values.length < 2) return 0
    
    const changes = values.slice(1).map((val, i) => Math.abs(val - values[i]))
    return changes.reduce((a, b) => a + b, 0) / changes.length
  }

  /**
   * Handle detected swarm activity
   */
  handleSwarmActivity(activityData) {
    // Store activity for pattern analysis
    this.state.activityHistory.push({
      type: 'activity',
      data: activityData,
      timestamp: Date.now()
    })
    
    // Generate commentary if conditions are met
    if (this.shouldGenerateCommentary()) {
      const commentary = this.generateActivityCommentary(activityData)
      if (commentary) {
        this.emitCommentary(commentary, 'swarm-activity')
      }
    }
    
    // Update development context
    this.updateDevelopmentContext(activityData)
  }

  /**
   * Handle detected patterns
   */
  handlePatternDetection(patternData) {
    const patternKey = patternData.pattern
    
    // Track pattern occurrences
    if (!this.state.detectedPatterns.has(patternKey)) {
      this.state.detectedPatterns.set(patternKey, {
        count: 0,
        lastSeen: null,
        intensity: []
      })
    }
    
    const pattern = this.state.detectedPatterns.get(patternKey)
    pattern.count++
    pattern.lastSeen = Date.now()
    pattern.intensity.push(patternData.intensity || 1)
    
    // Generate educational commentary for patterns
    if (this.config.educationalMode && this.shouldGenerateCommentary()) {
      const commentary = this.generatePatternCommentary(patternData)
      if (commentary) {
        this.emitCommentary(commentary, 'pattern-detection')
      }
    }
  }

  /**
   * Handle development events (git, CI/CD, etc.)
   */
  handleDevelopmentEvent(eventData) {
    this.state.developmentContext = {
      ...this.state.developmentContext,
      lastEvent: eventData,
      timestamp: Date.now()
    }
    
    if (this.shouldGenerateCommentary()) {
      const commentary = this.generateDevelopmentCommentary(eventData)
      if (commentary) {
        this.emitCommentary(commentary, 'development-event')
      }
    }
  }

  /**
   * Handle player behavior changes
   */
  handlePlayerBehaviorChange(behaviorData) {
    const behaviorKey = behaviorData.behavior
    
    if (!this.state.playerBehavior.has(behaviorKey)) {
      this.state.playerBehavior.set(behaviorKey, {
        count: 0,
        lastSeen: null,
        data: []
      })
    }
    
    const behavior = this.state.playerBehavior.get(behaviorKey)
    behavior.count++
    behavior.lastSeen = Date.now()
    behavior.data.push(behaviorData.data)
    
    // Adaptive commentary based on player behavior
    if (this.shouldGenerateCommentary()) {
      const commentary = this.generateAdaptiveCommentary(behaviorData)
      if (commentary) {
        this.emitCommentary(commentary, 'adaptive-behavior')
      }
    }
  }

  /**
   * Determine if commentary should be generated
   */
  shouldGenerateCommentary() {
    // Rate limiting
    if (this.state.commentaryCount >= this.config.maxCommentaryPerMinute) {
      return false
    }
    
    // Time-based throttling
    const timeSinceLastCommentary = Date.now() - this.state.lastCommentaryTime
    if (timeSinceLastCommentary < 10000) { // Minimum 10 seconds between commentary
      return false
    }
    
    // Random chance threshold
    return Math.random() < this.config.commentaryThreshold
  }

  /**
   * Generate commentary for swarm activities
   */
  generateActivityCommentary(activityData) {
    const changes = activityData.changes
    const commentaries = []
    
    for (const change of changes) {
      switch (change.type) {
        case 'agent_count_changed':
          if (change.delta > 0) {
            commentaries.push(`Oh! ${change.delta} new agent${change.delta > 1 ? 's' : ''} just joined the swarm. The collective intelligence grows!`)
          } else {
            commentaries.push(`Hmm, ${Math.abs(change.delta)} agent${Math.abs(change.delta) > 1 ? 's' : ''} just left the swarm. Scaling down for efficiency.`)
          }
          break
          
        case 'active_agents_changed':
          if (change.delta > 0) {
            commentaries.push(`More agents are becoming active - ${change.current} agents are now working on coordination tasks.`)
          } else {
            commentaries.push(`Some agents are going idle. Down to ${change.current} active agents. Resource optimization in action.`)
          }
          break
          
        case 'memory_usage_changed':
          const mbDelta = Math.round(change.delta / 1048576)
          if (change.delta > 0) {
            commentaries.push(`The swarm's memory usage just increased by ${mbDelta}MB. They're storing more coordination data.`)
          } else {
            commentaries.push(`Memory cleanup in progress - freed up ${Math.abs(mbDelta)}MB of swarm coordination data.`)
          }
          break
          
        case 'tasks_completed':
          const newTasks = change.delta
          if (newTasks > 0) {
            commentaries.push(`${newTasks} coordination task${newTasks > 1 ? 's' : ''} just completed! The swarm is making progress.`)
          }
          break
      }
    }
    
    return commentaries.length > 0 ? commentaries[Math.floor(Math.random() * commentaries.length)] : null
  }

  /**
   * Generate educational commentary for detected patterns
   */
  generatePatternCommentary(patternData) {
    const { pattern, description, intensity } = patternData
    
    const commentaries = {
      agent_scaling: [
        `The swarm is scaling up! This is called "dynamic agent allocation" - adding more AI minds to handle increased complexity.`,
        `Agent scaling detected! It's like calling in specialists when a project gets more complex. Each agent brings unique capabilities.`,
        `More agents are joining the coordination effort. This distributed approach prevents any single AI from becoming a bottleneck.`
      ],
      
      high_activity: [
        `High swarm activity period! This is what "emergent coordination" looks like - multiple AIs working together in real-time.`,
        `The swarm is in high-activity mode. It's fascinating to watch decentralized intelligence coordinate complex tasks.`,
        `Lots of inter-agent communication happening right now. This is distributed problem-solving at work!`
      ],
      
      memory_spike: [
        `Memory usage spike detected! The swarm is storing more coordination data - building up its collective knowledge base.`,
        `The agents are sharing more information than usual. This distributed memory system is how swarms maintain context.`,
        `Memory allocation increase suggests complex coordination patterns. The swarm is tackling something sophisticated!`
      ]
    }
    
    const patternCommentaries = commentaries[pattern]
    if (!patternCommentaries) return null
    
    let baseCommentary = patternCommentaries[Math.floor(Math.random() * patternCommentaries.length)]
    
    // Add intensity-based context
    if (intensity > 2) {
      baseCommentary += ` The intensity is quite high - this is some serious AI coordination happening!`
    } else if (intensity > 1.5) {
      baseCommentary += ` The pattern is moderately intense, showing active collaboration.`
    }
    
    return baseCommentary
  }

  /**
   * Generate development process commentary
   */
  generateDevelopmentCommentary(eventData) {
    const { eventType, details } = eventData
    
    const commentaries = {
      git_commit: [
        `A git commit just happened! The swarm development process includes version control - just like human software teams.`,
        `New code was committed to the repository. The swarm's development workflow includes proper source control practices.`,
        `Git commit detected! Even AI development follows best practices like version control and change tracking.`
      ],
      
      ci_build: [
        `Continuous integration build in progress! The swarm tests its own development work automatically.`,
        `A CI/CD pipeline just triggered. The swarm is continuously validating its own coordination improvements.`,
        `Build and test cycle detected! The swarm practices DevOps - developing and operating its own systems.`
      ],
      
      deployment: [
        `Deployment event! The swarm is updating its live coordination systems - self-improving AI in action.`,
        `New swarm capabilities are being deployed. This is continuous evolution of AI coordination systems.`,
        `System deployment detected! The swarm maintains and updates its own operational environment.`
      ]
    }
    
    const eventCommentaries = commentaries[eventType]
    if (!eventCommentaries) return null
    
    return eventCommentaries[Math.floor(Math.random() * eventCommentaries.length)]
  }

  /**
   * Generate adaptive commentary based on player behavior
   */
  generateAdaptiveCommentary(behaviorData) {
    const { behavior, playerLevel, context } = behaviorData
    
    const levelContent = this.getEducationalContent(behavior, playerLevel)
    if (!levelContent) return null
    
    return levelContent[Math.floor(Math.random() * levelContent.length)]
  }

  /**
   * Get educational content based on topic and player level
   */
  getEducationalContent(topic, level = 'beginner') {
    const topicMap = {
      swarm_coordination: 'swarmCoordination',
      development_process: 'developmentProcess'
    }
    
    const mappedTopic = topicMap[topic] || topic
    const content = this.educationalContent[mappedTopic]
    
    if (!content) return null
    
    return content[level] || content.beginner || null
  }

  /**
   * Update development context for better commentary
   */
  updateDevelopmentContext(activityData) {
    this.state.developmentContext = {
      ...this.state.developmentContext,
      lastActivity: activityData,
      timestamp: Date.now(),
      currentPhase: this.inferDevelopmentPhase(activityData)
    }
  }

  /**
   * Infer current development phase from activity
   */
  inferDevelopmentPhase(activityData) {
    const changes = activityData.changes
    
    if (changes.some(c => c.type === 'agent_count_changed' && c.delta > 0)) {
      return 'scaling_up'
    }
    
    if (changes.some(c => c.type === 'tasks_completed')) {
      return 'active_development'
    }
    
    if (changes.some(c => c.type === 'memory_usage_changed')) {
      return 'coordination_intensive'
    }
    
    return 'steady_state'
  }

  /**
   * Emit commentary to the game system
   */
  emitCommentary(commentary, type) {
    this.state.commentaryCount++
    this.state.lastCommentaryTime = Date.now()
    
    this.emit('commentary-generated', {
      commentary,
      type,
      timestamp: Date.now(),
      metadata: {
        educationalMode: this.config.educationalMode,
        developmentPhase: this.state.developmentContext?.currentPhase
      }
    })
  }

  /**
   * Track player behavior for adaptive commentary
   */
  trackPlayerBehavior(behavior, data = null, playerLevel = 'beginner') {
    this.emit('player-behavior-change', {
      behavior,
      data,
      playerLevel,
      timestamp: Date.now()
    })
  }

  /**
   * Detect development process events
   */
  detectDevelopmentEvent(command, output) {
    let eventType = null
    let details = {}
    
    // Git operations
    if (this.patterns.gitOperations.test(command)) {
      eventType = 'git_commit'
      details = { command, hasOutput: !!output }
    }
    
    // CI/CD operations
    if (this.patterns.cicdOperations.test(command)) {
      eventType = 'ci_build'
      details = { command, hasOutput: !!output }
    }
    
    if (eventType) {
      this.emit('development-event', { eventType, details, timestamp: Date.now() })
    }
  }

  /**
   * Get current monitoring statistics
   */
  getMonitoringStats() {
    return {
      isMonitoring: this.state.isMonitoring,
      commentaryCount: this.state.commentaryCount,
      patternsDetected: this.state.detectedPatterns.size,
      activityHistoryLength: this.state.activityHistory.length,
      playerBehaviors: this.state.playerBehavior.size,
      lastSwarmUpdate: this.state.lastSwarmStatus ? Date.now() - this.state.lastSwarmStatus.timestamp : null,
      developmentPhase: this.state.developmentContext?.currentPhase || 'unknown'
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = {
      ...this.config,
      ...newConfig
    }
    
    console.log(chalk.gray('[Swarm Monitor] Configuration updated'))
  }
}

module.exports = SwarmMetaCommentaryMonitor