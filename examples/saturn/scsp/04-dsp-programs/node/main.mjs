// Node.js 22+: owned SCSP core, offline PCM only. No audio device or game assets.
import {Scsp} from 'tetorica-fm2612/scsp.js';
import {ScspSynth} from 'tetorica-fm2612/scspsynth.js';
import {assembleScspDsp, disassembleScspDsp} from 'tetorica-fm2612/scsp_dsp_assembler.js';
import moduleFactory from 'tetorica-fm2612/generated/scsp_wasm.js';
import {runtimeAssetUrl} from 'tetorica-fm2612/package_assets.js';
import {encodeWav} from 'tetorica-fm2612';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const core = await Scsp.create({moduleFactory, moduleOptions:{
  wasmBinary:await readFile(runtimeAssetUrl('generated/scsp_wasm.wasm')),
}});
const saturn = new ScspSynth(core);
const sampleRate = 44100, chunks = [];
let frames = 0;
function render(seconds) {
  const count = Math.round(seconds * sampleRate);
  chunks.push(saturn.generateStereo(count)); frames += count;
}

const gainSource = `000: XSEL=1 YSEL=1 IRA=32 ZERO=1 COEF=0
001: EWT=1 EWA=0 ZERO=1`;
const iirSource = `000: TRA=1 XSEL=0 YSEL=1 ZERO=1 COEF=1
001: XSEL=1 YSEL=1 IRA=32 BSEL=1 COEF=2
002: TWT=1 TWA=0 EWT=1 EWA=0 ZERO=1`;
try {
  const pcm = Int16Array.from({length:64},(_,i)=>Math.round(4096*(2*i/64-1)));
  const sample = saturn.loadPCM(pcm,{baseFrequencyHz:44100/64,loopStartSamples:0});
  const originalRam = core.readRam();
  saturn.setPreset(0,{sample,totalLevel:0,directLevel:0,dspSend:7});
  saturn.setDspReturn({level:7,pan:0});
  for (const [name,source,codes] of [
    ['Gain',gainSource,[2048,0,0]], ['IIR',iirSource,[0,3840,256]],
  ]) {
    // Pure JavaScript assembly makes 128 steps / 512 words; application is separate.
    const words = assembleScspDsp(source);
    console.log(name+'\n'+disassembleScspDsp(words));
    saturn.applyDspProgram(words,{coefficients:{0:codes[0],1:codes[1],2:codes[2]}});
    saturn.noteOn(0,'A3'); render(0.7);
    saturn.noteOff(0); render(0.2);
    saturn.stopVoices();
  }
  const afterRam = core.readRam();
  if (!originalRam.every((value,index)=>value===afterRam[index])) throw new Error('RAM-free DSP changed PCM RAM');
  render(0.1);
  console.log('SCSP_DSP_RESULT '+JSON.stringify({kind:'gain-iir',ramUnchanged:true,frames,profile:saturn.getDspProgram().profile}));
} finally {saturn.dispose();}
const left = new Float32Array(frames), right = new Float32Array(frames);
let offset = 0;
for (const chunk of chunks) {left.set(chunk.left,offset); right.set(chunk.right,offset); offset += chunk.left.length;}
if (!left.every(Number.isFinite) || !right.every(Number.isFinite)) throw new Error('Invalid PCM');
const output = process.argv[2] ? resolve(process.argv[2])
  : fileURLToPath(new URL('../../../../../output/saturn-scsp-04-dsp-programs.wav', import.meta.url));
await mkdir(dirname(output),{recursive:true});
await writeFile(output,encodeWav({left,right,sampleRate},{gain:0.35}));
console.log(`${output}\n${frames} frames · ${sampleRate} Hz · stereo PCM16 · SCSP DSP`);
