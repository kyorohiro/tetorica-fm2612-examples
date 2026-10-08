export { sampleBytes, encodeRf5c164 } from './rf5c164_pcm.js';
/** Port RPC shared by main and Worker; commands never require main-thread synthesis. */
export declare function createRf5c164Client(port: any, decode: any): {
    loadMemory(bytes: any, address?: number): Promise<any>;
    /** @param {unknown} source @param {{address?: number, loopStart?: number}} [options] */
    loadSample(source: unknown, { address, loopStart }?: {
        address?: number;
        loopStart?: number;
    }): Promise<{
        start: number;
        loopStart: any;
        step: number;
    }>;
    setChannel: (ch: any, options: any) => Promise<any>;
    setPitch: (ch: any, step: any) => Promise<any>;
    keyOn: (ch: any) => Promise<any>;
    keyOff: (ch: any) => Promise<any>;
    writeRegister: (r: any, v: any) => Promise<any>;
    reset: () => Promise<any>;
    dispose(): void;
};
/** Compatibility facade. New offline code can construct Synth + DirectTransport. */
export declare function createRf5c164Control(chip: any): {
    dispose: () => any;
};
