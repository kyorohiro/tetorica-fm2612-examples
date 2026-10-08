import { PWM32XPlayback } from './pwm32x_playback.js';
import { YM2612Synth } from './ym2612synth.js';
import { NativeFXEngine } from './native_fx_engine.js';
export type MegaSynthOfflineOptions = {
    sampleRate?: number;
    masterVolume?: number;
    chipOptions?: import('./soundchip.js').SoundChipOptions;
    fxModule?: WebAssembly.Module;
    fxWasmBinary?: Uint8Array | ArrayBuffer;
    fxWasmUrl?: string | URL;
    signal?: AbortSignal;
    mega32X?: boolean;
    pwmOptions?: import('./pwm32x.js').PWM32XOptions;
};
/**
 * Create an experimental YM2612 + nativeFX offline renderer.
 * This is a separate entry point; the existing browser MegaSynth is unchanged.
 * Options: sampleRate (default 48000), masterVolume (default 1), chipOptions,
 * fxModule / fxWasmBinary / fxWasmUrl, signal, mega32X, pwmOptions.
 */
/** @typedef {{sampleRate?: number, masterVolume?: number, chipOptions?: import('./soundchip.js').SoundChipOptions,
 * fxModule?: WebAssembly.Module, fxWasmBinary?: Uint8Array | ArrayBuffer, fxWasmUrl?: string | URL,
 * signal?: AbortSignal, mega32X?: boolean, pwmOptions?: import('./pwm32x.js').PWM32XOptions}} MegaSynthOfflineOptions */
/** @param {MegaSynthOfflineOptions} [options] */
export declare function createMegaSynthOffline(options?: MegaSynthOfflineOptions): Promise<MegaSynthOffline>;
declare class MegaSynthOffline {
    #private;
    pwm: PWM32XPlayback | null;
    fm: YM2612Synth;
    fx: {
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
    /** @param {import("./ym2612.js").Ym2612} chip @param {NativeFXEngine} dsp @param {number} sampleRate @param {number} masterVolume @param {MegaSynthOfflineOptions} options */
    constructor(chip: import("./ym2612.js").Ym2612, dsp: NativeFXEngine, sampleRate: number, masterVolume: number, options: MegaSynthOfflineOptions);
    get currentFrame(): number;
    get sampleRate(): number;
    get masterVolume(): number;
    get currentTime(): number;
    /** Cancel future notes and FX tails while retaining the configured patches/chain. */
    stop(): void;
    clearSchedule(): void;
    /** Apply the shared native FX command protocol without a Web Audio transport. */
    applyFX(command: any): void;
    /** Session-owned PCM banks/voices use the same native mixer as the Worklet. */
    sampleCommand(command: any): number | undefined;
    /** Absolute output-frame timestamp; serializable FM commands, stable order. */
    schedule(frame: any, command: any): void;
    /** Advance the sample clock, render the chip, then apply native FX. */
    /** @param {number} frames @param {{onSource?: (input: Float32Array[]) => void}} [options] */
    render(frames: number, { onSource }?: {
        onSource?: (input: Float32Array[]) => void;
    }): {
        left: Float32Array<ArrayBuffer>;
        right: Float32Array<ArrayBuffer>;
        sampleRate: number;
    };
    close(): void;
}
export {};
