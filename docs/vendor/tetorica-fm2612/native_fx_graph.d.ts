export type NativeFXGraphNode = {
    type: string;
    slot?: number;
    children?: NativeFXGraphNode[];
};
export type NativeFXGraphApi = {
    graph_begin: () => void;
    graph_add: (type: number, slot: number) => number;
    graph_append: (parent: number, child: number) => number;
    graph_commit: (root: number) => number;
};
/**
 * @typedef {{type: string, slot?: number, children?: NativeFXGraphNode[]}} NativeFXGraphNode
 * @typedef {{graph_begin: () => void, graph_add: (type: number, slot: number) => number,
 *   graph_append: (parent: number, child: number) => number,
 *   graph_commit: (root: number) => number}} NativeFXGraphApi
 */
/** @param {...NativeFXGraphNode} children Nodes processed in series.
 * @returns {NativeFXGraphNode} Serial-chain descriptor. */
export declare const branch: (...children: NativeFXGraphNode[]) => NativeFXGraphNode;
/** @param {...NativeFXGraphNode} children Branches whose outputs are summed.
 * @returns {NativeFXGraphNode} Parallel descriptor. */
export declare const parallel: (...children: NativeFXGraphNode[]) => NativeFXGraphNode;
/** @param {string} type Effect name in types.
 * @param {number} [slot=0] Effect instance slot (0..7).
 * @returns {NativeFXGraphNode} Effect descriptor; no audio resources are created. */
export declare const effect: (type: string, slot?: number) => NativeFXGraphNode;
export declare const types: {
    chain: number;
    parallel: number;
    gain: number;
    eq: number;
    gate: number;
    compressor: number;
    reverb: number;
    filter: number;
    delay: number;
    distortion: number;
    bitcrusher: number;
    wobble: number;
    flanger: number;
    slicer: number;
    chorus: number;
};
/**
 * Build and commit a native graph, wrapping children in a serial root.
 * @param {NativeFXGraphApi} api Native WASM graph exports.
 * @param {NativeFXGraphNode[]} children Ordered top-level descriptors.
 * @returns {void}
 * @throws {Error} For invalid graphs, repeated FX instances or the 32-node limit.
 */
export declare function setChain(api: NativeFXGraphApi, children: NativeFXGraphNode[]): void;
/** @returns {NativeFXGraphNode[]} Default extra effects in serial order, all in slot zero. */
export declare function extraChain(): NativeFXGraphNode[];
/** @param {'serial' | 'parallel' | 'dual' | 'extended'} mode Routing preset.
 * @returns {NativeFXGraphNode[]} Top-level descriptors ready for setChain.
 * @throws {Error} For an unknown routing mode. */
export declare function preset(mode: 'serial' | 'parallel' | 'dual' | 'extended'): NativeFXGraphNode[];
