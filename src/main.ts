import fs from 'fs';
import {clearInterval} from 'timers';
import {Asset, Pair, Vulnerability, Platform} from './types';
import {compareNonSemanticVersions, compareSemanticVersions, isSemanticVersion} from './utils';

const ASSETS_FILE = 'data/assets.json';
const VULNERABILITIES_FILE = 'data/vulnerabilities.json';
const OUTPUT_FILE = 'data/output.json';

let allWrites = 0;

const partialJSONParser = (chunk: string|Buffer, leftOver: string, iter: number) => {
    let chunkStr = chunk.toString();
    const partiallCollected: any[] = [];
    if(iter === 0){
        chunkStr = chunkStr.slice(1, chunkStr.length);
    }else{
        chunkStr = leftOver + chunkStr;
    }
    const entities = chunkStr.split('\n');
    for(let i=0; i < entities.length; i++){
        if( i !== entities.length - 1) {
            try{
                partiallCollected.push(JSON.parse(entities[i].slice(0, entities[i].length - 1)));
            }catch (e) {
                console.log(entities[i].slice(0, entities[i].length - 1));
            }
        } else {
            leftOver = entities[i];
        }
    }
    return {
        partiallCollected,
        leftOver
    }
}

const vulnerabilityAssetPair = (vulnerability: Vulnerability, asset: Asset): Pair|boolean => {

    if(
        !asset.id ||
        !vulnerability.id ||
        !asset?.platforms?.length ||
        !vulnerability?.platforms?.length
    ) return false;

    const commonPlatforms: Platform[] = [];

    for(let k=0; k < asset.platforms.length; k++){
        for(let l=0; l < vulnerability.platforms.length; l++){
            if(asset.platforms[k].id === vulnerability.platforms[l].id){
                const minVersion = asset.platforms[k].minVersion;
                const maxVersion = asset.platforms[k].maxVersion;
                const vulnMinVersion = vulnerability.platforms[l].minVersion;
                const vulnMaxVersion = vulnerability.platforms[l].maxVersion;
                if(minVersion && maxVersion && vulnMinVersion && vulnMaxVersion){
                    const isSemantic = isSemanticVersion(minVersion) && isSemanticVersion(maxVersion) && isSemanticVersion(vulnMinVersion) && isSemanticVersion(vulnMaxVersion);
                    if(!isSemantic){
                        if(compareNonSemanticVersions(minVersion, vulnMinVersion) === 1 && compareNonSemanticVersions(maxVersion, vulnMaxVersion) === -1){
                            commonPlatforms.push(asset.platforms[k]);
                        }
                    }else{
                        if(compareSemanticVersions(minVersion, vulnMinVersion) === 1 && compareSemanticVersions(maxVersion, vulnMaxVersion) === -1){
                            commonPlatforms.push(asset.platforms[k]);
                        }
                    }
                }
            }
        }
    }

    if(commonPlatforms.length === 0){
        return false;
    }

    return {
        assetId: asset.id,
        vulnerabilityId: vulnerability.id,
        platforms: commonPlatforms
    };
}

const runThroughVulnerabilities = (writeStream: fs.WriteStream, assetsReadStream: fs.ReadStream, assetsChunk: Asset[]) => {

    const vulnerabilitiesReadStream = fs.createReadStream(VULNERABILITIES_FILE);

    let iter = 0;
    let leftOver = '';

    vulnerabilitiesReadStream.on('data', (chunk) => {

        const {
            partiallCollected: partiallCollectedVulnerabilities,
            leftOver: newLeftOver
        } = partialJSONParser(chunk, leftOver, iter);

        leftOver = newLeftOver;

        iter++;

        let toWrite: string[] = [];

        for(let i=0; i < assetsChunk.length; i++){
            for(let j=0; j < partiallCollectedVulnerabilities.length; j++) {
                const vulnerability: Vulnerability = partiallCollectedVulnerabilities[j];
                const asset: Asset = assetsChunk[i];
                const AssetVulnerabilityPair: Pair|boolean = vulnerabilityAssetPair(vulnerability, asset);

                if(!AssetVulnerabilityPair) continue;

                toWrite.push(JSON.stringify(AssetVulnerabilityPair));
            }
        }

        allWrites++;

        writeStream.write(
            toWrite.join(',\n') + `${(iter === 1 && leftOver === '') ? '' : ',\n'}`,
            (err) => {
                allWrites--;
                if(err) throw err;
            });

    });

    vulnerabilitiesReadStream.on('end', () => {
        vulnerabilitiesReadStream.close();
        console.timeLog('executionTime');
    });
}

export const generateOutput = async () => {
    console.time('executionTime');

    if(fs.existsSync(OUTPUT_FILE)) await fs.unlinkSync(OUTPUT_FILE);

    const assetsReadStream = fs.createReadStream(ASSETS_FILE);

    const writeStream = fs.createWriteStream(OUTPUT_FILE, {flags: 'a'});

    writeStream.write('[\n');

    let iter = 0;
    let leftOver = '';

    assetsReadStream.on('data', (chunk) => {
        const {
            partiallCollected: partiallCollectedAssets,
            leftOver: newLeftOver
        } = partialJSONParser(chunk, leftOver, iter);
        leftOver = newLeftOver;

        iter++;
        runThroughVulnerabilities(writeStream, assetsReadStream, partiallCollectedAssets);

    });

    assetsReadStream.on('end', () => {

        console.log('end');

        const used = process.memoryUsage().heapUsed / 1024 / 1024;
        console.log(`The script uses approximately ${used} MB`);

        console.timeLog('executionTime');

        const interval = setInterval(() => {
            console.log('allWrites', allWrites);
            if (allWrites === 0) {
                writeStream.write(']', () => {
                    writeStream.end();
                    console.timeLog('executionTime');
                });
                clearInterval(interval);
            }
        }, 10);


    });

}