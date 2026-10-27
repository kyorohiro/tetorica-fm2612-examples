import { PokeySynth } from './pokeysynth.js';
/** Offline authoring using the ordinary POKEY register/high-level API. No
 * audio is generated and adoptRegisterState() never inserts reset writes. */
export declare class PokeyTimelineBuilder extends PokeySynth {
    _timelineBuilderState: {
        sample: number;
        lastSample: number;
        length: number;
        capacity: number;
        data: Uint8Array<ArrayBuffer>;
        finished: boolean;
    };
    _timelinePackedData: Uint8Array<ArrayBuffer>;
    constructor({ clock, packedData }?: {
        clock?: number | undefined;
        packedData?: Uint8Array<ArrayBuffer> | undefined;
    });
    at(sample: any): this;
    /** Splice a prepacked run whose first delta is zero at the selected sample.
     * Validate the entire run before altering authored or packed output state. */
    packed(offset: any, length: any, count: any, endSample: any): this;
    finish(durationSamples: any): {
        version: number;
        clock: number;
        durationSamples: any;
        data: Uint8Array<any>;
    };
}
export declare function createPokeyTimelineBuilder(options: any): PokeyTimelineBuilder;
