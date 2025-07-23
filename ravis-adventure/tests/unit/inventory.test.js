import Inventory from '../../src/player/Inventory.js';

describe('Inventory', () => {
  let inventory;

  beforeEach(() => {
    inventory = new Inventory(5); // Max 5 items for testing
  });

  test('should initialize with correct capacity', () => {
    expect(inventory.maxItems).toBe(5);
    expect(inventory.items).toEqual([]);
    expect(inventory.isEmpty()).toBe(true);
    expect(inventory.isFull()).toBe(false);
  });

  test('should add items successfully', () => {
    const result = inventory.addItem('coffee');
    
    expect(result.success).toBe(true);
    expect(inventory.hasItem('coffee')).toBe(true);
    expect(inventory.getCount()).toBe(1);
    expect(inventory.isEmpty()).toBe(false);
  });

  test('should prevent duplicate items', () => {
    inventory.addItem('coffee');
    const result = inventory.addItem('coffee');
    
    expect(result.success).toBe(false);
    expect(result.message).toContain('already have');
    expect(inventory.getCount()).toBe(1);
  });

  test('should enforce capacity limits', () => {
    // Fill inventory to capacity
    for (let i = 0; i < 5; i++) {
      inventory.addItem(`item${i}`);
    }
    
    expect(inventory.isFull()).toBe(true);
    
    // Try to add one more
    const result = inventory.addItem('overflow_item');
    expect(result.success).toBe(false);
    expect(result.message).toContain('inventory is full');
  });

  test('should remove items correctly', () => {
    inventory.addItem('coffee');
    
    const result = inventory.removeItem('coffee');
    expect(result.success).toBe(true);
    expect(inventory.hasItem('coffee')).toBe(false);
    expect(inventory.isEmpty()).toBe(true);
  });

  test('should handle removing non-existent items', () => {
    const result = inventory.removeItem('nonexistent');
    
    expect(result.success).toBe(false);
    expect(result.message).toContain('don\'t have');
  });

  test('should display inventory correctly', () => {
    inventory.addItem('coffee');
    inventory.addItem('rubber_duck');
    
    const display = inventory.display();
    expect(display).toContain('Inventory (2/5)');
    expect(display).toContain('coffee');
    expect(display).toContain('rubber_duck');
  });

  test('should find items by pattern', () => {
    inventory.addItem('coffee_cup');
    inventory.addItem('energy_drink');
    inventory.addItem('rubber_duck');
    
    const coffeeItems = inventory.findItems('coffee');
    expect(coffeeItems).toContain('coffee_cup');
    expect(coffeeItems.length).toBe(1);
  });

  test('should check for item combinations', () => {
    inventory.addItem('coffee');
    inventory.addItem('energy_drink');
    
    const combinations = inventory.getCombinations();
    expect(combinations).toContain('super_caffeine');
  });

  test('should combine items successfully', () => {
    inventory.addItem('coffee');
    inventory.addItem('energy_drink');
    
    const result = inventory.combineItems('coffee', 'energy_drink');
    expect(result.success).toBe(true);
    expect(result.result).toBe('super_caffeine');
    expect(inventory.hasItem('super_caffeine')).toBe(true);
    expect(inventory.hasItem('coffee')).toBe(false);
    expect(inventory.hasItem('energy_drink')).toBe(false);
  });

  test('should serialize and deserialize correctly', () => {
    inventory.addItem('coffee');
    inventory.addItem('rubber_duck');
    
    const serialized = inventory.serialize();
    const newInventory = new Inventory();
    newInventory.deserialize(serialized);
    
    expect(newInventory.maxItems).toBe(5);
    expect(newInventory.hasItem('coffee')).toBe(true);
    expect(newInventory.hasItem('rubber_duck')).toBe(true);
    expect(newInventory.getCount()).toBe(2);
  });

  test('should clear inventory', () => {
    inventory.addItem('coffee');
    inventory.addItem('rubber_duck');
    
    const result = inventory.clear();
    expect(result.success).toBe(true);
    expect(inventory.isEmpty()).toBe(true);
    expect(result.message).toContain('Cleared 2 items');
  });
});