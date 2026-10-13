/** Independent OPN client. All writes and memory uploads use one ordered port. */
import { YM2612Synth } from './ym2612synth.js';
import { YM2203Synth } from './ym2203synth.js';
import { NeoGeoFMSynth } from './ym2610bsynth.js';
/**
 * Create a high-level OPN synth backed by ordered Worklet port commands.
 * The client owns the port; dispose rejects pending requests and closes it.
 * @param {'ym2612' | 'ym2203' | 'ym2610'} name Chip family to expose.
 * @param {MessagePort} port Paired with the chip's audio processor.
 * @returns The chip-specific synth and its disposal/optional scheduling controls.
 * @throws {Error} For an unsupported chip name.
 */
export declare function createOpnClient(name: 'ym2612' | 'ym2203' | 'ym2610', port: MessagePort): (NeoGeoFMSynth | YM2203Synth | YM2612Synth) & {
    readonly clock: number;
    setClock(hz: number): Promise<void>;
};
