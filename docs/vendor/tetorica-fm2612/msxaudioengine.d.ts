/**
 * @file msxaudioengine.js
 * 実行環境: Browser / Node.js
 * 依存: 音源チップ／WASM バックエンド（ファクトリーまたはエンジンを注入）。
 * 同期 PCM 生成・ミックス用。DOM・AudioContext・スピーカー出力は不要。
 */
import { Ym2151AudioEngine } from './ym2151audioengine.js';
import { Ay8910AudioEngine } from './ay8910audioengine.js';
import { Ym2413AudioEngine } from './ym2413audioengine.js';
import { Y8950AudioEngine } from './y8950audioengine.js';
import { K051649AudioEngine } from './k051649audioengine.js';
import { MultiChipAudioEngine } from './multichipaudioengine.js';
export type MsxChipDescriptor = {
    type: 'ym2151';
    index?: number;
    options: NonNullable<Parameters<typeof Ym2151AudioEngine.create>[0]>;
} | {
    type: 'ay8910';
    index?: number;
    options: NonNullable<Parameters<typeof Ay8910AudioEngine.create>[0]>;
} | {
    type: 'ym2413';
    index?: number;
    options: NonNullable<Parameters<typeof Ym2413AudioEngine.create>[0]>;
} | {
    type: 'y8950';
    index?: number;
    options: NonNullable<Parameters<typeof Y8950AudioEngine.create>[0]>;
} | {
    type: 'k051649';
    index?: number;
    options: NonNullable<Parameters<typeof K051649AudioEngine.create>[0]>;
};
/** @typedef {{type:'ym2151',index?:number,options:NonNullable<Parameters<typeof Ym2151AudioEngine.create>[0]>} | {type:'ay8910',index?:number,options:NonNullable<Parameters<typeof Ay8910AudioEngine.create>[0]>} | {type:'ym2413',index?:number,options:NonNullable<Parameters<typeof Ym2413AudioEngine.create>[0]>} | {type:'y8950',index?:number,options:NonNullable<Parameters<typeof Y8950AudioEngine.create>[0]>} | {type:'k051649',index?:number,options:NonNullable<Parameters<typeof K051649AudioEngine.create>[0]>}} MsxChipDescriptor */
/**
 * MsxAudioEngine adapter for synchronous stereo rendering and VGM register dispatch.
 * Output timing uses sampleRate() frames per second. No browser audio device is opened.
 * Dispose the engine when done to release its underlying chips.
 */
export declare class MsxAudioEngine extends MultiChipAudioEngine {
    /**
     * Create the chip instances required by this engine.
     * @param {{chips?:MsxChipDescriptor[],outputSampleRate?:number,masterVolume?:number, ym2151ModuleFactory?:import('./soundchip.js').WasmModuleFactory, ym2151ModuleOptions?:import('./soundchip.js').WasmModuleOptions, ym2151Clock?:number, ayModuleFactory?:import('./soundchip.js').WasmModuleFactory, ayModuleOptions?:import('./soundchip.js').WasmModuleOptions, ayClock?:number, ym2413ModuleFactory?:import('./soundchip.js').WasmModuleFactory, ym2413ModuleOptions?:import('./soundchip.js').WasmModuleOptions, ym2413Clock?:number, y8950ModuleFactory?:import('./soundchip.js').WasmModuleFactory, y8950ModuleOptions?:import('./soundchip.js').WasmModuleOptions, y8950Clock?:number, k051649ModuleFactory?:import('./soundchip.js').WasmModuleFactory, k051649ModuleOptions?:import('./soundchip.js').WasmModuleOptions, k051649Clock?:number,ym2151Variant?:'ym2151'|'ym2164',ayType?:number,ayFlags?:number}} [options={}] Chip factories, clocks in Hz and loader settings.
     * @param {number} [options.outputSampleRate=44100] Output stereo frames per second.
     * @param {number} [options.masterVolume=1] Linear output gain, not dB.
     * @returns {Promise<MsxAudioEngine>} Initialized engine owned by the caller.
     */
    static create(options?: {
        chips?: MsxChipDescriptor[];
        outputSampleRate?: number;
        masterVolume?: number;
        ym2151ModuleFactory?: import('./soundchip.js').WasmModuleFactory;
        ym2151ModuleOptions?: import('./soundchip.js').WasmModuleOptions;
        ym2151Clock?: number;
        ayModuleFactory?: import('./soundchip.js').WasmModuleFactory;
        ayModuleOptions?: import('./soundchip.js').WasmModuleOptions;
        ayClock?: number;
        ym2413ModuleFactory?: import('./soundchip.js').WasmModuleFactory;
        ym2413ModuleOptions?: import('./soundchip.js').WasmModuleOptions;
        ym2413Clock?: number;
        y8950ModuleFactory?: import('./soundchip.js').WasmModuleFactory;
        y8950ModuleOptions?: import('./soundchip.js').WasmModuleOptions;
        y8950Clock?: number;
        k051649ModuleFactory?: import('./soundchip.js').WasmModuleFactory;
        k051649ModuleOptions?: import('./soundchip.js').WasmModuleOptions;
        k051649Clock?: number;
        ym2151Variant?: 'ym2151' | 'ym2164';
        ayType?: number;
        ayFlags?: number;
    }): Promise<MsxAudioEngine>;
    /** @param {number} register
     * @param {number} value
     * @param {number} [index] */
    writeYm2151(register: number, value: number, index?: number): void;
    /** @param {boolean} value */
    setOpmMuted(value: boolean): void;
    /** @param {number} channel
     * @param {boolean} value */
    setOpmChannelMuted(channel: number, value: boolean): void;
    /** @param {number} register
     * @param {number} [index] */
    writeAy8910(register: number, value: any, index?: number): void;
    /** @param {number} register
     * @param {number} [index] */
    writeYm2413(register: number, value: any, index?: number): void;
    /** @param {number} register
     * @param {number} [index] */
    writeY8950(register: number, value: any, index?: number): void;
    /** @param {number} port
     * @param {number} register
     * @param {number} [index] */
    writeK051649(port: number, register: number, value: any, index?: number): void;
    /** @param {boolean} value */
    setAyMuted(value: boolean): void;
    /** @param {number} channel
     * @param {boolean} value */
    setAyChannelMuted(channel: number, value: boolean): void;
    /** @param {boolean} value */
    setOpllMuted(value: boolean): void;
    /** @param {boolean} value */
    setY8950Muted(value: boolean): void;
    /** @param {boolean} value */
    setSccMuted(value: boolean): void;
    /** @param {number} channel
     * @param {boolean} value */
    setSccChannelMuted(channel: number, value: boolean): void;
}
/** @param {Parameters<typeof MsxAudioEngine.create>[0]} [options] */
export declare const createMsxAudioEngine: (options?: Parameters<typeof MsxAudioEngine.create>[0]) => Promise<MsxAudioEngine>;
/**
 * Check supported MSX chip combinations and single-chip variant flags.
 * @param {import('./ym2612vgm.js').Ym2612VgmHeader} header Parsed VGM clock/variant fields.
 * @returns {void}
 * @throws {Error} For unsupported chip combinations or variants.
 */
export declare function validateMsxPlaybackHeader(header: import('./ym2612vgm.js').Ym2612VgmHeader): void;
