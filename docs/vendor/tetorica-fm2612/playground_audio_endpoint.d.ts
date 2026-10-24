/** Post-ready failures must retire the current owner, including runtime mixer
 * and client/cache wrappers added after an audio factory returns. No polling.
 * @template {{node:AudioWorkletNode,dispose:()=>void}} Endpoint
 * @param {Endpoint} endpoint
 * @param {{context:BaseAudioContext,label:string,onError?:(error:Error)=>void}} [options]
 * @returns {Endpoint} */
export declare function watchAudioEndpoint<Endpoint extends {
    node: AudioWorkletNode;
    dispose: () => void;
}>(endpoint: Endpoint, { context, label, onError }?: {
    context: BaseAudioContext;
    label: string;
    onError?: (error: Error) => void;
}): Endpoint;
