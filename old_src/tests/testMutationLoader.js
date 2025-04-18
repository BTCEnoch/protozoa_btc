/**
 * Simple test script for MutationBankLoader
 */

// Import required modules
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Log the test start
console.log('Testing mutation JSON files...');

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the mutations directory
const mutationsDir = path.join(__dirname, '../data/mutations');

// Check if the directory exists
if (!fs.existsSync(mutationsDir)) {
  console.error(`Directory not found: ${mutationsDir}`);
  process.exit(1);
}

// Get all subdirectories
const categories = fs.readdirSync(mutationsDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

console.log(`Found ${categories.length} mutation categories:`);

// Track total mutations
let totalMutations = 0;

// Process each category
for (const category of categories) {
  console.log(`\n${category.toUpperCase()}:`);

  const categoryDir = path.join(mutationsDir, category);
  const rarityFiles = fs.readdirSync(categoryDir)
    .filter(file => file.endsWith('.json'));

  // Process each rarity file
  for (const rarityFile of rarityFiles) {
    const rarityPath = path.join(categoryDir, rarityFile);
    const rarityName = path.basename(rarityFile, '.json').toUpperCase();

    try {
      // Read and parse the JSON file
      const fileContent = fs.readFileSync(rarityPath, 'utf8');
      const data = JSON.parse(fileContent);

      if (!data.mutations || !Array.isArray(data.mutations)) {
        console.error(`  ${rarityName}: Invalid format - missing mutations array`);
        continue;
      }

      const mutationCount = data.mutations.length;
      totalMutations += mutationCount;

      console.log(`  ${rarityName}: ${mutationCount} mutations`);

      // Log the first mutation if available
      if (mutationCount > 0) {
        console.log(`    First mutation: ${data.mutations[0].name}`);
      }
    } catch (error) {
      console.error(`  Error processing ${rarityPath}: ${error.message}`);
    }
  }
}

console.log(`\nTotal mutations found: ${totalMutations}`);
console.log('Test completed successfully!');
