#!/usr/bin/env node

import introStory from './stories/intro.js';

const scenes = introStory.scenes;
const sceneIds = new Set(Object.keys(scenes));
const missingScenes = new Set();

// Collect all choice IDs from all scenes
for (const [sceneId, scene] of Object.entries(scenes)) {
  if (scene.choices) {
    for (const choice of scene.choices) {
      if (!sceneIds.has(choice.id)) {
        missingScenes.add(choice.id);
      }
    }
  }
}

console.log('🔍 COMPREHENSIVE SCENE VALIDATION:');
console.log('📊 Total scenes:', sceneIds.size);
console.log('❌ Missing scenes:', missingScenes.size);

if (missingScenes.size > 0) {
  console.log('\n🚨 STILL MISSING:');
  [...missingScenes].sort().forEach(id => console.log('  -', id));
  process.exit(1);
} else {
  console.log('\n✅ ALL SCENES EXIST! Story is complete!');
  console.log('\n📋 Available scenes:');
  [...sceneIds].sort().forEach(id => console.log('  ✓', id));
}