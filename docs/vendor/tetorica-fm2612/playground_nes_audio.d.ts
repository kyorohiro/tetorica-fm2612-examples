/** @param {AudioContext} context
 * @param {AudioNode|null} destination
 * @param {{fds?:boolean,clock?:number,signal?:AbortSignal,workletUrl?:string|URL}} [options] */
export declare function createNesAudio(context: AudioContext, destination: AudioNode | null, { fds, clock, signal, workletUrl }?: {
    fds?: boolean;
    clock?: number;
    signal?: AbortSignal;
    workletUrl?: string | URL;
}): Promise<{
    node: AudioWorkletNode;
    port: MessagePort;
    clock: number;
    fdsEnabled: boolean;
    dispose: () => void;
}>;
