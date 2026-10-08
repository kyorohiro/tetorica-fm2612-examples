export declare function createNativeNoiseController(send: any): {
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
export declare function controlNativeNoise(voice: any, options?: {}): void;
