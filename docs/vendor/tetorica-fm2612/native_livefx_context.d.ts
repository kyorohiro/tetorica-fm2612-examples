/** Portable context transport for the offline Native liveFx probe.
 * JSON carries a bounded object graph, never audio blocks or executable code.
 * Unsupported structured-clone types fail explicitly instead of changing shape.
 */
export declare function encodeNativeLiveFxContext(context: any, { maxBytes, maxNodes }?: {
    maxBytes?: number | undefined;
    maxNodes?: number | undefined;
}): {
    version: number;
    root: any;
    nodes: any[];
};
/** Self-contained so the exact decoder can run inside the embedded engine. */
export declare function decodeNativeLiveFxContext(graph: any, { maxBytes, maxNodes }?: {
    maxBytes?: number | undefined;
    maxNodes?: number | undefined;
}): any;
