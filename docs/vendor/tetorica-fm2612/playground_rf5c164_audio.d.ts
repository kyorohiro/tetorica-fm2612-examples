/** @param {AudioContext} context
 * @param {AudioNode} destination
 * @param {{signal?:AbortSignal,wasmUrl?:string|URL,workletUrl?:string|URL,fetch?:typeof globalThis.fetch}} [options] */
export declare function createRf5c164Audio(context: AudioContext, destination: AudioNode, options?: {
    signal?: AbortSignal;
    wasmUrl?: string | URL;
    workletUrl?: string | URL;
    fetch?: typeof globalThis.fetch;
}): Promise<{
    node: AudioWorkletNode;
    port: MessagePort;
    dispose: () => void;
}>;
