/**
 * Resolve import selections into concrete MIDI routes without mutating the selections.
 * A missing destination skips a part. A missing channel chooses an unused channel at
 * import time, preferring sourceChannel; this does not select a physical chip voice.
 * Explicitly shared channels also share voice/controller state during playback.
 * @param {Object[]} selections Part routes with part, destination and optional channel/sourceChannel (0..15).
 * @returns {Object[]} Included route copies with a concrete channel (0..15).
 * @throws {Error} For duplicate parts, invalid destinations/channels or exhausted auto channels.
 */
export declare function assignMidiRoutes(selections: Object[]): Object[];
/**
 * Compile SMF parts to editable noteOn/noteOff/controller calls and sleepSamples waits.
 * Waits include MIDI tempo changes and use the 44100 Hz VGM timeline, not device frames.
 * @param {ArrayBuffer|Uint8Array} bytes Complete Standard MIDI File.
 * @param {Object[]} routes Resolved routes from assignMidiRoutes(), including preset and bendRange.
 * @param {Object} [options={}] Source-generation settings.
 * @param {string} [options.name="MIDI"] Display name included in a generated comment.
 * @param {Object} [options.presets={}] Available FM presets indexed by name.
 * @param {boolean} [options.module=false] Export initCh/runCh/runAllCh helpers instead of top-level playback.
 * @returns {string} JavaScript source, ending in a newline; no audio is rendered here.
 * @throws {Error} For invalid MIDI/routes/presets or source exceeding the size limit.
 */
export declare function midiToSource(bytes: ArrayBuffer | Uint8Array, routes: Object[], { name, presets, module }?: {
    name?: string;
    presets?: Object;
    module?: boolean;
}): string;
