/** @param {AudioContext} context
 * @param {AudioNode} destination */
export declare function createSegaPsgAudio(context: AudioContext, destination: AudioNode): Promise<{
    node: AudioWorkletNode;
    port: MessagePort;
    dispose(): void;
}>;
