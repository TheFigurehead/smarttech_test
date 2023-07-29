export const generateRandomNumberInRange = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export const generateRandomSemanticVersion = (minVersion: string) => {
    const minVersionArr = minVersion.split('.');
    const minMajor = parseInt(minVersionArr[0]);
    const minMinor = parseInt(minVersionArr[1]);
    const minPatch = parseInt(minVersionArr[2]);

    const major = generateRandomNumberInRange(minMajor, minMajor+5);
    const minor = generateRandomNumberInRange(minMinor, minMinor+10);
    const patch = generateRandomNumberInRange(minPatch, minPatch+15);

    return `${major}.${minor}.${patch}`;
}

export const generateNonSemanticVersion = (minVersion: string) => {
    const [ver, ...date] = minVersion.split('-');

    const dateTime = (date.length>0) ? new Date(date.join('/')).getTime() : new Date().getTime();
    const generatedDateTime = generateRandomNumberInRange(dateTime, dateTime+100*24*60*60*1000);
    const generatedDate = new Date(generatedDateTime).toISOString().split('T')[0];

    const minVersionArr = ver.split('.');

    const minMajor = parseInt(minVersionArr[0]);
    const minMinor = parseInt(minVersionArr[1]);
    const minPatch = parseInt(minVersionArr[2]);

    const major = generateRandomNumberInRange(minMajor, minMajor+5);
    const minor = generateRandomNumberInRange(minMinor, minMinor+10);
    const patch = generateRandomNumberInRange(minPatch, minPatch+15);

    return `${major}.${minor}.${patch}-${generatedDate}`;
}

export const compareNonSemanticVersions = (version1: string, version2: string) => {
    const [ver1, ...date1] = version1.split('-');
    const [ver2, ...date2] = version2.split('-');

    const dateTime1 = new Date(date1.join('/')).getTime();
    const dateTime2 = new Date(date2.join('/')).getTime();

    if(dateTime1 > dateTime2){
        return 1;
    } else if(dateTime1 < dateTime2){
        return -1;
    } else {
        const version1Arr = ver1.split('.');
        const version2Arr = ver2.split('.');

        if(parseInt(version1Arr[0]) > parseInt(version2Arr[0])){
            return 1;
        } else if(parseInt(version1Arr[0]) < parseInt(version2Arr[0])){
            return -1;
        } else {
            if(parseInt(version1Arr[1]) > parseInt(version2Arr[1])){
                return 1;
            } else if(parseInt(version1Arr[1]) < parseInt(version2Arr[1])){
                return -1;
            } else {
                if(parseInt(version1Arr[2]) > parseInt(version2Arr[2])){
                    return 1;
                } else if(parseInt(version1Arr[2]) < parseInt(version2Arr[2])){
                    return -1;
                } else {
                    return 0;
                }
            }
        }
    }
}

export const isSemanticVersion = (version: string) => {
    const versionArr = version.split('.');

    if(versionArr.length !== 3) return false;

    for(let i=0; i < versionArr.length; i++){
        if(isNaN(Number(versionArr[i]))) return false;
    }

    return true;
}

export const compareSemanticVersions = (version1: string, version2: string) => {
    const version1Arr = version1.split('.');
    const version2Arr = version2.split('.');

    if(parseInt(version1Arr[0]) > parseInt(version2Arr[0])){
        return 1;
    } else if(parseInt(version1Arr[0]) < parseInt(version2Arr[0])){
        return -1;
    } else {
        if(parseInt(version1Arr[1]) > parseInt(version2Arr[1])){
            return 1;
        } else if(parseInt(version1Arr[1]) < parseInt(version2Arr[1])){
            return -1;
        } else {
            if(parseInt(version1Arr[2]) > parseInt(version2Arr[2])){
                return 1;
            } else if(parseInt(version1Arr[2]) < parseInt(version2Arr[2])){
                return -1;
            } else {
                return 0;
            }
        }
    }
}