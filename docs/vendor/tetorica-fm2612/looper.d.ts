/**
 * @file looper.js
 * 実行環境: Browser / Node.js（タイマー注入時）
 * 依存: 注入された Synth、performance。既定タイマーは window.setTimeout / clearTimeout。
 * Node.js ではタイマーを注入する。再生には接続先 Synth の実行環境が必要。
 */
/**
 * Lightweight musical-event looper for MegaSynth / YM2612 browser usage.
 *
 * This first version intentionally records performance-level note events:
 *
 * - noteOn(channel, block, fnum)
 * - noteOff(channel)
 *
 * It does not try to record raw YM2612 register writes yet.
 * The main idea is to keep loop data editable and small.
 */
export type MegaSynthLooperEvent = {
    time: number;
    type: "noteOn" | "noteOff";
    channel: number;
    block?: number;
    fnum?: number;
};
export type MegaSynthLooperUnit = {
    id: string;
    muted: boolean;
    startedLoopTime?: number;
    patch: object | null;
    audio?: unknown;
    audioDuration?: number;
    events: MegaSynthLooperEvent[];
    playbackChannelMap?: Record<string, number>;
};
/**
 * @typedef {{
 *   time: number,
 *   type: "noteOn" | "noteOff",
 *   channel: number,
 *   block?: number,
 *   fnum?: number,
 * }} MegaSynthLooperEvent
 */
/**
 * @typedef {{
 *   id: string,
 *   muted: boolean,
 *   startedLoopTime?: number,
 *   patch: object | null,
 *   audio?: unknown,
 *   audioDuration?: number,
 *   events: MegaSynthLooperEvent[],
 *   playbackChannelMap?: Record<string, number>,
 * }} MegaSynthLooperUnit
 */
