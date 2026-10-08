/** Worker-owned dry FM capture and native sample playback for a session looper. */
export declare class MegaSynthPCMLooper {
    #private;
    constructor(engine: any, clock: any, maxSeconds?: number);
    startCapture: () => void;
    assertCanRender(frames: any): void;
    capture: (channels: any) => void;
    stopCapture: () => {
        audio: {
            name: string;
            frames: any;
            sampleRate: any;
        };
        audioDuration: number;
    } | null;
    schedulePlayback: (unit: any, startTime: any) => void;
    stopPlayback: (unit: any) => void;
    prune(units: any): void;
    exportAudio(unit: any): {
        sampleRate: any;
        channels: any;
    };
}
