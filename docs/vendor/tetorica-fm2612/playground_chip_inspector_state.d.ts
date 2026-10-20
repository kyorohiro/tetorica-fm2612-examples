export declare class PsgInspectorState {
    clock: () => number;
    sampleRate: number;
    dispatch: (command: import("./playground_native_voice_inspector.js").NativeVoiceCommand, owner?: string, metadata?: {
        preserveOwner?: boolean;
    }) => void;
    beginAudition: (channel: number, owner: string) => void;
    endAudition: (channel: number, owner: string) => void;
    auditions: Map<any, any>;
    periods: number[] | undefined;
    attenuations: number[] | undefined;
    lastVolumes: number[] | undefined;
    latched: number | undefined;
    mode: number | undefined;
    /** @param {any} chip @param {import('./playground_native_voice_inspector.js').NativeVoiceInspectorOptions} [options] */
    constructor(chip: any, { clock, sampleRate, dispatch, beginAudition, endAudition }?: import('./playground_native_voice_inspector.js').NativeVoiceInspectorOptions);
    resetAuditions(): void;
    reset(): void;
    prepare(callback: any): {
        commands: any[];
        value: any;
    };
    commit({ commands, value }: {
        commands: any;
        value: any;
    }, owner: any): any;
    write(value: any): void;
    read(): {
        kind: string;
        clock: number;
        sampleRate: number;
        channels: {
            channel: any;
            attenuation: number;
            volume: number;
            active: boolean;
            period: number;
            frequency: number | null;
            constantOutput: boolean;
        }[];
        noise: {
            channel: any;
            attenuation: number;
            volume: number;
            active: boolean;
            type: string;
            rate: string;
        };
        auditions: {
            channel: any;
            id: any;
        }[];
    };
    invoke(method: any, args?: any[]): any;
}
/** A compact waveform is derived from encoded RAM data, so it also matches mono downmix/clamping. */
/** @param {Uint8Array} bytes @param {{name?:string,frames?:number,step?:number,endGuardBytes?:number}} [options] */
export declare function rfSampleMetadata(bytes: Uint8Array, { name, frames, step, endGuardBytes }?: {
    name?: string;
    frames?: number;
    step?: number;
    endGuardBytes?: number;
}): {
    name: string;
    frames: number | undefined;
    step: number | undefined;
    waveform: number[];
    endGuardBytes?: number | undefined;
};
export declare class RfInspectorState {
    clock: () => number;
    sampleRate: number;
    samples: any[];
    memoryRanges: any[];
    memoryRevision: number;
    dispatch: (command: import("./playground_native_voice_inspector.js").NativeVoiceCommand, owner?: string, metadata?: {
        preserveOwner?: boolean;
    }) => void;
    beginAudition: (channel: number, owner: string) => void;
    endAudition: (channel: number, owner: string) => void;
    auditions: Map<any, any>;
    auditionWriting: number;
    selected: number | undefined;
    enabled: boolean | undefined;
    mask: any;
    configuredSteps: any[] | undefined;
    channels: {
        channel: number;
        start: number;
        loopStart: number;
        step: number;
        volume: number;
        pan: {
            left: number;
            right: number;
        };
    }[] | undefined;
    /** @param {any} chip @param {import('./playground_native_voice_inspector.js').NativeVoiceInspectorOptions} [options] */
    constructor(chip: any, { clock, sampleRate, dispatch, beginAudition, endAudition }?: import('./playground_native_voice_inspector.js').NativeVoiceInspectorOptions);
    resetAuditions(): void;
    reset(): void;
    write(register: any, value: any): void;
    memoryWrite(address: any, length: any): void;
    addSample(address: any, bytes: any, metadata: any): {
        name: string;
        frames: number | undefined;
        step: number | undefined;
        waveform: number[];
        endGuardBytes?: number | undefined;
        address: any;
        end: any;
        loopStart: any;
        valid: boolean;
    };
    allocate(length: any, requested: any): any;
    invoke(method: any, args?: any[]): boolean;
    read(): {
        kind: string;
        clock: number;
        sampleRate: number;
        enabled: boolean | undefined;
        memoryRevision: number;
        channels: {
            channel: number;
            start: number;
            loopStart: number;
            step: number;
            volume: number;
            pan: {
                left: number;
                right: number;
            };
            active: boolean | undefined;
        }[];
        samples: any[];
        memoryRanges: any[];
        auditions: {
            channel: any;
            id: any;
        }[];
    };
}
/** Separate admin messages from performance/client RPC: reads never consume or reschedule data. */
export declare function receiveChipInspector(data: any, port: any, handler: any): boolean;
export declare function readPwmInspector(pwm: any): any;
