/** YM2612-specific resolution and RPC. Time/order/storage belong to Performance Queue.
 * No user functions cross this boundary; captures occur between complete batches.
 */
export declare function createYm2612TimedProcessor({ performance: timeline, getState, getConfig, dispatch, nowFrame, sampleRate, leadFrames }: {
    dispatch: any;
    getConfig: any;
    getState: any;
    leadFrames?: number | undefined;
    nowFrame: any;
    performance: any;
    sampleRate: any;
}): {
    receive(data: any, port: any): boolean;
    apply(operation: any, port: any, frame: any, metadata: any): void;
    clear(): void;
};
/** Observe the accepted native bus below keyboard guards and inspectors. This
 * includes direct register pairs, raw address/data calls, DAC and legacy writes.
 * No write is added or removed and no PCM generation is performed here. */
export declare function observeYm2612TimedChip(chip: any): {
    getState: () => import("./ym2612_operation_state.js").YM2612OperationState;
};
