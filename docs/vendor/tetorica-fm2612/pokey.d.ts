/**
 * Standalone Atari POKEY audio core for Browser / Worker / Node.js.
 * No AudioContext, CPU or ROM is created. Each handle owns its complete state.
 * See the fixed SDK vendor/libvgm-pokey/ for BSD provenance and I/O limits.
 */
export declare const POKEY_CLOCK = 1789790;
/** Synchronous register / mono PCM API (duplicated into planar L/R). Output
 * retains the unipolar, clipped legacy linear DAC scale and DC component.
 * No Mixer gain, board circuit or DC filter is applied.
 */
export declare class Pokey {
    #private;
    /** @param {{moduleFactory:Function,moduleOptions?:object,clock?:number,sampleRate?:number}} options
     * @returns {Promise<Pokey>}
     */
    static create({ moduleFactory, moduleOptions, clock, sampleRate }?: {
        moduleFactory: Function;
        moduleOptions?: object;
        clock?: number;
        sampleRate?: number;
    }): Promise<Pokey>;
    /** Prefer create(); this instance owns its handle and output buffer.
     * The WASM module may be shared with other independent chip instances.
     * @param {*} module Instantiated Emscripten Pokey module.
     * @param {number} handle Owned native sound-core handle.
     * @param {number} clock Input clock in Hz.
     * @param {number} rate Output sample rate in Hz.
     */
    constructor(module: any, handle: number, clock: number, rate: number);
    /** @returns {number} Input clock in Hz. */
    get clock(): number;
    /** @returns {number} Output sample rate in Hz. */
    sampleRate(): number;
    /** Deterministic cold reset: registers, counters, polynomial phase and mutes.
     * @returns {void}
     */
    reset(): void;
    /** Chip-local register offsets 0x00..0x0f, never Atari CPU addresses.
     * @param {number} address
     * @param {number} value
     * @returns {void}
     */
    writeRegister(address: number, value: number): void;
    /** Hardware read-register map (POT/status/RANDOM), not the write bank.
     * This is a non-timing status peek, not a CPU bus access.
     * @param {number} address @returns {number} Register byte. */
    readRegister(address: number): number;
    /** Monitoring mute suppresses output while the voice continues advancing.
     * @param {number} channel Physical channel 0..3.
     * @param {boolean} muted
     * @returns {void}
     */
    setChannelMuted(channel: number, muted: boolean): void;
    /** Reserve output memory before a real-time render loop. Capacity is retained.
     * Prefix views through 128 frames are prewarmed for AudioWorklet segments.
     * @param {number} frames
     * @returns {void}
     */
    reserveFrames(frames: number): void;
    /** Borrowed PCM views: consume immediately. A later render, reserveFrames()
     * expansion, heap growth or dispose invalidates their contents/lifetime.
     * No output gain is applied.
     * With fixed frame size and stable WASM memory, views and buffers are reused.
     * @param {number} frames
     * @returns {Readonly<{left:Float32Array,right:Float32Array}>}
     */
    generateStereoView(frames: number): Readonly<{
        left: Float32Array;
        right: Float32Array;
    }>;
    /** Owned PCM copies, valid after subsequent renders and disposal.
     * @param {number} frames
     * @returns {{left:Float32Array,right:Float32Array}}
     */
    generateStereo(frames: number): {
        left: Float32Array;
        right: Float32Array;
    };
    /** Render into caller-owned, separate stereo buffers.
     * @param {Float32Array} left
     * @param {Float32Array} right
     * @param {number} [frames=left.length]
     * @returns {void}
     */
    generateStereoInto(left: Float32Array, right: Float32Array, frames?: number): void;
    /** @returns {void} */
    dispose(): void;
}
