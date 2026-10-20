/** @param {AudioContext} context @param {AudioNode|null} destination
 * @param {{signal?:AbortSignal,fetch?:typeof fetch,wasmUrl?:string|URL,workletUrl?:string|URL}} [options] */
export declare function createSnesAudio(context: AudioContext, destination: AudioNode | null, options?: {
    signal?: AbortSignal;
    fetch?: typeof fetch;
    wasmUrl?: string | URL;
    workletUrl?: string | URL;
}): Promise<{
    node: AudioWorkletNode;
    port: MessagePort;
    sampleRate: any;
    nativeSampleRate: number;
    dispose: () => void;
}>;
