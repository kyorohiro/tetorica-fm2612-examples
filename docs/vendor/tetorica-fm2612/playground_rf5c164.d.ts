export { sampleBytes, encodeRf5c164 } from './rf5c164_pcm.js';
/** Port RPC shared by main and Worker; commands never require main-thread synthesis. */
/** @param {MessagePort} port Ordered Worklet command/acknowledgement port.
 * @param {(source: unknown) => Promise<import('./wav.js').ChannelPCM>} decode PCM decoder for loadSample.
 * @returns RF5C164 register, memory, voice and disposal controls. */
export declare function createRf5c164Client(port: MessagePort, decode: (source: unknown) => Promise<import('./wav.js').ChannelPCM>, options?: {}): {
    loadMemory(bytes: any, address?: number): any;
    /** endGuardBytes requests consecutive end markers for large pitch steps; 0 retains the legacy trailer.
     * @param {unknown} source @param {{address?: number, loopStart?: number, endGuardBytes?: number}} [options] */
    loadSample(source: unknown, { address, loopStart, endGuardBytes }?: {
        address?: number;
        loopStart?: number;
        endGuardBytes?: number;
    }): Promise<{
        start: number;
        loopStart: any;
        step: number;
    }>;
    setChannel: (ch: any, options: any) => any;
    setPitch: (ch: any, step: any) => any;
    keyOn: (ch: any) => any;
    keyOff: (ch: any) => any;
    writeRegister: (r: any, v: any) => any;
    reset: () => any;
    dispose(): void;
} & {
    readonly clock: number;
    setClock(hz: number): Promise<void>;
    _requestControl(method: string, args?: any[], transfer?: Transferable[]): Promise<any>;
};
/** Compatibility facade. New offline code can construct Synth + DirectTransport. */
/** @param {import('./rf5c164.js').Rf5c164} chip Native chip owned by the facade.
 * @returns Bound Synth controls; dispose releases the supplied chip. */
export declare function createRf5c164Control(chip: import('./rf5c164.js').Rf5c164): {
    dispose: () => void;
};
