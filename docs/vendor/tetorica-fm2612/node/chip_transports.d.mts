import { PWM32XDirectTransport } from '../pwm32x_transport.js';
import { YM2612DirectTransport } from '../ym2612synth.js';
import { YM2608DirectTransport } from '../ym2608synth.js';
import { GameboyDirectTransport } from '../gameboysynth.js';
import { SegaPSGDirectTransport } from '../segapsgsynth.js';
export type AudifyTransportOptions = import('./megasynth.mjs').OutputConnectionOptions & {
    sampleRate?: number;
    gain?: number;
    queueBlocks?: number;
};
declare class RegisterDirectTransport {
    chip: Pick<import("../ym2151.js").Ym2151, "reset" | "write">;
    /** @param {Pick<import("../ym2151.js").Ym2151, "write"|"reset">} chip */
    constructor(chip: Pick<import("../ym2151.js").Ym2151, "write" | "reset">);
    reset(): void;
    write(...args: any[]): void;
    writeRegister(register: any, value: any): void;
}
export declare const YM2612AudifyTransport: new (chip: {
    writeRegister(register: number, value: number, port?: number): void;
    sampleRate?: () => number;
    generateStereoView?: (frames: number) => {
        left: Float32Array;
        right: Float32Array;
    };
    generateStereo?: (frames: number) => {
        left: Float32Array;
        right: Float32Array;
    };
    reset?: () => void;
    read?: (offset: number) => number;
    readStatus?: () => number;
    getIrq?: () => boolean;
}, options?: AudifyTransportOptions) => Omit<YM2612DirectTransport, "getState"> & {
    start(): Promise<void>;
    stop(): Promise<void>;
    close(): Promise<void>;
    getState(): {
        running: boolean;
        error: string | null;
        output: Record<string, unknown> | null;
    };
};
export declare const YM2608AudifyTransport: new (chip: any, options?: AudifyTransportOptions) => Omit<YM2608DirectTransport, "getState"> & {
    start(): Promise<void>;
    stop(): Promise<void>;
    close(): Promise<void>;
    getState(): {
        running: boolean;
        error: string | null;
        output: Record<string, unknown> | null;
    };
};
export declare const GameboyAudifyTransport: new (chip: any, options?: AudifyTransportOptions) => Omit<GameboyDirectTransport, "getState"> & {
    start(): Promise<void>;
    stop(): Promise<void>;
    close(): Promise<void>;
    getState(): {
        running: boolean;
        error: string | null;
        output: Record<string, unknown> | null;
    };
};
export declare const SegaPSGAudifyTransport: new (chip: import("../segapsg.js").SegaPSG, options?: AudifyTransportOptions) => Omit<SegaPSGDirectTransport, "getState"> & {
    start(): Promise<void>;
    stop(): Promise<void>;
    close(): Promise<void>;
    getState(): {
        running: boolean;
        error: string | null;
        output: Record<string, unknown> | null;
    };
};
export declare const YM2151AudifyTransport: new (chip: Pick<import("../ym2151.js").Ym2151, "reset" | "write">, options?: AudifyTransportOptions) => Omit<RegisterDirectTransport, "getState"> & {
    start(): Promise<void>;
    stop(): Promise<void>;
    close(): Promise<void>;
    getState(): {
        running: boolean;
        error: string | null;
        output: Record<string, unknown> | null;
    };
};
export declare const PWM32XAudifyTransport: new (chip: import("../pwm32x.js").PWM32X | import("../pwm32x_playback.js").PWM32XPlayback, options?: AudifyTransportOptions) => Omit<PWM32XDirectTransport, "getState"> & {
    start(): Promise<void>;
    stop(): Promise<void>;
    close(): Promise<void>;
    getState(): {
        running: boolean;
        error: string | null;
        output: Record<string, unknown> | null;
    };
};
export {};
