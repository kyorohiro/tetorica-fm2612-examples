export declare function createFm21290Client(port: any): {
    /** @param {number} address @param {number} value */
    writeRegister(address: number, value: number): void;
    dispose(): void;
};
export declare function createFm21290Audio(context: any, destination: any): Promise<{
    node: AudioWorkletNode;
    port: MessagePort;
    dispose: () => void;
}>;
