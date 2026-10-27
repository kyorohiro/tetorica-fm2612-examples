import { YM2612Synth } from './ym2612synth.js';
import { SoundChipMixer } from './soundchip_mixer.js';
/** Explicit timing interface, independent of an AudioContext or an AudioNode.
 * Between acknowledgements, time follows the monotonic host clock. A native
 * status acknowledgement reanchors it; no UI/audio polling is needed. */
declare class NativeAudioClock extends EventTarget {
    now: any;
    anchorMs: any;
    anchorSeconds: number;
    sampleRate: number;
    state: string;
    constructor(now: any);
    get currentTime(): number;
    update(status: any, anchorMs: any, reset?: boolean): void;
    setState(value: any): void;
}
/** Genesis / Mega-CD native audio owner for the existing Playground runtime.
 * `invoke` is a captured Tauri command transport, injected by the host. Import
 * and construction open no audio devices. Continuous rendering/output stays
 * native; uploads, requested monitor snapshots and recording retrieval are
 * explicit data transfers rather than a playback PCM bridge.
 * Web Audio remains the application's default and supports the full feature set.
 */
export declare class NativeGenesisSynth {
    invoke: (command: string, args?: object) => Promise<any>;
    now: () => number;
    onError: (error: Error) => void;
    pokeyMode: boolean;
    dualPokey: boolean;
    wonderswanMode: boolean;
    wonderswanClock: number;
    backend: string;
    consoleKind: string | null;
    snesMode: boolean;
    gameGearMode: boolean;
    oplMode: boolean;
    msxMode: boolean;
    msxAudioMode: boolean;
    masterSystemMode: boolean;
    x68000Mode: boolean;
    ym2203Mode: boolean;
    opnaMode: boolean;
    opnbMode: boolean;
    nesMode: boolean;
    dx7Mode: boolean;
    primaryMode: boolean;
    chip: string | undefined;
    mode: string | undefined;
    nukedMode: boolean;
    engine: string | undefined;
    pwmMode: boolean;
    megaCD: boolean;
    capabilities: Readonly<{
        chip: string | undefined;
        fmChannels: 0 | 3 | 4 | 6;
        psg: boolean;
        dac: boolean;
        pcm: boolean;
        pwm: boolean;
        recorder: true;
        worker: true;
        noise: true;
        dynamicSoundChips: false;
        dynamicSoundChipKinds: readonly string[];
        backend: "native-genesis";
        engine?: string | undefined;
    }>;
    clock: NativeAudioClock;
    outputMonitor: {
        backend: string;
        isReady: any;
        getSession: any;
        read({ mode, channel }: {
            channel: any;
            mode: any;
        }): Promise<{
            session: any;
            frame: any;
            sampleRate: any;
            frames: any;
            rms: any;
            peak: any;
        } | null>;
        pause(): any;
    };
    audioContext: any;
    node: any;
    audio: any;
    state: string;
    session: any;
    generation: number;
    pending: any[];
    acceptedCommands: number;
    acceptedPcmBytes: number;
    acceptedRequests: number;
    serial: Promise<void>;
    flushQueued: boolean;
    starting: Promise<this> | null;
    stopping: Promise<void> | null;
    closing: Promise<void> | null;
    error: unknown;
    workerSampleOrigin: any;
    listeners: Set<any>;
    mixer: SoundChipMixer;
    mixerReleases: any[];
    extraDevices: Map<any, any>;
    extraPokeyDevices: Map<any, any>;
    extraWonderSwanDevices: Map<any, any>;
    extraSpcDevices: Map<any, any>;
    extraSnesDevices: Map<any, any>;
    extraPwmDevices: Map<any, any>;
    extraDx7Devices: Map<any, any>;
    extraHuc6280Devices: Map<any, any>;
    extraNesDevices: Map<any, any>;
    extraGameboyDevices: Map<any, any>;
    extraOkim6258Devices: Map<any, any>;
    extraRf5c164Devices: Map<any, any>;
    extraPsgDevices: Map<any, any>;
    extraYm2612Devices: Map<any, any>;
    extraYm2203Devices: Map<any, any>;
    extraYm2608Devices: Map<any, any>;
    extraYm2610Devices: Map<any, any>;
    extraYm2610BDevices: Map<any, any>;
    extraYm2151Devices: Map<any, any>;
    extraYm2413Devices: Map<any, any>;
    extraAy8910Devices: Map<any, any>;
    extraOplDevices: Map<any, any>;
    nextExtraChipInstance: number;
    extraRf5c164Options: {
        decodeAudio: ((bytes: ArrayBuffer) => Promise<any>) | undefined;
        fetcher: typeof fetch;
    };
    liveFxDiagnostics: {
        readonly status: Readonly<{
            active: 0;
            initialized: false;
            latencyFrames: 0;
            blockFrames: 128;
            underruns: 0;
            overruns: 0;
            queuedCommands: 0;
            error: null;
        }>;
        observe: (status: any, revision?: number) => void;
        track(): void;
        reset(): void;
        poll: () => Promise<void>;
    };
    masterVolume: number;
    listeningVolume: number;
    auditions: Map<any, any>;
    psgAuditions: Map<any, any>;
    psgLevels: Uint8Array<ArrayBuffer>;
    psgLatch: number;
    mix: {
        fmLeft: number;
        fmRight: number;
        psgLeft: number;
        psgRight: number;
        master: number;
        gainUnits?: string | undefined;
    };
    media: {
        sample: {
            load(name: any, source: any): Promise<any>;
            play(name: any, options?: {}): Promise<{
                name: any;
                stop: () => void;
            }>;
            stop(name: any): void;
            stopAll(): void;
            unload: (name: any) => any;
            isLoaded: (name: any) => boolean;
            get: (name: any) => any;
            list: () => any[];
        };
        dacCommand: (command: any, timing?: {}) => Promise<void>;
        dispatchSample(message: any, timing?: {}): Promise<{
            op: string;
            id: any;
            value: number | undefined;
            error?: undefined;
        } | {
            value?: undefined;
            op: string;
            id: any;
            error: string;
        }>;
        loadDacBank(name: any, bytes: any): Promise<any>;
        playDacBank(name: any, time: any, timing?: {}): Promise<void>;
        startRecording({ seconds }?: {
            seconds?: number | undefined;
        }): Promise<void>;
        stopRecording(): Promise<any>;
        stopped(): void;
        reset(): void;
    };
    fxBeatSeconds: () => number;
    fx: {
        liveFx(name: string, { process, context, resetState }?: {
            process: (input: Float32Array[], output: Float32Array[], state: Record<string, unknown>, context: Record<string, unknown>) => void;
            context?: Record<string, unknown>;
            resetState?: boolean;
        }): void;
        updateContext(name: any, context: any): void;
        removeLiveFx(name: any): void;
        branch: (...children: any[]) => {
            type: string;
            children: any[];
            owner: /*elided*/ any;
            dispose(): void;
        };
        parallel: (...children: any[]) => {
            type: string;
            children: any[];
            owner: /*elided*/ any;
            dispose(): void;
        };
        setChain(effects?: any[]): any[];
        clear({ dispose }?: {
            dispose?: boolean | undefined;
        }): any[];
        dispose(): void;
        getChain(): any[];
        syncTempo(): void;
    } | null;
    nativeOpna: {
        client: import("./ym2608synth.js").YM2608Synth;
        dispatch: (message: any, timing?: {}) => Promise<{
            type: string;
            id: any;
            clock: number;
        } | {
            clock?: undefined;
            id: any;
            type?: string | undefined;
            value?: boolean | undefined;
        } | undefined>;
        read: (args?: {}) => Promise<any>;
        auditionNoteOn: (channel: any, block: any, fnum: any, voice: any) => Promise<void>;
        auditionNoteOff: (channel: any, voice: any) => Promise<void>;
        invoke(method: any, args?: any[]): Promise<any>;
        initialize(): Promise<any>;
        loadSample(source: any, options?: {}): Promise<{
            start: number;
            end: number;
            frames: number;
            paddedFrames: number;
            sampleRate: number;
            deltaN: number;
            duration: number;
            name?: any;
        }>;
        mix(volume: any, pan: any): Promise<void>;
        stopped: () => void;
        adoptStopped(data: any): any;
        reset(): void;
    } | null;
    nativeOpnb: {
        client: import("./ym2610bsynth.js").NeoGeoFMSynth | import("./ym2610bsynth.js").YM2610BSynth;
        dispatch: (message: any, timing?: {}) => Promise<{
            type: string;
            id: any;
            clock: number;
        } | {
            clock?: undefined;
            id: any;
            type?: string | undefined;
            value?: boolean | undefined;
        } | undefined>;
        read: (args?: {}) => Promise<any>;
        auditionNoteOn: (channel: any, block: any, fnum: any, voice: any) => Promise<void>;
        auditionNoteOff: (channel: any, voice: any) => Promise<void>;
        invoke(method: any, args?: any[]): Promise<any>;
        initialize(): Promise<any>;
        loadSample(source: any, options?: {}): Promise<any>;
        mix(volume: any, pan: any): Promise<void>;
        stopped: () => void;
        adoptStopped(data: any): any;
        reset(): void;
    } | null;
    nativeYm2203: {
        client: import("./ym2203synth.js").YM2203Synth;
        dispatch: (message: any, timing?: {}) => Promise<any>;
        read: (args?: {}) => Promise<any>;
        invoke: (method: any, args?: any[]) => Promise<any>;
        auditionNoteOn: (channel: any, block: any, fnum: any, voice: any) => Promise<void>;
        auditionNoteOff: (channel: any, voice: any) => Promise<void>;
        initialize(): Promise<void>;
        mix(volume?: number, pan?: number): Promise<void>;
        stopped: () => void;
        adoptStopped(data: any): any;
        reset(): void;
    } | null;
    nativeOpn: {
        client: import("./ym2608synth.js").YM2608Synth;
        dispatch: (message: any, timing?: {}) => Promise<{
            type: string;
            id: any;
            clock: number;
        } | {
            clock?: undefined;
            id: any;
            type?: string | undefined;
            value?: boolean | undefined;
        } | undefined>;
        read: (args?: {}) => Promise<any>;
        auditionNoteOn: (channel: any, block: any, fnum: any, voice: any) => Promise<void>;
        auditionNoteOff: (channel: any, voice: any) => Promise<void>;
        invoke(method: any, args?: any[]): Promise<any>;
        initialize(): Promise<any>;
        loadSample(source: any, options?: {}): Promise<{
            start: number;
            end: number;
            frames: number;
            paddedFrames: number;
            sampleRate: number;
            deltaN: number;
            duration: number;
            name?: any;
        }>;
        mix(volume: any, pan: any): Promise<void>;
        stopped: () => void;
        adoptStopped(data: any): any;
        reset(): void;
    } | {
        client: import("./ym2203synth.js").YM2203Synth;
        dispatch: (message: any, timing?: {}) => Promise<any>;
        read: (args?: {}) => Promise<any>;
        invoke: (method: any, args?: any[]) => Promise<any>;
        auditionNoteOn: (channel: any, block: any, fnum: any, voice: any) => Promise<void>;
        auditionNoteOff: (channel: any, voice: any) => Promise<void>;
        initialize(): Promise<void>;
        mix(volume?: number, pan?: number): Promise<void>;
        stopped: () => void;
        adoptStopped(data: any): any;
        reset(): void;
    } | {
        client: import("./ym2610bsynth.js").NeoGeoFMSynth | import("./ym2610bsynth.js").YM2610BSynth;
        dispatch: (message: any, timing?: {}) => Promise<{
            type: string;
            id: any;
            clock: number;
        } | {
            clock?: undefined;
            id: any;
            type?: string | undefined;
            value?: boolean | undefined;
        } | undefined>;
        read: (args?: {}) => Promise<any>;
        auditionNoteOn: (channel: any, block: any, fnum: any, voice: any) => Promise<void>;
        auditionNoteOff: (channel: any, voice: any) => Promise<void>;
        invoke(method: any, args?: any[]): Promise<any>;
        initialize(): Promise<any>;
        loadSample(source: any, options?: {}): Promise<any>;
        mix(volume: any, pan: any): Promise<void>;
        stopped: () => void;
        adoptStopped(data: any): any;
        reset(): void;
    } | null;
    fm: import("./ym2610bsynth.js").NeoGeoFMSynth | import("./ym2203synth.js").YM2203Synth | import("./ym2608synth.js").YM2608Synth | import("./ym2610bsynth.js").YM2610BSynth | YM2612Synth | null;
    psg: any;
    sample: {
        load(name: any, source: any): Promise<any>;
        play(name: any, options?: {}): Promise<{
            name: any;
            stop: () => void;
        }>;
        stop(name: any): void;
        stopAll(): void;
        unload: (name: any) => any;
        isLoaded: (name: any) => boolean;
        get: (name: any) => any;
        list: () => any[];
    };
    nativePcm: {
        client: {
            id: string;
            loadMemory(bytes: any, address?: number): any;
            loadSample(source: any, { address, loopStart, endGuardBytes }?: {
                address?: number;
                loopStart?: number;
                endGuardBytes?: number;
            }): Promise<{
                start: number;
                loopStart: any;
                step: number;
            }>;
            setChannel: (channel: any, options: any) => any;
            setPitch: (channel: any, step: any) => any;
            keyOn: (channel: any) => any;
            keyOff: (channel: any) => any;
            writeRegister: (register: any, value: any) => any;
            reset: () => any;
            setClock(hz: any): Promise<void>;
            dispose(): void;
        };
        dispatch(message: any, timing?: {}): Promise<void>;
        read(): Promise<{
            memoryRevision: number;
            samples: any[];
            memoryRanges: any[];
            auditions: {
                channel: any;
                id: any;
            }[];
            clock: any;
            sampleRate: any;
            channels: any;
            enabled: any;
            mask: any;
            selected: any;
            frame: any;
            kind: string;
        }>;
        invoke(method: any, args?: any[]): Promise<boolean>;
        loadSample(source: any, options?: {
            name?: string;
            address?: number;
            loopStart?: number;
        }): Promise<{
            name: string;
            frames: number | undefined;
            step: number | undefined;
            waveform: number[];
            endGuardBytes?: number | undefined;
            address: any;
            end: any;
            loopStart: any;
            valid: boolean;
            start: any;
        }>;
        stopped(): void;
        reset(): void;
    } | null;
    pcm: {
        id: string;
        loadMemory(bytes: any, address?: number): any;
        loadSample(source: any, { address, loopStart, endGuardBytes }?: {
            address?: number;
            loopStart?: number;
            endGuardBytes?: number;
        }): Promise<{
            start: number;
            loopStart: any;
            step: number;
        }>;
        setChannel: (channel: any, options: any) => any;
        setPitch: (channel: any, step: any) => any;
        keyOn: (channel: any) => any;
        keyOff: (channel: any) => any;
        writeRegister: (register: any, value: any) => any;
        reset: () => any;
        setClock(hz: any): Promise<void>;
        dispose(): void;
    } | null;
    nativeDx7: {
        client: {
            id: string;
            internalSampleRate: number;
            readonly sampleRate: any;
            readonly voices: any;
            readonly selectedVoice: any;
            _getState: () => {
                sampleRate: any;
                internalSampleRate: number;
                voices: any;
                selectedVoice: any;
                stateRevision: any;
            };
            _onStateChange(listener: any): () => boolean;
            _adoptState(): boolean;
            _stopVoices(): Promise<import("./msfa_dx7/src/preset.js").DX7PresetState | {
                sampleRate: any;
                internalSampleRate: number;
                voices: any;
                selectedVoice: any;
                stateRevision: any;
            } | undefined>;
            getState(): Promise<import("./msfa_dx7/src/preset.js").DX7PresetState | {
                sampleRate: any;
                internalSampleRate: number;
                voices: any;
                selectedVoice: any;
                stateRevision: any;
            } | undefined>;
            loadSysex(bytes: any): Promise<any>;
            setPreset(preset: any): Promise<void>;
            setOperator(operator: any, params: any): Promise<void>;
            setOperators(entries: any): Promise<void>;
            setFeedback(value: any): Promise<void>;
            getPreset(): Promise<import("./msfa_dx7/src/preset.js").DX7PresetState | {
                sampleRate: any;
                internalSampleRate: number;
                voices: any;
                selectedVoice: any;
                stateRevision: any;
            } | undefined>;
            selectVoice(index: any): void;
            noteOn(note: any, velocity?: number): void;
            noteOff(note: any): void;
            allNotesOff(): void;
            panic(): void;
            dispose(): void;
        };
        dispatch(message: any, timing?: {}): Promise<{
            id: any;
            value: import("./msfa_dx7/src/preset.js").DX7PresetState | {
                sampleRate: any;
                internalSampleRate: number;
                voices: any;
                selectedVoice: any;
                stateRevision: any;
            } | undefined;
        } | undefined>;
        read(): Promise<{
            kind: string;
            sampleRate: number;
            internalSampleRate: number;
            polyphony: number;
            selectedVoice: number;
            voices: any;
            preset: import("./msfa_dx7/src/preset.js").DX7PresetState;
            activeSource: string;
            activeNotes: {
                midi: any;
                velocity: any;
                manual: boolean;
            }[];
            auditions: {
                channel: number;
                midi: any;
                id: any;
            }[];
            logical: {
                selectedVoice: number;
                voices: any;
                preset: import("./msfa_dx7/src/preset.js").DX7PresetState;
                pendingCommands: number;
            };
        }>;
        invoke(method: any, args?: any[]): Promise<any>;
        mix(volume: any, pan: any): Promise<void>;
        performance(request: any): Promise<void>;
        stopped(): void;
        adoptStopped(snapshot: any): void;
        reset(): void;
        dispose(): void;
    } | null;
    dx7: {
        id: string;
        internalSampleRate: number;
        readonly sampleRate: any;
        readonly voices: any;
        readonly selectedVoice: any;
        _getState: () => {
            sampleRate: any;
            internalSampleRate: number;
            voices: any;
            selectedVoice: any;
            stateRevision: any;
        };
        _onStateChange(listener: any): () => boolean;
        _adoptState(): boolean;
        _stopVoices(): Promise<import("./msfa_dx7/src/preset.js").DX7PresetState | {
            sampleRate: any;
            internalSampleRate: number;
            voices: any;
            selectedVoice: any;
            stateRevision: any;
        } | undefined>;
        getState(): Promise<import("./msfa_dx7/src/preset.js").DX7PresetState | {
            sampleRate: any;
            internalSampleRate: number;
            voices: any;
            selectedVoice: any;
            stateRevision: any;
        } | undefined>;
        loadSysex(bytes: any): Promise<any>;
        setPreset(preset: any): Promise<void>;
        setOperator(operator: any, params: any): Promise<void>;
        setOperators(entries: any): Promise<void>;
        setFeedback(value: any): Promise<void>;
        getPreset(): Promise<import("./msfa_dx7/src/preset.js").DX7PresetState | {
            sampleRate: any;
            internalSampleRate: number;
            voices: any;
            selectedVoice: any;
            stateRevision: any;
        } | undefined>;
        selectVoice(index: any): void;
        noteOn(note: any, velocity?: number): void;
        noteOff(note: any): void;
        allNotesOff(): void;
        panic(): void;
        dispose(): void;
    } | null;
    nativeNes: {
        client: import("./nesapusynth.js").NesApuSynth;
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
    } | null;
    nes: import("./nesapusynth.js").NesApuSynth | null;
    nativeWonderSwan: {
        client: import("./wonderswansynth.js").WonderSwanSynth;
        dispatch: (message: any, timing?: {}) => any;
        read: (args?: {}) => Promise<any>;
        invoke: (method: any, args?: any[]) => Promise<any>;
        cancelOwner: (performance: any, owner: any) => void;
        cancelPerformance: (performance: any) => void;
        initialize(): Promise<void>;
        mix(volume?: number, pan?: number): Promise<void>;
        stopped(): void;
        adoptStopped(data: any): void;
        reset(): void;
    } | null;
    ws: import("./wonderswansynth.js").WonderSwanSynth | null;
    wonderswan: import("./wonderswansynth.js").WonderSwanSynth | null;
    primaryPokey: {
        client: import("./pokeysynth.js").PokeySynth;
        dispatch: (message: any, timing?: {}) => Promise<{
            id: any;
            value: any;
        } | undefined> | {
            deferred: Promise<{
                id: any;
                value: any;
            } | undefined>;
        };
        read: (args?: {}) => Promise<any>;
        invoke: (method: any, args?: any[]) => Promise<any>;
        cancelOwner: (performance: any, owner: any) => void;
        cancelPerformance: (performance: any) => void;
        stopped(): void;
        adoptStopped(): void;
        initialized: boolean;
        id: string;
        globalName: string;
        mix(volume?: number, pan?: number): Promise<void>;
        initialize(): Promise<void>;
        restoreAfterStop(session: any): Promise<void>;
        reset(): void;
    }[];
    pokey: import("./pokeysynth.js").PokeySynth;
    pokey2: import("./pokeysynth.js").PokeySynth;
    nativeConsole: {
        client: import("./gameboysynth.js").GameboySynth | import("./huc6280synth.js").Huc6280Synth;
        dispatch: (message: any, timing?: {}) => Promise<{
            id: any;
            value: boolean;
        } | undefined>;
        read: ({ after }?: {
            after?: number;
        }) => Promise<import("./playground_native_voice_inspector.js").GameboyVoiceSnapshot | {
            kind: string;
            clock: number;
            sampleRate: number;
            activeSource: string;
            selectedChannel: number | undefined;
            masterVolume: {
                left: number;
                right: number;
            };
            lfo: {
                frequency: number;
                depth: number;
                reset: boolean;
            };
            globals: number[];
            channels: {
                channel: number;
                type: string;
                active: boolean;
                enabled: boolean;
                dda: boolean;
                ddaValue: number;
                volume: number;
                pan: {
                    left: number;
                    right: number;
                };
                period: number;
                frequency: number;
                waveform: number[];
                waveformKnown: boolean;
                waveformPointer: number | null;
                noise: {
                    enabled: boolean;
                    frequency: number;
                } | null;
                registers: number[];
            }[];
        }>;
        invoke(method: any, args?: any[]): Promise<any>;
        initialize(): void;
        mix(volume: any, pan: any): any;
        stopped(): void;
        adoptStopped(snapshot: any): import("./playground_native_voice_inspector.js").GameboyVoiceSnapshot | {
            kind: string;
            clock: number;
            sampleRate: number;
            activeSource: string;
            selectedChannel: number | undefined;
            masterVolume: {
                left: number;
                right: number;
            };
            lfo: {
                frequency: number;
                depth: number;
                reset: boolean;
            };
            globals: number[];
            channels: {
                channel: number;
                type: string;
                active: boolean;
                enabled: boolean;
                dda: boolean;
                ddaValue: number;
                volume: number;
                pan: {
                    left: number;
                    right: number;
                };
                period: number;
                frequency: number;
                waveform: number[];
                waveformKnown: boolean;
                waveformPointer: number | null;
                noise: {
                    enabled: boolean;
                    frequency: number;
                } | null;
                registers: number[];
            }[];
        };
        reset(): void;
    } | null;
    gameboy: import("./gameboysynth.js").GameboySynth | import("./huc6280synth.js").Huc6280Synth | null;
    huc6280: import("./gameboysynth.js").GameboySynth | import("./huc6280synth.js").Huc6280Synth | null;
    pce: import("./gameboysynth.js").GameboySynth | import("./huc6280synth.js").Huc6280Synth | null;
    nativeSnes: {
        client: {
            id: string;
            sampleRate: number;
            nativeSampleRate: number;
            _getState: () => import("./snessynth.js").SnesState;
            _adoptState(state: any): void;
            _stopVoices: () => any;
            dispose(): void;
            loadBRR(input: any, options: any): Promise<any>;
            readDsp(register: any): Promise<any>;
            getState(): Promise<import("./snessynth.js").SnesState>;
            getPreset(channel: any): Promise<import("./snessynth.js").SnesVoiceState>;
            snapshot(): Promise<{
                ram: Uint8Array<ArrayBuffer>;
                dsp: Uint8Array<ArrayBuffer>;
                nativeFrames: any;
            }>;
            prepareTimeline: (trace: any) => Promise<any>;
            playTimeline: () => Promise<any>;
            stopTimeline: () => Promise<any>;
            getTimelineState(): Promise<any>;
        };
        dispatch: (message: any, timing?: {}) => any;
        read: (args?: {}) => Promise<{
            kind: string;
            sampleRate: number;
            nativeSampleRate: number;
            activeSource: string;
            samples: import("./snessynth.js").SnesSample[];
            channels: {
                sample: any;
                adsr1: number;
                adsr2: number;
                gain: number;
                volumeLeft: any;
                volumeRight: any;
                pitch: number;
                channel: number;
                type: string;
                active: boolean;
                frequency: number | null;
            }[];
            auditions: {
                channel: any;
                id: any;
            }[];
            timeline: {
                loaded: boolean;
                positionFrames: number;
                totalFrames: number;
                ended: boolean;
                playing: boolean;
            };
        }>;
        invoke(method: any, args?: any[]): Promise<boolean>;
        initialize(): void;
        mix(volume: any, pan: any): any;
        stopped(): void;
        adoptStopped(data: any): {
            kind: string;
            sampleRate: number;
            nativeSampleRate: number;
            activeSource: string;
            samples: import("./snessynth.js").SnesSample[];
            channels: {
                sample: any;
                adsr1: number;
                adsr2: number;
                gain: number;
                volumeLeft: any;
                volumeRight: any;
                pitch: number;
                channel: number;
                type: string;
                active: boolean;
                frequency: number | null;
            }[];
            auditions: {
                channel: any;
                id: any;
            }[];
            timeline: {
                loaded: boolean;
                positionFrames: number;
                totalFrames: number;
                ended: boolean;
                playing: boolean;
            };
        };
        reset(): void;
    } | null;
    snes: {
        id: string;
        sampleRate: number;
        nativeSampleRate: number;
        _getState: () => import("./snessynth.js").SnesState;
        _adoptState(state: any): void;
        _stopVoices: () => any;
        dispose(): void;
        loadBRR(input: any, options: any): Promise<any>;
        readDsp(register: any): Promise<any>;
        getState(): Promise<import("./snessynth.js").SnesState>;
        getPreset(channel: any): Promise<import("./snessynth.js").SnesVoiceState>;
        snapshot(): Promise<{
            ram: Uint8Array<ArrayBuffer>;
            dsp: Uint8Array<ArrayBuffer>;
            nativeFrames: any;
        }>;
        prepareTimeline: (trace: any) => Promise<any>;
        playTimeline: () => Promise<any>;
        stopTimeline: () => Promise<any>;
        getTimelineState(): Promise<any>;
    } | null;
    nativePwm: {
        client: {
            id: string;
            write: (register: any, value: any) => Promise<any>;
            writeRegister: (register: any, value: any) => Promise<any>;
            read: (register: any) => Promise<any>;
            reset: () => Promise<any>;
            scheduleWrites: (entries: any) => Promise<any>;
            clearSchedule: () => Promise<any>;
            getState: () => Promise<any>;
            setClock: (hz: any) => Promise<any>;
            dispose(): void;
        };
        dispatch(message: any, timing?: {}): Promise<{
            id: any;
            value: any;
        } | undefined>;
        read(): Promise<any>;
        invoke(method: any, args?: any[]): Promise<any>;
        mix(volume: any, pan: any): any;
        stopped(): void;
        adoptStopped(applied: any): void;
        reset(): void;
    } | null;
    pwm: {
        id: string;
        write: (register: any, value: any) => Promise<any>;
        writeRegister: (register: any, value: any) => Promise<any>;
        read: (register: any) => Promise<any>;
        reset: () => Promise<any>;
        scheduleWrites: (entries: any) => Promise<any>;
        clearSchedule: () => Promise<any>;
        getState: () => Promise<any>;
        setClock: (hz: any) => Promise<any>;
        dispose(): void;
    } | null;
    nativeX68000: {
        ym2151: {
            client: {
                id: string;
                readonly clock: number;
                _adoptClock(hz: any): void;
                _getState(): {
                    clock: number;
                    registers: number[];
                };
                _adoptState(state: any): void;
                writeRegister: (register: any, value: any) => void;
                reset(): void;
                setOperator(ch: any, operator: any, options: any): void;
                setAlgo(ch: any, algorithm: any, feedback?: number): void;
                setPan(ch: any, left: any, right: any): void;
                setNote(ch: any, note: any): number;
                setFrequency(ch: any, hz: any): {
                    keyCode: number;
                    keyFraction: number;
                };
                setPitch(ch: any, keyCode: any, keyFraction?: number): void;
                noteOn(ch: any, note: any): void;
                keyOn(ch: any, mask?: number): void;
                keyOff(ch: any): void;
                _forceKeyOff(ch: any): void;
                allNotesOff(): void;
                setNoise(enabled: any, frequency?: number): void;
                dispose(): void;
            };
            initialize: () => Promise<void>;
            mix: (volume?: number, pan?: number) => Promise<void>;
            dispatch: (message: any, timing?: {}) => Promise<{
                id: any;
                value?: boolean | undefined;
            } | undefined>;
            read: (args?: {}) => Promise<any>;
            invoke: (method: any, args?: any[]) => Promise<any>;
            stopped: () => void;
            adoptStopped(data: any): void;
            reset(): void;
        };
        okim6258: {
            client: import("./okim6258synth.js").Oki6258Synth;
            initialize: () => Promise<void>;
            mix: (volume?: number, pan?: number) => Promise<void>;
            dispatch: (message: any, timing?: {}) => Promise<{
                id: any;
                value?: boolean | undefined;
            } | undefined>;
            read: (args?: {}) => Promise<any>;
            invoke: (method: any, args?: any[]) => Promise<any>;
            loadSample: (source: any, options: any) => Promise<{
                frames: number;
                paddedFrames: number;
                sampleRate: number;
                durationSeconds: number;
                bytes: number;
                name: any;
            }>;
            stopped: () => void;
            adoptStopped(data: any): void;
            reset(): void;
        };
    } | null;
    opm: {
        id: string;
        readonly clock: number;
        _adoptClock(hz: any): void;
        _getState(): {
            clock: number;
            registers: number[];
        };
        _adoptState(state: any): void;
        writeRegister: (register: any, value: any) => void;
        reset(): void;
        setOperator(ch: any, operator: any, options: any): void;
        setAlgo(ch: any, algorithm: any, feedback?: number): void;
        setPan(ch: any, left: any, right: any): void;
        setNote(ch: any, note: any): number;
        setFrequency(ch: any, hz: any): {
            keyCode: number;
            keyFraction: number;
        };
        setPitch(ch: any, keyCode: any, keyFraction?: number): void;
        noteOn(ch: any, note: any): void;
        keyOn(ch: any, mask?: number): void;
        keyOff(ch: any): void;
        _forceKeyOff(ch: any): void;
        allNotesOff(): void;
        setNoise(enabled: any, frequency?: number): void;
        dispose(): void;
    } | null;
    ym2151: {
        id: string;
        readonly clock: number;
        _adoptClock(hz: any): void;
        _getState(): {
            clock: number;
            registers: number[];
        };
        _adoptState(state: any): void;
        writeRegister: (register: any, value: any) => void;
        reset(): void;
        setOperator(ch: any, operator: any, options: any): void;
        setAlgo(ch: any, algorithm: any, feedback?: number): void;
        setPan(ch: any, left: any, right: any): void;
        setNote(ch: any, note: any): number;
        setFrequency(ch: any, hz: any): {
            keyCode: number;
            keyFraction: number;
        };
        setPitch(ch: any, keyCode: any, keyFraction?: number): void;
        noteOn(ch: any, note: any): void;
        keyOn(ch: any, mask?: number): void;
        keyOff(ch: any): void;
        _forceKeyOff(ch: any): void;
        allNotesOff(): void;
        setNoise(enabled: any, frequency?: number): void;
        dispose(): void;
    } | null;
    adpcm: import("./okim6258synth.js").Oki6258Synth | null;
    okim6258: import("./okim6258synth.js").Oki6258Synth | null;
    nativeMasterSystem: {
        segapsg: {
            client: any;
            initialize(): Promise<void>;
            mix(volume?: number, pan?: number): Promise<void>;
            dispatch: (message: any, timing?: {}) => Promise<{
                id: any;
                value?: boolean | undefined;
            } | undefined>;
            read: (args?: {}) => Promise<any>;
            invoke: (method: any, args?: any[], options?: {}) => Promise<any>;
            stopped: () => void;
            adoptStopped(data: any): void;
            reset(): void;
        };
        ym2413: {
            client: any;
            initialize(): Promise<void>;
            mix(volume?: number, pan?: number): Promise<void>;
            dispatch: (message: any, timing?: {}) => Promise<{
                id: any;
                value?: boolean | undefined;
            } | undefined>;
            read: (args?: {}) => Promise<any>;
            invoke: (method: any, args?: any[], options?: {}) => Promise<any>;
            stopped: () => void;
            adoptStopped(data: any): void;
            reset(): void;
        };
    } | null;
    nativeGameGear: {
        segapsg: {
            client: any;
            initialize(): Promise<void>;
            mix(volume?: number, pan?: number): Promise<void>;
            dispatch: (message: any, timing?: {}) => Promise<{
                id: any;
                value?: boolean | undefined;
            } | undefined>;
            read: (args?: {}) => Promise<any>;
            invoke: (method: any, args?: any[], options?: {}) => Promise<any>;
            stopped: () => void;
            adoptStopped(data: any): void;
            reset(): void;
        };
    } | null;
    segapsg: any;
    nativeMsx: {
        ym2413: {
            client: any;
            initialize(): Promise<void>;
            mix(volume?: number, pan?: number): Promise<void>;
            dispatch: (message: any, timing?: {}) => Promise<{
                id: any;
                value?: boolean | undefined;
            } | undefined>;
            read: (args?: {}) => Promise<any>;
            invoke: (method: any, args?: any[], options?: {}) => Promise<any>;
            stopped: () => void;
            adoptStopped(data: any): void;
            reset(): void;
        };
        ay8910: {
            client: any;
            initialize(): Promise<void>;
            mix(volume?: number, pan?: number): Promise<void>;
            dispatch: (message: any, timing?: {}) => Promise<{
                id: any;
                value?: boolean | undefined;
            } | undefined>;
            read: (args?: {}) => Promise<any>;
            invoke: (method: any, args?: any[], options?: {}) => Promise<any>;
            stopped: () => void;
            adoptStopped(data: any): void;
            reset(): void;
        };
    } | null;
    nativeMsxAudio: {
        ym2413: {
            client: any;
            initialize(): Promise<void>;
            mix(volume?: number, pan?: number): Promise<void>;
            dispatch: (message: any, timing?: {}) => Promise<{
                id: any;
                value?: boolean | undefined;
            } | undefined>;
            read: (args?: {}) => Promise<any>;
            invoke: (method: any, args?: any[], options?: {}) => Promise<any>;
            stopped: () => void;
            adoptStopped(data: any): void;
            reset(): void;
        };
        ay8910: {
            client: any;
            initialize(): Promise<void>;
            mix(volume?: number, pan?: number): Promise<void>;
            dispatch: (message: any, timing?: {}) => Promise<{
                id: any;
                value?: boolean | undefined;
            } | undefined>;
            read: (args?: {}) => Promise<any>;
            invoke: (method: any, args?: any[], options?: {}) => Promise<any>;
            stopped: () => void;
            adoptStopped(data: any): void;
            reset(): void;
        };
        y8950: {
            client: any;
            initialize(): Promise<void>;
            mix(volume?: number, pan?: number): Promise<void>;
            dispatch: (message: any, timing?: {}) => Promise<{
                id: any;
                value?: boolean | undefined;
            } | undefined>;
            read: (args?: {}) => Promise<any>;
            invoke: (method: any, args?: any[], options?: {}) => Promise<any>;
            stopped: () => void;
            adoptStopped(data: any): void;
            reset(): void;
        };
    } | null;
    opll: any;
    ym2413: any;
    ay: any;
    ay8910: any;
    nativeOpl: {
        client: any;
        initialize(): Promise<void>;
        mix(volume?: number, pan?: number): Promise<void>;
        dispatch: (message: any, timing?: {}) => Promise<{
            id: any;
            value?: boolean | undefined;
        } | undefined>;
        read: (args?: {}) => Promise<any>;
        invoke: (method: any, args?: any[], options?: {}) => Promise<any>;
        stopped: () => void;
        adoptStopped(data: any): void;
        reset(): void;
    } | null;
    opl: any;
    y8950: any;
    nativeVoiceChips: {} | null;
    primaryEndpoints: {
        id: string;
        name: string;
        globalName: string;
        client: import("./pokeysynth.js").PokeySynth;
    }[] | {
        name: string | undefined;
        globalName: string;
        client: any;
    }[] | {
        name: string | null;
        globalName: string;
        client: import("./gameboysynth.js").GameboySynth | import("./huc6280synth.js").Huc6280Synth;
    }[];
    stream: {
        load: () => never;
        play: () => never;
        stop(): void;
        stopAll(): void;
        pause(): void;
        unload: () => boolean;
        isLoaded: () => boolean;
        get: () => null;
        list: () => never[];
    };
    nextNoiseNamespace: number;
    noise: {
        create(options?: {}): {
            type: any;
            gain: any;
            pan: any;
            attack: any;
            release: any;
            filter: {
                cutoff: any;
                q: any;
                set(mode: any, frequency: any, q?: any): void;
            };
            start: () => void;
            stop: () => void;
            dispose(): void;
        };
        stopAll(): void;
        disposeAll(): void;
        reset(): void;
    };
    chipInspector: {
        list: () => any[];
        getConnectionToken: (id: any) => any;
        subscribe(listener: any): () => void;
        notify: () => void;
        read: (id: any) => Promise<any>;
        invoke: (id: any, method: any, args?: any[]) => Promise<any>;
        loadSample: (id: any, source: any, options: any) => Promise<any>;
        dispose(): void;
    };
    diagnosticsReading: any;
    /** @param {{invoke:(command:string,args?:object)=>Promise<any>,now?:()=>number,
     * onError?:(error:Error)=>void,mixer?:SoundChipMixer,masterVolume?:number,
     * decodeAudio?:(bytes:ArrayBuffer)=>Promise<any>,fetcher?:typeof globalThis.fetch,megaCD?:boolean,dx7?:boolean,
     * clock?:number,wonderswanClock?:number, mode?:'genesis'|'mega-cd'|'dx7'|'nes'|'gameboy'|'snes'|'wonderswan'|'pc-engine'|'pc-engine-cd'|'pc98'|'pc98-26'|'ym2203'|'ym2608'|'neogeo'|'neogeo-b'|'ym2610'|'ym2610b'|'x68000'|'master-system'|'game-gear'|'msx'|'msx-audio'|'ym3526'|'ym3812'|'ymf262'|'genesis-full'|'32x'|'genesis-full-nuked'|'genesis-nuked'}} [options] */
    constructor({ invoke, now, onError, mixer, masterVolume, decodeAudio, fetcher, megaCD, dx7, mode, clock, wonderswanClock }?: {
        invoke: (command: string, args?: object) => Promise<any>;
        now?: () => number;
        onError?: (error: Error) => void;
        mixer?: SoundChipMixer;
        masterVolume?: number;
        decodeAudio?: (bytes: ArrayBuffer) => Promise<any>;
        fetcher?: typeof globalThis.fetch;
        megaCD?: boolean;
        dx7?: boolean;
        clock?: number;
        wonderswanClock?: number;
        mode?: 'genesis' | 'mega-cd' | 'dx7' | 'nes' | 'gameboy' | 'snes' | 'wonderswan' | 'pc-engine' | 'pc-engine-cd' | 'pc98' | 'pc98-26' | 'ym2203' | 'ym2608' | 'neogeo' | 'neogeo-b' | 'ym2610' | 'ym2610b' | 'x68000' | 'master-system' | 'game-gear' | 'msx' | 'msx-audio' | 'ym3526' | 'ym3812' | 'ymf262' | 'genesis-full' | '32x' | 'genesis-full-nuked' | 'genesis-nuked';
    });
    unavailableMedia(feature: any): {
        load: () => never;
        play: () => never;
        stop(): void;
        stopAll(): void;
        pause(): void;
        unload: () => boolean;
        isLoaded: () => boolean;
        get: () => null;
        list: () => never[];
    };
    validateVolume(value: any): number;
    isReady(): boolean;
    createExtraSegaPsg(options: any): Promise<{
        native: boolean;
        ready: boolean;
        nativeInstance: number;
        kind: any;
        label: any;
        client: any;
        endpoint: any;
        clock: any;
        stereoEnabled: any;
        engine?: any;
        layout: {};
        dispose(): void;
        mix(settings: any): void;
    }>;
    createExtraSpc(options: any): Promise<{
        native: boolean;
        ready: boolean;
        nativeInstance: number;
        kind: any;
        label: any;
        client: any;
        endpoint: any;
        clock: any;
        stereoEnabled: any;
        engine?: any;
        layout: {};
        dispose(): void;
        mix(settings: any): void;
    }>;
    createExtraSnes(options: any): Promise<{
        native: boolean;
        ready: boolean;
        nativeInstance: number;
        kind: any;
        label: any;
        client: any;
        endpoint: any;
        clock: any;
        stereoEnabled: any;
        engine?: any;
        layout: {};
        dispose(): void;
        mix(settings: any): void;
    }>;
    createExtraPwm(options: any): Promise<{
        native: boolean;
        ready: boolean;
        nativeInstance: number;
        kind: any;
        label: any;
        client: any;
        endpoint: any;
        clock: any;
        stereoEnabled: any;
        engine?: any;
        layout: {};
        dispose(): void;
        mix(settings: any): void;
    }>;
    createExtraDx7(options: any): Promise<{
        native: boolean;
        ready: boolean;
        nativeInstance: number;
        kind: any;
        label: any;
        client: any;
        endpoint: any;
        clock: any;
        stereoEnabled: any;
        engine?: any;
        layout: {};
        dispose(): void;
        mix(settings: any): void;
    }>;
    createExtraPokey(options: any): Promise<{
        native: boolean;
        ready: boolean;
        nativeInstance: number;
        kind: any;
        label: any;
        client: any;
        endpoint: any;
        clock: any;
        stereoEnabled: any;
        engine?: any;
        layout: {};
        dispose(): void;
        mix(settings: any): void;
    }>;
    createExtraWonderSwan(options: any): Promise<{
        native: boolean;
        ready: boolean;
        nativeInstance: number;
        kind: any;
        label: any;
        client: any;
        endpoint: any;
        clock: any;
        stereoEnabled: any;
        engine?: any;
        layout: {};
        dispose(): void;
        mix(settings: any): void;
    }>;
    createExtraHuc6280(options: any): Promise<{
        native: boolean;
        ready: boolean;
        nativeInstance: number;
        kind: any;
        label: any;
        client: any;
        endpoint: any;
        clock: any;
        stereoEnabled: any;
        engine?: any;
        layout: {};
        dispose(): void;
        mix(settings: any): void;
    }>;
    createExtraNes(options: any): Promise<{
        native: boolean;
        ready: boolean;
        nativeInstance: number;
        kind: any;
        label: any;
        client: any;
        endpoint: any;
        clock: any;
        stereoEnabled: any;
        engine?: any;
        layout: {};
        dispose(): void;
        mix(settings: any): void;
    }>;
    createExtraGameboy(options: any): Promise<{
        native: boolean;
        ready: boolean;
        nativeInstance: number;
        kind: any;
        label: any;
        client: any;
        endpoint: any;
        clock: any;
        stereoEnabled: any;
        engine?: any;
        layout: {};
        dispose(): void;
        mix(settings: any): void;
    }>;
    createExtraOkim6258(options: any): Promise<{
        native: boolean;
        ready: boolean;
        nativeInstance: number;
        kind: any;
        label: any;
        client: any;
        endpoint: any;
        clock: any;
        stereoEnabled: any;
        engine?: any;
        layout: {};
        dispose(): void;
        mix(settings: any): void;
    }>;
    createExtraRf5c164(options: any): Promise<{
        native: boolean;
        ready: boolean;
        nativeInstance: number;
        kind: any;
        label: any;
        client: any;
        endpoint: any;
        clock: any;
        stereoEnabled: any;
        engine?: any;
        layout: {};
        dispose(): void;
        mix(settings: any): void;
    }>;
    createExtraYm2612(options: any): Promise<{
        native: boolean;
        ready: boolean;
        nativeInstance: number;
        kind: any;
        label: any;
        client: any;
        endpoint: any;
        clock: any;
        stereoEnabled: any;
        engine?: any;
        layout: {};
        dispose(): void;
        mix(settings: any): void;
    }>;
    createExtraOpl(kind: any, options: any): Promise<{
        native: boolean;
        ready: boolean;
        nativeInstance: number;
        kind: any;
        label: any;
        client: any;
        endpoint: any;
        clock: any;
        stereoEnabled: any;
        engine?: any;
        layout: {};
        dispose(): void;
        mix(settings: any): void;
    }>;
    createExtraYm2413(options: any): Promise<{
        native: boolean;
        ready: boolean;
        nativeInstance: number;
        kind: any;
        label: any;
        client: any;
        endpoint: any;
        clock: any;
        stereoEnabled: any;
        engine?: any;
        layout: {};
        dispose(): void;
        mix(settings: any): void;
    }>;
    createExtraAy8910(options: any): Promise<{
        native: boolean;
        ready: boolean;
        nativeInstance: number;
        kind: any;
        label: any;
        client: any;
        endpoint: any;
        clock: any;
        stereoEnabled: any;
        engine?: any;
        layout: {};
        dispose(): void;
        mix(settings: any): void;
    }>;
    createExtraYm2151(options: any): Promise<{
        native: boolean;
        ready: boolean;
        nativeInstance: number;
        kind: any;
        label: any;
        client: any;
        endpoint: any;
        clock: any;
        stereoEnabled: any;
        engine?: any;
        layout: {};
        dispose(): void;
        mix(settings: any): void;
    }>;
    createExtraYm2610(options: any): Promise<{
        native: boolean;
        ready: boolean;
        nativeInstance: number;
        kind: any;
        label: any;
        client: any;
        endpoint: any;
        clock: any;
        stereoEnabled: any;
        engine?: any;
        layout: {};
        dispose(): void;
        mix(settings: any): void;
    }>;
    createExtraYm2610B(options: any): Promise<{
        native: boolean;
        ready: boolean;
        nativeInstance: number;
        kind: any;
        label: any;
        client: any;
        endpoint: any;
        clock: any;
        stereoEnabled: any;
        engine?: any;
        layout: {};
        dispose(): void;
        mix(settings: any): void;
    }>;
    createExtraYm2608(options: any): Promise<{
        native: boolean;
        ready: boolean;
        nativeInstance: number;
        kind: any;
        label: any;
        client: any;
        endpoint: any;
        clock: any;
        stereoEnabled: any;
        engine?: any;
        layout: {};
        dispose(): void;
        mix(settings: any): void;
    }>;
    createExtraYm2203(options: any): Promise<{
        native: boolean;
        ready: boolean;
        nativeInstance: number;
        kind: any;
        label: any;
        client: any;
        endpoint: any;
        clock: any;
        stereoEnabled: any;
        engine?: any;
        layout: {};
        dispose(): void;
        mix(settings: any): void;
    }>;
    validateGenesisStatus(status: any): void;
    addListener(listener: any): () => boolean;
    emit(event: any): void;
    installFmEvents(): void;
    start(): Promise<this>;
    resume(): Promise<void>;
    /** Observe an existing session without reanchoring its clock or sending audio commands. */
    readAudioDiagnostics(): Promise<{
        backend: string;
        session: any;
        mode: string | undefined;
        engine?: string | undefined;
        sampleRate: any;
        frame: any;
        running: boolean;
        queued: any;
        lateCommands: any;
        queueOverflows: any;
        transport: {
            pendingCommands: number;
            acceptedCommands: number;
            acceptedRequests: number;
        };
        liveFx: {
            active: any;
            processCalls: any;
            underruns: any;
            overruns: any;
            latencyFrames: any;
        } | null;
    }>;
    registerCommand({ port, register, value, time }: {
        port?: number | undefined;
        register: any;
        time: any;
        value: any;
    }): {
        type: string;
        port: number;
        register: any;
        value: any;
        frame: number;
    };
    frameAt(seconds: any): number;
    write(port: any, register: any, value: any): void;
    writePsg(value: any): void;
    scheduleWrites(entries: any): void;
    enqueue(command: any): void;
    enqueueMany(commands: any): void;
    flush(): Promise<void>;
    /** One-off preparation shares the command ordering barrier. A late response
     * cannot install state or resume playback after Stop/session replacement. */
    nativeRequest(command: any, args?: {}): Promise<any>;
    observeNativeSnapshot(command: any, args?: {}): Promise<any>;
    nativeSpcRequest(command: any, args?: {}): Promise<any>;
    reportAsyncError(error: any): void;
    setNativePerformance(request: any): Promise<any>;
    dispatchNativeFxCommand(message: any, timing?: {}): Promise<any>;
    /** Explicit Worker transport receiver. A real MessagePort bridge supplies
     * timing and ownership; the native synth remains independent of AudioNodes. */
    dispatchNativeCommand(message: any, timing?: {}): Promise<any>;
    dispatchNativePcmCommand(message: any, timing?: {}): Promise<{
        id: any;
    } | undefined>;
    dispatchNativeDx7Command(message: any, timing?: {}): Promise<{
        id: any;
        value: import("./msfa_dx7/src/preset.js").DX7PresetState | {
            sampleRate: any;
            internalSampleRate: number;
            voices: any;
            selectedVoice: any;
            stateRevision: any;
        } | undefined;
    } | undefined>;
    dispatchNativeNesCommand(message: any, timing?: {}): Promise<{
        id: any;
        value: boolean;
    } | undefined>;
    dispatchNativePwmCommand(message: any, timing?: {}): Promise<{
        id: any;
        value: any;
    } | undefined>;
    dispatchNativeConsoleCommand(kind: any, message: any, timing?: {}): Promise<any>;
    dispatchNativeSnesCommand(message: any, timing?: {}): Promise<any>;
    fail(error: any): void;
    silencePsg(): void;
    resetPsg(): void;
    discardPending(): void;
    /** Stop is a barrier: old sends settle before the native callback clears its
     * queue and fades/resets. The device clock continues in the same session. */
    stopNativeAudio(): Promise<void>;
    close(): Promise<void>;
    releaseMixer(): void;
    setMasterVolume(value: any): number;
    getMasterVolume(): number;
    setListeningVolume(value: any): void;
    auditionNoteOn(channel: any, block: any, fnum: any, token: any): void;
    auditionNoteOff(channel: any, token: any): void;
    clearAuditions(): void;
    /** Admin operations use the native command transport directly. No MessagePort,
     * AudioNode or PCM bridge is fabricated for the shared Keyboard UI. */
    createInspector(): {
        list: () => any[];
        getConnectionToken: (id: any) => any;
        subscribe(listener: any): () => void;
        notify: () => void;
        read: (id: any) => Promise<any>;
        invoke: (id: any, method: any, args?: any[]) => Promise<any>;
        loadSample: (id: any, source: any, options: any) => Promise<any>;
        dispose(): void;
    };
    createFXApi({ getBeatSeconds }?: {
        getBeatSeconds?: (() => 0.5) | undefined;
    }): {
        liveFx(name: string, { process, context, resetState }?: {
            process: (input: Float32Array[], output: Float32Array[], state: Record<string, unknown>, context: Record<string, unknown>) => void;
            context?: Record<string, unknown>;
            resetState?: boolean;
        }): void;
        updateContext(name: any, context: any): void;
        removeLiveFx(name: any): void;
        branch: (...children: any[]) => {
            type: string;
            children: any[];
            owner: /*elided*/ any;
            dispose(): void;
        };
        parallel: (...children: any[]) => {
            type: string;
            children: any[];
            owner: /*elided*/ any;
            dispose(): void;
        };
        setChain(effects?: any[]): any[];
        clear({ dispose }?: {
            dispose?: boolean | undefined;
        }): any[];
        dispose(): void;
        getChain(): any[];
        syncTempo(): void;
    };
    clearFXChain(options: any): any[];
    getFXChain(): any[];
    setFXChain(effects: any): any[];
    syncFXTempo(): void;
    allocateNoiseNamespace(): number;
    startOutputRecording(options: any): Promise<void>;
    stopOutputRecording(): Promise<any>;
    getAudioContext(): null;
}
export {};
