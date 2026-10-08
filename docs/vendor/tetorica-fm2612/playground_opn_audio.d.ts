export declare function createOpnAudio(context: any, destination: any, name: any): Promise<{
    node: AudioWorkletNode;
    port: MessagePort;
    dispose(): void;
}>;
