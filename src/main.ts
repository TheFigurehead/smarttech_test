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
                console.log(e);
                console.log(`Error in chunk # ${iter}.`)
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

const onMainReadStreamEnd = (writeStream: fs.WriteStream, startTimestamp: number) => {
    const interval = setInterval(() => {
        process.stdout.write(
            `\rRunning write processes: ${allWrites} / Time taken: ${(Date.now() - startTimestamp) / 1000 } seconds`
        );
        // console.timeLog('executionTime');
        if (allWrites === 0) {
            writeStream.write(']', () => {
                writeStream.end();
                process.stdout.write('\nFinished!\n');
                console.timeLog('executionTime');
                const used = process.memoryUsage().heapUsed / 1024 / 1024;
                console.log(`The script uses approximately ${used} MB`);
            });
            clearInterval(interval);
        }
    }, 100);
}

const checkCommonPlatforms = (assetPlatforms: Platform[], vulnerabilityPlatforms: Platform[]): Platform[] => {
    const commonPlatforms: Platform[] = [];
    for(let k=0; k < assetPlatforms.length; k++){
        for(let l=0; l < vulnerabilityPlatforms.length; l++){
            if(assetPlatforms[k].id === vulnerabilityPlatforms[l].id){
                const minVersion = assetPlatforms[k].minVersion;
                const maxVersion = assetPlatforms[k].maxVersion;
                const vulnMinVersion = vulnerabilityPlatforms[l].minVersion;
                const vulnMaxVersion = vulnerabilityPlatforms[l].maxVersion;
                if(minVersion && maxVersion && vulnMinVersion && vulnMaxVersion){
                    const isSemantic = isSemanticVersion(minVersion) && isSemanticVersion(maxVersion) && isSemanticVersion(vulnMinVersion) && isSemanticVersion(vulnMaxVersion);
                    if(!isSemantic){
                        if(compareNonSemanticVersions(minVersion, vulnMinVersion) === 1 && compareNonSemanticVersions(maxVersion, vulnMaxVersion) === -1){
                            commonPlatforms.push(assetPlatforms[k]);
                        }
                    }else{
                        if(compareSemanticVersions(minVersion, vulnMinVersion) === 1 && compareSemanticVersions(maxVersion, vulnMaxVersion) === -1){
                            commonPlatforms.push(assetPlatforms[k]);
                        }
                    }
                }
            }
        }
    }
    return commonPlatforms;
}

const vulnerabilityAssetPair = (vulnerability: Vulnerability, asset: Asset): Pair|boolean => {

    if(
        !asset.id ||
        !vulnerability.id ||
        !asset?.platforms?.length ||
        !vulnerability?.platforms?.length
    ) return false;

    const commonPlatforms = checkCommonPlatforms(asset.platforms, vulnerability.platforms);

    if(commonPlatforms.length === 0){
        return false;
    }

    return {
        assetId: asset.id,
        vulnerabilityId: vulnerability.id,
        platforms: commonPlatforms
    };
}

const checkVulnerabilitiesAssetsPairs = (assetsChunk: Asset[], vulnerabilities: Vulnerability[]) => {
    let toWrite: string[] = [];
    for(let i=0; i < assetsChunk.length; i++){
        for(let j=0; j < vulnerabilities.length; j++) {
            const vulnerability: Vulnerability = vulnerabilities[j];
            const asset: Asset = assetsChunk[i];
            const AssetVulnerabilityPair: Pair|boolean = vulnerabilityAssetPair(vulnerability, asset);

            if(!AssetVulnerabilityPair) continue;

            toWrite.push(JSON.stringify(AssetVulnerabilityPair));
        }
    }
    return toWrite;
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
        const toWrite = checkVulnerabilitiesAssetsPairs(assetsChunk, partiallCollectedVulnerabilities);
        allWrites++;
        writeStream.write(
            toWrite.join(',\n') + `${(iter === 1 && leftOver === '') ? '' : ',\n'}`,
            (err) => {
                allWrites--;
                if(err) throw err;
            });
    });
}

export const generateOutput = async () => {

    console.time('executionTime');

    const startTimestamp = Date.now();

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

        onMainReadStreamEnd(writeStream, startTimestamp);

    });

}