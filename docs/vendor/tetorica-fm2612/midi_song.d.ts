/**
 * @file midi_song.js
 * 実行環境: Browser / Node.js
 * 依存: 注入された MIDI API とタイミング処理。実際の再生環境は MIDI API に依存する。
 */
/** Replay editable beat-based event generators on one absolute timeline. */
export declare function createMidiSongPlayer(midi: any, { channels, tempos, endBeat }: {
    channels: any;
    endBeat?: number | undefined;
    tempos?: {
        beat: number;
        bpm: number;
    }[] | undefined;
}): {
    readonly running: boolean;
    runChannels(numbers: any, replacements?: {}): Promise<void>;
};
