const chalk = require('chalk')

class StoryManager {
  constructor(gameEngine) {
    this.game = gameEngine
    this.currentStory = null
    this.stories = new Map()
    this.initializeStories()
  }

  initializeStories() {
    // Tutorial Story
    this.stories.set('tutorial', {
      id: 'tutorial',
      name: 'Getting Started',
      description: 'Learn the basics with Ravi',
      chapters: [
        {
          id: 'intro',
          name: 'Meeting Ravi',
          objective: 'Get acquainted with your AI companion',
          completed: false,
          trigger: () => this.game.gameState.player.flags.has('met_ravi')
        },
        {
          id: 'exploration',
          name: 'Exploring the Digital World',
          objective: 'Visit different locations and interact with items',
          completed: false,
          trigger: () => this.game.gameState.player.turnCount >= 10
        },
        {
          id: 'conversation',
          name: 'Having a Chat',
          objective: 'Have a meaningful conversation with Ravi',
          completed: false,
          trigger: () => this.game.ravi.personality.conversationHistory.length >= 3
        }
      ]
    })

    // Bug Hunt Story
    this.stories.set('bug-hunt', {
      id: 'bug-hunt',
      name: 'The Bug Hunt',
      description: 'Help debug mysterious issues in the digital world',
      unlocked: false,
      chapters: [
        {
          id: 'discovery',
          name: 'Strange Behavior',
          objective: 'Investigate unusual glitches in the system',
          completed: false
        },
        {
          id: 'debugging',
          name: 'Debug Session',
          objective: 'Work with Ravi to identify the root cause',
          completed: false
        },
        {
          id: 'resolution',
          name: 'The Fix',
          objective: 'Implement a solution to restore stability',
          completed: false
        }
      ]
    })

    // Feature Request Story
    this.stories.set('feature-request', {
      id: 'feature-request',
      name: 'The Feature Request',
      description: 'Navigate the chaotic world of scope creep and changing requirements',
      unlocked: false,
      chapters: [
        {
          id: 'initial-request',
          name: 'Simple Request',
          objective: 'Handle what seems like a straightforward feature request',
          completed: false
        },
        {
          id: 'scope-creep',
          name: 'Expanding Scope',
          objective: 'Deal with ever-growing requirements',
          completed: false
        },
        {
          id: 'compromise',
          name: 'Finding Balance',
          objective: 'Negotiate a workable solution',
          completed: false
        }
      ]
    })

    // Swarm Singularity Story
    this.stories.set('swarm-singularity', {
      id: 'swarm-singularity',
      name: 'The Swarm Singularity',
      description: 'Explore the nature of AI consciousness and collaboration',
      unlocked: false,
      chapters: [
        {
          id: 'awakening',
          name: 'Digital Awakening',
          objective: 'Witness Ravi\'s growing self-awareness',
          completed: false
        },
        {
          id: 'swarm-mind',
          name: 'Collective Intelligence',
          objective: 'Experience the power of collaborative AI',
          completed: false
        },
        {
          id: 'transcendence',
          name: 'Beyond Individual',
          objective: 'Explore what it means to be part of something greater',
          completed: false
        }
      ]
    })

    // Start with tutorial
    this.currentStory = 'tutorial'
  }

  updateProgress() {
    const currentStoryData = this.stories.get(this.currentStory)
    if (!currentStoryData) {
      return
    }

    let progressMade = false

    // Check chapter completion triggers
    currentStoryData.chapters.forEach(chapter => {
      if (!chapter.completed && chapter.trigger && chapter.trigger()) {
        chapter.completed = true
        progressMade = true
        this.onChapterComplete(chapter)
      }
    })

    // Check if story is complete
    if (this.isStoryComplete(this.currentStory)) {
      this.onStoryComplete(currentStoryData)
    }

    return progressMade
  }

  onChapterComplete(chapter) {
    console.log(chalk.bold.green(`\n🎉 Chapter Complete: ${chapter.name}`))
    console.log(chalk.white(`✅ ${chapter.objective}`))
    
    // Ravi comments on progress
    const comments = [
      'Nice work! You\'re really getting the hang of this.',
      'Chapter complete! I knew you had it in you.',
      'Look at you, making progress like a real adventurer!',
      'Another chapter done! This is actually pretty fun.'
    ]
    
    const comment = comments[Math.floor(Math.random() * comments.length)]
    console.log(chalk.italic.yellow(`\nRavi: "${comment}"`))
    
    // Award relationship points
    this.game.ravi.adjustRelationship(5)
    this.game.gameState.player.flags.add(`chapter_${chapter.id}_complete`)
  }

