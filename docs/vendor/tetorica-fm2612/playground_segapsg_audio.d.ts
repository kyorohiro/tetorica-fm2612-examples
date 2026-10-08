export declare function createSegaPsgAudio(context: any, destination: any): Promise<{
    node: AudioWorkletNode;
    port: MessagePort;
    dispose(): void;
}>;
