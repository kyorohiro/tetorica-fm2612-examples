/**
 * @file megasynth_fx.js
 * 実行環境: Browser（音声処理時）
 * 依存: Web Audio の AudioContext / AudioNode、エフェクトにより AudioWorkletNode と window のタイマー。
 * import だけでは音声デバイスを開かない。
 */
/**
 * @typedef {{
 *   get(): number,
 *   set(value: number): number,
 *   rampTo(value: number, seconds?: number): number,
 * }} AudioParamControl
 */
export type AudioParamControl = {
    get(): number;
    set(value: number): number;
    rampTo(value: number, seconds?: number): number;
};
export type SimpleParamControl = {
    get(): number;
    set(value: number): number;
};
export type FXConnectTarget = AudioNode | {
    input: AudioNode;
};
export type FXBranch = {
    type: "branch";
    effects: AnyFXUnit[];
};
export type BaseFXUnit = {
    type: string;
    input: AudioNode;
    output: AudioNode;
    params: Record<string, unknown>;
    connect(target: FXConnectTarget): FXConnectTarget;
    disconnect(): void;
    dispose(): void;
};
export type GainFXOptions = {
    gain?: number;
};
export type EqFXOptions = {
    bass?: number;
    bassFrequency?: number;
    mid?: number;
    midFrequency?: number;
    midQ?: number;
    treble?: number;
    trebleFrequency?: number;
};
export type RadioToneFXOptions = {
    highpass?: number;
    lowpass?: number;
    presence?: number;
    mix?: number;
    output?: number;
};
export type LofiFXOptions = {
    cutoff?: number;
    highshelf?: number;
    drive?: number;
    mix?: number;
    output?: number;
};
export type StereoWidthFXOptions = {
    width?: number;
    mix?: number;
    output?: number;
};
export type BitcrusherFXOptions = {
    bitDepth?: number;
    holdFrames?: number;
    mix?: number;
    output?: number;
};
export type FilterFXOptions = {
    type?: BiquadFilterType;
    cutoff?: number;
    q?: number;
};
export type DelayFXOptions = {
    time?: number;
    feedback?: number;
    mix?: number;
};
export type DistortionFXOptions = {
    drive?: number;
    mix?: number;
    output?: number;
};
export type CompressorFXOptions = {
    threshold?: number;
    knee?: number;
    ratio?: number;
    attack?: number;
    release?: number;
    output?: number;
};
export type GateFXOptions = {
    threshold?: number;
    floor?: number;
    mix?: number;
};
export type WobbleFXOptions = {
    cutoff?: number;
    depth?: number;
    rate?: number;
    resonance?: number;
    mix?: number;
    getBeatSeconds?: (() => number);
};
export type FlangerFXOptions = {
    time?: number;
    depth?: number;
    rate?: number;
    feedback?: number;
    mix?: number;
    getBeatSeconds?: (() => number);
};
export type ChorusFXOptions = {
    delay1?: number;
    delay2?: number;
    depth?: number;
    rate?: number;
    spread?: number;
    mix?: number;
    output?: number;
    getBeatSeconds?: (() => number);
};
export type TapeSaturationFXOptions = {
    drive?: number;
    output?: number;
    mix?: number;
};
export type ReverbFXOptions = {
    mix?: number;
    tone?: number;
    seconds?: number;
    decay?: number;
};
export type SlicerFXOptions = {
    phase?: number;
    mix?: number;
    getBeatSeconds?: (() => number);
};
export type GainFXUnit = BaseFXUnit & {
    type: "gain";
    gain: AudioParamControl;
};
export type EqFXUnit = BaseFXUnit & {
    type: "eq";
    bass: AudioParamControl;
    mid: AudioParamControl;
    treble: AudioParamControl;
};
export type RadioToneFXUnit = BaseFXUnit & {
    type: "radioTone";
    highpass: AudioParamControl;
    lowpass: AudioParamControl;
    presence: AudioParamControl;
    mix: AudioParamControl;
    outputGain: AudioParamControl;
};
export type LofiFXUnit = BaseFXUnit & {
    type: "lofi";
    cutoff: AudioParamControl;
    highshelf: AudioParamControl;
    drive: AudioParamControl;
    mix: AudioParamControl;
    outputGain: AudioParamControl;
};
export type StereoWidthFXUnit = BaseFXUnit & {
    type: "stereoWidth";
    width: AudioParamControl;
    mix: AudioParamControl;
    outputGain: AudioParamControl;
};
export type BitcrusherFXUnit = BaseFXUnit & {
    type: "bitcrusher";
    bitDepth: AudioParamControl;
    holdFrames: AudioParamControl;
    mix: AudioParamControl;
    outputGain: AudioParamControl;
};
export type FilterFXUnit = BaseFXUnit & {
    type: "filter";
    cutoff: AudioParamControl;
    q: AudioParamControl;
};
export type DelayFXUnit = BaseFXUnit & {
    type: "delay";
    time: AudioParamControl;
    feedback: AudioParamControl;
    mix: AudioParamControl;
};
export type DistortionFXUnit = BaseFXUnit & {
    type: "distortion";
    drive: AudioParamControl;
    mix: AudioParamControl;
    outputGain: AudioParamControl;
};
export type CompressorFXUnit = BaseFXUnit & {
    type: "compressor";
    threshold: AudioParamControl;
    knee: AudioParamControl;
    ratio: AudioParamControl;
    attack: AudioParamControl;
    release: AudioParamControl;
    outputGain: AudioParamControl;
};
export type GateFXUnit = BaseFXUnit & {
    type: "gate";
    threshold: SimpleParamControl;
    floor: AudioParamControl;
    mix: AudioParamControl;
};
export type WobbleFXUnit = BaseFXUnit & {
    type: "wobble";
    cutoff: AudioParamControl;
    depth: AudioParamControl;
    rate: SimpleParamControl;
    resonance: AudioParamControl;
    mix: AudioParamControl;
};
export type FlangerFXUnit = BaseFXUnit & {
    type: "flanger";
    time: AudioParamControl;
    depth: AudioParamControl;
    rate: SimpleParamControl;
    feedback: AudioParamControl;
    mix: AudioParamControl;
};
export type ChorusFXUnit = BaseFXUnit & {
    type: "chorus";
    delay1: AudioParamControl;
    delay2: AudioParamControl;
    depth: AudioParamControl;
    rate: SimpleParamControl;
    spread: SimpleParamControl;
    mix: AudioParamControl;
    outputGain: AudioParamControl;
};
export type TapeSaturationFXUnit = BaseFXUnit & {
    type: "tapeSaturation";
    drive: AudioParamControl;
    mix: AudioParamControl;
    outputGain: AudioParamControl;
};
export type ReverbFXUnit = BaseFXUnit & {
    type: "reverb";
    mix: AudioParamControl;
    tone: AudioParamControl;
};
export type SlicerFXUnit = BaseFXUnit & {
    type: "slicer";
    phase: SimpleParamControl;
    mix: AudioParamControl;
};
export type ParallelFXUnit = BaseFXUnit & {
    type: "parallel";
    branches: FXBranch[];
};
export type AnyFXUnit = GainFXUnit | EqFXUnit | RadioToneFXUnit | LofiFXUnit | StereoWidthFXUnit | BitcrusherFXUnit | FilterFXUnit | DelayFXUnit | DistortionFXUnit | CompressorFXUnit | GateFXUnit | WobbleFXUnit | FlangerFXUnit | ChorusFXUnit | TapeSaturationFXUnit | ReverbFXUnit | SlicerFXUnit | ParallelFXUnit;
/**
 * Describe one serial branch used by `parallel(...)`.
 *
 * `branch(a, b, c)` means:
 *
 * input -> a -> b -> c
 *
 * @param {...AnyFXUnit} effects
 * @returns {FXBranch}
 */
