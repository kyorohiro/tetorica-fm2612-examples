/** VGM Maker's 43-byte YM2612 instrument format. */
export declare const VGI_FILE_SIZE = 43;
/** Parse a 43-byte VGI file into a logical YM2612 preset. */
export declare function parseVgi(data: any): {
    algorithm: any;
    feedback: any;
    b4: number;
    ams: number;
    pms: number;
    pan: {
        left: boolean;
        right: boolean;
    };
    operators: never[];
};
/** Create a 43-byte VGI file from a logical YM2612 preset. */
export declare function createVgiFromPreset(preset: any): Uint8Array<ArrayBuffer>;
