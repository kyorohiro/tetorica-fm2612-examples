export type Ym2612VgmHeader = {
    ident: string;
    version: number;
    ym2612Clock: number;
    ay8910Clock: number;
    ay8910Type: number;
    ay8910Flags: number;
    ym3526Clock: number;
    ym3812Clock: number;
    y8950Clock: number;
    ymf278bClock: number;
    ymf262Clock: number;
    ym2151Clock: number;
    ym2413Clock: number;
    ym2203Clock: number;
    ym2608Clock: number;
    rf5c164Clock: number;
    psgClock: number;
    ym2610Clock: number;
    totalSamples: number;
    loopOffset: number;
    loopSamples: number;
    dataOffset: number;
};
export type Ym2151WriteEvent = {
    type: "ym2151-write";
    register: number;
    value: number;
};
export type Ym2612WriteEvent = {
    type: "ym2612-write";
    port: 0 | 1;
    register: number;
    value: number;
};
export type Ym2203WriteEvent = {
    type: "ym2203-write";
    register: number;
    value: number;
};
export type Ym2608WriteEvent = {
    type: "ym2608-write";
    port: 0 | 1;
    register: number;
    value: number;
};
export type Ym2413WriteEvent = {
    type: "ym2413-write";
    register: number;
    value: number;
};
export type Ym2610WriteEvent = {
    type: "ym2610-write";
    port: 0 | 1;
    register: number;
    value: number;
};
export type Rf5c164Event = {
    type: "rf5c164-write";
    register: number;
    value: number;
    chipIndex: number;
} | {
    type: "rf5c164-memory-write";
    offset: number;
    value: number;
    chipIndex: number;
} | {
    type: "rf5c164-data";
    offset: number;
    data: Uint8Array;
    chipIndex: number;
};
export type Ym2608AdpcmBDataEvent = {
    type: "ym2608-adpcm-b-data";
    data: Uint8Array;
    offset: number;
    memorySize: number;
    chipIndex: number;
};
export type SegaPsgWriteEvent = {
    type: "psg-write";
    value: number;
};
export type Ym2612WaitEvent = {
    type: "wait";
    samples: number;
};
export type Ym2612EndEvent = {
    type: "end";
};
export type Ym2612VgmEvent = {
    type: "ay8910-write";
    register: number;
    value: number;
    chipIndex: number;
} | {
    type: "ym3526-write";
    register: number;
    value: number;
    chipIndex: number;
} | {
    type: "ym3812-write";
    register: number;
    value: number;
} | {
    type: "ymf262-write";
    register: number;
    value: number;
    port: number;
} | Ym2151WriteEvent | Ym2413WriteEvent | Rf5c164Event | Ym2612WriteEvent | Ym2203WriteEvent | Ym2608WriteEvent | Ym2608AdpcmBDataEvent | Ym2610WriteEvent | SegaPsgWriteEvent | Ym2612WaitEvent | Ym2612EndEvent;
export type Ym2612PcmRamWriteInfo = {
    type: number;
    readOffset: number;
    writeOffset: number;
    size: number;
    commandOffset: number;
};
export declare class Ym2612VGM {
    #private;
    /** @type {Uint8Array} */
    bytes: Uint8Array;
    /** @type {DataView} */
    view: DataView;
    /** @type {Ym2612VgmHeader} */
    header: Ym2612VgmHeader;
    /** @type {number} */
    position: number;
    /** @type {boolean} */
    ended: boolean;
    /** @type {Pick<Console, "warn"> | null} */
    logger: Pick<Console, "warn"> | null;
    /** @type {Map<number, Uint8Array>} */
    dataBanks: Map<number, Uint8Array>;
    bankBlocks: Map<any, any>;
    decompressionTables: Map<any, any>;
    bankBlocksSeen: Set<any>;
    rf5c164BlocksSeen: Set<any>;
    pwmBlocks: any[];
    pwmBlocksSeen: Set<any>;
    /** @type {Uint8Array[]} */
    dataBlocks: Uint8Array[];
    /** @type {Array<{ type: number, size: number, preview: string }>} */
    dataBlockInfo: Array<{
        type: number;
        size: number;
        preview: string;
    }>;
    /** @type {Map<number, {
     *   chipType: number,
     *   port: number,
     *   register: number,
     *   dataBankId: number,
     *   stepSize: number,
     *   stepBase: number,
     *   frequency: number,
     *   active: boolean,
     *   loop: boolean,
     *   data: Uint8Array | null,
     *   dataOffset: number,
     *   dataLength: number,
     *   cursor: number,
     *   sampleRemainder: number
     * }>} */
    streams: Map<number, {
        chipType: number;
        port: number;
        register: number;
        dataBankId: number;
        stepSize: number;
        stepBase: number;
        frequency: number;
        active: boolean;
        loop: boolean;
        data: Uint8Array | null;
        dataOffset: number;
        dataLength: number;
        cursor: number;
        sampleRemainder: number;
    }>;
    /** @type {number} */
    dataBankCursor: number;
    /** @type {{ port: number, value: number } | null} */
    pendingYm2612DataBankWrite: {
        port: number;
        value: number;
    } | null;
    /** @type {Ym2612PcmRamWriteInfo[]} */
    pcmRamWrites: Ym2612PcmRamWriteInfo[];
    /**
     * @param {ArrayBuffer | ArrayBufferView} source
     * @param {{ logger?: Pick<Console, "warn"> | null }} [options]
     */
    constructor(source: ArrayBuffer | ArrayBufferView, options?: {
        logger?: Pick<Console, "warn"> | null;
    });
    /**
     * @returns {Ym2612VgmHeader}
     */
    parseHeader(): Ym2612VgmHeader;
    /**
     * @returns {void}
     */
    savePlaybackState(): void;
    loadPlaybackState(state: any): void;
    reset(): void;
    /**
     * @returns {boolean}
     */
    hasLoop(): boolean;
    /**
     * @returns {Array<{ type: number, size: number, preview: string, index: number }>}
     */
    dataBlockSummary(): Array<{
        type: number;
        size: number;
        preview: string;
        index: number;
    }>;
    /**
     * @returns {Map<string, number>}
     */
    analyzeCommandUsage(): Map<string, number>;
    /**
     * @returns {Array<string>}
     */
    analyzeSpecialCommands(): Array<string>;
    /**
     * @returns {Ym2612PcmRamWriteInfo[]}
     */
    pcmRamWriteSummary(): Ym2612PcmRamWriteInfo[];
    /**
     * @param {number} targetCommand
     * @param {number} [contextRadius]
     * @returns {Array<string>}
     */
    analyzeCommandContext(targetCommand: number, contextRadius?: number): Array<string>;
    /**
     * @returns {Ym2612VgmEvent}
     */
    step(): Ym2612VgmEvent;
    /**
     * @param {{
     *   resolveChip?: (type: string, index: number) => { writeRegister(register: number, value: number, port?: number): void, loadSampleMemory?(data: Uint8Array, offset: number, memorySize: number): void },
     *   ym2612?: { writeRegister(register: number, value: number, port?: number): void },
     *   ay8910?: { writeRegister(register: number, value: number): void },
   *   y8950?: { writeRegister(register: number, value: number): void, loadSampleMemory?(data: Uint8Array, offset: number, memorySize: number): void },
   *   ymf278b?: { writeRegister(register: number, value: number, port: number): void, loadSampleMemory?(data: Uint8Array, offset: number, memorySize: number): void },
   *   ym3526?: { writeRegister(register: number, value: number): void },
   *   ym3812?: { writeRegister(register: number, value: number): void },
   *   ymf262?: { writeRegister(register: number, value: number, port: number): void },
   *   ym2151?: { writeRegister(register: number, value: number): void },
   *   ym2413?: { writeRegister(register: number, value: number): void },
   *   ym2203?: { writeRegister(register: number, value: number): void },
     *   ym2608?: { writeRegister(register: number, value: number, port?: number): void, loadAdpcmBMemory?(data: Uint8Array, offset: number, memorySize: number): void },
     *   psg?: { write(data: number): void },
     *   writeRegister?: (register: number, value: number, port?: number) => void
     * }} targets
     * @returns {Ym2612VgmEvent}
     */
    playStep(targets: {
        resolveChip?: (type: string, index: number) => {
            writeRegister(register: number, value: number, port?: number): void;
            loadSampleMemory?(data: Uint8Array, offset: number, memorySize: number): void;
        };
        ym2612?: {
            writeRegister(register: number, value: number, port?: number): void;
        };
        ay8910?: {
            writeRegister(register: number, value: number): void;
        };
        y8950?: {
            writeRegister(register: number, value: number): void;
            loadSampleMemory?(data: Uint8Array, offset: number, memorySize: number): void;
        };
        ymf278b?: {
            writeRegister(register: number, value: number, port: number): void;
            loadSampleMemory?(data: Uint8Array, offset: number, memorySize: number): void;
        };
        ym3526?: {
            writeRegister(register: number, value: number): void;
        };
        ym3812?: {
            writeRegister(register: number, value: number): void;
        };
        ymf262?: {
            writeRegister(register: number, value: number, port: number): void;
        };
        ym2151?: {
            writeRegister(register: number, value: number): void;
        };
        ym2413?: {
            writeRegister(register: number, value: number): void;
        };
        ym2203?: {
            writeRegister(register: number, value: number): void;
        };
        ym2608?: {
            writeRegister(register: number, value: number, port?: number): void;
            loadAdpcmBMemory?(data: Uint8Array, offset: number, memorySize: number): void;
        };
        psg?: {
            write(data: number): void;
        };
        writeRegister?: (register: number, value: number, port?: number) => void;
    }): Ym2612VgmEvent;
    /**
     * @param {{
     *   resolveChip?: (type: string, index: number) => { writeRegister(register: number, value: number, port?: number): void, loadSampleMemory?(data: Uint8Array, offset: number, memorySize: number): void },
     *   ym2612?: { writeRegister(register: number, value: number, port?: number): void },
     *   psg?: { write(data: number): void },
     *   writeRegister?: (register: number, value: number, port?: number) => void
     * }} targets
     * @param {number} vgmSamples
     * @param {(segmentSamples: number) => void} onSegment
     * @returns {void}
     */
    consumeWait(targets: {
        resolveChip?: (type: string, index: number) => {
            writeRegister(register: number, value: number, port?: number): void;
            loadSampleMemory?(data: Uint8Array, offset: number, memorySize: number): void;
        };
        ym2612?: {
            writeRegister(register: number, value: number, port?: number): void;
        };
        psg?: {
            write(data: number): void;
        };
        writeRegister?: (register: number, value: number, port?: number) => void;
    }, vgmSamples: number, onSegment: (segmentSamples: number) => void): void;
    /**
     * Export YM2612 writes as Tetorica Playground JavaScript.
     *
     * @param {{
     *   includeHeaderComment?: boolean,
     *   totalLoopSamples?: number | null,
     * }} [options]
     * @returns {string}
     */
    exportPlaygroundJavaScript(options?: {
        includeHeaderComment?: boolean;
        totalLoopSamples?: number | null;
    }): string;
    requiresYmf278bWaveRom(): boolean;
    requiresYm2608RhythmRom(): boolean;
    /**
     * @param {number} command
     * @param {number} position
     * @returns {string}
     */
    describeCommandAt(position: number): string;
}
export declare function decodePwmBlock(data: any, tables?: Map<any, any>): Uint8Array<ArrayBuffer>;
/**
 * @param {ArrayBuffer | ArrayBufferView | Ym2612VGM} source
 * @param {{
 *   includeHeaderComment?: boolean,
 *   includeDac?: boolean,
 *   includePsg?: boolean,
 *   dacBase64?: boolean,
 *   scheduled?: boolean,
 *   high?: boolean,
 *   noteish?: boolean,
 *   cleanNoteOnset?: boolean,
 *   compact?: boolean,
 *   totalLoopSamples?: number | null,
 * }} [options]
 * @returns {string}
 */
