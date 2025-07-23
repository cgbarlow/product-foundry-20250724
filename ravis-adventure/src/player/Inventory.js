export default class Inventory {
  constructor(maxItems = 10) {
    this.maxItems = maxItems;
    this.items = [];
  }

  addItem(itemName) {
    if (this.items.length >= this.maxItems) {
      return { 
        success: false, 
        message: `Your inventory is full! (${this.maxItems} items max)` 
      };
    }

    if (this.hasItem(itemName)) {
      return { 
        success: false, 
        message: `You already have a ${itemName}.` 
      };
    }

    this.items.push(itemName);
    return { 
      success: true, 
      message: `Added ${itemName} to inventory.` 
    };
  }

  removeItem(itemName) {
    const index = this.items.indexOf(itemName);
    if (index > -1) {
      this.items.splice(index, 1);
      return { 
        success: true, 
        message: `Removed ${itemName} from inventory.` 
      };
    }
    
    return { 
      success: false, 
      message: `You don't have a ${itemName}.` 
    };
  }

  hasItem(itemName) {
    return this.items.includes(itemName);
  }

  getItem(itemName) {
    return this.hasItem(itemName) ? itemName : null;
  }

  isEmpty() {
    return this.items.length === 0;
  }

  isFull() {
    return this.items.length >= this.maxItems;
  }

  getCount() {
    return this.items.length;
  }

  getCapacity() {
    return this.maxItems;
  }

  getRemainingSpace() {
    return this.maxItems - this.items.length;
  }

  display() {
    if (this.isEmpty()) {
      return 'Your inventory is empty. Time to collect some stuff!';
    }

    let display = `📦 Inventory (${this.items.length}/${this.maxItems}):\n`;
    this.items.forEach((item, index) => {
      display += `  ${index + 1}. ${item}\n`;
    });
    
    return display.trim();
  }

  listItems() {
    return [...this.items]; // Return copy to avoid external modification
  }

  clear() {
    const count = this.items.length;
    this.items = [];
    return { 
      success: true, 
      message: `Cleared ${count} items from inventory.` 
    };
  }

  // Find items by type or pattern
  findItems(pattern) {
    return this.items.filter(item => 
      item.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  // Check if inventory contains any of the specified items
  hasAnyOf(itemList) {
    return itemList.some(item => this.hasItem(item));
  }

  // Check if inventory contains all of the specified items
  hasAllOf(itemList) {
    return itemList.every(item => this.hasItem(item));
  }

  // Get item combinations (for crafting or puzzle solving)
  getCombinations() {
    const combinations = [];
    
    // Check for useful item combinations
    if (this.hasItem('coffee') && this.hasItem('energy_drink')) {
      combinations.push('super_caffeine');
    }
    
    if (this.hasItem('rubber_duck') && this.hasItem('debug_hammer')) {
      combinations.push('ultimate_debugging');
    }
    
    if (this.hasItem('master_keycard') && this.hasItem('ancient_manual')) {
      combinations.push('admin_privileges');
    }
    
    return combinations;
  }

  // Try to combine items
  combineItems(item1, item2) {
    if (!this.hasItem(item1) || !this.hasItem(item2)) {
      return { 
        success: false, 
        message: 'You need both items to combine them.' 
      };
    }

    // Define item combinations
    const combinations = {
      'coffee,energy_drink': {
        result: 'super_caffeine',
        message: 'You mix coffee with energy drink. This probably violates several health codes.',
        removeItems: true
      },
      'rubber_duck,debug_hammer': {
        result: 'ultimate_debugging_kit',
        message: 'You combine the rubber duck with the debug hammer. Now you can debug AND destroy bugs!',
        removeItems: true
      }
    };

    const key1 = `${item1},${item2}`;
    const key2 = `${item2},${item1}`;
    const combination = combinations[key1] || combinations[key2];

    if (combination) {
      if (combination.removeItems) {
        this.removeItem(item1);
        this.removeItem(item2);
      }
      
      this.addItem(combination.result);
      
      return {
        success: true,
        message: combination.message,
        result: combination.result
      };
    }

    return {
      success: false,
      message: `You can't combine ${item1} and ${item2}.`
    };
  }

  // Serialization for save/load
  serialize() {
    return {
      maxItems: this.maxItems,
      items: [...this.items]
    };
  }

  deserialize(data) {
    this.maxItems = data.maxItems || 10;
    this.items = data.items || [];
  }

  // Debug methods
  setMaxItems(max) {
    this.maxItems = Math.max(1, max);
    
    // Remove excess items if inventory is now too full
    if (this.items.length > this.maxItems) {
      const removed = this.items.splice(this.maxItems);
      return {
        success: true,
        message: `Inventory capacity set to ${max}. Removed excess items: ${removed.join(', ')}`
      };
    }
    
    return {
      success: true,
      message: `Inventory capacity set to ${max}.`
    };
  }

  addDebugItems() {
    const debugItems = [
      'debug_hammer',
      'coffee',
      'rubber_duck',
      'master_keycard',
      'ancient_manual'
    ];
    
    const added = [];
    debugItems.forEach(item => {
      if (!this.isFull() && !this.hasItem(item)) {
        this.addItem(item);
        added.push(item);
      }
    });
    
    return {
      success: true,
      message: `Added debug items: ${added.join(', ')}`
    };
  }
}