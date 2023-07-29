export class PartialJSONDecoder {
    public leftOver: string = '';
    public iter: number = 0;

    public decode(chunk: Buffer|string) {

        let chunkStr = chunk.toString();
        const partiallyCollected: any[] = [];

        if(this.iter === 0){
            chunkStr = chunkStr.slice(1, chunkStr.length);
        }else{
            chunkStr = this.leftOver + chunkStr;
        }

        const entities = chunkStr.split('\n');

        for(let i=0; i < entities.length; i++){
            if( i !== entities.length - 1) {
                try{
                    partiallyCollected.push(JSON.parse(entities[i].slice(0, entities[i].length - 1)));
                }catch (e) {
                    console.log(e);
                    console.log(`Error in chunk # ${this.iter}.`)
                    console.log(entities[i].slice(0, entities[i].length - 1));
                }
            } else {
                this.leftOver = entities[i];
            }
        }

        this.iter++;

        return partiallyCollected;

    }
}