import { NesApuSynth } from './nesapusynth.js';
/** Same register generator as the public NES API; uploads await Worklet acknowledgement. */
/** @param {MessagePort} port Ordered Worklet command/acknowledgement port, owned by the client.
 * @param {{clock?: number, fdsEnabled?: boolean}} [options={}] Clock in Hz and FDS availability.
 * @returns {NesApuSynth} Synth whose dispose closes the port and rejects pending uploads. */
export declare function createNesClient(port: MessagePort, { clock, fdsEnabled }?: {
    clock?: number;
    fdsEnabled?: boolean;
}): NesApuSynth;
