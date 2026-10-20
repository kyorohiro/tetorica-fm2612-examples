/** Browser setup; subsequent writes travel directly from Worker to Worklet.
 * @param {AudioContext} context @param {AudioNode|null} destination
 * @param {{chip?:'ym3526'|'ym3812'|'y8950'|'ymf262',clock?:number,signal?:AbortSignal,wasmUrl?:string|URL,workletUrl?:string|URL,fetch?:typeof fetch,onError?:()=>void}} [options] */
export declare function createOplAudio(context: AudioContext, destination: AudioNode | null, options?: {
    chip?: 'ym3526' | 'ym3812' | 'y8950' | 'ymf262';
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
    chip: "y8950" | "ym3526" | "ym3812" | "ymf262";
    dispose: () => void;
}>;
