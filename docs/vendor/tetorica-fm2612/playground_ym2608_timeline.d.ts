/** Audio-thread timeline: VGM positions are 44100 Hz samples, not output frames. */
export declare class Ym2608Timeline {
    engine: any;
    sampleRate: any;
    prepared: {
        events: any[][];
        blocks: any[];
        duration: any;
    } | null;
    active: {
        events: any[][];
        blocks: any[];
        duration: any;
        frame: number;
        index: number;
        reply: any;
    } | null;
    constructor(engine: any, sampleRate: any);
    prepare(events: any, blocks: any, duration: any): void;
    play(reply: any): void;
    cancel(): void;
    dispose(): void;
    process(left: any, right: any): void;
}
