/**
 * Test for MutationBankLoader
 *
 * This file tests the MutationBankLoader class to ensure it correctly loads
 * mutation data from JSON files.
 */

import { getMutationBankLoader } from '../services/mutations/mutationBankLoader.js';
import { MutationCategory, Rarity } from '../types/core.js';

async function testMutationBankLoader() {
  console.log('Testing MutationBankLoader...');

  try {
    // Get the mutation bank loader
    const loader = getMutationBankLoader();

    // Load mutations from files
    const mutationBank = await loader.loadFromFiles('./src/data/mutations');

    // Log the number of mutations loaded for each category and rarity
    console.log('Mutations loaded:');

    let totalMutations = 0;

    for (const category of Object.values(MutationCategory)) {
      console.log(`\n${category}:`);

      for (const rarity of Object.values(Rarity)) {
        const mutations = mutationBank[category][rarity];
        console.log(`  ${rarity}: ${mutations.length} mutations`);
        totalMutations += mutations.length;

        // Log the first mutation of each category and rarity if available
        if (mutations.length > 0) {
          console.log(`    First mutation: ${mutations[0].name}`);
        }
      }
    }

    console.log(`\nTotal mutations loaded: ${totalMutations}`);

    // Test complete
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testMutationBankLoader();
