/** AudioWorklet: bank allocation and voice routing for the native PCM mixer. */
/**
 * @param {{memory: WebAssembly.Memory, sample_clear: () => void, sample_reset: (rate: number) => void,
 *   sample_allocate: (slot: number, frames: number, channels: number, rate: number) => number,
 *   sample_active: (slot: number) => number,
 *   sample_play: (slot: number, bank: number, rate: number, gain: number, pan: number, offset: number, duration: number, loop: number, loopStart: number, loopEnd: number, fadeIn: number, fadeOut: number) => number,
 *   sample_stop: (slot: number) => void, sample_unload: (slot: number) => void}} api Native WASM sample exports.
 * @param {number} rate Output sample frames per second.
 * @returns Clear/reset and command dispatch operations; play returns a voice ID.
 */
export declare function createSampleProcessor(api: {
    memory: WebAssembly.Memory;
    sample_clear: () => void;
    sample_reset: (rate: number) => void;
    sample_allocate: (slot: number, frames: number, channels: number, rate: number) => number;
    sample_active: (slot: number) => number;
    sample_play: (slot: number, bank: number, rate: number, gain: number, pan: number, offset: number, duration: number, loop: number, loopStart: number, loopEnd: number, fadeIn: number, fadeOut: number) => number;
    sample_stop: (slot: number) => void;
    sample_unload: (slot: number) => void;
}, rate: number): {
    clear: () => void;
    reset: () => void;
    reserve: (d: any, performance: any) => number;
    startReserved: (id: any) => void;
    cancelReservation: (id: any) => void;
    stopOwner: (owner: any, session: any) => void;
    command(d: any): number | undefined;
};
