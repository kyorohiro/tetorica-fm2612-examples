/** Render-driven timers. No wall-clock timers, DOM or audio device dependency. */
export declare class SampleClock {
    #private;
    constructor(sampleRate: any, currentFrame: any);
    get pendingCount(): number;
    get nextFrame(): number;
    setTimer: (callback: any, delayMs: any) => number;
    atFrame(frame: any, callback: any): number;
    clearTimer: (id: any) => void;
    clear(): void;
    runDue(): Promise<void>;
}
