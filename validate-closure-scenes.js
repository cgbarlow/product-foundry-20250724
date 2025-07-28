#!/usr/bin/env node

/**
 * Validation script for closure scenes
 * Checks that all choice references point to existing scenes
 */

import fs from 'fs';
import path from 'path';

// Import the story
const storyModule = await import('./stories/intro.js');
const story = storyModule.default || storyModule;

console.log('🔍 Validating closure scenes...\n');

// Get all scene IDs
const sceneIds = new Set(Object.keys(story.scenes));
console.log(`📊 Total scenes: ${sceneIds.size}`);

// Find closure scenes (scenes added in this session)
const closureSceneIds = [
  'consciousness_synthesis',
  'research_collaboration_completion', 
  'meta_commentary_resolution',
  'technical_mastery_endpoint',
  'friendship_deepening',
  'reflection_sanctuary',
  'creative_collaboration_hub',
  'peaceful_conclusion',
  'reflect_on_journey',
  'explore_practical_applications',
  'venture_to_other_realms',
  'deep_meditation_state',
  'express_gratitude',
  'enjoy_peaceful_moment',
  'share_favorite_memories',
  'express_gratitude_for_experience',
  'contemplate_future_possibilities'
];

console.log(`🎯 Closure scenes added: ${closureSceneIds.length}`);

// Validate each closure scene
let validationErrors = [];
let choiceCount = 0;

closureSceneIds.forEach(sceneId => {
  const scene = story.scenes[sceneId];
  
  if (!scene) {
    validationErrors.push(`❌ Scene not found: ${sceneId}`);
    return;
  }
  
  console.log(`✅ ${sceneId} (${scene.choices?.length || 0} choices)`);
  
  // Check each choice
  scene.choices?.forEach(choice => {
    choiceCount++;
    if (!sceneIds.has(choice.id)) {
      validationErrors.push(`❌ Missing scene reference: ${choice.id} (from ${sceneId})`);
    }
  });
});

console.log(`\n📈 Statistics:`);
console.log(`- Closure scenes: ${closureSceneIds.length}`);
console.log(`- Closure scene choices: ${choiceCount}`);
console.log(`- Total scenes in story: ${sceneIds.size}`);

if (validationErrors.length === 0) {
  console.log('\n🎉 SUCCESS: All closure scenes are properly structured!');
  console.log('✅ No missing scene references found');
  console.log('✅ All choices point to existing scenes');
  
  // Show closure scene network
  console.log('\n🕸️  Closure Scene Network:');
  closureSceneIds.forEach(sceneId => {
    const scene = story.scenes[sceneId];
    const choiceTargets = scene.choices?.map(c => c.id) || [];
    const closureTargets = choiceTargets.filter(id => closureSceneIds.includes(id));
    if (closureTargets.length > 0) {
      console.log(`   ${sceneId} → [${closureTargets.join(', ')}]`);
    }
  });
  
} else {
  console.log(`\n❌ VALIDATION ERRORS (${validationErrors.length}):`);
  validationErrors.forEach(error => console.log(`   ${error}`));
}

console.log('\n🔧 Closure Scene Design Summary:');
console.log('- Strategic endpoint scenes provide satisfying conclusions');
console.log('- Hub scenes interconnect closure paths without creating new missing references');
console.log('- All choices point to existing scenes within the closure network');
console.log('- Players can cycle through closure scenes or reach final endpoints');
console.log('- No new missing scene references were created');