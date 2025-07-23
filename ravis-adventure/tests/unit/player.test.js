import Player from '../../src/player/Player.js';
import Room from '../../src/story/Room.js';

describe('Player', () => {
  let player;
  let testRoom;

  beforeEach(() => {
    player = new Player('TestRavi');
    testRoom = new Room({
      id: 'test_room',
      name: 'Test Room',
      description: 'A room for testing',
      items: ['test_item'],
      characters: ['test_character']
    });
  });

  test('should initialize with correct default values', () => {
    expect(player.name).toBe('TestRavi');
    expect(player.currentRoom).toBeNull();
    expect(player.inventory).toBeDefined();
    expect(player.stats).toBeDefined();
    expect(player.achievements).toEqual([]);
  });

  test('should move to rooms correctly', () => {
    const result = player.moveTo(testRoom);
    
    expect(result.success).toBe(true);
    expect(player.currentRoom).toBe(testRoom);
    expect(result.currentRoom).toBe(testRoom);
  });

  test('should handle item interactions', () => {
    player.currentRoom = testRoom;
    
    // Test taking an item
    const takeResult = player.takeItem('test_item');
    expect(takeResult.success).toBe(true);
    expect(player.inventory.hasItem('test_item')).toBe(true);
    expect(testRoom.hasItem('test_item')).toBe(false);
  });

  test('should handle character dialogue', () => {
    player.currentRoom = testRoom;
    
    const talkResult = player.talkTo('test_character');
    expect(talkResult.success).toBe(true);
    expect(talkResult.character).toBe('test_character');
    expect(talkResult.message).toBeDefined();
  });

  test('should track achievements', () => {
    const achievementResult = player.unlockAchievement('test_achievement', 'Test Achievement');
    
    expect(achievementResult.success).toBe(true);
    expect(player.hasAchievement('test_achievement')).toBe(true);
    expect(player.achievements.length).toBe(1);
  });

  test('should handle game flags', () => {
    player.setFlag('test_flag', 'test_value');
    
    expect(player.hasFlag('test_flag')).toBe(true);
    expect(player.getFlag('test_flag')).toBe('test_value');
  });

  test('should serialize and deserialize correctly', () => {
    player.currentRoom = testRoom;
    player.inventory.addItem('test_item');
    player.setFlag('test_flag', 'test_value');
    
    const serialized = player.serialize();
    const newPlayer = new Player();
    newPlayer.deserialize(serialized);
    
    expect(newPlayer.name).toBe(player.name);
    expect(newPlayer.inventory.hasItem('test_item')).toBe(true);
    expect(newPlayer.getFlag('test_flag')).toBe('test_value');
  });

  test('should calculate play time correctly', () => {
    // Mock start time to 10 minutes ago
    player.startTime = new Date(Date.now() - 10 * 60 * 1000);
    
    const playTime = player.getPlayTime();
    expect(playTime).toContain('10m');
  });

  test('should get player status', () => {
    player.currentRoom = testRoom;
    
    const status = player.getStatus();
    expect(status.name).toBe('TestRavi');
    expect(status.room).toBe('Test Room');
    expect(status.health).toBeDefined();
    expect(status.achievements).toBe(0);
  });
});