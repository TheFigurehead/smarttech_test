import { generateRandomVulnerabilityJSON, generateRandomAssetsJSON } from './src/placeholders';

console.time('executionTime');

generateRandomVulnerabilityJSON('data/vulnerabilities.json', 10);
generateRandomAssetsJSON('data/assets.json', 10);