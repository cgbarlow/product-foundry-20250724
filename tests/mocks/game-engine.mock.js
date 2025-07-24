/**
 * Game Engine Mock
 * QA Engineer: Mock implementation for isolated testing
 */

class MockGameEngine {
  constructor() {
    this.state = {
      currentLocation: 'living_room',
      inventory: [],
      gameProgress: {
        introComplete: false,
        chaptersCompleted: 0,
        achievements: []
      },
      character: null,
      isRunning: false
    };
    
    this.locations = new Map([
      ['living_room', {
        name: 'Living Room',
        description: 'A cozy living room with a couch and TV.',
        exits: { north: 'kitchen', east: 'bedroom' },
        items: ['remote'],
        npcs: []
      }],
      ['kitchen', {
        name: 'Kitchen',
        description: 'A small kitchen with modern appliances.',
        exits: { south: 'living_room' },
        items: ['coffee'],
        npcs: []
      }],
      ['bedroom', {
        name: 'Bedroom',
        description: 'A comfortable bedroom with a large bed.',
        exits: { west: 'living_room' },
        items: ['book'],
        npcs: []
      }]
    ]);
    
    this.commandHistory = [];
    this.saveData = null;
  }
  
  // Game state management
  getState() {
    return { ...this.state };
  }
  
  setState(newState) {
    this.state = { ...this.state, ...newState };
  }
  
  // Location management
  getCurrentLocation() {
    return this.locations.get(this.state.currentLocation);
  }
  
  moveToLocation(locationId) {
    // Check if movement is valid from current location
    const currentLocation = this.getCurrentLocation();
    const validExits = Object.values(currentLocation.exits || {});
    
    if (this.locations.has(locationId) && validExits.includes(locationId)) {
      this.state.currentLocation = locationId;
      return true;
    }
    return false;
  }
  
  // Inventory management
  addToInventory(item) {
    if (!this.state.inventory.includes(item)) {
      this.state.inventory.push(item);
      return true;
    }
    return false;
  }
  
  removeFromInventory(item) {
    const index = this.state.inventory.indexOf(item);
    if (index > -1) {
      this.state.inventory.splice(index, 1);
      return true;
    }
    return false;
  }
  
  hasInInventory(item) {
    return this.state.inventory.includes(item);
  }
  
  // Character management
  setCharacter(character) {
    this.state.character = character;
  }
  
  getCharacter() {
    return this.state.character;
  }
  
  // Command processing
  async processCommand(command) {
    this.commandHistory.push(command);
    
    // Mock command processing
    const cmd = command.command.toLowerCase();
    const args = command.args || [];
    
    switch (cmd) {
      case 'look':
        return this.getCurrentLocation().description;
      
      case 'go':
        const direction = args[0];
        const currentLocation = this.getCurrentLocation();
        const targetLocation = currentLocation.exits[direction];
        
        if (targetLocation && this.moveToLocation(targetLocation)) {
          return `You go ${direction} to the ${this.getCurrentLocation().name}.`;
        }
        return `You can't go ${direction} from here.`;
      
      case 'inventory':
        return this.state.inventory.length > 0 
          ? `You have: ${this.state.inventory.join(', ')}`
          : 'Your inventory is empty.';
      
      case 'take':
        const item = args[0];
        const location = this.getCurrentLocation();
        
        if (location.items.includes(item)) {
          location.items = location.items.filter(i => i !== item);
          this.addToInventory(item);
          return `You take the ${item}.`;
        }
        return `There is no ${item} here.`;
      
      default:
        return `I don't understand the command "${cmd}".`;
    }
  }
  
  // Game lifecycle
  async startInteractiveMode() {
    this.state.isRunning = true;
    return Promise.resolve();
  }
  
  async stopGame() {
    this.state.isRunning = false;
    return Promise.resolve();
  }
  
  // Save/Load functionality
  async saveGame(filename) {
    this.saveData = {
      filename,
      state: { ...this.state },
      timestamp: Date.now()
    };
    return Promise.resolve();
  }
  
  async loadGame(filename) {
    if (this.saveData && this.saveData.filename === filename) {
      this.state = { ...this.saveData.state };
      return Promise.resolve();
    }
    // For testing, create a mock save if needed
    if (filename === 'test_save') {
      this.state = {
        currentLocation: 'kitchen',
        inventory: ['test_item'],
        gameProgress: { introComplete: true, chaptersCompleted: 1 },
        character: null,
        isRunning: false
      };
      return Promise.resolve();
    }
    throw new Error('Save file not found');
  }
  
  async resetGame() {
    this.state = {
      currentLocation: 'living_room',
      inventory: [],
      gameProgress: {
        introComplete: false,
        chaptersCompleted: 0,
        achievements: []
      },
      character: null,
      isRunning: false
    };
    this.commandHistory = [];
    this.saveData = null;
    return Promise.resolve();
  }
  
  // Testing utilities
  getCommandHistory() {
    return [...this.commandHistory];
  }
  
  clearCommandHistory() {
    this.commandHistory = [];
  }
  
  // Mock swarm coordination hooks
  async executeSwarmHook(hookType, data) {
    return Promise.resolve({ success: true, hookType, data });
  }
}

module.exports = MockGameEngine;