export declare function createFXBranch(...effects: AnyFXUnit[]): FXBranch;
/**
 * Create one routing unit that splits one input into multiple branches and
 * mixes them back together.
 *
 * @param {BaseAudioContext} audioContext
 * @param {...(FXBranch | AnyFXUnit)} branchesOrEffects
 * @returns {ParallelFXUnit}
 */
export declare function createFXParallel(audioContext: BaseAudioContext, ...branchesOrEffects: (FXBranch | AnyFXUnit)[]): ParallelFXUnit;
/**
 * @param {BaseAudioContext} audioContext
 * @param {GainFXOptions} [options]
 * @returns {GainFXUnit}
 */
export declare function createGainFX(audioContext: BaseAudioContext, options?: GainFXOptions): GainFXUnit;
/**
 * @param {BaseAudioContext} audioContext
 * @param {EqFXOptions} [options]
 * @returns {EqFXUnit}
 */
export declare function createEqFX(audioContext: BaseAudioContext, options?: EqFXOptions): EqFXUnit;
/**
 * Radio-like narrow-band tone shaping.
 *
 * This is useful when game audio should feel like it is coming from:
 *
 * - a handheld radio
 * - an in-world speaker
 * - a phone / comms voice
 *
 * @param {BaseAudioContext} audioContext
 * @param {RadioToneFXOptions} [options]
 * @returns {RadioToneFXUnit}
 */
