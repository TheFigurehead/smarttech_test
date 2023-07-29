import { generateRandomVulnerabilityJSON, generateRandomAssetsJSON } from './src/placeholders';

console.time('executionTime');

generateRandomVulnerabilityJSON('data/vulnerabilities.json', 10000);
generateRandomAssetsJSON('data/assets.json', 10000);