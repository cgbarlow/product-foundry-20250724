export default class Item {
  constructor({ id, name, description, type = 'misc', usable = false, takeable = true, properties = {} }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.type = type; // 'weapon', 'consumable', 'key', 'misc'
    this.usable = usable;
    this.takeable = takeable;
    this.properties = properties;
    this.used = false;
  }

  use(player, target = null) {
    if (!this.usable) {
      return { success: false, message: `You can't use the ${this.name}.` };
    }

    switch (this.type) {
    case 'consumable':
      return this.consume(player);
    case 'weapon':
      return this.attack(player, target);
    case 'key':
      return this.unlock(player, target);
    default:
      return this.defaultUse(player, target);
    }
  }

  consume(player) {
    if (this.used) {
      return { success: false, message: `You already used the ${this.name}.` };
    }

    this.used = true;
    
    // Apply item effects based on properties
    if (this.properties.health) {
      player.stats.health += this.properties.health;
      player.stats.health = Math.min(player.stats.health, player.stats.maxHealth);
    }
    
    if (this.properties.energy) {
      player.stats.energy += this.properties.energy;
      player.stats.energy = Math.min(player.stats.energy, player.stats.maxEnergy);
    }

    return { 
      success: true, 
      message: `You used the ${this.name}. ${this.properties.useMessage || 'You feel refreshed.'}`,
      consumed: true
    };
  }

  attack(player, target) {
    if (!target) {
      return { success: false, message: `Attack what with the ${this.name}?` };
    }

    const damage = this.properties.damage || 10;
    return {
      success: true,
      message: `You attack ${target} with the ${this.name} for ${damage} damage!`,
      damage: damage
    };
  }

  unlock(player, target) {
    if (!target) {
      return { success: false, message: `Unlock what with the ${this.name}?` };
    }

    const unlocks = this.properties.unlocks || [];
    if (unlocks.includes(target)) {
      return {
        success: true,
        message: `You unlock ${target} with the ${this.name}!`,
        unlocked: target
      };
    }

    return { success: false, message: `The ${this.name} doesn't work on ${target}.` };
  }

  defaultUse(_player, _target) {
    return {
      success: true,
      message: this.properties.useMessage || `You use the ${this.name}.`
    };
  }

  examine() {
    let desc = this.description;
    
    if (this.properties.hidden) {
      desc += ` ${this.properties.hidden}`;
    }
    
    if (this.usable) {
      desc += ' (usable)';
    }
    
    return desc;
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      usable: this.usable,
      takeable: this.takeable,
      properties: this.properties,
      used: this.used
    };
  }

  static deserialize(data) {
    const item = new Item(data);
    item.used = data.used || false;
    return item;
  }

  // Create predefined game items
  static createGameItems() {
    return {
      'visitor_badge': new Item({
        id: 'visitor_badge',
        name: 'visitor badge',
        description: 'A plastic badge that says "VISITOR" in Comic Sans font. Somehow this makes you feel less legitimate.',
        type: 'key',
        usable: true,
        properties: { unlocks: ['lobby_door'] }
      }),

      'rubber_duck': new Item({
        id: 'rubber_duck',
        name: 'rubber duck',
        description: 'A yellow rubber duck that has seen things. Its eyes hold the wisdom of a thousand debugging sessions.',
        type: 'misc',
        usable: true,
        properties: { 
          useMessage: 'You talk to the rubber duck. Suddenly, the solution becomes clear!',
          hint: true
        }
      }),

      'coffee': new Item({
        id: 'coffee',
        name: 'coffee',
        description: 'Life-giving elixir of the gods. Also known as "developer fuel."',
        type: 'consumable',
        usable: true,
        properties: { 
          health: 20,
          energy: 30,
          useMessage: 'The coffee courses through your veins. You feel more alert!'
        }
      }),

      'debug_hammer': new Item({
        id: 'debug_hammer',
        name: 'debug hammer',
        description: 'A mighty hammer forged from pure logic. Perfect for smashing bugs.',
        type: 'weapon',
        usable: true,
        properties: { 
          damage: 25,
          useMessage: 'You swing the debug hammer with righteous fury!'
        }
      }),

      'master_keycard': new Item({
        id: 'master_keycard',
        name: 'master keycard',
        description: 'A sleek keycard that opens all doors. The ultimate developer privilege.',
        type: 'key',
        usable: true,
        properties: { 
          unlocks: ['server_room', 'ai_lab', 'ceo_office', 'debug_chamber'],
          useMessage: 'The keycard beeps and grants access!'
        }
      }),

      'ancient_manual': new Item({
        id: 'ancient_manual',
        name: 'ancient programming manual',
        description: 'A dusty manual titled "Programming in FORTRAN: The Way of the Ancients." It radiates power.',
        type: 'weapon',
        usable: true,
        properties: { 
          damage: 50,
          useMessage: 'You recite ancient incantations from the manual! The code bends to your will!'
        }
      }),

      'energy_drink': new Item({
        id: 'energy_drink',
        name: 'energy drink',
        description: 'A can of "CODER FUEL EXTREME". Warning label mentions possible side effects including "transcending reality."',
        type: 'consumable',
        usable: true,
        properties: { 
          health: 10,
          energy: 50,
          useMessage: 'You feel like you could code for 48 hours straight!'
        }
      })
    };
  }
}