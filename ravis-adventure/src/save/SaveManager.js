import fs from 'fs';
import path from 'path';

export default class SaveManager {
  constructor(saveDirectory = './saves') {
    this.saveDirectory = saveDirectory;
    this.maxSaveSlots = 3;
    this.ensureSaveDirectory();
  }

  ensureSaveDirectory() {
    try {
      if (!fs.existsSync(this.saveDirectory)) {
        fs.mkdirSync(this.saveDirectory, { recursive: true });
      }
    } catch (error) {
      console.error('Failed to create save directory:', error);
    }
  }

  saveGame(gameState, slotName = 'quicksave') {
    try {
      const saveData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        slotName: slotName,
        gameState: gameState,
        playTime: this.calculatePlayTime(gameState.player?.startTime),
        checksum: this.generateChecksum(gameState)
      };

      const filename = this.getSaveFilename(slotName);
      const filepath = path.join(this.saveDirectory, filename);
      
      fs.writeFileSync(filepath, JSON.stringify(saveData, null, 2));
      
      return {
        success: true,
        message: `Game saved to slot '${slotName}' successfully.`,
        filepath: filepath,
        timestamp: saveData.timestamp
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to save game: ${error.message}`,
        error: error
      };
    }
  }

  loadGame(slotName = 'quicksave') {
    try {
      const filename = this.getSaveFilename(slotName);
      const filepath = path.join(this.saveDirectory, filename);
      
      if (!fs.existsSync(filepath)) {
        return {
          success: false,
          message: `No save file found for slot '${slotName}'.`
        };
      }

      const saveData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      
      // Validate save data
      const validation = this.validateSaveData(saveData);
      if (!validation.valid) {
        return {
          success: false,
          message: `Save file is corrupted: ${validation.error}`,
          corrupted: true
        };
      }

      return {
        success: true,
        message: `Game loaded from slot '${slotName}' successfully.`,
        gameState: saveData.gameState,
        timestamp: saveData.timestamp,
        playTime: saveData.playTime
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to load game: ${error.message}`,
        error: error
      };
    }
  }

  listSaves() {
    try {
      const files = fs.readdirSync(this.saveDirectory);
      const saveFiles = files.filter(file => file.endsWith('.sav'));
      
      const saves = saveFiles.map(file => {
        try {
          const filepath = path.join(this.saveDirectory, file);
          const saveData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
          
          return {
            slotName: saveData.slotName,
            timestamp: saveData.timestamp,
            playTime: saveData.playTime,
            version: saveData.version,
            valid: this.validateSaveData(saveData).valid,
            size: fs.statSync(filepath).size
          };
        } catch (error) {
          return {
            slotName: path.basename(file, '.sav'),
            timestamp: 'Unknown',
            playTime: 'Unknown',
            version: 'Unknown',
            valid: false,
            corrupted: true,
            error: error.message
          };
        }
      });

      return {
        success: true,
        saves: saves,
        count: saves.length
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to list saves: ${error.message}`,
        error: error
      };
    }
  }

  deleteSave(slotName) {
    try {
      const filename = this.getSaveFilename(slotName);
      const filepath = path.join(this.saveDirectory, filename);
      
      if (!fs.existsSync(filepath)) {
        return {
          success: false,
          message: `No save file found for slot '${slotName}'.`
        };
      }

      fs.unlinkSync(filepath);
      
      return {
        success: true,
        message: `Save file '${slotName}' deleted successfully.`
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to delete save: ${error.message}`,
        error: error
      };
    }
  }

  backupSave(slotName) {
    try {
      const filename = this.getSaveFilename(slotName);
      const filepath = path.join(this.saveDirectory, filename);
      
      if (!fs.existsSync(filepath)) {
        return {
          success: false,
          message: `No save file found for slot '${slotName}'.`
        };
      }

      const backupFilename = `${slotName}_backup_${Date.now()}.sav`;
      const backupFilepath = path.join(this.saveDirectory, backupFilename);
      
      fs.copyFileSync(filepath, backupFilepath);
      
      return {
        success: true,
        message: `Save file backed up as '${backupFilename}'.`,
        backupFile: backupFilename
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to backup save: ${error.message}`,
        error: error
      };
    }
  }

  getSaveFilename(slotName) {
    // Sanitize slot name for filename
    const sanitized = slotName.replace(/[^a-zA-Z0-9_-]/g, '_');
    return `${sanitized}.sav`;
  }

  validateSaveData(saveData) {
    try {
      // Check required fields
      if (!saveData.version) {
        return { valid: false, error: 'Missing version field' };
      }
      
      if (!saveData.gameState) {
        return { valid: false, error: 'Missing game state' };
      }
      
      if (!saveData.timestamp) {
        return { valid: false, error: 'Missing timestamp' };
      }

      // Check game state structure
      const gameState = saveData.gameState;
      if (!gameState.player) {
        return { valid: false, error: 'Missing player data' };
      }

      // Validate checksum if present
      if (saveData.checksum) {
        const expectedChecksum = this.generateChecksum(gameState);
        if (saveData.checksum !== expectedChecksum) {
          return { valid: false, error: 'Checksum mismatch - save file may be corrupted' };
        }
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: `Validation error: ${error.message}` };
    }
  }

  generateChecksum(gameState) {
    // Simple checksum based on key game state properties
    try {
      const key = JSON.stringify({
        player: gameState.player?.name,
        room: gameState.currentRoom,
        inventory: gameState.player?.inventory?.items,
        achievements: gameState.player?.achievements?.length || 0
      });
      
      // Simple hash function
      let hash = 0;
      for (let i = 0; i < key.length; i++) {
        const char = key.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      return hash.toString(16);
    } catch (error) {
      return 'invalid';
    }
  }

  calculatePlayTime(startTime) {
    if (!startTime) return 'Unknown';
    
    try {
      const start = new Date(startTime);
      const now = new Date();
      const diffMs = now - start;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const remainingMins = diffMins % 60;
      
      if (diffHours > 0) {
        return `${diffHours}h ${remainingMins}m`;
      } else {
        return `${diffMins}m`;
      }
    } catch (error) {
      return 'Unknown';
    }
  }

  // Auto-save functionality
  createAutoSave(gameState) {
    const autoSaveSlot = `autosave_${Date.now()}`;
    const result = this.saveGame(gameState, autoSaveSlot);
    
    // Clean up old auto-saves (keep only last 5)
    if (result.success) {
      this.cleanupAutoSaves();
    }
    
    return result;
  }

  cleanupAutoSaves() {
    try {
      const files = fs.readdirSync(this.saveDirectory);
      const autoSaves = files
        .filter(file => file.startsWith('autosave_') && file.endsWith('.sav'))
        .map(file => ({
          name: file,
          path: path.join(this.saveDirectory, file),
          stats: fs.statSync(path.join(this.saveDirectory, file))
        }))
        .sort((a, b) => b.stats.mtime - a.stats.mtime); // Newest first

      // Keep only the 5 most recent auto-saves
      const toDelete = autoSaves.slice(5);
      
      toDelete.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (error) {
          console.error(`Failed to delete old auto-save ${file.name}:`, error);
        }
      });
      
      return {
        success: true,
        cleaned: toDelete.length,
        remaining: Math.min(autoSaves.length, 5)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Import/Export functionality
  exportSave(slotName, exportPath) {
    try {
      const loadResult = this.loadGame(slotName);
      if (!loadResult.success) {
        return loadResult;
      }

      fs.copyFileSync(
        path.join(this.saveDirectory, this.getSaveFilename(slotName)),
        exportPath
      );

      return {
        success: true,
        message: `Save exported to ${exportPath}`,
        exportPath: exportPath
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to export save: ${error.message}`,
        error: error
      };
    }
  }

  importSave(importPath, slotName) {
    try {
      if (!fs.existsSync(importPath)) {
        return {
          success: false,
          message: 'Import file not found.'
        };
      }

      // Validate the imported save
      const saveData = JSON.parse(fs.readFileSync(importPath, 'utf8'));
      const validation = this.validateSaveData(saveData);
      
      if (!validation.valid) {
        return {
          success: false,
          message: `Invalid save file: ${validation.error}`
        };
      }

      const filename = this.getSaveFilename(slotName);
      const filepath = path.join(this.saveDirectory, filename);
      
      fs.copyFileSync(importPath, filepath);

      return {
        success: true,
        message: `Save imported to slot '${slotName}' successfully.`
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to import save: ${error.message}`,
        error: error
      };
    }
  }
}