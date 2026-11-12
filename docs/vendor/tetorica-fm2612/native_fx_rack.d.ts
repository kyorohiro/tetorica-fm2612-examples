/** @param {AudioContext} context Owner of the native FX AudioWorklet.
 * @returns Native rack node, FX/sample/noise controllers and Main/Worker ownership/lifecycle methods. */
export declare function createNativeFXRack(context: AudioContext): Promise<{
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
        load(name: string, pcm: import('./wav.js').ChannelPCM): Promise<{
            name: string;
            length: number;
            sampleRate: number;
            numberOfChannels: number;
            duration: number;
        }>;
        play(name: string, options?: import('./megasynth.js').MegaSynthSamplePlayOptions): Promise<{
            name: string;
            stop: () => void;
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
