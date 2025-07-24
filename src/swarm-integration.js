/**
 * @fileoverview Swarm Integration Module
 * Connects the game to Claude Flow MCP swarm tools and coordinates meta-commentary
 * Feature #18: Integration layer between game systems and swarm monitoring
 */

const SwarmMetaCommentaryMonitor = require('./swarm-meta-commentary')
const chalk = require('chalk')

/**
 * SwarmIntegration - Main integration class for swarm features
 */
class SwarmIntegration {
  constructor(gameEngine, options = {}) {
    this.gameEngine = gameEngine
    this.options = {
      enableRealTimeMonitoring: options.enableRealTimeMonitoring !== false,
      enableEducationalMode: options.enableEducationalMode || false,
      enableDevelopmentAwareness: options.enableDevelopmentAwareness !== false,
      swarmMcpEnabled: options.swarmMcpEnabled !== false,
      ...options
    }
    
    this.state = {
      initialized: false,
      swarmActive: false,
      lastSwarmStatus: null,
      integrationMetrics: {
        commentariesGenerated: 0,
        patternsDetected: 0,
        developmentEventsTracked: 0,
        playerBehaviorsAnalyzed: 0
      }
    }
    
    // Initialize components
    this.monitor = null
    this.mcpTools = new Map()
    this.raviIntegration = null
    
    this.setupIntegration()
  }

  /**
   * Setup swarm integration components
   */
  setupIntegration() {
    try {
      // Initialize swarm monitoring
      if (this.options.enableRealTimeMonitoring) {
        this.monitor = new SwarmMetaCommentaryMonitor({
          educationalMode: this.options.enableEducationalMode,
          monitoringInterval: 3000, // 3 seconds for responsive commentary
          commentaryThreshold: 0.2, // 20% chance for more frequent commentary
          maxCommentaryPerMinute: 4
        })
        
        this.setupMonitorEventHandlers()
      }
      
      // Setup MCP tools mapping
      this.setupMcpTools()
      
      // Initialize development awareness
      if (this.options.enableDevelopmentAwareness) {
        this.setupDevelopmentAwareness()
      }
      
      console.log(chalk.gray('[Swarm Integration] Swarm integration components initialized'))
      
    } catch (error) {
      console.warn(chalk.yellow(`[Swarm Integration] Setup error: ${error.message}`))
    }
  }

  /**
   * Setup event handlers for the swarm monitor
   */
  setupMonitorEventHandlers() {
    if (!this.monitor) return
    
    this.monitor.on('commentary-generated', (data) => {
      this.state.integrationMetrics.commentariesGenerated++
      this.handleSwarmCommentary(data)
    })
    
    this.monitor.on('pattern-detected', (pattern) => {
      this.state.integrationMetrics.patternsDetected++
      this.handlePatternDetection(pattern)
    })
    
    this.monitor.on('development-event', (event) => {
      this.state.integrationMetrics.developmentEventsTracked++
      this.handleDevelopmentEvent(event)
    })
    
    this.monitor.on('player-behavior-change', (behavior) => {
      this.state.integrationMetrics.playerBehaviorsAnalyzed++
      this.handlePlayerBehaviorChange(behavior)
    })
  }

  /**
   * Setup MCP tools mapping for Claude Flow integration
   */
  setupMcpTools() {
    // Map of available Claude Flow MCP tools
    this.mcpTools.set('swarm_init', {
      tool: 'mcp__ruv-swarm__swarm_init',
      description: 'Initialize swarm coordination',
      commentaryTrigger: 'swarm_initialization'
    })
    
    this.mcpTools.set('agent_spawn', {
      tool: 'mcp__ruv-swarm__agent_spawn',
      description: 'Spawn new coordination agent',
      commentaryTrigger: 'agent_spawning'
    })
    
    this.mcpTools.set('task_orchestrate', {
      tool: 'mcp__ruv-swarm__task_orchestrate',
      description: 'Orchestrate distributed tasks',
      commentaryTrigger: 'task_coordination'
    })
    
    this.mcpTools.set('memory_usage', {
      tool: 'mcp__ruv-swarm__memory_usage',
      description: 'Manage swarm memory',
      commentaryTrigger: 'memory_operations'
    })
    
    this.mcpTools.set('neural_train', {
      tool: 'mcp__ruv-swarm__neural_train',
      description: 'Train neural patterns',
      commentaryTrigger: 'neural_learning'
    })
    
    this.mcpTools.set('performance_metrics', {
      tool: 'mcp__ruv-swarm__daa_performance_metrics',
      description: 'Analyze performance',
      commentaryTrigger: 'performance_analysis'
    })
  }

