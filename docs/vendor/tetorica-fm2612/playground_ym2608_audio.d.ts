/** @param {AudioContext} context
 * @param {AudioNode} destination */
export declare function createYm2608Audio(context: AudioContext, destination: AudioNode): Promise<{
    node: AudioWorkletNode;
    port: MessagePort;
    dispose(): void;
}>;
