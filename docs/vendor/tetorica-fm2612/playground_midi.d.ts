export declare const MIDI_SUPPORTED_CC: readonly number[];
/**
 * Validate the full-scale pitch bend distance.
 * @param {number} value Semitones on either side of the unbent note (0..96).
 * @returns {number} The validated value.
 * @throws {Error} For nonfinite or out-of-range values.
 */
export declare function validateBendRange(value: number): number;
/**
 * Resolve a note name or MIDI key number; C4 is 60 and A4 is 69.
 * @param {string|number} note Uppercase note name (e.g. C#4, Bb3) or integer 0..127.
 * @returns {number} MIDI key number, independent of the output channel.
 * @throws {Error} For invalid names or notes outside 0..127.
 */
export declare function midiNote(note: string | number): number;
/**
 * Create the register-side MIDI adapter; handles on the same destination/channel share state.
 * Automatic voice allocation and fixed physical-channel mode are implemented here.
 * @param {Object} options Register transports and initial voice.
 * @param {Function} options.write Receives FM writes with port, register, value and optional time in seconds.
 * @param {Function} options.writePsg Receives PSG writes.
 * @param {Object} options.preset Initial FM voice, validated by YM2612Synth.
 * @param {number} [options.fmChannels=6] Number of available physical FM voices.
 * @returns {Object} Rack command handlers and voice lifecycle operations.
 */
export declare function createMidiRack({ write, writePsg, preset, fmChannels }: {
    write: Function;
    writePsg: Function;
    preset: Object;
    fmChannels?: number;
}): Object;
/**
 * Build the user-facing MIDI API shared by main-thread and Worker execution.
 * Output channels use 0..15 (CH1..CH16); the rack controls physical voice allocation.
 * @param {Function} invoke Dispatch a rack method and its argument array.
 * @param {Object} options Timing and execution context callbacks.
 * @param {Function} options.sleep Await a duration in seconds.
 * @param {Function} options.bpm Read the current beats-per-minute value.
 * @param {Function} [options.check] Throw when the current run is cancelled.
 * @param {Function} [options.owner] Return the current live-loop ownership token.
 * @param {Function} [options.now] Read the scheduling clock in seconds.
 * @returns {Object} MIDI API with output handles, sound-chip mode selection and cleanup helpers.
 */
export declare function createMidiApi(invoke: Function, { sleep, bpm, check, owner, now }: {
    sleep: Function;
    bpm: Function;
    check?: Function;
    owner?: Function;
    now?: Function;
}): Object;
