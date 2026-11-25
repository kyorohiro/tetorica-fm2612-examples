/** Worklet-local ownership for the UI keyboard on one shared OPN chip.
 * Script patch/FX writes remain live; only pitch/key writes to held channels
 * are suppressed. Commands use physical chip channels (Neo Geo maps in host).
 */
export declare function createOpnAuditionGuard(chip: any, channelCount?: number): {
    /** Explicit sample-timed edits follow application order. A new Key On
     * claims the voice, invalidating the old manual key-up token. Parameter
     * and pitch writes retain that token; an old scheduled Off cannot release
     * a currently held manual replacement. Ordinary script writes keep their
     * existing keyboard-priority path above. */
    writeTimedRegister(register: any, value: any, port?: number, releasingGate?: boolean): boolean;
    /** Return false for unrelated commands. Invalid audition data throws before
     * changing claims or chip state; the processor reports that error to host. */
    handle(command: any): boolean;
};
/** Dispatch private UI commands without turning malformed input into a crashed
 * AudioWorklet. The normal chip protocol remains unchanged. */
export declare function receiveOpnAuditionCommand(guard: any, command: any, reply: any): boolean;
/** Shared Genesis PSG bus ownership. Script latch/data continuations retain
 * their own destination while an inspector changes the physical chip latch.
 * Install after the applied-state observer, so blocked bytes never enter it.
 * @param {{write:(byte:number)=>unknown,reset:()=>unknown}} chip
 * @param {{getState:()=>{latched:number,mode:number,periods:number[]}}} options
 */
export declare function createPsgAuditionGuard(chip: {
    write: (byte: number) => unknown;
    reset: () => unknown;
}, { getState }: {
    getState: () => {
        latched: number;
        mode: number;
        periods: number[];
    };
}): {
    begin(channel: any, owner: any): void;
    end(channel: any, owner: any): void;
    apply(command: any, owner: any): unknown;
    clear(): void;
};
