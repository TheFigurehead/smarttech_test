import { generateRandomVulnerabilityJSON, generateRandomAssetsJSON } from './src/placeholders';

console.time('executionTime');

generateRandomVulnerabilityJSON('data/vulnerabilities.json', 1000);
generateRandomAssetsJSON('data/assets.json', 1000);