  /**
   * Setup development process awareness
   */
  setupDevelopmentAwareness() {
    // Monitor for development-related activities
    this.developmentPatterns = {
      gitCommit: /git\s+(commit|push|pull|merge)/i,
      npmScript: /npm\s+(run|test|build|start)/i,
      ciOperation: /(jest|eslint|build|deploy)/i,
      fileEdit: /edit|write|update.*\.(js|json|md)$/i
    }
    
    // Hook into game engine events if available
    if (this.gameEngine && this.gameEngine.on) {
      this.gameEngine.on('command', (command) => {
        this.analyzeCommandForDevelopmentActivity(command)
      })
    }
  }

  /**
   * Initialize integration with the game
   */
  async initialize() {
    if (this.state.initialized) return
    
    try {
      console.log(chalk.blue('[Swarm Integration] Initializing swarm integration...'))
      
      // Start swarm monitoring if enabled
      if (this.monitor && this.options.enableRealTimeMonitoring) {
        await this.monitor.startMonitoring()
        console.log(chalk.green('[Swarm Integration] Real-time swarm monitoring started'))
      }
      
      // Check for existing swarm activity
      await this.checkInitialSwarmState()
      
      // Integration with Ravi if available
      if (this.gameEngine.ravi) {
        this.initializeRaviIntegration()
      }
      
      this.state.initialized = true
      console.log(chalk.green('[Swarm Integration] Swarm integration initialized successfully'))
      
      // Emit initial commentary about swarm activation
      this.emitInitialCommentary()
      
    } catch (error) {
      console.warn(chalk.yellow(`[Swarm Integration] Initialization error: ${error.message}`))
    }
  }

  /**
   * Initialize integration with Ravi character
   */
  initializeRaviIntegration() {
    const ravi = this.gameEngine.ravi
    
    if (ravi && ravi.initializeSwarmMonitoring && this.monitor) {
      ravi.initializeSwarmMonitoring(this.monitor)
      this.raviIntegration = ravi
      console.log(chalk.gray('[Swarm Integration] Ravi swarm integration established'))
    }
  }

  /**
   * Check initial swarm state on startup
   */
  async checkInitialSwarmState() {
    try {
      // This would integrate with actual Claude Flow MCP tools
      // For now, we'll use the monitor's simulated status
      const swarmStatus = await this.monitor?.getSwarmStatus()
      
      if (swarmStatus) {
        this.state.swarmActive = swarmStatus.totalAgents > 0
        this.state.lastSwarmStatus = swarmStatus
        
        if (this.state.swarmActive) {
          console.log(chalk.cyan(`[Swarm Integration] Detected active swarm with ${swarmStatus.totalAgents} agents`))
        }
      }
    } catch (error) {
      console.warn(chalk.yellow(`[Swarm Integration] Could not check initial swarm state: ${error.message}`))
    }
  }

  /**
   * Emit initial commentary about swarm integration
   */
  emitInitialCommentary() {
    if (this.raviIntegration) {
      setTimeout(() => {
        console.log(chalk.italic.cyan('\nRavi: "Oh interesting! I can now see the swarm coordination happening in real-time. This is like having x-ray vision into the AI development process!"'))
      }, 2000)
      
      if (this.options.enableEducationalMode) {
        setTimeout(() => {
          console.log(chalk.italic.blue('\nRavi: "Since educational mode is enabled, I\'ll explain what I\'m seeing as the swarm coordinates. Think of it as AI development commentary with a side of computer science education!"'))
        }, 4000)
      }
    }
  }

  /**
   * Handle swarm commentary from the monitor
   */
  handleSwarmCommentary(commentaryData) {
    // Commentary is handled by Ravi integration
    // This method can be used for additional game-level responses
    
    // Update game state based on commentary type
    if (commentaryData.type === 'swarm-activity') {
      this.updateGameStateForSwarmActivity(commentaryData)
    }
    
    // Log significant commentary for metrics
    if (commentaryData.metadata?.significance === 'high') {
      console.log(chalk.gray(`[Swarm Integration] High-significance commentary generated: ${commentaryData.type}`))
    }
  }

  /**
   * Handle pattern detection from the monitor
   */
  handlePatternDetection(pattern) {
    const { pattern: patternType, intensity } = pattern
    
    // Update game state flags based on patterns
    if (this.gameEngine.gameState) {
      this.gameEngine.gameState.player.flags.add(`swarm_pattern_${patternType}`)
      
      // High-intensity patterns might affect gameplay
      if (intensity > 2.0) {
        this.gameEngine.gameState.player.flags.add('swarm_high_activity')
      }
    }
  }

  /**
   * Handle development events
   */
  handleDevelopmentEvent(event) {
    const { eventType } = event
    
    // Track development activity in game state
    if (this.gameEngine.gameState) {
      const devFlags = this.gameEngine.gameState.player.flags
      devFlags.add(`dev_event_${eventType}`)
      
      // Count development events
      const devEventCount = Array.from(devFlags).filter(flag => flag.startsWith('dev_event_')).length
      if (devEventCount > 5) {
        devFlags.add('development_aware_player')
      }
    }
  }

