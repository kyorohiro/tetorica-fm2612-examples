/** @param {AudioContext} context
 * @param {AudioNode|null} destination
 * @param {{clock?:number,wasmUrl?:string|URL,workletUrl?:string|URL,signal?:AbortSignal,fetch?:typeof fetch}} [options]
 */
export declare function createOki6258Audio(context: AudioContext, destination: AudioNode | null, { clock, wasmUrl, workletUrl, signal, fetch: fetchBytes }?: {
    clock?: number;
    wasmUrl?: string | URL;
    workletUrl?: string | URL;
    signal?: AbortSignal;
    fetch?: typeof fetch;
}): Promise<{
    node: AudioWorkletNode;
    port: MessagePort;
    clock: number;
    dispose: () => void;
}>;
