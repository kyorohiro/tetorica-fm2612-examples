/** Main-thread asset loading; no fetch or URL constructor is needed in Worklet.
 * Every endpoint owns its SID/WASM instance and may only acknowledge its
 * creation clock. Output is the same mono signal on left and right. */
export declare function createSidAudio(context: any, destination: any, options?: {}): Promise<{
    node: AudioWorkletNode;
    port: MessagePort;
    clock: number;
    model: any;
    chip: string;
    dispose: () => void;
}>;