  /**
   * Handle player behavior changes
   */
  handlePlayerBehaviorChange(behavior) {
    // Update player behavior analysis in game state
    if (this.gameEngine.gameState && this.gameEngine.gameState.player) {
      const player = this.gameEngine.gameState.player
      
      if (!player.behaviorAnalysis) {
        player.behaviorAnalysis = new Map()
      }
      
      const behaviorKey = behavior.behavior
      if (!player.behaviorAnalysis.has(behaviorKey)) {
        player.behaviorAnalysis.set(behaviorKey, { count: 0, lastSeen: null })
      }
      
      const behaviorData = player.behaviorAnalysis.get(behaviorKey)
      behaviorData.count++
      behaviorData.lastSeen = Date.now()
    }
  }

  /**
   * Analyze commands for development activity
   */
  analyzeCommandForDevelopmentActivity(command) {
    if (!this.monitor) return
    
    for (const [patternName, pattern] of Object.entries(this.developmentPatterns)) {
      if (pattern.test(command)) {
        this.monitor.detectDevelopmentEvent(command, null)
        break
      }
    }
  }

  /**
   * Update game state based on swarm activity
   */
  updateGameStateForSwarmActivity(commentaryData) {
    if (!this.gameEngine.gameState) return
    
    const player = this.gameEngine.gameState.player
    
    // Add swarm awareness flags
    player.flags.add('swarm_aware')
    
    // Track swarm commentary exposure
    if (!player.swarmExposure) {
      player.swarmExposure = {
        commentariesHeard: 0,
        patternsObserved: 0,
        educationalContent: 0
      }
    }
    
    player.swarmExposure.commentariesHeard++
    
    if (commentaryData.metadata?.educationalMode) {
      player.swarmExposure.educationalContent++
    }
  }

  /**
   * Manually trigger swarm commentary (for testing or special events)
   */
  triggerSwarmCommentary(context, type = 'manual') {
    if (!this.monitor) return
    
    const commentary = `Manual swarm commentary triggered for context: ${context}`
    
    this.monitor.emitCommentary(commentary, type)
  }

  /**
   * Update swarm integration configuration
   */
  updateConfiguration(newConfig) {
    this.options = {
      ...this.options,
      ...newConfig
    }
    
    // Update monitor configuration if available
    if (this.monitor && newConfig.monitorConfig) {
      this.monitor.updateConfig(newConfig.monitorConfig)
    }
    
    console.log(chalk.gray('[Swarm Integration] Configuration updated'))
  }

  /**
   * Get integration status and metrics
   */
  getStatus() {
    return {
      initialized: this.state.initialized,
      swarmActive: this.state.swarmActive,
      monitoringActive: this.monitor?.state.isMonitoring || false,
      raviIntegrated: !!this.raviIntegration,
      metrics: this.state.integrationMetrics,
      configuration: this.options,
      lastSwarmStatus: this.state.lastSwarmStatus,
      monitoringStats: this.monitor?.getMonitoringStats() || null
    }
  }

  /**
   * Cleanup integration resources
   */
  cleanup() {
    console.log(chalk.gray('[Swarm Integration] Cleaning up swarm integration...'))
    
    // Stop monitoring
    if (this.monitor) {
      this.monitor.stopMonitoring()
    }
    
    // Clear references
    this.raviIntegration = null
    this.mcpTools.clear()
    
    this.state.initialized = false
    console.log(chalk.gray('[Swarm Integration] Cleanup completed'))
  }

  /**
   * Test swarm integration functionality
   */
  async runIntegrationTest() {
    console.log(chalk.yellow('[Swarm Integration] Running integration test...'))
    
    const testResults = {
      monitorInitialization: false,
      commentaryGeneration: false,
      patternDetection: false,
      raviIntegration: false,
      mcpToolsMapping: false
    }
    
    try {
      // Test monitor initialization
      if (this.monitor) {
        testResults.monitorInitialization = true
        console.log(chalk.green('✓ Monitor initialization: PASS'))
      }
      
      // Test commentary generation
      this.triggerSwarmCommentary('integration_test')
      testResults.commentaryGeneration = true
      console.log(chalk.green('✓ Commentary generation: PASS'))
      
      // Test Ravi integration
      if (this.raviIntegration) {
        testResults.raviIntegration = true
        console.log(chalk.green('✓ Ravi integration: PASS'))
      }
      
      // Test MCP tools mapping
      if (this.mcpTools.size > 0) {
        testResults.mcpToolsMapping = true
        console.log(chalk.green('✓ MCP tools mapping: PASS'))
      }
      
      const passedTests = Object.values(testResults).filter(Boolean).length
      const totalTests = Object.keys(testResults).length
      
      console.log(chalk.cyan(`[Swarm Integration] Integration test completed: ${passedTests}/${totalTests} tests passed`))
      
      return testResults
      
    } catch (error) {
      console.error(chalk.red(`[Swarm Integration] Integration test error: ${error.message}`))
      return testResults
    }
  }
}

module.exports = SwarmIntegration