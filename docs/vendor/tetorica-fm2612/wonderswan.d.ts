/**
 * Standalone WonderSwan sound core for Browser / Worker / Node.js.
 * No AudioContext, CPU, BIOS or ROM is created. See third_party/mame-wonderswan/
 * for provenance and the limits of this preliminary MAME-derived core.
 */
export declare const WONDERSWAN_CLOCK = 3072000;
/** Synchronous register / RAM / stereo PCM API. Output follows the raw,
 * unipolar MAME headphone DAC scale; no Mixer gain or DC filter is applied.
 */
export declare class WonderSwan {
    #private;
    /** @param {{moduleFactory:Function,moduleOptions?:object,clock?:number,sampleRate?:number}} options
     * @returns {Promise<WonderSwan>}
     */
    static create({ moduleFactory, moduleOptions, clock, sampleRate }?: {
        moduleFactory: Function;
        moduleOptions?: object;
        clock?: number;
        sampleRate?: number;
    }): Promise<WonderSwan>;
    /** Prefer create(); this instance owns its handle and output buffer.
     * The WASM module may be shared with other independent chip instances.
     * @param {*} module Instantiated Emscripten WonderSwan module.
     * @param {number} handle Owned native sound-core handle.
     * @param {number} clock Input clock in Hz.
     * @param {number} rate Output sample rate in Hz.
     */
    constructor(module: any, handle: number, clock: number, rate: number);
    /** @returns {number} Input clock in Hz. */
    get clock(): number;
    /** @returns {number} Output sample rate in Hz. */
    sampleRate(): number;
    /** Deterministic cold reset: RAM, registers, counters, held PCM and mutes.
     * @returns {void}
     */
    reset(): void;
    /** Absolute byte addresses 0x80..0x9f, not VGM-relative register numbers.
     * Hyper Voice, DMA and CPU-side ports are outside this API's first version.
     * @param {number} address
     * @param {number} value
     * @returns {void}
     */
    writeRegister(address: number, value: number): void;
    /** @param {number} address @returns {number} Register byte. */
    readRegister(address: number): number;
    /** Write one byte of the sound core's owned 16 KiB wave RAM.
     * @param {number} address
     * @param {number} value
     * @returns {void}
     */
    writeMemory(address: number, value: number): void;
    /** @param {number} address @returns {number} Packed RAM byte. */
    readMemory(address: number): number;
    /** Copy packed wave RAM bytes. Each channel uses 16 bytes / 32 four-bit
     * samples, low nibble first, at (register 0x8f << 6) + channel * 16.
     * @param {Uint8Array} bytes
     * @param {number} [offset=0]
     * @returns {void}
     */
    loadMemory(bytes: Uint8Array, offset?: number): void;
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
