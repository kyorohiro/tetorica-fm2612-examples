export type MidiSongOutput = {
    noteOn: (note: string | number, options: {
        velocity: number;
    }) => unknown;
    noteOff: (note: string | number) => unknown;
    cc: (controller: number, value: number) => unknown;
    pitchBend?: (value: number) => unknown;
};
export type MidiSongEvent = {
    at: number;
    output: MidiSongOutput;
    order?: number;
    offOrder?: number;
    play?: string | number;
    duration?: number;
    velocity?: number;
    noteOn?: string | number;
    noteOff?: string | number;
    cc?: [number, number];
    pitchBend?: number;
};
/**
 * @file midi_song.js
 * 実行環境: Browser / Node.js
 * 依存: 注入された MIDI API とタイミング処理。実際の再生環境は MIDI API に依存する。
 */
/** Replay editable beat-based event generators on one absolute timeline. */
/**
 * @typedef {{noteOn: (note: string | number, options: {velocity: number}) => unknown,
 *   noteOff: (note: string | number) => unknown, cc: (controller: number, value: number) => unknown,
 *   pitchBend?: (value: number) => unknown}} MidiSongOutput
 * @typedef {{at: number, output: MidiSongOutput, order?: number, offOrder?: number,
 *   play?: string | number, duration?: number, velocity?: number, noteOn?: string | number,
 *   noteOff?: string | number, cc?: [number, number], pitchBend?: number}} MidiSongEvent
 */
/**
 * Merge channel generators and scheduled note-offs on one absolute timeline.
 * @param {{createTimeline: () => {waitUntil: (seconds: number) => Promise<void>}}} midi Playback API.
 * @param {{channels: Record<number, {outputs: MidiSongOutput[], events: (...outputs: MidiSongOutput[]) => Iterator<MidiSongEvent>}>, tempos?: {beat: number, bpm: number}[], endBeat?: number}} options Beat-based channels, ordered tempo changes and ending beat.
 * @returns Song player with running state and runChannels selection/replacement controls.
 */
export declare function createMidiSongPlayer(midi: {
    createTimeline: () => {
        waitUntil: (seconds: number) => Promise<void>;
    };
}, { channels, tempos, endBeat }: {
    channels: Record<number, {
        outputs: MidiSongOutput[];
        events: (...outputs: MidiSongOutput[]) => Iterator<MidiSongEvent>;
    }>;
    tempos?: {
        beat: number;
        bpm: number;
    }[];
    endBeat?: number;
}): {
    readonly running: boolean;
    runChannels(numbers: any, replacements?: {}): Promise<void>;
};
