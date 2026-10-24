/** NES + FDS controls for the callback-owned Native core; no audio bridge. */
import { NesApuSynth } from './nesapusynth.js';
export declare function createNativeGenesisNes(synth: any): {
    client: NesApuSynth;
    dispatch: (message: any, timing?: {}) => Promise<{
        id: any;
        value: boolean;
    } | undefined>;
    read: ({ after }?: {
        after?: number;
    }) => Promise<{
        kind: string;
        clock: any;
        sampleRate: number;
        fdsEnabled: boolean;
        activeSource: string;
        registers: number[];
        channels: ({
            channel: number;
            type: string;
            enabled: boolean;
            active: boolean;
            control: number;
            lengthIndex: number;
            lengthHalt: boolean;
            period: number;
        } | {
            channel: number;
            type: string;
            rate: number;
            loop: boolean;
            level: number;
            address: number;
            length: number;
            loaded: boolean;
            active: boolean;
            enabled: boolean;
        } | {
            channel: number;
            type: string;
            active: boolean;
            enabled: boolean;
            wave: number[];
            gain: any;
            master: any;
            period: number;
            frequency: number;
            modulation: {
                table: number[];
                rate: number;
                depth: number;
                bias: number;
                enabled: boolean;
            };
        })[];
        dmc: {
            channel: number;
            type: string;
            rate: number;
            loop: boolean;
            level: number;
            address: number;
            length: number;
            loaded: boolean;
            active: boolean;
            enabled: boolean;
        };
        fds: {
            channel: number;
            type: string;
            active: boolean;
            enabled: boolean;
            wave: number[];
            gain: any;
            master: any;
            period: number;
            frequency: number;
            modulation: {
                table: number[];
                rate: number;
                depth: number;
                bias: number;
                enabled: boolean;
            };
        } | null;
    }>;
    invoke(method: any, args?: any[]): Promise<any>;
    initialize(): void;
    mix(volume: any, pan: any): any;
    stopped(): void;
    adoptStopped(snapshot: any): {
        kind: string;
        clock: any;
        sampleRate: number;
        fdsEnabled: boolean;
        activeSource: string;
        registers: number[];
        channels: ({
            channel: number;
            type: string;
            enabled: boolean;
            active: boolean;
            control: number;
            lengthIndex: number;
            lengthHalt: boolean;
            period: number;
        } | {
            channel: number;
            type: string;
            rate: number;
            loop: boolean;
            level: number;
            address: number;
            length: number;
            loaded: boolean;
            active: boolean;
            enabled: boolean;
        } | {
            channel: number;
            type: string;
            active: boolean;
            enabled: boolean;
            wave: number[];
            gain: any;
            master: any;
            period: number;
            frequency: number;
            modulation: {
                table: number[];
                rate: number;
                depth: number;
                bias: number;
                enabled: boolean;
            };
        })[];
        dmc: {
            channel: number;
            type: string;
            rate: number;
            loop: boolean;
            level: number;
            address: number;
            length: number;
            loaded: boolean;
            active: boolean;
            enabled: boolean;
        };
        fds: {
            channel: number;
            type: string;
            active: boolean;
            enabled: boolean;
            wave: number[];
            gain: any;
            master: any;
            period: number;
            frequency: number;
            modulation: {
                table: number[];
                rate: number;
                depth: number;
                bias: number;
                enabled: boolean;
            };
        } | null;
    };
    reset(): void;
};
