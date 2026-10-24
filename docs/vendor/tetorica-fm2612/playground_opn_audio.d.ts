/** @param {AudioContext} context
 * @param {AudioNode} destination
 * @param {'ym2612'|'ym2203'|'ym2610'|'ym2610b'} name */
export declare function createOpnAudio(context: AudioContext, destination: AudioNode, name: 'ym2612' | 'ym2203' | 'ym2610' | 'ym2610b', options?: {}): Promise<{
    node: AudioWorkletNode;
    port: MessagePort;
    dispose(): void;
}>;
