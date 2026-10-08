export { SoundChipMixer, soundChipMixDefaults } from './soundchip_mixer.js';
export { encodeWav } from './wav.js';
export type SoundChipOptions = {
    /**
     * 生成済み *_wasm.js / .wasm のディレクトリURL（末尾 /）。
     */
    assetBaseUrl?: URL | string;
    /**
     * 注入する Emscripten factory。指定時は自動ロードを省略。
     */
    moduleFactory?: Function;
    /**
     * wasmBinary、locateFile などをそのまま渡す。
     */
    moduleOptions?: Object;
    /**
     * Worklet output mixer.
     */
    mixer?: import('./soundchip_mixer.js').SoundChipMixer;
    /**
     * Stable chip ID (automatically allocated when omitted).
     */
    id?: string;
    /**
     * WASM ファイルの読み込みを中断する。
     */
    signal?: AbortSignal;
    /**
     * チップの実行場所。worklet はブラウザーのみ。
     */
    execution?: 'direct' | 'worklet';
    /**
     * Worklet の接続先。省略時は factory が生成・解放する。
     */
    audioContext?: AudioContext;
    /**
     * Input clock in Hz.
     */
    clock?: number;
    /**
     * Requested PCM/output sample rate.
     */
    sampleRate?: number;
    /**
     * AY chip variant type.
     */
    type?: number;
    /**
     * Chip-specific flags.
     */
    flags?: number;
    /**
     * Chip variant selection.
     */
    variant?: boolean;
    /**
     * PWM amplitude scaling.
     */
    outputMode?: 'dac' | 'duty';
    /**
     * Browser output destination.
     */
    outputNode?: AudioNode;
    /**
     * Worklet endpoint の出力音量。
     */
    gain?: number;
};
export type SoundChipMap = {
    gameboy: import('./gameboyapu.js').GameboyApu;
    segapsg: import('./segapsg.js').SegaPSG;
    pwm: import('./pwm32x.js').PWM32X;
    ay8910: import('./ay8910.js').Ay8910;
    y8950: import('./y8950.js').Y8950;
    ym2610b: import('./ym2610b.js').Ym2610B;
    ym2151: import('./ym2151.js').Ym2151;
    ym2203: import('./ym2203.js').Ym2203;
    ym2413: import('./ym2413.js').Ym2413;
    ym2608: import('./ym2608.js').Ym2608;
    ym2612: import('./ym2612.js').Ym2612;
    ym3438: import('./ym3438.js').Ym3438;
    ym3526: import('./ym3526.js').Ym3526;
    ym3812: import('./ym3812.js').Ym3812;
    ymf262: import('./ymf262.js').Ymf262;
    ymf276: import('./ymf276.js').Ymf276;
    ymf278b: import('./ymf278b.js').Ymf278b;
    ymf288: import('./ymf288.js').Ymf288;
};
export type WorkletChipName = 'ym2612' | 'ym2608' | 'ym2151' | 'gameboy' | 'segapsg' | 'pwm';
export declare function createSoundChip<Name extends WorkletChipName>(name: Name, options: SoundChipOptions & {
    execution: 'worklet';
}): Promise<import('./soundchip_worklet.js').WorkletSoundChip & {
    name: Name;
}>;
export declare function createSoundChip<Name extends keyof SoundChipMap>(name: Name, options?: SoundChipOptions & {
    execution?: 'direct';
}): Promise<SoundChipMap[Name] & {
    readonly id: string;
}>;
export declare function createSoundChip<Name extends WorkletChipName>(name: Name, options: SoundChipOptions): Promise<(SoundChipMap[Name] & {
    readonly id: string;
}) | import('./soundchip_worklet.js').WorkletSoundChip>;
