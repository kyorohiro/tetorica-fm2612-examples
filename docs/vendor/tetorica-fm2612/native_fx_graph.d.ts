export declare const branch: (...children: any[]) => {
    type: string;
    children: any[];
};
export declare const parallel: (...children: any[]) => {
    type: string;
    children: any[];
};
export declare const effect: (type: any, slot?: number) => {
    type: any;
    slot: number;
};
export declare const types: {
    chain: number;
    parallel: number;
    gain: number;
    eq: number;
    gate: number;
    compressor: number;
    reverb: number;
    filter: number;
    delay: number;
    distortion: number;
    bitcrusher: number;
    wobble: number;
    flanger: number;
    slicer: number;
    chorus: number;
};
export declare function setChain(api: any, children: any): void;
export declare function extraChain(): {
    type: any;
    slot: number;
}[];
export declare function preset(mode: any): ({
    type: string;
    children: any[];
} | {
    type: any;
    slot: number;
})[];
