/** @param {AudioContext} context
 * @param {AudioNode} destination */
export declare function createYm2151Audio(context: AudioContext, destination: AudioNode): Promise<{
    node: AudioWorkletNode;
    port: MessagePort;
    dispose(): void;
}>;
