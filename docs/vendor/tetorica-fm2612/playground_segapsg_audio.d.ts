/** Browser setup; subsequent writes travel directly from Worker to Worklet.
 * @param {AudioContext} context @param {AudioNode|null} destination
 * @param {{clock?:number,stereoEnabled?:boolean,signal?:AbortSignal,wasmUrl?:string|URL,workletUrl?:string|URL,fetch?:typeof fetch}} [options] */
export declare function createSegaPsgAudio(context: AudioContext, destination: AudioNode | null, options?: {
    clock?: number;
    stereoEnabled?: boolean;
    signal?: AbortSignal;
    wasmUrl?: string | URL;
    workletUrl?: string | URL;
    fetch?: typeof fetch;
}): Promise<{
    node: AudioWorkletNode;
    port: MessagePort;
    clock: number;
    stereoEnabled: boolean;
    dispose: () => void;
}>;
