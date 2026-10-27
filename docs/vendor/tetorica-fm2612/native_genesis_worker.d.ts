export declare function createNativeGenesisWorkerBridge({ synth, MessageChannelClass, onError, maxPending }: {
    MessageChannelClass?: {
        new (): MessageChannel;
        prototype: MessageChannel;
    } | undefined;
    maxPending?: number | undefined;
    onError?: (() => void) | undefined;
    synth: any;
}): {
    primaryPorts: any;
    port: MessagePort;
    chipPort: MessagePort;
    fxPort: MessagePort;
    pwmPort: MessagePort | null;
    pcmPort: MessagePort | null;
    dx7Port: MessagePort | null;
    nesPort: MessagePort | null;
    wonderswanPort: MessagePort | null;
    gameboyPort: MessagePort | null;
    snesPort: MessagePort | null;
    huc6280Port: MessagePort | null;
    ym2151Port: MessagePort | null;
    okim6258Port: MessagePort | null;
    segapsgPort: MessagePort | null;
    ym2413Port: MessagePort | null;
    ay8910Port: MessagePort | null;
    y8950Port: MessagePort | null;
    ym3526Port: MessagePort | null;
    ym3812Port: MessagePort | null;
    ymf262Port: MessagePort | null;
    attachEndpoint(dispatch: any, { cancelOwner, stop }?: {
        cancelOwner?: (() => void) | undefined;
        stop?: (() => void) | undefined;
    }): {
        port: MessagePort;
        controlPort: MessagePort;
        cancelOwner: () => void;
        stop: () => void;
        dispose(): void;
    };
    dispose(): Promise<any>;
};
