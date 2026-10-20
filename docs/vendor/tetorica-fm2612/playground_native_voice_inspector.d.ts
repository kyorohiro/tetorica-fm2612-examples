export type NativeVoiceCommand = {
    method: string;
    args?: any[];
    channel?: number;
};
export type NativeVoiceInspectorOptions = {
    clock?: number | (() => number);
    sampleRate?: number;
    dispatch?: (command: NativeVoiceCommand, owner?: string, metadata?: {
        preserveOwner?: boolean;
    }) => void;
    beginAudition?: (channel: number, owner: string) => void;
    endAudition?: (channel: number, owner: string) => void;
};
export type GameboyVoiceChannelBase = {
    channel: number;
    active: boolean;
    frequency: number;
    pan: {
        left: boolean;
        right: boolean;
    };
    lengthEnabled: boolean;
    lengthCount: number;
    length: number;
};
export type GameboyVoiceEnvelope = {
    direction: 'up' | 'down';
    period: number;
};
export type GameboyVoiceSweep = {
    direction: 'up' | 'down';
    period: number;
    shift: number;
};
export type GameboyPulseVoiceSnapshot = GameboyVoiceChannelBase & {
    channel: 0 | 1;
    type: 'pulse';
    period: number;
    duty: 0.125 | 0.25 | 0.5 | 0.75;
    volume: number;
    envelope: GameboyVoiceEnvelope;
    sweep?: GameboyVoiceSweep;
};
export type GameboyWaveVoiceSnapshot = GameboyVoiceChannelBase & {
    channel: 2;
    type: 'wave';
    period: number;
    level: 0 | 0.25 | 0.5 | 1;
    waveform: number[];
};
export type GameboyNoiseVoiceSnapshot = GameboyVoiceChannelBase & {
    channel: 3;
    type: 'noise';
    volume: number;
    envelope: GameboyVoiceEnvelope;
    divisor: number;
    shift: number;
    width: 7 | 15;
};
export type GameboyVoiceChannelSnapshot = GameboyPulseVoiceSnapshot | GameboyWaveVoiceSnapshot | GameboyNoiseVoiceSnapshot;
export type GameboyVoiceSnapshot = {
    kind: 'gameboy';
    clock: number;
    sampleRate: number;
    powered: boolean;
    activeSource: 'applied-register-gates';
    masterVolume: {
        left: number;
        right: number;
    };
    channels: GameboyVoiceChannelSnapshot[];
    registers: number[];
};
/**
 * @typedef {{method: string, args?: any[], channel?: number}} NativeVoiceCommand
 * @typedef {object} NativeVoiceInspectorOptions
 * @property {number | (() => number)} [clock]
 * @property {number} [sampleRate]
 * @property {(command: NativeVoiceCommand, owner?: string, metadata?: {preserveOwner?: boolean}) => void} [dispatch]
 * @property {(channel: number, owner: string) => void} [beginAudition]
 * @property {(channel: number, owner: string) => void} [endAudition]
 */
/**
 * @typedef {{channel:number,active:boolean,frequency:number,pan:{left:boolean,right:boolean},
 * lengthEnabled:boolean,lengthCount:number,length:number}} GameboyVoiceChannelBase
 * @typedef {{direction:'up'|'down',period:number}} GameboyVoiceEnvelope
 * @typedef {{direction:'up'|'down',period:number,shift:number}} GameboyVoiceSweep
 * @typedef {GameboyVoiceChannelBase & {channel:0|1,type:'pulse',period:number,
 * duty:0.125|0.25|0.5|0.75,volume:number,envelope:GameboyVoiceEnvelope,
 * sweep?:GameboyVoiceSweep}} GameboyPulseVoiceSnapshot
 * @typedef {GameboyVoiceChannelBase & {channel:2,type:'wave',period:number,
 * level:0|0.25|0.5|1,waveform:number[]}} GameboyWaveVoiceSnapshot
 * @typedef {GameboyVoiceChannelBase & {channel:3,type:'noise',volume:number,
 * envelope:GameboyVoiceEnvelope,divisor:number,shift:number,width:7|15}} GameboyNoiseVoiceSnapshot
 * @typedef {GameboyPulseVoiceSnapshot|GameboyWaveVoiceSnapshot|GameboyNoiseVoiceSnapshot} GameboyVoiceChannelSnapshot
 * @typedef {{kind:'gameboy',clock:number,sampleRate:number,powered:boolean,
 * activeSource:'applied-register-gates',masterVolume:{left:number,right:number},
 * channels:GameboyVoiceChannelSnapshot[],registers:number[]}} GameboyVoiceSnapshot
 */
