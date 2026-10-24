/** Validate a command before admitting it to the synth's ordered queue. The
 * namespace is supplied by the trusted Main/Worker transport, never the voice. */
export declare function nativeGenesisNoiseMessage(message: any, { namespace, sampleRate }: {
    namespace: any;
    sampleRate: any;
}): {
    op: string;
    namespace: any;
    action: any;
    slot: any;
    token: any;
} | {
    op: string;
    namespace: any;
    action: any;
    slot: any;
    token: any;
    type: any;
    seed: any;
} | {
    op: string;
    namespace: any;
    action: any;
    slot: any;
    token: any;
    param: any;
    value: any;
    seconds: any;
} | {
    op: string;
    namespace: any;
    action: any;
    slot: any;
    token: any;
    mode: any;
};
/** @param {{send:(message:any)=>void, getSampleRate?:()=>number}} [options] */
export declare function createNativeGenesisNoise({ send, getSampleRate }?: {
    send: (message: any) => void;
    getSampleRate?: () => number;
}): {
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
    /** Global native Stop already clears the DSP. Retire local identities
     * without sending cleanup that could reach a replacement performance. */
    reset(): void;
};
/** A Main liveLoop may share a prepared voice with a replacement loop. Start
 * transfers its lease; old finally/stopLoop operations cannot mute the new owner. */
export declare function createNativeNoiseOwnership(noise: any, { getContext }?: {
    getContext?: (() => null) | undefined;
}): {
    api: {
        create(options?: {}): {
            type: any;
            gain: {
                get: () => any;
                set(value: any): any;
                rampTo(value: any, seconds: any): any;
            };
            pan: {
                get: () => any;
                set(value: any): any;
                rampTo(value: any, seconds: any): any;
            };
            attack: {
                get: () => any;
                set(value: any): any;
                rampTo(value: any, seconds: any): any;
            };
            release: {
                get: () => any;
                set(value: any): any;
                rampTo(value: any, seconds: any): any;
            };
            filter: {
                cutoff: {
                    get: () => any;
                    set(value: any): any;
                    rampTo(value: any, seconds: any): any;
                };
                q: {
                    get: () => any;
                    set(value: any): any;
                    rampTo(value: any, seconds: any): any;
                };
                set(...args: any[]): any;
            };
            start(): void;
            stop(): void;
            dispose(): void;
        };
        stopAll(): void;
    };
    releaseOwner(value: any): void;
    clear(): void;
};
