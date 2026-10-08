/**
 * @file Worker / Node.js: DAC bank preparation and sample-relative commands.
 * AudioWorklet owns the audio-clock origin and performs timed register writes.
 */
export declare function createWorkerDac(send: any, { lookaheadSeconds }?: {
    lookaheadSeconds?: number | undefined;
}): {
    api: {
        load(name: any, data: any): Promise<void>;
        loadBase64(name: any, encoded: any): Promise<void>;
        playStream(name: any, { atSamples }?: {
            atSamples?: number | undefined;
        }): void;
        schedule(start: any, entries: any): void;
        scheduleBase64(start: any, encoded: any): void;
    };
    begin: () => any;
    schedule: (start: any, entries: any) => void;
    setLookahead(value: any): void;
    reset(): void;
};
