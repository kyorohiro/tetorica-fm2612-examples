/** Worklet-local ownership for the UI keyboard on one shared OPN chip.
 * Script patch/FX writes remain live; only pitch/key writes to held channels
 * are suppressed. Commands use physical chip channels (Neo Geo maps in host).
 */
export declare function createOpnAuditionGuard(chip: any, channelCount?: number): {
    /** Return false for unrelated commands. Invalid audition data throws before
     * changing claims or chip state; the processor reports that error to host. */
    handle(command: any): boolean;
};
/** Dispatch private UI commands without turning malformed input into a crashed
 * AudioWorklet. The normal chip protocol remains unchanged. */
export declare function receiveOpnAuditionCommand(guard: any, command: any, reply: any): boolean;
