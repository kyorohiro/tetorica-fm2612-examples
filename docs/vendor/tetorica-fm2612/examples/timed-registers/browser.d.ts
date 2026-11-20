export declare function startTimedExample(): Promise<{
    synth: import("../../gameboy_runtime_synth.js").GameboyRuntimeSynth | import("../../megasynth.js").MegaSynth | import("../../native_runtime_synth.js").NativeRuntimeSynth | import("../../ym2610bsynth.js").NeoGeoSynth | import("../../ym2203synth.js").YM2203RuntimeSynth | import("../../ym2608synth.js").YM2608RuntimeSynth | import("../../ym2610bsynth.js").YM2610BRuntimeSynth;
    psgWrites: any;
    opllWrites: any;
    stop(): Promise<void>;
}>;
