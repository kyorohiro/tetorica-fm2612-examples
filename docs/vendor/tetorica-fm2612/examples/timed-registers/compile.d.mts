export declare function runCompileExample(): {
    psgWrites: ({
        offsetSeconds: number;
        operationIndex: number;
        writeIndex: number;
    } & ({
        value: number;
        register: number;
        channel: number;
    } | {
        stereo: number;
    }))[];
    opllWrites: {
        offsetSeconds: number;
        register: number;
        value: number;
        operationIndex: number;
        writeIndex: number;
        intentMask?: number;
    }[];
    comparison: {
        offsetSeconds: number;
        register: number;
        value: number;
        operationIndex: number;
        writeIndex: number;
        intentMask?: number;
    }[];
};
