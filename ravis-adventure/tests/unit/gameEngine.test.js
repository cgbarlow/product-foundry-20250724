import GameEngine from '../../src/engine/GameEngine.js';
import { jest } from '@jest/globals';

describe('GameEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new GameEngine();
  });

  test('should initialize with proper default state', () => {
    expect(engine.player).toBeNull();
    expect(engine.rooms).toBeInstanceOf(Map);
    expect(engine.gameState.isRunning).toBe(false);
    expect(engine.rooms.size).toBeGreaterThan(0);
  });

  test('should initialize game and create player', async () => {
    const gameState = await engine.initialize();
    
    expect(engine.player).toBeDefined();
    expect(engine.player.name).toBe('Ravi');
    expect(gameState.isRunning).toBe(true);
    expect(gameState.currentRoom).toBeDefined();
    expect(gameState.currentRoom.id).toBe('lobby');
  });

  test('should have predefined rooms', () => {
    expect(engine.rooms.has('lobby')).toBe(true);
    expect(engine.rooms.has('office')).toBe(true);
    expect(engine.rooms.has('ai_lab')).toBe(true);
    expect(engine.rooms.has('server_room')).toBe(true);
    expect(engine.rooms.has('break_room')).toBe(true);
  });

  test('should process basic commands', async () => {
    await engine.initialize();
    
    // Test help command
    const helpResult = engine.processCommand('help');
    expect(helpResult.success).toBe(true);
    expect(helpResult.message).toContain('Available Commands');

    // Test look command
    const lookResult = engine.processCommand('look');
    expect(lookResult.success).toBe(true);
    expect(lookResult.room).toBeDefined();
  });

  test('should handle movement between rooms', async () => {
    await engine.initialize();
    
    // Move north to office
    const moveResult = engine.processCommand('go north');
    expect(moveResult.success).toBe(true);
    expect(moveResult.room.id).toBe('office');
    expect(engine.gameState.currentRoom.id).toBe('office');
  });

  test('should handle invalid commands gracefully', async () => {
    await engine.initialize();
    
    const result = engine.processCommand('invalid command');
    expect(result.success).toBe(false);
    expect(result.message).toContain('don\'t understand');
  });

  test('should parse commands correctly', () => {
    const simpleCommand = engine.parseCommand('look');
    expect(simpleCommand.verb).toBe('look');
    expect(simpleCommand.object).toBe('');

    const complexCommand = engine.parseCommand('go north');
    expect(complexCommand.verb).toBe('go');
    expect(complexCommand.object).toBe('north');
  });

  test('should handle inventory commands', async () => {
    await engine.initialize();
    
    const invResult = engine.processCommand('inventory');
    expect(invResult.success).toBe(true);
    expect(invResult.inventory).toBeDefined();
  });

  test('should save and load game state', async () => {
    await engine.initialize();
    engine.processCommand('go north'); // Move to office
    
    const saveResult = engine.processCommand('save test');
    expect(saveResult.success).toBe(true);
    
    const loadResult = engine.processCommand('load test');
    expect(loadResult.success).toBe(true);
  });
});