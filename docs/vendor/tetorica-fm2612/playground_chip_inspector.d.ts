/** UI-only admin port access. Audio creation and Worker-owned ports are deliberately untouched. */
export declare function createChipInspector({ endpoints, decode }: {
    decode: any;
    endpoints: any;
}): {
    list: () => any;
    notify: () => void;
    subscribe(listener: any): () => boolean;
    read(id: any): Promise<any>;
    invoke(id: any, method: any, args?: any[]): Promise<any>;
    loadSample(id: any, source: any, options?: {}): Promise<any>;
    dispose(): void;
};
