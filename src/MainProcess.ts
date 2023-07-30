import fs from "fs";
import { PartialJSONDecoder } from './PartialJSONDecoder';
import { SecondaryProcess } from './SecondaryProcess';

export class MainProcess {

    static OUTPUT_FILE = 'data/output.json';
    static SOURCE_FILE = 'data/assets.json';

    public startTimestamp: number = Date.now();
    public activeWritesAmount: number = 0;

    public mainReadStream: fs.ReadStream;
    public outputWriteStream: fs.WriteStream;

    public checksDone: number = 0;

    public partialJSONParser: PartialJSONDecoder = new PartialJSONDecoder();

    constructor() {
        console.time('executionTime');
    }

    private changeActiveWritesAmount(amount: number) {
        this.activeWritesAmount += amount;
        process.stdout.write(
            `\rRunning write processes: ${this.activeWritesAmount} / Time taken: ${(Date.now() - this.startTimestamp) / 1000 } seconds`
        );
        if (this.activeWritesAmount === 0) {
            this.onWriteEnd();
        }
    }

    public async init() {
        await this.clearOutputFileContent();
        this.initMainReadStream();
        this.initOutputWriteStream();
    }

    private async clearOutputFileContent() {
        if(fs.existsSync(MainProcess.OUTPUT_FILE))
            await fs.unlinkSync(MainProcess.OUTPUT_FILE);
    }

    private initMainReadStream() {
        this.mainReadStream = fs.createReadStream(MainProcess.SOURCE_FILE);
        this.mainReadStream.on('data', this.onAssetsReadStreamData.bind(this));
    }

    private onAssetsReadStreamData(chunk: Buffer) {
        const partiallyCollectedAssets = this.partialJSONParser.decode(chunk);
        new SecondaryProcess(
            this.outputWriteStream,
            partiallyCollectedAssets,
            () => this.changeActiveWritesAmount(1),
            () => this.changeActiveWritesAmount(-1),
            () => this.checksDone++
        );
    }

    private initOutputWriteStream() {
        this.outputWriteStream = fs.createWriteStream(MainProcess.OUTPUT_FILE, {flags: 'a'});
        this.onWriteStart();
    }

    private onWriteStart() {
        this.outputWriteStream.write('[\n');
    }

    private onWriteEnd() {
        this.outputWriteStream.write(']', () => {
            this.outputWriteStream.end();
            process.stdout.write('\nFinished!\n');
            console.timeLog('executionTime');
            const used = process.memoryUsage().heapUsed / 1024 / 1024;
            console.log(`The script uses approximately ${used} MB`);

            console.log(`Checks done: ${this.checksDone}`);
        });
    }

}