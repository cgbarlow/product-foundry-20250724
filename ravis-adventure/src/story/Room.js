export default class Room {
  constructor({ id, name, description, exits = {}, items = [], characters = [], firstVisit = true }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.exits = exits;
    this.items = [...items]; // Copy array to avoid shared references
    this.characters = [...characters];
    this.firstVisit = firstVisit;
    this.visitCount = 0;
  }

  getDescription() {
    this.visitCount++;
    
    let desc = this.description;
    
    // Add items description
    if (this.items.length > 0) {
      desc += `\n\nYou see: ${this.items.join(', ')}.`;
    }
    
    // Add characters description
    if (this.characters.length > 0) {
      desc += `\n\nPeople here: ${this.characters.join(', ')}.`;
    }
    
    // Add exits description
    const exitList = Object.keys(this.exits);
    if (exitList.length > 0) {
      desc += `\n\nExits: ${exitList.join(', ')}.`;
    }
    
    return desc;
  }

  addItem(item) {
    if (!this.items.includes(item)) {
      this.items.push(item);
      return true;
    }
    return false;
  }

  removeItem(item) {
    const index = this.items.indexOf(item);
    if (index > -1) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  }

  hasItem(item) {
    return this.items.includes(item);
  }

  addCharacter(character) {
    if (!this.characters.includes(character)) {
      this.characters.push(character);
      return true;
    }
    return false;
  }

  removeCharacter(character) {
    const index = this.characters.indexOf(character);
    if (index > -1) {
      this.characters.splice(index, 1);
      return true;
    }
    return false;
  }

  hasCharacter(character) {
    return this.characters.includes(character);
  }

  canExit(direction) {
    return Object.prototype.hasOwnProperty.call(this.exits, direction);
  }

  getExit(direction) {
    return this.exits[direction];
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      exits: this.exits,
      items: this.items,
      characters: this.characters,
      firstVisit: this.firstVisit,
      visitCount: this.visitCount
    };
  }

  deserialize(data) {
    this.items = data.items || [];
    this.characters = data.characters || [];
    this.firstVisit = data.firstVisit !== undefined ? data.firstVisit : true;
    this.visitCount = data.visitCount || 0;
  }

  // Special room behaviors
  onEnter(_player) {
    // Override in subclasses for special room effects
    console.log(`${player.name} entered ${this.name}`);
  }

  onExit(_player) {
    // Override in subclasses for special room effects
    console.log(`${player.name} left ${this.name}`);
  }

  // Room-specific interactions
  interact(action, target, _player) {
    // Override in subclasses for room-specific interactions
    return { success: false, message: `You can't ${action} ${target} here.` };
  }
}