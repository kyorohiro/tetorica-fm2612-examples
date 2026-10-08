export declare function createThreadOutput(options: any): Promise<{
    frames: undefined;
    readonly queuedFrames: number;
    write(pcm: any): void;
    start: () => Promise<any>;
    stop(): Promise<void>;
    getState: () => any;
    close(): any;
}>;
