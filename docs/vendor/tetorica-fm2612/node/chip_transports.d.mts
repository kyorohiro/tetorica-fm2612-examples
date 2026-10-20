import { AY8910DirectTransport } from '../ay8910synth.js';
import { PWM32XDirectTransport } from '../pwm32x_transport.js';
import { YM2612DirectTransport } from '../ym2612synth.js';
import { YM2608DirectTransport } from '../ym2608synth.js';
import { GameboyDirectTransport } from '../gameboysynth.js';
import { SegaPSGDirectTransport } from '../segapsgsynth.js';
import { YM2151DirectTransport } from '../ym2151synth.js';
import { NesApuDirectTransport } from '../nesapusynth.js';
import { YM2413DirectTransport } from '../ym2413synth.js';
import { OPLDirectTransport } from '../opl_synth.js';
import { YM3526DirectTransport } from '../ym3526synth.js';
import { YM3812DirectTransport } from '../ym3812synth.js';
import { Y8950DirectTransport } from '../y8950synth.js';
import { YMF262DirectTransport } from '../ymf262synth.js';
export type AudifyTransportOptions = import('./megasynth.mjs').OutputConnectionOptions & {
    sampleRate?: number;
    gain?: number;
    queueBlocks?: number;
    clock?: number;
    chip?: import('../opl_synth.js').OPLChip;
};
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
export declare const YM2608AudifyTransport: new (chip: import("../ym2608.js").Ym2608, options?: AudifyTransportOptions) => Omit<YM2608DirectTransport, "getState"> & {
    start(): Promise<void>;
    stop(): Promise<void>;
    close(): Promise<void>;
    getState(): {
        running: boolean;
        error: string | null;
        output: Record<string, unknown> | null;
    };
};
export declare const GameboyAudifyTransport: new (chip: import("../gameboyapu.js").GameboyApu, options?: AudifyTransportOptions) => Omit<GameboyDirectTransport, "getState"> & {
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
export declare const YM2151AudifyTransport: new (chip: import("../ym2151.js").Ym2151, options?: AudifyTransportOptions) => Omit<YM2151DirectTransport, "getState"> & {
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
export declare const NesApuAudifyTransport: new (chip: import("../nesapu.js").NesApu, options?: AudifyTransportOptions) => Omit<NesApuDirectTransport, "getState"> & {
    start(): Promise<void>;
    stop(): Promise<void>;
    close(): Promise<void>;
    getState(): {
        running: boolean;
        error: string | null;
        output: Record<string, unknown> | null;
    };
};
export declare const OPLAudifyTransport: new (chip: {
    write(offset: number, value: number): void;
    reset(): void;
    sampleRate?: (clock?: number) => number;
    generateStereo?: (frames: number) => {
        left: Float32Array;
        right: Float32Array;
    };
    readStatus?: () => number;
    getIrq?: () => boolean;
}, options?: AudifyTransportOptions) => Omit<OPLDirectTransport, "getState"> & {
    start(): Promise<void>;
    stop(): Promise<void>;
    close(): Promise<void>;
    getState(): {
        running: boolean;
        error: string | null;
        output: Record<string, unknown> | null;
    };
};
export declare const YM3526AudifyTransport: new (chip: import("../ym3526.js").Ym3526, options?: AudifyTransportOptions) => Omit<YM3526DirectTransport, "getState"> & {
    start(): Promise<void>;
    stop(): Promise<void>;
    close(): Promise<void>;
    getState(): {
        running: boolean;
        error: string | null;
        output: Record<string, unknown> | null;
    };
};
export declare const YM3812AudifyTransport: new (chip: import("../ym3812.js").Ym3812, options?: AudifyTransportOptions) => Omit<YM3812DirectTransport, "getState"> & {
    start(): Promise<void>;
    stop(): Promise<void>;
    close(): Promise<void>;
    getState(): {
        running: boolean;
        error: string | null;
        output: Record<string, unknown> | null;
    };
};
export declare const Y8950AudifyTransport: new (chip: import("../y8950.js").Y8950, options?: AudifyTransportOptions) => Omit<Y8950DirectTransport, "getState"> & {
    start(): Promise<void>;
    stop(): Promise<void>;
    close(): Promise<void>;
    getState(): {
        running: boolean;
        error: string | null;
        output: Record<string, unknown> | null;
    };
};
export declare const YMF262AudifyTransport: new (chip: import("../ymf262.js").Ymf262, options?: AudifyTransportOptions) => Omit<YMF262DirectTransport, "getState"> & {
    start(): Promise<void>;
    stop(): Promise<void>;
    close(): Promise<void>;
    getState(): {
        running: boolean;
        error: string | null;
        output: Record<string, unknown> | null;
    };
};
export declare const YM2413AudifyTransport: new (chip: import("../ym2413.js").Ym2413, options?: AudifyTransportOptions) => Omit<YM2413DirectTransport, "getState"> & {
    start(): Promise<void>;
    stop(): Promise<void>;
    close(): Promise<void>;
    getState(): {
        running: boolean;
        error: string | null;
        output: Record<string, unknown> | null;
    };
};
export declare const AY8910AudifyTransport: new (chip: import("../ay8910.js").Ay8910, options?: AudifyTransportOptions) => Omit<AY8910DirectTransport, "getState"> & {
    start(): Promise<void>;
    stop(): Promise<void>;
    close(): Promise<void>;
    getState(): {
        running: boolean;
        error: string | null;
        output: Record<string, unknown> | null;
    };
};
