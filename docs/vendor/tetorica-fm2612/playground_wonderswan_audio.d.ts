/** Create the audio endpoint; performance commands use its dedicated MessagePort. */
export declare function createWonderSwanAudio(context: any, destination: any, options?: {}): Promise<{
    node: AudioWorkletNode;
    port: MessagePort;
    clock: number;
    dispose: () => void;
}>;