export declare function exportYm2612VgmToPlaygroundJavaScript(source: ArrayBuffer | ArrayBufferView | Ym2612VGM, options?: {
    includeHeaderComment?: boolean;
    includeDac?: boolean;
    includePsg?: boolean;
    dacBase64?: boolean;
    scheduled?: boolean;
    high?: boolean;
    noteish?: boolean;
    cleanNoteOnset?: boolean;
    compact?: boolean;
    totalLoopSamples?: number | null;
}): string;
/**
 * Export only the YM2608 FM register set as YM2612-compatible Playground
 * writes. SSG, Rhythm, and ADPCM-B registers are intentionally omitted.
 *
 * @param {ArrayBuffer | ArrayBufferView | Ym2612VGM} source
 * @param {{
 *   includeHeaderComment?: boolean,
 *   scheduled?: boolean,
 *   totalLoopSamples?: number | null,
 * }} [options]
 * @returns {string}
 */
export declare function exportYm2608FmVgmToPlaygroundJavaScript(source: ArrayBuffer | ArrayBufferView | Ym2612VGM, options?: {
    includeHeaderComment?: boolean;
    scheduled?: boolean;
    totalLoopSamples?: number | null;
}): string;
/**
 * Export only the YM2203 FM register set as YM2612-compatible Playground
 * writes. The YM2203 SSG section is intentionally omitted.
 *
 * @param {ArrayBuffer | ArrayBufferView | Ym2612VGM} source
 * @param {{
 *   includeHeaderComment?: boolean,
 *   scheduled?: boolean,
 *   totalLoopSamples?: number | null,
 * }} [options]
 * @returns {string}
 */
