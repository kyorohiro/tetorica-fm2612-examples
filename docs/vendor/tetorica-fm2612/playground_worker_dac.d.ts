/**
 * @file Worker / Node.js: DAC bank preparation and sample-relative commands.
 * AudioWorklet owns the audio-clock origin and performs timed register writes.
 */
/** @param {(command: Record<string, unknown>) => void} send Ordered chip-port sender.
 * @param {{lookaheadSeconds?: number}} [options={}] Initial scheduling lead time in seconds.
 * @returns DAC bank preparation and 44100-Hz sample-relative register scheduling helpers. */
export declare function createWorkerDac(send: (command: Record<string, unknown>) => void, { lookaheadSeconds }?: {
    lookaheadSeconds?: number;
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
    begin: () => void;
    schedule: (start: any, entries: any) => void;
    setLookahead(value: any): void;
    reset(): void;
};
