/** Register transports: Synth stays on the caller thread, chip runs in AudioWorklet. */
export declare class ChipWorkletTransport {
    endpoint: MessagePort | import("./soundchip_worklet.js").WorkletSoundChip | null;
    port: any;
    disposed: boolean;
    /** @param {import("./soundchip_worklet.js").WorkletSoundChip | MessagePort} endpoint */
    constructor(endpoint: import("./soundchip_worklet.js").WorkletSoundChip | MessagePort);
    send(method: any, args: any): void;
    reset(): void;
    write(...args: any[]): void;
    writeRegister(...args: any[]): void;
    start(): void | Promise<void>;
    stop(): any;
    flush(): any;
    dispose(): void;
    close(): Promise<void>;
}
export declare class GameboyWorkletTransport extends ChipWorkletTransport {
}
export declare class SegaPSGWorkletTransport extends ChipWorkletTransport {
}
export declare class YM2151WorkletTransport extends ChipWorkletTransport {
}
