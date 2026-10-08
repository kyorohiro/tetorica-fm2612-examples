/** Independent OPN client. All writes and memory uploads use one ordered port. */
import { YM2612Synth } from './ym2612synth.js';
import { YM2203Synth } from './ym2203synth.js';
import { NeoGeoFMSynth } from './ym2610bsynth.js';
export declare function createOpnClient(name: any, port: any): NeoGeoFMSynth | YM2203Synth | YM2612Synth;