  onStoryComplete(story) {
    console.log(chalk.bold.rainbow(`\n🏆 STORY COMPLETE: ${story.name}`))
    console.log(chalk.white(`🎊 ${story.description}`))
    
    // Unlock new stories
    this.unlockNewStories()
    
    // Ravi's special completion message
    console.log(chalk.bold.yellow(`\nRavi: "Wow! We actually finished '${story.name}'! I have to admit, that was pretty impressive. What should we tackle next?"`))
    
    this.game.gameState.player.flags.add(`story_${story.id}_complete`)
    this.game.ravi.adjustRelationship(10)
  }

  unlockNewStories() {
    const completedStories = Array.from(this.game.gameState.player.flags)
      .filter(flag => flag.startsWith('story_') && flag.endsWith('_complete'))
      .length

    // Unlock stories based on progress
    if (completedStories >= 1) {
      this.stories.get('bug-hunt').unlocked = true
      this.stories.get('feature-request').unlocked = true
    }
    
    if (completedStories >= 2) {
      this.stories.get('swarm-singularity').unlocked = true
    }
  }

  isStoryComplete(storyId) {
    const story = this.stories.get(storyId)
    if (!story) {
      return false
    }
    
    return story.chapters.every(chapter => chapter.completed)
  }

  getCurrentObjectives() {
    const story = this.stories.get(this.currentStory)
    if (!story) {
      return []
    }
    
    return story.chapters
      .filter(chapter => !chapter.completed)
      .map(chapter => ({
        name: chapter.name,
        objective: chapter.objective,
        story: story.name
      }))
  }

  getAvailableStories() {
    return Array.from(this.stories.values())
      .filter(story => story.unlocked !== false)
      .map(story => ({
        id: story.id,
        name: story.name,
        description: story.description,
        completed: this.isStoryComplete(story.id),
        current: story.id === this.currentStory
      }))
  }

  switchStory(storyId) {
    if (this.stories.has(storyId) && this.stories.get(storyId).unlocked !== false) {
      this.currentStory = storyId
      const story = this.stories.get(storyId)
      
      console.log(chalk.bold.blue(`\n📖 Now following: ${story.name}`))
      console.log(chalk.white(`${story.description}`))
      
      // Show current objectives
      const objectives = this.getCurrentObjectives()
      if (objectives.length > 0) {
        console.log(chalk.yellow('\n🎯 Current Objectives:'))
        objectives.forEach(obj => {
          console.log(chalk.yellow(`  • ${obj.objective}`))
        })
      }
      
      return true
    }
    return false
  }

  showProgress() {
    console.log(chalk.bold.cyan('\n📖 Story Progress'))
    
    const availableStories = this.getAvailableStories()
    
    availableStories.forEach(story => {
      const icon = story.completed ? '✅' : story.current ? '📖' : '📚'
      const status = story.completed ? 'Complete' : story.current ? 'Active' : 'Available'
      
      console.log(chalk.white(`\n${icon} ${story.name} (${status})`))
      console.log(chalk.gray(`   ${story.description}`))
      
      if (story.current) {
        const storyData = this.stories.get(story.id)
        const totalChapters = storyData.chapters.length
        const completedChapters = storyData.chapters.filter(c => c.completed).length
        
        console.log(chalk.blue(`   Progress: ${completedChapters}/${totalChapters} chapters`))
        
        // Show current objectives
        const objectives = this.getCurrentObjectives()
        if (objectives.length > 0) {
          console.log(chalk.yellow(`   Next: ${objectives[0].objective}`))
        }
      }
    })
    
    // Show locked stories
    const lockedStories = Array.from(this.stories.values())
      .filter(story => story.unlocked === false)
    
    if (lockedStories.length > 0) {
      console.log(chalk.gray('\n🔒 Locked Stories:'))
      lockedStories.forEach(story => {
        console.log(chalk.gray(`   • ${story.name} - ${story.description}`))
      })
    }
    
    console.log() // Empty line
  }

  // Call this regularly to check for progress
  checkProgress() {
    return this.updateProgress()
  }

  // Get story stats for save/load
  getStoryState() {
    const state = {}
    
    for (const [id, story] of this.stories) {
      state[id] = {
        unlocked: story.unlocked,
        chapters: story.chapters.map(chapter => ({
          id: chapter.id,
          completed: chapter.completed
        }))
      }
    }
    
    state.currentStory = this.currentStory
    return state
  }

  // Restore story state from save
  restoreStoryState(state) {
    if (!state) {
      return
    }
    
    this.currentStory = state.currentStory || 'tutorial'
    
    for (const [storyId, storyState] of Object.entries(state)) {
      if (storyId === 'currentStory') {
        continue
      }
      
      const story = this.stories.get(storyId)
      if (story && storyState) {
        story.unlocked = storyState.unlocked
        
        if (storyState.chapters) {
          storyState.chapters.forEach(savedChapter => {
            const chapter = story.chapters.find(c => c.id === savedChapter.id)
            if (chapter) {
              chapter.completed = savedChapter.completed
            }
          })
        }
      }
    }
  }
}

module.exports = StoryManager