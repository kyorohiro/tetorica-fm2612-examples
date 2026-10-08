export declare function createGameboyAudio(context: any, destination: any): Promise<{
    node: AudioWorkletNode;
    port: MessagePort;
    dispose(): void;
}>;
