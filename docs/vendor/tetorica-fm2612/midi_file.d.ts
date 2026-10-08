/**
 * Read SMF format 0/1 with PPQN timing and apply its tempo map to event timestamps.
 * Channel numbers in this parsed representation are 1..16, unlike the 0..15 output API.
 * Parts are separated by track, port, device name and channel. Unsupported performance
 * messages are retained with warnings; parsing does not play or modify a sound chip.
 * @param {ArrayBuffer|Uint8Array} input Complete MIDI file (at most 32 MiB).
 * @returns {{format: number, division: number, events: Object[], parts: Object[], seconds: number, warnings: string[]}}
 *   Events sorted by tick/track/order, with seconds from the beginning of the file.
 * @throws {Error} For malformed data, unsupported timing/format or more than 500000 events.
 */
export declare function parseMidiFile(input: ArrayBuffer | Uint8Array): {
    format: number;
    division: number;
    events: Object[];
    parts: Object[];
    seconds: number;
    warnings: string[];
};
