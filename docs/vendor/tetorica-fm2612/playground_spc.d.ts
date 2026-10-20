export declare function createSpcClient(port: any, initial?: {}, { getOwner, captureContext, restoreContext, invokeEvent, }?: {
    captureContext?: (() => null) | undefined;
    getOwner?: (() => null) | undefined;
    invokeEvent?: ((fn: any, event: any) => any) | undefined;
    restoreContext?: (() => void) | undefined;
}): {
    sampleRate: any;
    nativeSampleRate: number;
    loadSPC(input: any): Promise<any>;
    play(): Promise<any>;
    pause(): Promise<any>;
    stop(): Promise<any>;
    /** Observe semantic DSP events on the caller's Main/logic Worker thread.
     * Overload always emits an overflow diagnostic even when types are filtered.
     * @param {(event:any)=>void} callback
     * @param {{voices?:number[],types?:string[],intervalMs?:number}} [options]
     * @returns {()=>void} */
    onEvent(callback: (event: any) => void, { voices, types, intervalMs }?: {
        voices?: number[];
        types?: string[];
        intervalMs?: number;
    }): () => void;
    getState(): Promise<any>;
    snapshot(): Promise<any>;
    setMuteMask(mask: any): Promise<any>;
    seek(seconds: any): Promise<any>;
    dispose(): void;
};
