/** Loop-owned asynchronous failures. No clock or sound-chip knowledge. */
export declare function createLoopAsyncTasks({ getLoop, cancelWaits, isActive }: {
    cancelWaits: any;
    getLoop: any;
    isActive?: ((loop: any) => boolean) | undefined;
}): {
    track(promise: any): void;
    finish(loop: any): Promise<void>;
    releaseName(name: any): void;
    release(loop: any): void;
    clear(): void;
};
