export type DacPcm = Uint8Array | ArrayBuffer | number[];
export type DacSampleOptions = {
    sampleRate: number;
};
export type DacPlayOptions = {
    when?: number;
    offset?: number;
    size?: number;
    pan?: 'both' | 'left' | 'right';
};
/**
 * @typedef {Uint8Array | ArrayBuffer | number[]} DacPcm
 * @typedef {{sampleRate: number}} DacSampleOptions
 * @typedef {{when?: number, offset?: number, size?: number, pan?: 'both' | 'left' | 'right'}} DacPlayOptions
 */
/** Unsigned 8-bit mono PCM. 128 is silence; this is not WAV or packed VGM data. */
/** @param {DacPcm} data */
export declare function copyDacPcm(data: DacPcm): Uint8Array<ArrayBuffer>;
/**
 * Shared Synth API. Promises acknowledge preparation/scheduling, not playback completion.
 * when is absolute seconds on the transport clock; omit it to start at the next rendered frame.
 */
export declare class YM2612Dac {
    transport: any;
    enabled: boolean;
    value: number;
    constructor(transport: any);
    _send(command: any): Promise<any>;
    /**
     * Register a private copy; resolves when the playback backend has stored it.
     * @param {string} sampleName
     * @param {DacPcm} data
     * @param {DacSampleOptions} options
     * @returns {Promise<void>}
     */
    setSample(sampleName: string, data: DacPcm, { sampleRate }: DacSampleOptions): Promise<void>;
    /**
     * offset/size count PCM bytes. One DAC voice: a new start replaces the playing sample.
     * @param {string} sampleName
     * @param {DacPlayOptions} [options]
     * @returns {Promise<void>}
     */
    playFromSample(sampleName: string, options?: DacPlayOptions): Promise<void>;
    /**
     * Convenience playback without registering a reusable name.
     * @param {DacPcm} data
     * @param {DacSampleOptions & DacPlayOptions} options
     * @returns {Promise<void>}
     */
    play(data: DacPcm, { sampleRate, ...options }: DacSampleOptions & DacPlayOptions): Promise<void>;
    /** Cancel pending starts, silence DAC and release CH6 for FM. Registered samples remain. */
    stop(): Promise<any>;
    /** Release a registered sample. Already accepted playback retains its data until it ends. */
    removeSample(sampleName: any): Promise<any>;
}
/** Sample-clock scheduler shared by Node rendering and both YM2612 AudioWorklets. */
export declare class YM2612DacPlayer {
    sampleRate: any;
    write: any;
    samples: Map<any, any>;
    queue: any[];
    active: any;
    panRegister: number;
    constructor(sampleRate: any, write: any);
    observeWrite(port: any, register: any, value: any): void;
    command(command: any, frame: any): void;
    nextFrame(): number;
    advance(frame: any): void;
    stop(): void;
    reset(): void;
}
/** Receiver acknowledges only after the PCM is installed in the audio backend. */
/** @param {YM2612DacPlayer} player Native DAC bank/voice manager.
 * @param {{type: string, id?: number, command?: object}} command Worklet input message.
 * @param {number} frame Current rendered sample frame.
 * @param {(message: {type: string, id?: number, error?: string}) => void} reply Acknowledgement sender.
 * @returns {boolean} Whether the message was a handled PCM DAC request. */
export declare function receiveDacCommand(player: YM2612DacPlayer, command: {
    type: string;
    id?: number;
    command?: object;
}, frame: number, reply: (message: {
    type: string;
    id?: number;
    error?: string;
}) => void): boolean;
