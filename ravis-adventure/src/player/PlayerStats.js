export default class PlayerStats {
  constructor() {
    this.maxHealth = 100;
    this.health = 100;
    this.maxEnergy = 100;
    this.energy = 100;
    this.level = 1;
    this.experience = 0;
    this.experienceToNext = 100;
    this.debugSkill = 10;
    this.caffeineLevel = 0;
    this.statusEffects = [];
  }

  // Health management
  takeDamage(amount) {
    const oldHealth = this.health;
    this.health = Math.max(0, this.health - amount);
    const actualDamage = oldHealth - this.health;
    
    if (this.health === 0) {
      return {
        success: true,
        message: `You took ${actualDamage} damage and have been defeated!`,
        defeated: true,
        health: this.health
      };
    }
    
    return {
      success: true,
      message: `You took ${actualDamage} damage. Health: ${this.health}/${this.maxHealth}`,
      health: this.health
    };
  }

  restoreHealth(amount) {
    const oldHealth = this.health;
    this.health = Math.min(this.maxHealth, this.health + amount);
    const actualHealing = this.health - oldHealth;
    
    return {
      success: true,
      message: `You restored ${actualHealing} health. Health: ${this.health}/${this.maxHealth}`,
      health: this.health
    };
  }

  // Energy management
  useEnergy(amount) {
    if (this.energy < amount) {
      return {
        success: false,
        message: 'You don\'t have enough energy for that action.',
        energy: this.energy
      };
    }
    
    this.energy -= amount;
    return {
      success: true,
      message: `Used ${amount} energy. Energy: ${this.energy}/${this.maxEnergy}`,
      energy: this.energy
    };
  }

  restoreEnergy(amount) {
    const oldEnergy = this.energy;
    this.energy = Math.min(this.maxEnergy, this.energy + amount);
    const actualRestore = this.energy - oldEnergy;
    
    return {
      success: true,
      message: `Restored ${actualRestore} energy. Energy: ${this.energy}/${this.maxEnergy}`,
      energy: this.energy
    };
  }

  // Experience and leveling
  gainExperience(amount) {
    this.experience += amount;
    const levelsGained = [];
    
    while (this.experience >= this.experienceToNext) {
      this.levelUp();
      levelsGained.push(this.level);
    }
    
    if (levelsGained.length > 0) {
      return {
        success: true,
        message: `Gained ${amount} XP and leveled up to ${this.level}!`,
        levelsGained: levelsGained,
        experience: this.experience
      };
    }
    
    return {
      success: true,
      message: `Gained ${amount} XP. (${this.experience}/${this.experienceToNext})`,
      experience: this.experience
    };
  }

  levelUp() {
    this.level++;
    this.experience -= this.experienceToNext;
    this.experienceToNext = Math.floor(this.experienceToNext * 1.5);
    
    // Increase stats on level up
    this.maxHealth += 10;
    this.health = this.maxHealth; // Full heal on level up
    this.maxEnergy += 10;
    this.energy = this.maxEnergy; // Full energy on level up
    this.debugSkill += 2;
  }

  // Debug battle mechanics
  getAttackPower() {
    let power = this.debugSkill;
    
    // Caffeine bonus
    if (this.caffeineLevel > 50) {
      power += Math.floor(this.caffeineLevel / 10);
    }
    
    // Status effect bonuses
    if (this.hasStatusEffect('focused')) {
      power *= 1.5;
    }
    
    return Math.floor(power);
  }

  getDefensePower() {
    let defense = Math.floor(this.debugSkill * 0.5);
    
    // Status effect bonuses
    if (this.hasStatusEffect('caffeinated')) {
      defense += 5;
    }
    
    return defense;
  }

  // Status effects
  addStatusEffect(effect, duration = 5) {
    const existing = this.statusEffects.find(e => e.name === effect);
    
    if (existing) {
      existing.duration = Math.max(existing.duration, duration);
      return {
        success: true,
        message: `${effect} effect refreshed.`
      };
    }
    
    this.statusEffects.push({
      name: effect,
      duration: duration,
      appliedAt: Date.now()
    });
    
    return {
      success: true,
      message: `You are now ${effect}.`
    };
  }

  removeStatusEffect(effect) {
    const index = this.statusEffects.findIndex(e => e.name === effect);
    
    if (index > -1) {
      this.statusEffects.splice(index, 1);
      return {
        success: true,
        message: `${effect} effect has worn off.`
      };
    }
    
    return {
      success: false,
      message: `You don't have the ${effect} effect.`
    };
  }

  hasStatusEffect(effect) {
    return this.statusEffects.some(e => e.name === effect);
  }

  updateStatusEffects() {
    const expiredEffects = [];
    
    this.statusEffects = this.statusEffects.filter(effect => {
      effect.duration--;
      if (effect.duration <= 0) {
        expiredEffects.push(effect.name);
        return false;
      }
      return true;
    });
    
    return expiredEffects;
  }

  // Caffeine system
  consumeCaffeine(amount) {
    this.caffeineLevel = Math.min(100, this.caffeineLevel + amount);
    
    if (this.caffeineLevel > 80) {
      this.addStatusEffect('jittery', 10);
      return {
        success: true,
        message: 'You feel EXTREMELY caffeinated! Your hands are shaking.',
        caffeineLevel: this.caffeineLevel
      };
    } else if (this.caffeineLevel > 50) {
      this.addStatusEffect('caffeinated', 15);
      return {
        success: true,
        message: 'You feel energized and alert!',
        caffeineLevel: this.caffeineLevel
      };
    }
    
    return {
      success: true,
      message: 'You feel slightly more awake.',
      caffeineLevel: this.caffeineLevel
    };
  }

  // Status display
  getStatusDisplay() {
    const status = [];
    
    // Health bar
    const healthPercent = (this.health / this.maxHealth) * 100;
    const healthBar = this.createBar(healthPercent, '❤️');
    status.push(`Health: ${healthBar} ${this.health}/${this.maxHealth}`);
    
    // Energy bar
    const energyPercent = (this.energy / this.maxEnergy) * 100;
    const energyBar = this.createBar(energyPercent, '⚡');
    status.push(`Energy: ${energyBar} ${this.energy}/${this.maxEnergy}`);
    
    // Level and XP
    status.push(`Level: ${this.level} (${this.experience}/${this.experienceToNext} XP)`);
    
    // Debug skill
    status.push(`Debug Skill: ${this.debugSkill}`);
    
    // Caffeine level
    if (this.caffeineLevel > 0) {
      const caffeineBar = this.createBar(this.caffeineLevel, '☕');
      status.push(`Caffeine: ${caffeineBar} ${this.caffeineLevel}%`);
    }
    
    // Status effects
    if (this.statusEffects.length > 0) {
      const effects = this.statusEffects.map(e => `${e.name}(${e.duration})`).join(', ');
      status.push(`Effects: ${effects}`);
    }
    
    return status.join('\n');
  }

  createBar(percent, icon) {
    const barLength = 10;
    const filled = Math.floor((percent / 100) * barLength);
    const empty = barLength - filled;
    
    return `${icon}${'█'.repeat(filled)}${'░'.repeat(empty)}`;
  }

  // Check if player is in good condition for actions
  canPerformAction(energyCost = 0) {
    if (this.health <= 0) {
      return { success: false, message: 'You are defeated and cannot act.' };
    }
    
    if (this.energy < energyCost) {
      return { 
        success: false, 
        message: `You need ${energyCost} energy for that action. (You have ${this.energy})` 
      };
    }
    
    return { success: true };
  }

  // Serialization for save/load
  serialize() {
    return {
      maxHealth: this.maxHealth,
      health: this.health,
      maxEnergy: this.maxEnergy,
      energy: this.energy,
      level: this.level,
      experience: this.experience,
      experienceToNext: this.experienceToNext,
      debugSkill: this.debugSkill,
      caffeineLevel: this.caffeineLevel,
      statusEffects: this.statusEffects
    };
  }

  deserialize(data) {
    this.maxHealth = data.maxHealth || 100;
    this.health = data.health || 100;
    this.maxEnergy = data.maxEnergy || 100;
    this.energy = data.energy || 100;
    this.level = data.level || 1;
    this.experience = data.experience || 0;
    this.experienceToNext = data.experienceToNext || 100;
    this.debugSkill = data.debugSkill || 10;
    this.caffeineLevel = data.caffeineLevel || 0;
    this.statusEffects = data.statusEffects || [];
  }

  // Debug methods
  fullHeal() {
    this.health = this.maxHealth;
    this.energy = this.maxEnergy;
    return { success: true, message: 'Fully healed!' };
  }

  grantExperience(amount) {
    return this.gainExperience(amount);
  }

  setLevel(level) {
    this.level = Math.max(1, level);
    this.maxHealth = 100 + (this.level - 1) * 10;
    this.maxEnergy = 100 + (this.level - 1) * 10;
    this.debugSkill = 10 + (this.level - 1) * 2;
    this.experienceToNext = Math.floor(100 * Math.pow(1.5, this.level - 1));
    return { success: true, message: `Level set to ${this.level}.` };
  }
}