export declare function createRadioToneFX(audioContext: BaseAudioContext, options?: RadioToneFXOptions): RadioToneFXUnit;
/**
 * Small lo-fi tone shaper.
 *
 * This is intentionally lighter than a full cassette / vinyl simulation.
 * It keeps the runtime simple enough for game embedding while still giving:
 *
 * - softer highs
 * - mild band-limiting
 * - light saturation
 *
 * @param {BaseAudioContext} audioContext
 * @param {LofiFXOptions} [options]
 * @returns {LofiFXUnit}
 */
export declare function createLofiFX(audioContext: BaseAudioContext, options?: LofiFXOptions): LofiFXUnit;
/**
 * @param {BaseAudioContext} audioContext
 * @param {StereoWidthFXOptions} [options]
 * @returns {StereoWidthFXUnit}
 */
export declare function createStereoWidthFX(audioContext: BaseAudioContext, options?: StereoWidthFXOptions): StereoWidthFXUnit;
/**
 * @param {BaseAudioContext} audioContext
 * @param {BitcrusherFXOptions} [options]
 * @returns {BitcrusherFXUnit}
 */
export declare function createBitcrusherFX(audioContext: BaseAudioContext, options?: BitcrusherFXOptions): BitcrusherFXUnit;
/**
 * @param {BaseAudioContext} audioContext
 * @param {FilterFXOptions} [options]
 * @returns {FilterFXUnit}
 */
export declare function createFilterFX(audioContext: BaseAudioContext, options?: FilterFXOptions): FilterFXUnit;
/**
 * @param {BaseAudioContext} audioContext
 * @param {DelayFXOptions} [options]
 * @returns {DelayFXUnit}
 */
export declare function createDelayFX(audioContext: BaseAudioContext, options?: DelayFXOptions): DelayFXUnit;
/**
 * @param {BaseAudioContext} audioContext
 * @param {DistortionFXOptions} [options]
 * @returns {DistortionFXUnit}
 */
export declare function createDistortionFX(audioContext: BaseAudioContext, options?: DistortionFXOptions): DistortionFXUnit;
/**
 * @param {BaseAudioContext} audioContext
 * @param {CompressorFXOptions} [options]
 * @returns {CompressorFXUnit}
 */
export declare function createCompressorFX(audioContext: BaseAudioContext, options?: CompressorFXOptions): CompressorFXUnit;
/**
 * @param {BaseAudioContext} audioContext
 * @param {GateFXOptions} [options]
 * @returns {GateFXUnit}
 */
export declare function createGateFX(audioContext: BaseAudioContext, options?: GateFXOptions): GateFXUnit;
/**
 * @param {BaseAudioContext} audioContext
 * @param {WobbleFXOptions} [options]
 * @returns {WobbleFXUnit}
 */
export declare function createWobbleFX(audioContext: BaseAudioContext, options?: WobbleFXOptions): WobbleFXUnit;
/**
 * @param {BaseAudioContext} audioContext
 * @param {FlangerFXOptions} [options]
 * @returns {FlangerFXUnit}
 */
export declare function createFlangerFX(audioContext: BaseAudioContext, options?: FlangerFXOptions): FlangerFXUnit;
/**
 * @param {BaseAudioContext} audioContext
 * @param {ChorusFXOptions} [options]
 * @returns {ChorusFXUnit}
 */
export declare function createChorusFX(audioContext: BaseAudioContext, options?: ChorusFXOptions): ChorusFXUnit;
/**
 * @param {BaseAudioContext} audioContext
 * @param {TapeSaturationFXOptions} [options]
 * @returns {TapeSaturationFXUnit}
 */
export declare function createTapeSaturationFX(audioContext: BaseAudioContext, options?: TapeSaturationFXOptions): TapeSaturationFXUnit;
/**
 * @param {BaseAudioContext} audioContext
 * @param {ReverbFXOptions} [options]
 * @returns {ReverbFXUnit}
 */
export declare function createReverbFX(audioContext: BaseAudioContext, options?: ReverbFXOptions): ReverbFXUnit;
/**
 * @param {BaseAudioContext} audioContext
 * @param {SlicerFXOptions} [options]
 * @returns {SlicerFXUnit}
 */
export declare function createSlicerFX(audioContext: BaseAudioContext, options?: SlicerFXOptions): SlicerFXUnit;
