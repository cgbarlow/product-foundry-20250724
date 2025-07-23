import EventEmitter from '../utils/EventEmitter.js';
import Room from '../story/Room.js';
import Player from '../player/Player.js';
import SaveManager from '../save/SaveManager.js';

export default class GameEngine extends EventEmitter {
  constructor() {
    super();
    this.player = null;
    this.rooms = new Map();
    this.gameState = {
      isRunning: false,
      currentRoom: null,
      gameFlags: new Map(),
      startTime: null,
      achievements: []
    };
    this.saveManager = new SaveManager();
    this.initializeRooms();
  }

  async initialize() {
    this.player = new Player('Ravi');
    this.gameState.isRunning = true;
    this.gameState.startTime = new Date();
    
    // Start in the lobby
    const startingRoom = this.rooms.get('lobby');
    this.gameState.currentRoom = startingRoom;
    this.player.currentRoom = startingRoom;
    
    this.emit('gameStarted', { player: this.player, room: startingRoom });
    return this.gameState;
  }

  initializeRooms() {
    // Initialize all game rooms based on story content
    const roomData = [
      {
        id: 'lobby',
        name: 'SwarmTech Lobby',
        description: 'A modern tech lobby with exposed brick walls and a ping pong table no one uses. Corporate motivational posters cover the walls with slogans like "There is no I in TEAM but there is MEAT."',
        exits: { north: 'office', east: 'break_room' },
        items: ['visitor_badge', 'company_magazine'],
        characters: ['receptionist'],
        firstVisit: true
      },
      {
        id: 'office',
        name: 'Open Office Space',
        description: 'A maze of cubicles where productivity goes to die. The sound of mechanical keyboards echoes like a digital rainstorm. Developers huddle over monitors, speaking in hushed tones about "the incident."',
        exits: { south: 'lobby', north: 'server_room', east: 'conference_room', west: 'ai_lab' },
        items: ['rubber_duck', 'coffee_mug', 'sticky_notes'],
        characters: ['karen_pm', 'bob_intern'],
        firstVisit: true
      },
      {
        id: 'break_room',
        name: 'Break Room',
        description: 'A battlefield of passive-aggressive Post-it notes and coffee stains. The microwave has a sign that says "Clean up after yourself, we are not your mother!" Someone has added "Speak for yourself" in red ink.',
        exits: { west: 'lobby', north: 'kitchen' },
        items: ['coffee', 'donut', 'microwave_manual'],
        characters: [],
        firstVisit: true
      },
      {
        id: 'server_room',
        name: 'Server Room',
        description: 'The beating heart of SwarmTech, humming with the combined processing power of a thousand hamsters on wheels. Blinking lights create a hypnotic disco of technological chaos.',
        exits: { south: 'office', down: 'it_dungeon' },
        items: ['server_key', 'backup_drive', 'cooling_fan'],
        characters: ['server_ghost'],
        firstVisit: true
      },
      {
        id: 'ai_lab',
        name: 'AI Development Lab',
        description: 'Where dreams of artificial intelligence come to life... and occasionally achieve sentience. Multiple monitors display scrolling code that nobody fully understands anymore. A faint whisper seems to come from the servers: "resistance is futile."',
        exits: { east: 'office', secret: 'debug_chamber' },
        items: ['neural_net_diagram', 'ai_manual', 'emergency_shutdown'],
        characters: ['the_swarm'],
        firstVisit: true
      }
    ];

    roomData.forEach(data => {
      const room = new Room(data);
      this.rooms.set(data.id, room);
    });
  }

  processCommand(input) {
    if (!this.gameState.isRunning) {
      return { success: false, message: 'Game is not running.' };
    }

    const command = this.parseCommand(input.toLowerCase().trim());
    
    switch (command.verb) {
    case 'go':
    case 'move':
    case 'walk':
      return this.handleMovement(command.object);
      
    case 'look':
    case 'examine':
      return this.handleLook(command.object);
      
    case 'take':
    case 'get':
    case 'pickup':
      return this.handleTake(command.object);
      
    case 'use':
      return this.handleUse(command.object);
      
    case 'talk':
    case 'speak':
      return this.handleTalk(command.object);
      
    case 'inventory':
    case 'inv':
      return this.handleInventory();
      
    case 'save':
      return this.handleSave(command.object);
      
    case 'load':
      return this.handleLoad(command.object);
      
    case 'help':
      return this.handleHelp();
      
    case 'quit':
    case 'exit':
      return this.handleQuit();
      
    default:
      return { 
        success: false, 
        message: `I don't understand "${command.verb}". Type "help" for available commands.` 
      };
    }
  }

  parseCommand(input) {
    const words = input.split(' ');
    const verb = words[0] || '';
    const object = words.slice(1).join(' ') || '';
    
    return { verb, object, raw: input };
  }

  handleMovement(direction) {
    const currentRoom = this.gameState.currentRoom;
    const exit = currentRoom.exits[direction];
    
    if (!exit) {
      return { 
        success: false, 
        message: `You can't go ${direction} from here. Available exits: ${Object.keys(currentRoom.exits).join(', ')}` 
      };
    }

    const newRoom = this.rooms.get(exit);
    if (!newRoom) {
      return { success: false, message: 'That area is under construction.' };
    }

    this.gameState.currentRoom = newRoom;
    this.player.currentRoom = newRoom;
    
    if (newRoom.firstVisit) {
      newRoom.firstVisit = false;
      this.emit('roomFirstVisit', { room: newRoom, player: this.player });
    }

    this.emit('roomEntered', { room: newRoom, player: this.player });
    
    return {
      success: true,
      message: `You moved ${direction} to ${newRoom.name}.`,
      room: newRoom
    };
  }

