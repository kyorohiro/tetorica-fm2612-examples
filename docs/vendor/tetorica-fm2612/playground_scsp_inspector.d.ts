/** Slot editing, PCM copies and identity-safe manual Keyboard leases. */
export declare class ScspVoiceInspector {
    auditions: Map<any, any>;
    /** @param {import('./scspsynth.js').ScspSynth} synth
     * @param {import('./playground_native_voice_inspector.js').NativeVoiceInspectorOptions & {validate?:(command:any)=>void, readPCM?:(sample:any)=>any, editPCM?:(ch:number,pcm:any,options:any)=>any}} [options] */
    constructor(synth: import('./scspsynth.js').ScspSynth, { sampleRate, dispatch, validate, readPCM, editPCM, beginAudition, endAudition }?: import('./playground_native_voice_inspector.js').NativeVoiceInspectorOptions & {
        validate?: (command: any) => void;
        readPCM?: (sample: any) => any;
        editPCM?: (ch: number, pcm: any, options: any) => any;
    });
    read(): any;
    resetAuditions(): void;
    invoke(method: any, args?: any[]): any;
}
