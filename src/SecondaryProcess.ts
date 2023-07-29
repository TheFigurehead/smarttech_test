import fs from "fs";
import {Asset, Pair, Platform, Vulnerability} from "./types";
import {PartialJSONDecoder} from "./PartialJSONDecoder";
import {compareNonSemanticVersions, compareSemanticVersions, isSemanticVersion} from "./utils";

export class SecondaryProcess {

    static SOURCE_FILE = 'data/vulnerabilities.json';

    public readStream: fs.ReadStream;
    public outputWriteStream: fs.WriteStream;
    public partialJSONParser: PartialJSONDecoder = new PartialJSONDecoder();

    public mainChunks: Asset[] = [];

    public onWriteStart: () => void;
    public onWriteEnd: () => void;

    private writeIteration: number = 0;

    constructor(writeStream: fs.WriteStream, mainChunks: Asset[], onWriteStart: () => void, onWriteEnd: () => void) {
        this.outputWriteStream = writeStream;
        this.onWriteStart = onWriteStart;
        this.onWriteEnd = onWriteEnd;
        this.mainChunks = mainChunks;

        this.initReadStream();
        this.run();
    }

    private initReadStream() {
        this.readStream = fs.createReadStream(SecondaryProcess.SOURCE_FILE);
    }

    private run(){
        this.readStream.on('data', this.onReadStreamData.bind(this));
    }

    onReadStreamData(chunk: Buffer) {

        const partiallyCollected = this.partialJSONParser.decode(chunk);

        const toWrite = this.checkPairs(
            this.mainChunks,
            partiallyCollected
        );

        this.writeIteration++;

        this.onWriteStart();

        this.outputWriteStream.write(
            `${this.writeIteration !== 1 ? ',' : ''}`+
            toWrite.join(',\n'),
            (err) => {
                this.onWriteEnd();
                if(err) throw err;
            });
    }

    public checkPairs(assetsChunk: Asset[], vulnerabilities: Vulnerability[]){
        let toWrite: string[] = [];
        for(let i=0; i < assetsChunk.length; i++){
            for(let j=0; j < vulnerabilities.length; j++) {
                const vulnerability: Vulnerability = vulnerabilities[j];
                const asset: Asset = assetsChunk[i];
                const AssetVulnerabilityPair: Pair|boolean = this.makePair(vulnerability, asset);

                if(!AssetVulnerabilityPair) continue;

                toWrite.push(JSON.stringify(AssetVulnerabilityPair));
            }
        }
        return toWrite;
    }

    public makePair(vulnerability: Vulnerability, asset: Asset): Pair|boolean {

        if(
            !asset.id ||
            !vulnerability.id ||
            !asset?.platforms?.length ||
            !vulnerability?.platforms?.length
        ) return false;

        const commonPlatforms = this.checkCommonPlatforms(asset.platforms, vulnerability.platforms);

        if(commonPlatforms.length === 0){
            return false;
        }

        return {
            assetId: asset.id,
            vulnerabilityId: vulnerability.id,
            platforms: commonPlatforms
        };
    }

    public checkCommonPlatforms(assetPlatforms: Platform[], vulnerabilityPlatforms: Platform[]): Platform[] {
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
}