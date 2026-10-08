/** AudioWorklet: bank allocation and voice routing for the native PCM mixer. */
export declare function createSampleProcessor(api: any, rate: any): {
    clear: () => void;
    reset: () => void;
    command(d: any): number | undefined;
};