export declare function exportYm2203FmVgmToPlaygroundJavaScript(source: ArrayBuffer | ArrayBufferView | Ym2612VGM, options?: {
    includeHeaderComment?: boolean;
    scheduled?: boolean;
    totalLoopSamples?: number | null;
}): string;
/**
 * Export YM2203 FM writes for a native YM2203 target without changing FNUM.
 */
export declare function exportYm2203VgmToPlaygroundJavaScript(source: any, options?: {}): string;
/**
 * Export YM2608 FM writes for a native YM2608 target without changing FNUM.
 */
export declare function exportYm2608VgmToPlaygroundJavaScript(source: any, options?: {}): string;
/** Export YM2610B FM writes while omitting SSG and ADPCM registers. */
export declare function exportYm2610BVgmToPlaygroundJavaScript(source: any, options?: {}): string;
/** Export Neo Geo FM through the YM2612 compatibility target. */
export declare function exportYm2610FmVgmToPlaygroundJavaScript(source: any, options?: {}): string;
/**
 * @param {0|1} port
 * @param {number} register
 * @param {number} value
 * @returns {{ scope: "global" } | { scope: "channel", channel: number }}
 */
export declare function getYm2612WriteTarget(port: 0 | 1, register: number, value: number): {
    scope: "global";
} | {
    scope: "channel";
    channel: number;
};
/**
 * @param {0|1} port
 * @param {number} register
 * @param {number} value
 * @returns {string | null}
 */
export declare function describeYm2612Write(port: 0 | 1, register: number, value: number): string | null;
/**
 * @param {Uint8Array} bytes
 * @param {DataView} view
 * @param {number} position
 * @returns {number}
 */
export declare function rawCommandLength(bytes: Uint8Array, view: DataView, position: number): number;
