export declare function createNativeFXRack(context: any): Promise<{
    node: AudioWorkletNode;
    controller: {
        liveFx(name: string, { process, context, resetState }?: {
            process: (input: Float32Array[], output: Float32Array[], state: Record<string, unknown>, context: Record<string, unknown>) => void;
            context?: Record<string, unknown>;
            resetState?: boolean;
        }): void;
        updateContext(name: any, context: any): void;
        removeLiveFx(name: any): void;
        branch: (...children: any[]) => {
            type: string;
            children: any[];
            owner: /*elided*/ any;
            dispose(): void;
        };
        parallel: (...children: any[]) => {
            type: string;
            children: any[];
            owner: /*elided*/ any;
            dispose(): void;
        };
        setChain(effects?: any[]): any[];
        clear({ dispose }?: {
            dispose?: boolean | undefined;
        }): any[];
        dispose(): void;
        getChain(): any[];
        syncTempo(): void;
    };
    mainActive: boolean;
    sample: {
        accept(d: any): void;
        load(name: any, pcm: any): Promise<{
            name: any;
            length: any;
            sampleRate: any;
            numberOfChannels: any;
            duration: number;
        }>;
        play(name: any, options?: {}): Promise<{
            name: any;
            stop: () => any;
        }>;
        stop(name: any): void;
        stopAll(): void;
        unload(name: any): boolean;
        isLoaded: (name: any) => boolean;
        get: (name: any) => any;
        list: () => any[];
        invalidate(): void;
    };
    noise: {
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
    getBeatSeconds: () => number;
    useMain(): void;
    workerPort(): MessagePort;
    stop(): void;
    dispose(): void;
}>;
