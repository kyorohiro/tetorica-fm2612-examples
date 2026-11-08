/** Experimental CPU-free MAME-derived PlayStation SPU. Browser / Worker / Node.
 * The caller injects a generated WASM factory; no AudioContext, BIOS or CPU is created.
 * See docs/ps1_spu.md for upstream accuracy limits and supported register modes.
 */
export declare const PS1_SPU_SAMPLE_RATE = 44100;
export declare const PS1_SPU_RAM_BYTES: number;
export declare const PS1_SPU_MAX_FRAMES: number;
/** Direct register/RAM/PCM interface to one independently owned SPU instance.
 * Byte offsets are relative to 0x1f801c00, not absolute PS1 bus addresses.
 * Stereo PCM has a fixed native rate of 44,100 Hz. This class does not resample,
 * normalize gain, allocate musical voices or decode PCM files into SPU ADPCM.
 */
export declare class Ps1Spu {
    #private;
    module: object;
    handle: number;
    api: object;
    leftPtr: number;
    rightPtr: number;
    bufferFrames: number;
    /** @param {object} module Initialized generated Emscripten module.
     * @param {number} handle Native instance created by Ps1Spu.create().
     * @param {object} api Bound native functions.
     */
    constructor(module: object, handle: number, api: object);
    /** Initialize an experimental standalone SPU with 512 KiB RAM and 24 voices.
     * @param {{moduleFactory:import('./soundchip.js').WasmModuleFactory,
     *   moduleOptions?:import('./soundchip.js').WasmModuleOptions}} options
     * @returns {Promise<Ps1Spu>}
     */
    static create({ moduleFactory, moduleOptions }: {
        moduleFactory: import('./soundchip.js').WasmModuleFactory;
        moduleOptions?: import('./soundchip.js').WasmModuleOptions;
    }): Promise<Ps1Spu>;
    /** Fixed native PCM output rate. */
    get sampleRate(): number;
    /** Number of generated native stereo frames since creation/reset. */
    get nativeFrames(): number;
    /** Reset registers, voices and decoder history. RAM is retained unless requested.
     * @param {{clearRam?:boolean}} [options]
     */
    reset(options?: {
        clearRam?: boolean;
    }): void;
    /** Write an even register byte offset (0..0x3fe) and an unsigned 16-bit value.
     * Unsupported modes are rejected by the standalone core before changing state.
     * @param {number} offset @param {number} value
     */
    write(offset: number, value: number): void;
    /** Read a hardware register view, including live envelope/address/status values.
     * @param {number} offset @returns {number}
     */
    read(offset: number): number;
    /** Apply current ADSR registers to a held envelope without restarting its
     * sample or envelope level. This is an instrument extension, not a KON write.
     * @param {number} channel */
    refreshEnvelope(channel: number): void;
    /** Manual audition only: per-voice transition ramp, with a minimum fast
     * release duration. Raw register key-on/off retains its original semantics.
     * @param {number} channel @param {boolean} on */
    auditionKey(channel: number, on: boolean): void;
    /** Copy raw bytes into SPU RAM and invalidate affected decoder caches.
     * This expects already encoded SPU ADPCM or other raw RAM data, not PCM/WAV.
     * @param {Uint8Array} bytes @param {number} [address=0]
     */
    loadRam(bytes: Uint8Array, address?: number): void;
    /** Return an owned copy of a RAM range; default is the complete RAM image.
     * @param {number} [address=0] @param {number} [length]
     * @returns {Uint8Array}
     */
    readRam(address?: number, length?: number): Uint8Array;
    /** Generate native-rate PCM into caller-owned, non-overlapping Float32 views.
     * Invalid destinations/counts are rejected before the SPU advances.
     * @param {Float32Array} left @param {Float32Array} right
     * @param {number} [frames] @param {number} [offset=0]
     */
    renderInto(left: Float32Array, right: Float32Array, frames?: number, offset?: number): void;
    /** @param {number} frames @returns {{left:Float32Array,right:Float32Array}} */
    generateStereo(frames: number): {
        left: Float32Array;
        right: Float32Array;
    };
    /** Release this instance. Previously returned arrays remain owned by the caller. */
    dispose(): void;
}
