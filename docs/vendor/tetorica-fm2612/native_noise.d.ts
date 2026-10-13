/** @param {(message:Record<string,unknown>)=>void} send Ordered transport sender.
 * @returns Native noise voice creation and stop/dispose controls; the controller owns at most 32 voices. */
export declare function createNativeNoiseController(send: (message: Record<string, unknown>) => void): {
    create(options?: {}): {
        type: any;
        gain: any;
        pan: any;
        attack: any;
        release: any;
        filter: {
            cutoff: any;
            q: any;
            set(mode: any, frequency: any, q?: any): void;
        };
        start: () => void;
        stop: () => void;
        dispose(): void;
    };
    stopAll(): void;
    disposeAll(): void;
};
/**
 * Set or ramp a native noise voice's gain, pan and filter controls.
 * @param {ReturnType<ReturnType<typeof createNativeNoiseController>['create']>} voice Existing noise voice.
 * @param {{gain?: number, pan?: number, cutoff?: number, q?: number, slide?: number}} [options={}] Target values; slide is ramp duration in seconds.
 * @returns {void}
 */
export declare function controlNativeNoise(voice: ReturnType<ReturnType<typeof createNativeNoiseController>['create']>, options?: {
    gain?: number;
    pan?: number;
    cutoff?: number;
    q?: number;
    slide?: number;
}): void;
