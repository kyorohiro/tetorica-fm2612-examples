/** Commands travel directly from Main or logic Worker to the PWM AudioWorklet. */
/** @param {AudioContext} context
 * @param {AudioNode} destination
 * @param {{signal?:AbortSignal,clock?:number,gain?:number,outputMode?:'dac'|'duty'}} [options] */
export declare function createPWM32XAudio(context: AudioContext, destination: AudioNode, options?: {
    signal?: AbortSignal;
    clock?: number;
    gain?: number;
    outputMode?: 'dac' | 'duty';
}): Promise<{
    node: AudioWorkletNode;
    port: MessagePort;
    dispose(): void;
}>;
