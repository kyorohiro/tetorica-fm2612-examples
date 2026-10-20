/** Browser setup; subsequent writes travel directly from Worker to Worklet.
 * @param {AudioContext} context @param {AudioNode|null} destination
 * @param {{clock?:number,signal?:AbortSignal,wasmUrl?:string|URL,workletUrl?:string|URL,fetch?:typeof fetch,onError?:()=>void}} [options] */
export declare function createYm2413Audio(context: AudioContext, destination: AudioNode | null, options?: {
    clock?: number;
    signal?: AbortSignal;
    wasmUrl?: string | URL;
    workletUrl?: string | URL;
    fetch?: typeof fetch;
    onError?: () => void;
}): Promise<{
    node: AudioWorkletNode;
    port: MessagePort;
    clock: number;
    chip: string;
    dispose: () => void;
}>;
