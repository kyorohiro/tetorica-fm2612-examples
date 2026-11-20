export declare const SID_TIMED_STATE_FORMAT = "tetorica-sid-state";
export declare const SID_TIMED_STATE_VERSION = 1;
/** Detached operation-resolution baseline; not an audio/C64 save state. */
/** @param {any} state
 * @param {{instanceId:string|number,frame:number,sampleRate:number}} [options]
 * @returns {import('./sid_timed_client.js').SidStateSnapshot}
 */
export declare function createSidTimedSnapshot(state: any, { instanceId, frame, sampleRate }?: {
    instanceId: string | number;
    frame: number;
    sampleRate: number;
}): import('./sid_timed_client.js').SidStateSnapshot;
export declare function validateSidTimedSnapshot(snapshot: any, expected?: {}): import("./sid_timed_client.js").SidStateSnapshot;
