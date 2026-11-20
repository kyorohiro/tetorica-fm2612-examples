/** Call from a user gesture. This function owns its context, endpoint and client. */
export declare function startDmgSidTimedExample(mode?: string): Promise<{
    audioContext: AudioContext;
    client: import("tetorica-fm2612/playground_sid.js").SidClient | (import("../../gameboysynth.js").GameboySynth & import("../../gameboy_timed_client.js").GameboyTimedApi & {
        setClock(hz: number): Promise<unknown>;
    });
    operations: Readonly<{
        version: 1;
        chip: 'gameboy';
        referenceSampleRate: number;
        operations: ReadonlyArray<{
            time: {
                unit: 'sample' | 'seconds';
                value: number;
            };
            order: number;
            method: string;
            args: ReadonlyArray<unknown>;
        }>;
    }> | import("../../sid_timed_client.js").SidOperationProgram;
    snapshot: Readonly<{
        format: 'tetorica-gameboy-state';
        version: 1;
        instanceId: string | number;
        frame: number;
        sampleRate: number;
        state: Readonly<{
            clock: number;
            initialized: boolean;
            registers: readonly number[];
            voice: readonly number[];
        }>;
    }> | import("../../sid_timed_client.js").SidStateSnapshot;
    writes: import("../../sid_timed_client.js").SidCompiledWrite[];
    reservation: import("../../sid_timed_client.js").SidScheduleReceipt;
    stop(): Promise<void>;
}>;
