/** Snapshot of applied OPM writes, independent of a Main/Worker client's shadow.
 * Reads never write the chip, advance audio or flush the performance queue.
 */
export declare class Ym2151VoiceInspector {
    clock: () => number;
    sampleRate: number;
    dispatch: ((command: import("./playground_native_voice_inspector.js").NativeVoiceCommand, owner?: string, metadata?: {
        preserveOwner?: boolean;
    }) => void) | undefined;
    beginAudition: (channel: number, owner: string) => void;
    endAudition: (channel: number, owner: string) => void;
    auditions: Map<any, any>;
    registers: Uint8Array<ArrayBuffer> | undefined;
    keyMasks: Uint8Array<ArrayBuffer> | undefined;
    amDepth: number | undefined;
    pmDepth: number | undefined;
    /** @param {import('./playground_native_voice_inspector.js').NativeVoiceInspectorOptions} [options] */
    constructor({ clock, sampleRate, dispatch, beginAudition, endAudition }?: import('./playground_native_voice_inspector.js').NativeVoiceInspectorOptions);
    resetAuditions(): void;
    reset(): void;
    observeWrite(register: any, value: any): void;
    observeKeyOff(ch: any): void;
    ownsAudition(ch: any, owner: any): boolean;
    /** Validate a complete edit against a private register copy before dispatching. */
    stage(callback: any, owner: any): any;
    operator(stage: any, ch: any, op: any, patch: any): void;
    pitch(stage: any, ch: any, keyCode: any, keyFraction: any): void;
    frequency(stage: any, ch: any, hz: any): {
        keyCode: number;
        keyFraction: number;
    };
    invoke(method: any, args?: any[]): any;
    read(): {
        kind: string;
        clock: number;
        sampleRate: number;
        activeSource: string;
        registers: number[];
        channels: {
            channel: number;
            type: string;
            active: boolean;
            keyMask: number;
            keyCode: number;
            keyFraction: number;
            midi: number;
            frequency: number;
            algorithm: number;
            feedback: number;
            pan: {
                left: boolean;
                right: boolean;
            };
            ams: number;
            pms: number;
            operators: {
                [k: string]: number | boolean;
            }[];
        }[];
        lfo: {
            frequency: number;
            amDepth: number | undefined;
            pmDepth: number | undefined;
            waveform: number;
        };
        noise: {
            enabled: boolean;
            frequency: number;
        };
    };
}
