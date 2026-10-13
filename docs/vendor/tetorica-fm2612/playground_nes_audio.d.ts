/** @param {AudioContext} context
 * @param {AudioNode} destination
 * @param {{fds?:boolean,clock?:number}} [options] */
export declare function createNesAudio(context: AudioContext, destination: AudioNode, { fds, clock }?: {
    fds?: boolean;
    clock?: number;
}): Promise<{
    node: AudioWorkletNode;
    port: MessagePort;
    clock: number;
    fdsEnabled: boolean;
    dispose(): void;
}>;
