export type Asset = {
    id: number,
    name: string,
    platforms: Platform[],
}

export type Vulnerability = {
    id: number,
    name: string,
    platforms: Platform[],
}

export type Pair = {
    vulnerabilityId: number;
    assetId: number;
    platforms: Platform[]
}

export type Platform = {
    id: number,
    name: string,
    minVersion?: string,
    maxVersion?: string,
}