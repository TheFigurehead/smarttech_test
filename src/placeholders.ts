import {generateNonSemanticVersion, generateRandomSemanticVersion, generateRandomNumberInRange} from './utils';
import { Platform } from './types';
import fs from 'fs';

let PLATFORMS: Platform[] = [];

const VUL_LIST: string[] = [
    'Injection',
    'Broken Authentication',
    'Sensitive Data Exposure',
    'XML External Entities (XXE)',
    'Broken Access Control',
    'Security Misconfiguration',
    'Cross-Site Scripting XSS',
    'Insecure Deserialization',
    'Using Components with Known Vulnerabilities',
    'Insufficient Logging & Monitoring'
];

const writeObjectToStream = (writeStream: fs.WriteStream, object: any, isLast: boolean, iter: number) => {
    writeStream.write(
        `${iter === 0 ? '[' : ''}` + JSON.stringify(object) + `${isLast ? ']' : ','}\n`,
        (err) => {
            if(err) throw err;
        }
    );
}

const getPlatformsArray = () => {
    if(PLATFORMS.length === 0){
        const data = fs.readFileSync('data/platforms.json', 'utf8');
        PLATFORMS = JSON.parse(data);
    }
    return PLATFORMS;
}

const generateRandomPlatforms = () => {
    const platforms = getPlatformsArray();
    const randomRange = generateRandomNumberInRange(1, 2);
    const randomPlatforms = [];
    for(let j=0; j < randomRange; j++){
        const isSemantic = Math.random() <= 0.9;
        const randomMinVersion = isSemantic ? generateRandomSemanticVersion('0.0.1') : generateNonSemanticVersion('0.0.1');
        randomPlatforms.push({
            ...platforms[(Math.floor(Math.random() * platforms.length))],
            minVersion: randomMinVersion,
            maxVersion: isSemantic ? generateRandomSemanticVersion(randomMinVersion) : generateNonSemanticVersion(randomMinVersion),
        });
    }
    return randomPlatforms;
}

export const generateRandomJSON = async (filename: string, quantity: number, generator: any) => {

    if(fs.existsSync(filename)) await fs.unlinkSync(filename);

    const writeStream = fs.createWriteStream(filename, {flags: 'a'});

    for (let i=0; i < quantity; i++){
        writeObjectToStream(
            writeStream,
            generator(),
            i === quantity - 1,
            i
        );
    }

    console.timeLog('executionTime');

}


const generateRandomAssets = () => {
    return {
        id: Math.floor(Math.random() * 1000000),
        name: `Asset ${Math.floor(Math.random() * 1000000)}`,
        platforms: generateRandomPlatforms(),
    }
}

const generateRandomVulnerability = () => {
    return {
        id: Math.floor(Math.random() * 1000000),
        name: VUL_LIST[(Math.floor(Math.random() * VUL_LIST.length))],
        platforms: generateRandomPlatforms(),
    }
}

export const generateRandomVulnerabilityJSON = (filename: string, quantity: number) => {
    generateRandomJSON(filename, quantity, generateRandomVulnerability);
}

export const generateRandomAssetsJSON = (filename: string, quantity: number) => {
    generateRandomJSON(filename, quantity, generateRandomAssets);
}