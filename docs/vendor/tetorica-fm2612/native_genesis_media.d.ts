/** Shared one-off decoder for native sample banks and RF5C164 RAM uploads.
 * @param {any} source
 * @param {{fetcher?:typeof globalThis.fetch, decodeAudio?:(bytes:ArrayBuffer)=>Promise<any>}} [options]
 */
export declare function decodeNativeGenesisPCM(source: any, { fetcher, decodeAudio }?: {
    fetcher?: typeof globalThis.fetch;
    decodeAudio?: (bytes: ArrayBuffer) => Promise<any>;
}): Promise<{
    sampleRate: any;
    channels: Float32Array<any>[];
}>;
/** The synth owns ordering, session invalidation, and failure reporting.
 * @param {any} synth
 * @param {{fetch?:typeof globalThis.fetch, decodeAudio?:(bytes:ArrayBuffer)=>Promise<any>}} [options]
 */
export declare function createNativeGenesisMedia(synth: any, { fetch: fetcher, decodeAudio }?: {
    fetch?: typeof globalThis.fetch;
    decodeAudio?: (bytes: ArrayBuffer) => Promise<any>;
}): {
    sample: {
        load(name: any, source: any): Promise<any>;
        play(name: any, options?: {}): Promise<{
            name: any;
            stop: () => void;
        }>;
        stop(name: any): void;
        stopAll(): void;
        unload: (name: any) => any;
        isLoaded: (name: any) => boolean;
        get: (name: any) => any;
        list: () => any[];
    };
    dacCommand: (command: any, timing?: {}) => Promise<void>;
    dispatchSample(message: any, timing?: {}): Promise<{
        op: string;
        id: any;
        value: number | undefined;
        error?: undefined;
    } | {
        value?: undefined;
        op: string;
        id: any;
        error: string;
    }>;
    loadDacBank(name: any, bytes: any): Promise<any>;
    playDacBank(name: any, time: any, timing?: {}): Promise<void>;
    startRecording({ seconds }?: {
        seconds?: number | undefined;
    }): Promise<void>;
    stopRecording(): Promise<any>;
    stopped(): void;
    reset(): void;
};
