/** Immediate ordered commands, shared by main-thread and Worker runtimes. */
/** @param {MessagePort} port */
export declare function createSegaPsgClient(port: MessagePort): {
    dispose(): void;
} & {
    readonly clock: number;
    setClock(hz: number): Promise<void>;
};
