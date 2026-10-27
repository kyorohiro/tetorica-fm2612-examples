/** Browser setup; subsequent writes travel directly from Worker to Worklet.
 * @param {AudioContext} context @param {AudioNode|null} destination
 * @param {{clock?:number,type?:0|16,flags?:number,signal?:AbortSignal,wasmUrl?:string|URL,workletUrl?:string|URL,fetch?:typeof fetch,onError?:()=>void}} [options] */
export declare function createAy8910Audio(context: AudioContext, destination: AudioNode | null, options?: {
    clock?: number;
    type?: 0 | 16;
    flags?: number;
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
    type: 0 | 16;
    flags: number;
    dispose: () => void;
}>;
