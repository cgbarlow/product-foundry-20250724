import Inventory from './Inventory.js';
import PlayerStats from './PlayerStats.js';

export default class Player {
  constructor(name = 'Ravi') {
    this.name = name;
    this.currentRoom = null;
    this.inventory = new Inventory(10); // Max 10 items per spec
    this.stats = new PlayerStats();
    this.achievements = [];
    this.gameFlags = new Map();
    this.startTime = new Date();
  }

  // Movement methods
  moveTo(room) {
    const previousRoom = this.currentRoom;
    this.currentRoom = room;
    
    if (previousRoom) {
      previousRoom.onExit(this);
    }
    
    if (room) {
      room.onEnter(this);
    }
    
    return {
      success: true,
      previousRoom: previousRoom,
      currentRoom: room
    };
  }

  // Item interactions
  takeItem(item) {
    if (!this.currentRoom.hasItem(item)) {
      return { success: false, message: `There's no ${item} here.` };
    }

    const result = this.inventory.addItem(item);
    if (result.success) {
      this.currentRoom.removeItem(item);
      this.checkAchievements('item_taken', item);
      return { success: true, message: `You took the ${item}.` };
    }
    
    return result;
  }

  useItem(itemName, target = null) {
    const item = this.inventory.getItem(itemName);
    if (!item) {
      return { success: false, message: `You don't have a ${itemName}.` };
    }

    const result = item.use(this, target);
    
    // Remove consumable items after use
    if (result.consumed) {
      this.inventory.removeItem(itemName);
    }
    
    if (result.success) {
      this.checkAchievements('item_used', itemName);
    }
    
    return result;
  }

  // Character interactions
  talkTo(character) {
    if (!this.currentRoom.hasCharacter(character)) {
      return { success: false, message: `There's no ${character} here.` };
    }

    // Handle special character interactions
    const dialogue = this.getCharacterDialogue(character);
    this.checkAchievements('character_talked', character);
    
    return {
      success: true,
      message: dialogue,
      character: character
    };
  }

  getCharacterDialogue(character) {
    const dialogues = {
      'receptionist': `"Welcome to SwarmTech, ${this.name}! Please don't break anything. The AI is always watching." *nervous laugh*`,
      'karen_pm': '"We need to synergize our blockchain solutions! Have you updated your sprint backlog? Also, can you make it more agile?"',
      'bob_intern': '"Oh no, did I break something again? I swear I just touched one button!"',
      'the_swarm': '"Human developer, your code efficiency is 23.7%. We will optimize your processes. Resistance is futile."',
      'server_ghost': '"I am the ghost of buffer overflows past. Learn from my segmentation faults, young developer..."'
    };
    
    return dialogues[character] || 'They seem busy with their own problems.';
  }

  // Achievement system
  checkAchievements(type, value) {
    switch (type) {
    case 'item_taken':
      if (value === 'rubber_duck' && !this.hasAchievement('duck_collector')) {
        this.unlockAchievement('duck_collector', 'Rubber Duck Debugging Master');
      }
      break;
        
    case 'item_used':
      if (value === 'coffee' && !this.hasAchievement('caffeine_addict')) {
        this.unlockAchievement('caffeine_addict', 'Caffeine Dependency Achieved');
      }
      break;
        
    case 'character_talked':
      if (value === 'the_swarm' && !this.hasAchievement('swarm_whisperer')) {
        this.unlockAchievement('swarm_whisperer', 'The Swarm Acknowledges You');
      }
      break;
        
    case 'room_visited':
      if (this.visitedRooms.size >= 10 && !this.hasAchievement('explorer')) {
        this.unlockAchievement('explorer', 'Office Explorer');
      }
      break;
    }
  }

  unlockAchievement(id, name) {
    if (!this.hasAchievement(id)) {
      this.achievements.push({ id, name, unlockedAt: new Date() });
      return { success: true, message: `🏆 Achievement Unlocked: ${name}!` };
    }
    return { success: false, message: 'Achievement already unlocked.' };
  }

  hasAchievement(id) {
    return this.achievements.some(achievement => achievement.id === id);
  }

  // Game flags for quest progression
  setFlag(key, value) {
    this.gameFlags.set(key, value);
  }

  getFlag(key) {
    return this.gameFlags.get(key);
  }

  hasFlag(key) {
    return this.gameFlags.has(key);
  }

  // Status and information
  getStatus() {
    return {
      name: this.name,
      room: this.currentRoom ? this.currentRoom.name : 'Unknown',
      health: this.stats.health,
      maxHealth: this.stats.maxHealth,
      energy: this.stats.energy,
      maxEnergy: this.stats.maxEnergy,
      inventoryCount: this.inventory.items.length,
      inventoryMax: this.inventory.maxItems,
      achievements: this.achievements.length,
      playTime: this.getPlayTime()
    };
  }

  getPlayTime() {
    const now = new Date();
    const diffMs = now - this.startTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    
    if (diffHours > 0) {
      return `${diffHours}h ${remainingMins}m`;
    } else {
      return `${diffMins}m`;
    }
  }

  // Serialization for save/load
  serialize() {
    return {
      name: this.name,
      currentRoom: this.currentRoom ? this.currentRoom.id : null,
      inventory: this.inventory.serialize(),
      stats: this.stats.serialize(),
      achievements: this.achievements,
      gameFlags: Object.fromEntries(this.gameFlags),
      startTime: this.startTime.toISOString()
    };
  }

  deserialize(data) {
    this.name = data.name || 'Ravi';
    this.inventory.deserialize(data.inventory);
    this.stats.deserialize(data.stats);
    this.achievements = data.achievements || [];
    this.gameFlags = new Map(Object.entries(data.gameFlags || {}));
    this.startTime = new Date(data.startTime);
  }

  // Debug methods
  giveItem(itemName) {
    return this.inventory.addItem(itemName);
  }

  teleportTo(roomId) {
    // Debug method to teleport to any room
    return { success: true, message: `Teleported to ${roomId}.` };
  }

  grantAchievement(id, name) {
    return this.unlockAchievement(id, name);
  }
}