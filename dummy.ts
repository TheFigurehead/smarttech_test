import { generateRandomVulnerabilityJSON, generateRandomAssetsJSON } from './src/placeholders';

console.time('executionTime');

let assetsToGenerate = 100;
let vulnerabilitiesToGenerate = 100;

if (process.argv.length > 2) {
    for(let i = 2; i < process.argv.length; i++) {
        let arg = process.argv[i];
        if (arg.startsWith('--assets=')) {
            assetsToGenerate = parseInt(arg.substr(9));
        } else if (arg.startsWith('--vulnerabilities=')) {
            vulnerabilitiesToGenerate = parseInt(arg.substr(18));
        }
    }
}

generateRandomVulnerabilityJSON('data/vulnerabilities.json', vulnerabilitiesToGenerate);
generateRandomAssetsJSON('data/assets.json', assetsToGenerate);