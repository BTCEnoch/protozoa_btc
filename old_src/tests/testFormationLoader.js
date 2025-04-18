/**
 * Simple test script for FormationBankLoader
 */

// Import required modules
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Log the test start
console.log('Testing formation JSON files...');

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the formations directory
const formationsDir = path.join(__dirname, '../data/formations');

// Check if the directory exists
if (!fs.existsSync(formationsDir)) {
  console.error(`Directory not found: ${formationsDir}`);
  process.exit(1);
}

// Get all JSON files in the directory
const formationFiles = fs.readdirSync(formationsDir)
  .filter(file => file.endsWith('.json'));

console.log(`Found ${formationFiles.length} formation files:`);

// Track total formations
let totalFormations = 0;

// Process each file
for (const file of formationFiles) {
  const filePath = path.join(formationsDir, file);
  const roleName = path.basename(file, '.json').toUpperCase();

  try {
    // Read and parse the JSON file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);

    if (!data.formations || !Array.isArray(data.formations)) {
      console.error(`  ${roleName}: Invalid format - missing formations array`);
      continue;
    }

    const formationCount = data.formations.length;
    totalFormations += formationCount;

    console.log(`  ${roleName}: ${formationCount} formations`);

    // Group formations by tier
    const formationsByTier = {};
    for (const formation of data.formations) {
      const tier = formation.tier;
      if (!formationsByTier[tier]) {
        formationsByTier[tier] = [];
      }
      formationsByTier[tier].push(formation);
    }

    // Log formations by tier
    for (const [tier, formations] of Object.entries(formationsByTier)) {
      console.log(`    ${tier}: ${formations.length} formations`);
      // Log the first formation of each tier
      if (formations.length > 0) {
        console.log(`      First formation: ${formations[0].name}`);
      }
    }
  } catch (error) {
    console.error(`  Error processing ${filePath}: ${error.message}`);
  }
}

console.log(`\nTotal formations found: ${totalFormations}`);
console.log('Test completed successfully!');
