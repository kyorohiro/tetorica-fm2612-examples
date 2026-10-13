export { sampleBytes, encodeRf5c164 } from './rf5c164_pcm.js';
/** Port RPC shared by main and Worker; commands never require main-thread synthesis. */
/** @param {MessagePort} port Ordered Worklet command/acknowledgement port.
 * @param {(source: unknown) => Promise<import('./wav.js').ChannelPCM>} decode PCM decoder for loadSample.
 * @returns RF5C164 register, memory, voice and disposal controls. */
export declare function createRf5c164Client(port: MessagePort, decode: (source: unknown) => Promise<import('./wav.js').ChannelPCM>): {
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
} & {
    readonly clock: number;
    setClock(hz: number): Promise<void>;
};
/** Compatibility facade. New offline code can construct Synth + DirectTransport. */
/** @param {import('./rf5c164.js').Rf5c164} chip Native chip owned by the facade.
 * @returns Bound Synth controls; dispose releases the supplied chip. */
export declare function createRf5c164Control(chip: import('./rf5c164.js').Rf5c164): {
    dispose: () => void;
};
