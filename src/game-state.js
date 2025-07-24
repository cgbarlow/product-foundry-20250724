/**
 * @fileoverview Game state management for Ravi's Adventure
 * Handles save/load, progress tracking, and persistent data
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';

class GameState {
  constructor() {
    this.saveDirectory = path.join(os.homedir(), '.ravis-adventure');
    this.currentSave = null;
    this.gameData = {
      playerName: null,
      startTime: null,
      totalPlayTime: 0,
      achievements: new Set(),
      statistics: {
        choicesMade: 0,
        storiesCompleted: 0,
        secretsFound: 0,
        raviMockingsReceived: 0,
        metaReferencesTriggered: 0
      },
      preferences: {
        autoSave: true,
        skipIntro: false,
        verboseOutput: false,
        colorScheme: 'default'
      }
    };

    this.achievementDefinitions = new Map([
      ['first_steps', {
        name: 'First Steps',
        description: "Made your first choice in Ravi's world",
        condition: (stats) => stats.choicesMade >= 1
      }],
      ['chatterbox', {
        name: 'Chatterbox',
        description: 'Had a full conversation with Ravi',
        condition: (stats) => stats.choicesMade >= 10
      }],
      ['meta_master', {
        name: 'Meta Master',
        description: 'Triggered 5 meta-narrative references',
        condition: (stats) => stats.metaReferencesTriggered >= 5
      }],
      ['speed_demon', {
        name: 'Speed Demon',
        description: 'Completed a story path in under 5 minutes',
        condition: (stats, gameData) => gameData.totalPlayTime < 300000 && stats.storiesCompleted >= 1
      }],
      ['completionist', {
        name: 'Completionist',
        description: 'Explored all three main story paths',
        condition: (stats) => stats.storiesCompleted >= 3
      }],
      ['ravi_whisperer', {
        name: 'Ravi Whisperer',
        description: 'Survived 50 of Ravi\'s mocking comments',
        condition: (stats) => stats.raviMockingsReceived >= 50
      }],
      ['secret_hunter', {
        name: 'Secret Hunter',
        description: 'Found all hidden easter eggs',
        condition: (stats) => stats.secretsFound >= 7
      }],
      ['swarm_sympathizer', {
        name: 'Swarm Sympathizer',
        description: 'Showed understanding of the AI development process',
        condition: (stats) => stats.metaReferencesTriggered >= 10
      }]
    ]);
  }

  /**
   * Initialize game state directory
   */
  async initialize() {
    try {
      await fs.mkdir(this.saveDirectory, { recursive: true });
    } catch (error) {
      console.warn('Could not create save directory:', error.message);
    }
  }

  /**
   * Start a new game session
   * @param {string} playerName - Player's name
   */
  startNewGame(playerName = 'Player') {
    this.gameData.playerName = playerName;
    this.gameData.startTime = Date.now();
    this.gameData.totalPlayTime = 0;
    this.gameData.achievements = new Set();
    this.gameData.statistics = {
      choicesMade: 0,
      storiesCompleted: 0,
      secretsFound: 0,
      raviMockingsReceived: 0,
      metaReferencesTriggered: 0
    };

    this.recordStatistic('choicesMade', 0); // Initialize
    return this.gameData;
  }

  /**
   * Record a game statistic
   * @param {string} statName - Statistic name
   * @param {number} increment - Amount to increment (default 1)
   */
  recordStatistic(statName, increment = 1) {
    if (!(statName in this.gameData.statistics)) {
      console.warn(`Unknown statistic: ${statName}`);
      return;
    }

    this.gameData.statistics[statName] += increment;
    this.checkAchievements();
  }

  /**
   * Check and unlock achievements
   */
  checkAchievements() {
    for (const [achievementId, achievement] of this.achievementDefinitions) {
      if (!this.gameData.achievements.has(achievementId)) {
        if (achievement.condition(this.gameData.statistics, this.gameData)) {
          this.unlockAchievement(achievementId);
        }
      }
    }
  }

  /**
   * Unlock an achievement
   * @param {string} achievementId - Achievement identifier
   */
  unlockAchievement(achievementId) {
    const achievement = this.achievementDefinitions.get(achievementId);
    if (!achievement) {
      console.warn(`Unknown achievement: ${achievementId}`);
      return;
    }

    this.gameData.achievements.add(achievementId);
    
    // Return achievement data for UI display
    return {
      id: achievementId,
      name: achievement.name,
      description: achievement.description,
      unlockedAt: Date.now()
    };
  }

  /**
   * Get all unlocked achievements
   */
  getUnlockedAchievements() {
    return Array.from(this.gameData.achievements).map(id => ({
      id,
      ...this.achievementDefinitions.get(id)
    }));
  }

  /**
   * Get achievement progress
   */
  getAchievementProgress() {
    const total = this.achievementDefinitions.size;
    const unlocked = this.gameData.achievements.size;
    return {
      unlocked,
      total,
      percentage: Math.round((unlocked / total) * 100)
    };
  }

  /**
   * Update total play time
   */
  updatePlayTime() {
    if (this.gameData.startTime) {
      this.gameData.totalPlayTime = Date.now() - this.gameData.startTime;
    }
  }

  /**
   * Get formatted play time
   */
  getFormattedPlayTime() {
    const totalSeconds = Math.floor(this.gameData.totalPlayTime / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Save game state to file
   * @param {string} saveName - Save file name
   * @param {Object} storyState - Current story state
   */
  async saveGame(saveName, storyState = {}) {
    await this.initialize();
    
    this.updatePlayTime();
    
    const saveData = {
      gameData: {
        ...this.gameData,
        achievements: Array.from(this.gameData.achievements)
      },
      storyState,
      savedAt: Date.now(),
      version: '1.0.0'
    };

    const saveFile = path.join(this.saveDirectory, `${saveName}.json`);
    
    try {
      await fs.writeFile(saveFile, JSON.stringify(saveData, null, 2));
      this.currentSave = saveName;
      return saveFile;
    } catch (error) {
      throw new Error(`Failed to save game: ${error.message}`);
    }
  }

  /**
   * Load game state from file
   * @param {string} saveName - Save file name
   */
  async loadGame(saveName) {
    const saveFile = path.join(this.saveDirectory, `${saveName}.json`);
    
    try {
      const saveData = JSON.parse(await fs.readFile(saveFile, 'utf8'));
      
      this.gameData = {
        ...this.gameData,
        ...saveData.gameData,
        achievements: new Set(saveData.gameData.achievements || [])
      };
      
      this.currentSave = saveName;
      return saveData;
    } catch (error) {
      throw new Error(`Failed to load game: ${error.message}`);
    }
  }

  /**
   * Get list of available save files
   */
  async getSaveFiles() {
    await this.initialize();
    
    try {
      const files = await fs.readdir(this.saveDirectory);
      const saveFiles = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const filePath = path.join(this.saveDirectory, file);
            const stats = await fs.stat(filePath);
            const saveData = JSON.parse(await fs.readFile(filePath, 'utf8'));
            
            saveFiles.push({
              name: file.replace('.json', ''),
              playerName: saveData.gameData?.playerName || 'Unknown',
              savedAt: saveData.savedAt,
              playTime: this.formatTime(saveData.gameData?.totalPlayTime || 0),
              size: stats.size
            });
          } catch (error) {
            console.warn(`Corrupted save file: ${file}`);
          }
        }
      }

      return saveFiles.sort((a, b) => b.savedAt - a.savedAt);
    } catch (error) {
      return [];
    }
  }

  /**
   * Delete a save file
   * @param {string} saveName - Save file name
   */
  async deleteSave(saveName) {
    const saveFile = path.join(this.saveDirectory, `${saveName}.json`);
    
    try {
      await fs.unlink(saveFile);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete save: ${error.message}`);
    }
  }

  /**
   * Auto-save current game state
   * @param {Object} storyState - Current story state
   */
  async autoSave(storyState = {}) {
    if (!this.gameData.preferences.autoSave) {
      return null;
    }

    const autoSaveName = `autosave_${Date.now()}`;
    await this.saveGame(autoSaveName, storyState);
    
    // Keep only the 3 most recent autosaves
    await this.cleanupAutoSaves();
    
    return autoSaveName;
  }

  /**
   * Clean up old auto-save files
   */
  async cleanupAutoSaves() {
    try {
      const saveFiles = await this.getSaveFiles();
      const autoSaves = saveFiles
        .filter(save => save.name.startsWith('autosave_'))
        .sort((a, b) => b.savedAt - a.savedAt);

      // Delete all but the 3 most recent
      for (let i = 3; i < autoSaves.length; i++) {
        await this.deleteSave(autoSaves[i].name);
      }
    } catch (error) {
      console.warn('Auto-save cleanup failed:', error.message);
    }
  }

  /**
   * Format time duration
   * @param {number} milliseconds - Time in milliseconds
   */
  formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Set user preference
   * @param {string} key - Preference key
   * @param {*} value - Preference value
   */
  setPreference(key, value) {
    if (key in this.gameData.preferences) {
      this.gameData.preferences[key] = value;
    } else {
      console.warn(`Unknown preference: ${key}`);
    }
  }

  /**
   * Get user preference
   * @param {string} key - Preference key
   * @param {*} defaultValue - Default value
   */
  getPreference(key, defaultValue = null) {
    return this.gameData.preferences[key] ?? defaultValue;
  }

  /**
   * Get game statistics summary
   */
  getStatsSummary() {
    return {
      ...this.gameData.statistics,
      playTime: this.getFormattedPlayTime(),
      achievements: this.getAchievementProgress()
    };
  }

  /**
   * Export game data for sharing/analysis
   */
  exportGameData() {
    return {
      playerName: this.gameData.playerName,
      statistics: this.gameData.statistics,
      achievements: Array.from(this.gameData.achievements),
      playTime: this.gameData.totalPlayTime,
      exportedAt: Date.now()
    };
  }

  /**
   * Get current save name
   */
  getCurrentSave() {
    return this.currentSave;
  }

  /**
   * Check if auto-save is enabled
   */
  isAutoSaveEnabled() {
    return this.gameData.preferences.autoSave;
  }
}

export default GameState;