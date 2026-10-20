/** Private adapter plumbing: retain a lease when a voice FIFO queues work. */
export declare function registerKeyboardScope(pg: any, getContext: any, setContext: any): void;
export declare function captureKeyboardCallback(pg: any, callback: any): any;
export declare function keyboardBinding(name: any, handlers: any): {
    name: string;
    handlers: {
        noteOn: any;
        noteOff: any;
        allNotesOff: any;
    };
};
export declare function musicalKeyboardEvent(event: any): {
    id: any;
    midi: any;
    velocity: any;
};
export declare function createMusicalKeyboard({ getContext, setContext, invoke, onChange, onError }: {
    getContext: any;
    invoke?: ((callback: any) => any) | undefined;
    onChange?: (() => void) | undefined;
    onError?: (() => void) | undefined;
    setContext: any;
}): {
    commit(definition: any, current?: () => boolean): Promise<void>;
    clear(): Promise<void>;
    readonly target: any;
    readonly session: any;
    settled: () => Promise<void>;
};
/** Restore an interactive lease after awaited chip RPCs without making sibling
 * liveLoops immediate. A retired lease cannot issue a late note or release. */
export declare function createKeyboardApiGuard(getContext: any, setContext: any): (object: any) => any;