export declare class MegaSynthLooper {
    synth: {
        start?: () => Promise<unknown>;
        fm?: {
            noteOn: (channel: number, block: number, fnum: number) => void;
            noteOff: (channel: number) => void;
        };
        noteOn?: (channel: number, block: number, fnum: number) => void;
        noteOff?: (channel: number) => void;
    };
    audioPaddingSeconds: number;
    now: () => number;
    setTimer: (fn: () => void, delayMs: number) => unknown;
    clearTimer: (timerId: unknown) => void;
    liveTarget: any;
    playbackTarget: any;
    getPatch: () => object | null;
    applyPatch: (patch: object, channel: number, event: MegaSynthLooperEvent) => void;
    startAudioCapture: () => Promise<void> | void;
    stopAudioCapture: () => Promise<{
        audio?: unknown;
        audioDuration?: number;
    } | null> | {
        audio?: unknown;
        audioDuration?: number;
    } | null;
    scheduleAudioPlayback: ((unit: MegaSynthLooperUnit, startTime: number) => void) | null;
    stopAudioPlayback: (unit?: MegaSynthLooperUnit | string | null) => void;
    onStateChange: (detail: {
        reason: string;
        unit?: MegaSynthLooperUnit | null;
        auto?: boolean;
    }) => void;
    running: boolean;
    recording: boolean;
    armed: boolean;
    loopLength: any;
    startedAt: number | null;
    loopStartedAt: any;
    currentUnit: any;
    units: any[];
    _scheduledTimers: any[];
    _activeChannels: Set<any>;
    _recordStopTimer: unknown;
    _armTimer: any;
    /**
     * @param {{
     *   synth: {
     *     start?: () => Promise<unknown>,
     *     fm?: {
     *       noteOn: (channel: number, block: number, fnum: number) => void,
     *       noteOff: (channel: number) => void,
     *     },
     *     noteOn?: (channel: number, block: number, fnum: number) => void,
     *     noteOff?: (channel: number) => void,
     *   },
     *   now?: () => number,
     *   setTimer?: (fn: () => void, delayMs: number) => unknown,
     *   clearTimer?: (timerId: unknown) => void,
     *   liveTarget?: {
     *     noteOn: (channel: number, block: number, fnum: number) => void,
     *     noteOff: (channel: number) => void,
     *   },
     *   playbackTarget?: {
     *     noteOn: (channel: number, block: number, fnum: number) => void,
     *     noteOff: (channel: number) => void,
     *   },
     *   getPatch?: () => object | null,
     *   applyPatch?: (patch: object, channel: number, event: MegaSynthLooperEvent) => void,
     *   startAudioCapture?: () => Promise<void> | void,
     *   stopAudioCapture?: () => Promise<{ audio?: unknown, audioDuration?: number } | null> | { audio?: unknown, audioDuration?: number } | null,
     *   scheduleAudioPlayback?: (unit: MegaSynthLooperUnit, startTime: number) => void,
     *   stopAudioPlayback?: (unit?: MegaSynthLooperUnit | string | null) => void,
     *   onStateChange?: (detail: { reason: string, unit?: MegaSynthLooperUnit | null, auto?: boolean }) => void,
     *   audioPaddingSeconds?: number,
     * }} options
     */
    constructor(options?: {
        synth: {
            start?: () => Promise<unknown>;
            fm?: {
                noteOn: (channel: number, block: number, fnum: number) => void;
                noteOff: (channel: number) => void;
            };
            noteOn?: (channel: number, block: number, fnum: number) => void;
            noteOff?: (channel: number) => void;
        };
        now?: () => number;
        setTimer?: (fn: () => void, delayMs: number) => unknown;
        clearTimer?: (timerId: unknown) => void;
        liveTarget?: {
            noteOn: (channel: number, block: number, fnum: number) => void;
            noteOff: (channel: number) => void;
        };
        playbackTarget?: {
            noteOn: (channel: number, block: number, fnum: number) => void;
            noteOff: (channel: number) => void;
        };
        getPatch?: () => object | null;
        applyPatch?: (patch: object, channel: number, event: MegaSynthLooperEvent) => void;
        startAudioCapture?: () => Promise<void> | void;
        stopAudioCapture?: () => Promise<{
            audio?: unknown;
            audioDuration?: number;
        } | null> | {
            audio?: unknown;
            audioDuration?: number;
        } | null;
        scheduleAudioPlayback?: (unit: MegaSynthLooperUnit, startTime: number) => void;
        stopAudioPlayback?: (unit?: MegaSynthLooperUnit | string | null) => void;
        onStateChange?: (detail: {
            reason: string;
            unit?: MegaSynthLooperUnit | null;
            auto?: boolean;
        }) => void;
        audioPaddingSeconds?: number;
    });
    start(): Promise<this>;
    stop(): Promise<void>;
    clear(): Promise<void>;
    toggleRecord(): Promise<any>;
    startRecording(): Promise<any>;
    finishRecording(options?: {}): Promise<{
        id: any;
        muted: boolean;
        startedLoopTime: any;
        patch: any;
        audio: {} | null;
        audioDuration: number;
        events: any;
        playbackChannelMap: {};
    } | null>;
    undo(): Promise<any>;
    noteOn(channel: any, block: any, fnum: any): void;
    noteOff(channel: any): void;
    getState(): {
        running: boolean;
        recording: boolean;
        armed: boolean;
        loopLength: any;
        startedAt: number | null;
        loopStartedAt: any;
        currentUnitId: any;
        unitCount: number;
        canUndo: boolean;
        units: {
            id: any;
            muted: any;
            hasAudio: boolean;
            hasPatch: boolean;
            eventCount: any;
        }[];
    };
    getUnits(): {
        id: any;
        muted: any;
        patch: any;
        startedLoopTime: any;
        audio: any;
        audioDuration: any;
        playbackChannelMap: any;
        events: any;
    }[];
    _dispatchPerformanceEvent(event: any, shouldRecord: any, patch?: null, playbackChannelMap?: null): void;
    _recordEvent(event: any): void;
    _getCurrentRecordTime(): any;
    _scheduleLoopCycle(cycleStartTime: any): void;
    _clearScheduledTimers(): void;
    _clearRecordStopTimer(): void;
    _clearArmTimer(): void;
    _scheduleUnitRemainder(unit: any, now?: number): void;
    _scheduleLoopRemainder(now?: number): void;
    _scheduleAudioUnit(unit: any, cycleStartTime: any, now: any): void;
    _scheduleNextAudioUnitPlayback(unit: any, now?: number): void;
    _playAudioUnitNow(unit: any, now?: number): void;
    _pruneScheduledTimers(): void;
    _allNotesOff(): void;
    _getLoopPosition(currentTime?: number): any;
    _wrapLoopTime(time: any): any;
    _allNotesOffOnTarget(target: any): void;
    _resolvePerformanceTarget(targetSource: any): any;
    _clonePatch(patch: any): any;
    _scheduleRecordStopTimer(): void;
    _notifyStateChange(reason: any, detail?: {}): void;
    _unitHasAudio(unit: any): boolean;
    _rebuildPlaybackChannelMaps(): void;
    _assignPlaybackChannelMap(unit: any, usedPlaybackChannels?: null): void;
    _collectUsedPlaybackChannels(excludeUnit?: null): Set<any>;
    _collectUnitChannels(unit: any): any[];
    _allocatePlaybackChannel(preferredChannel: any, usedPlaybackChannels: any): any;
    _resolvePlaybackChannel(sourceChannel: any, playbackChannelMap: any): any;
}
