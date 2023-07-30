export class PartialJSONDecoder {
    private buffer: Buffer|string = '';
    public iter: number = 0;

    public decode(chunk: Buffer) {

        let toDelete = 0;
        this.buffer = [this.buffer, chunk.toString()].join('').replace(/^,/, '');

        const jsonObjects = this.buffer.split(/(\{.+\})/g);

        if (jsonObjects.length === 0) {
            return [];
        }
        const partiallyCollected: any[] = [];
        for (let i = 0; i < jsonObjects.length; i++) {
            if(i !== jsonObjects.length - 1) toDelete += jsonObjects[i].length;
            try {
                partiallyCollected.push(...JSON.parse(`[${jsonObjects[i]}]`));
            } catch (e) {
                continue;
            }
        }
        this.iter++;
        this.buffer = this.buffer.slice(toDelete);

        return partiallyCollected;

    }
}