/** Commands travel directly from Main or logic Worker to the PWM AudioWorklet. */
export declare function createPWM32XAudio(context: any, destination: any, options?: {}): Promise<{
    node: AudioWorkletNode;
    port: MessagePort;
    dispose(): void;
}>;