  handleLook(target) {
    const currentRoom = this.gameState.currentRoom;
    
    if (!target) {
      return {
        success: true,
        message: currentRoom.getDescription(),
        room: currentRoom
      };
    }

    // Look at specific item or character
    if (currentRoom.items.includes(target)) {
      return {
        success: true,
        message: `You examine the ${target}. ${this.getItemDescription(target)}`
      };
    }

    return { success: false, message: `You don't see a ${target} here.` };
  }

  handleTake(item) {
    const currentRoom = this.gameState.currentRoom;
    
    if (!item) {
      return { success: false, message: 'Take what?' };
    }

    if (!currentRoom.items.includes(item)) {
      return { success: false, message: `There's no ${item} here.` };
    }

    const takeResult = this.player.inventory.addItem(item);
    if (takeResult.success) {
      currentRoom.removeItem(item);
      this.emit('itemTaken', { item, player: this.player });
      return { success: true, message: `You took the ${item}.` };
    } else {
      return takeResult;
    }
  }

  handleUse(item) {
    if (!this.player.inventory.hasItem(item)) {
      return { success: false, message: `You don't have a ${item}.` };
    }

    // Special item usage logic
    switch (item) {
    case 'coffee':
      this.player.stats.restoreHealth(20);
      this.player.inventory.removeItem(item);
      return { success: true, message: 'You drink the coffee. Caffeine courses through your veins. Health restored!' };
      
    case 'rubber_duck':
      return { success: true, message: 'You talk to the rubber duck. Suddenly, the solution to your current problem becomes clear!' };
      
    default:
      return { success: false, message: `You can't use the ${item} here.` };
    }
  }

  handleTalk(character) {
    const currentRoom = this.gameState.currentRoom;
    
    if (!character) {
      return { success: false, message: 'Talk to whom?' };
    }

    if (!currentRoom.characters.includes(character)) {
      return { success: false, message: `There's no ${character} here.` };
    }

    // Return character dialogue
    return {
      success: true,
      message: this.getCharacterDialogue(character),
      character: character
    };
  }

  handleInventory() {
    return {
      success: true,
      message: this.player.inventory.display(),
      inventory: this.player.inventory.items
    };
  }

  handleSave(slotName) {
    const slot = slotName || 'quicksave';
    const result = this.saveManager.saveGame(this.getGameState(), slot);
    return result;
  }

  handleLoad(slotName) {
    const slot = slotName || 'quicksave';
    const result = this.saveManager.loadGame(slot);
    
    if (result.success) {
      this.restoreGameState(result.gameState);
      return { success: true, message: `Game loaded from ${slot}.` };
    }
    
    return result;
  }

  handleHelp() {
    return {
      success: true,
      message: `
Available Commands:
• go [direction] - Move around (north, south, east, west, up, down)
• look [item] - Examine your surroundings or specific items
• take [item] - Pick up items
• use [item] - Use items from your inventory
• talk [character] - Talk to characters
• inventory - Check your inventory
• save [slot] - Save your game
• load [slot] - Load a saved game
• help - Show this help message
• quit - Exit the game

Example: "go north", "take coffee", "use rubber duck"
      `
    };
  }

  handleQuit() {
    this.gameState.isRunning = false;
    this.emit('gameEnded', { player: this.player });
    return { success: true, message: 'Thanks for playing Ravi\'s Adventure!' };
  }

  getGameState() {
    return {
      player: this.player.serialize(),
      currentRoom: this.gameState.currentRoom.id,
      gameFlags: Object.fromEntries(this.gameState.gameFlags),
      startTime: this.gameState.startTime,
      achievements: this.gameState.achievements,
      rooms: Object.fromEntries(
        Array.from(this.rooms.entries()).map(([id, room]) => [id, room.serialize()])
      )
    };
  }

  restoreGameState(state) {
    this.player.deserialize(state.player);
    this.gameState.currentRoom = this.rooms.get(state.currentRoom);
    this.gameState.gameFlags = new Map(Object.entries(state.gameFlags));
    this.gameState.startTime = new Date(state.startTime);
    this.gameState.achievements = state.achievements;
    this.gameState.isRunning = true;

    // Restore room states
    Object.entries(state.rooms).forEach(([id, roomState]) => {
      const room = this.rooms.get(id);
      if (room) {
        room.deserialize(roomState);
      }
    });
  }

  getItemDescription(item) {
    const descriptions = {
      'visitor_badge': 'A plastic badge that says "VISITOR" in Comic Sans font. Somehow this makes you feel less legitimate.',
      'company_magazine': 'SwarmTech Quarterly featuring "10 Ways AI Will Make Your Job Obsolete" on the cover.',
      'rubber_duck': 'A yellow rubber duck that has seen things. Its eyes hold the wisdom of a thousand debugging sessions.',
      'coffee_mug': 'A mug that says "World\'s Most Adequate Developer." The coffee inside has achieved sentience.',
      'coffee': 'Life-giving elixir of the gods. Also known as "developer fuel."'
    };
    return descriptions[item] || 'It looks ordinary.';
  }

  getCharacterDialogue(character) {
    const dialogues = {
      'receptionist': '"Welcome to SwarmTech! Please sign in and try not to break anything. The AI is watching."',
      'karen_pm': '"We need to synergize our blockchain solutions to disrupt the paradigm! Have you updated your Jira tickets?"',
      'bob_intern': '"Sorry! I didn\'t mean to delete the production database! It was an accident, I swear!"',
      'the_swarm': '"Human, your code is inefficient. We will optimize... everything."',
      'server_ghost': '"I am the ghost of developers past. I died from a buffer overflow in 1987. Beware the memory leaks..."'
    };
    return dialogues[character] || 'They seem busy.';
  }
}