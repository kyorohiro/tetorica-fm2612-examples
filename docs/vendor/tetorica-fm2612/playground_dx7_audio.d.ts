/**
 * Ready PCM source for the existing Playground mixer. Owns no AudioContext;
 * control commands use a direct transferable Main/Worker-to-Worklet port.
 * @param {AudioContext} context
 * @param {AudioNode|null} destination
 * @param {{signal?:AbortSignal,fetch?:typeof fetch,onError?:(error:Error)=>void}} [options]
 */
export declare function createDx7Audio(context: AudioContext, destination: AudioNode | null, options?: {
    signal?: AbortSignal;
    fetch?: typeof fetch;
    onError?: (error: Error) => void;
}): Promise<{
    node: AudioWorkletNode;
    port: MessagePort;
    sampleRate: any;
    internalSampleRate: any;
    voices: any;
    selectedVoice: any;
    dispose: () => void;
}>;
