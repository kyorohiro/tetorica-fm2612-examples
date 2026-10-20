/** Browser setup; subsequent writes travel directly from Worker to Worklet.
 * @param {AudioContext} context @param {AudioNode|null} destination
 * @param {{clock?:number,signal?:AbortSignal,wasmUrl?:string|URL,workletUrl?:string|URL,fetch?:typeof fetch}} [options] */
export declare function createHuc6280Audio(context: AudioContext, destination: AudioNode | null, options?: {
    clock?: number;
    signal?: AbortSignal;
    wasmUrl?: string | URL;
    workletUrl?: string | URL;
    fetch?: typeof fetch;
}): Promise<{
    node: AudioWorkletNode;
    port: MessagePort;
    clock: number;
    dispose: () => void;
}>;