/** Mirrors only applied writes. read() never renders audio, triggers a note, or sends a message. */
declare class VoiceInspector {
    chip: any;
    clock: () => any;
    sampleRate: number;
    dispatch: (command: NativeVoiceCommand, owner?: string, metadata?: {
        preserveOwner?: boolean;
    }) => void;
    beginAudition: (channel: number, owner: string) => void;
    endAudition: (channel: number, owner: string) => void;
    auditions: Map<any, any>;
    /** @param {any} chip @param {NativeVoiceInspectorOptions} [options] */
    constructor(chip: any, { clock, sampleRate, dispatch, beginAudition, endAudition }?: NativeVoiceInspectorOptions);
    audition(method: any, args: any): boolean;
    stage(callback: any, owner: any): any;
    commit({ commands, state }: {
        commands: any;
        state: any;
    }, owner: any): void;
    resetAuditions(): void;
}
export declare class GameboyVoiceInspector extends VoiceInspector {
    kind: string;
    registers: Uint8Array<ArrayBuffer> | undefined;
    voice: Uint8Array<ArrayBuffer> | undefined;
    gates: boolean[] | undefined;
    /** @param {any} chip @param {NativeVoiceInspectorOptions} [options] */
    constructor(chip: any, options?: NativeVoiceInspectorOptions);
    reset(): void;
    observeWrite(offset: any, value: any): void;
    prepare(callback: any): {
        commands: any[];
        state: {
            clock: number;
            initialized: boolean;
            registers: number[];
            voice: number[];
        };
        value: any;
    };
    adoptConfigured(state: any): void;
    keyOn(synth: any, channel: any, midi: any): void;
    keyOff(synth: any, channel: any): void;
    invoke(method: any, args?: any[]): any;
    /** @returns {GameboyVoiceSnapshot} */
    read(): GameboyVoiceSnapshot;
}
export declare class NesVoiceInspector extends VoiceInspector {
    kind: string;
    fdsEnabled: boolean;
    registers: Uint8Array<ArrayBuffer> | undefined;
    enabled: number | undefined;
    fdsGain: any;
    fdsMaster: any;
    modTable: Uint8Array<ArrayBuffer> | undefined;
    modCursor: number | undefined;
    memoryRanges: any[] | undefined;
    /** @param {any} chip @param {NativeVoiceInspectorOptions} [options] */
    constructor(chip: any, options?: NativeVoiceInspectorOptions);
    reset(): void;
    observeWrite(address: any, value: any): void;
    sample(): {
        address: number;
        length: number;
    } | null;
    prepare(callback: any): {
        commands: any[];
        state: {
            clock: number;
            registers: number[];
            enabled: number;
            fdsActive: boolean;
            fdsGain: number;
            fdsMaster: number;
            sample: {
                address: number;
                length: number;
            } | null;
        };
        value: any;
    };
    adoptConfigured(state: any): void;
    stopVoices(): void;
    keyOn(synth: any, channel: any, midi: any): void;
    keyOff(synth: any, channel: any): void;
    invoke(method: any, args?: any[]): any;
    lengthPatch(s: any, channel: any, p: any): void;
    frequency(s: any, channel: any, hz: any): any;
    read(): {
        kind: string;
        clock: any;
        sampleRate: number;
        fdsEnabled: boolean;
        activeSource: string;
        registers: number[];
        channels: ({
            channel: number;
            type: string;
            enabled: boolean;
            active: boolean;
            control: number;
            lengthIndex: number;
            lengthHalt: boolean;
            period: number;
        } | {
            channel: number;
            type: string;
            rate: number;
            loop: boolean;
            level: number;
            address: number;
            length: number;
            loaded: boolean;
            active: boolean;
            enabled: boolean;
        } | {
            channel: number;
            type: string;
            active: boolean;
            enabled: boolean;
            wave: number[];
            gain: any;
            master: any;
            period: number;
            frequency: number;
            modulation: {
                table: number[];
                rate: number;
                depth: number;
                bias: number;
                enabled: boolean;
            };
        })[];
        dmc: {
            channel: number;
            type: string;
            rate: number;
            loop: boolean;
            level: number;
            address: number;
            length: number;
            loaded: boolean;
            active: boolean;
            enabled: boolean;
        };
        fds: {
            channel: number;
            type: string;
            active: boolean;
            enabled: boolean;
            wave: number[];
            gain: any;
            master: any;
            period: number;
            frequency: number;
            modulation: {
                table: number[];
                rate: number;
                depth: number;
                bias: number;
                enabled: boolean;
            };
        } | null;
    };
}
export {};
