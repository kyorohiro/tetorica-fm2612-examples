/**
 * @file Native FX descriptors and controls. Browser main thread or Worker;
 * no DOM or AudioNode dependency. The injected sender owns transport.
 * Slots are private to a controller; activate one controller at a time per rack.
 */
export declare const FX_TYPES: {
    gain: number;
    eq: number;
    gate: number;
    compressor: number;
    reverb: number;
    filter: number;
    delay: number;
    distortion: number;
    bitcrusher: number;
    wobble: number;
    flanger: number;
    slicer: number;
    chorus: number;
};
export declare const FX_PARAMS: {
    gain: {
        gain: number[];
    };
    eq: {
        bass: number[];
        mid: number[];
        treble: number[];
    };
    gate: {
        threshold: number[];
        hysteresis: number[];
        attack: number[];
        hold: number[];
        release: number[];
    };
    compressor: {
        threshold: number[];
        ratio: number[];
        attack: number[];
        release: number[];
        makeup: number[];
    };
    reverb: {
        mix: number[];
        room: number[];
        damping: number[];
        tone: number[];
    };
    filter: {
        cutoff: number[];
        q: number[];
    };
    delay: {
        time: number[];
        feedback: number[];
        mix: number[];
    };
    distortion: {
        drive: number[];
        mix: number[];
    };
    bitcrusher: {
        bitDepth: number[];
        holdFrames: number[];
        mix: number[];
    };
    wobble: {
        cutoff: number[];
        depth: number[];
        rate: number[];
        resonance: number[];
        mix: number[];
    };
    flanger: {
        time: number[];
        depth: number[];
        rate: number[];
        feedback: number[];
        mix: number[];
    };
    slicer: {
        phase: number[];
        duty: number[];
        floor: number[];
        mix: number[];
    };
    chorus: {
        time: number[];
        depth: number[];
        rate: number[];
        mix: number[];
    };
};
export declare function createNativeFXController(send: any, { getBeatSeconds }?: {
    getBeatSeconds?: (() => 0.5) | undefined;
}): {
    /** @param {string} name @param {{process: (input: Float32Array[], output: Float32Array[], state: Record<string, unknown>, context: Record<string, unknown>) => void, context?: Record<string, unknown>, resetState?: boolean}} [options] */
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
