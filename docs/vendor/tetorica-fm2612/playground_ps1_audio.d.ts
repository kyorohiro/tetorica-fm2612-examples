/** @param {AudioContext} context @param {AudioNode|null} destination
 * @param {{signal?:AbortSignal,fetch?:typeof fetch,wasmUrl?:string|URL,workletUrl?:string|URL,onError?:(error:Error)=>void}} [options] */
export declare function createPs1Audio(context: AudioContext, destination: AudioNode | null, options?: {
    signal?: AbortSignal;
    fetch?: typeof fetch;
    wasmUrl?: string | URL;
    workletUrl?: string | URL;
    onError?: (error: Error) => void;
}): Promise<{
    node: AudioWorkletNode;
    port: MessagePort;
    sampleRate: any;
    nativeSampleRate: number;
    state: any;
    dispose: () => void;
}>;
