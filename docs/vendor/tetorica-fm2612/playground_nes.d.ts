import { NesApuSynth } from './nesapusynth.js';
/** Same register generator as the public NES API; uploads await Worklet acknowledgement. */
/** @param {MessagePort} port Ordered Worklet command/acknowledgement port, owned by the client.
 * @param {{clock?: number, fdsEnabled?: boolean, state?:object,native?:boolean}} [options={}] Clock in Hz, FDS availability and an optional existing device snapshot.
 * @returns {NesApuSynth & {_stopVoices:()=>Promise<void>}} Synth whose dispose closes the port and rejects pending uploads. */
export declare function createNesClient(port: MessagePort, { clock, fdsEnabled, state, native }?: {
    clock?: number;
    fdsEnabled?: boolean;
    state?: object;
    native?: boolean;
}, lifecycle?: {}): NesApuSynth & {
    _stopVoices: () => Promise<void>;
};
