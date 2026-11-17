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

try {
  const pcm=Int16Array.from({length:64},(_,i)=>Math.round(4096*Math.sin(2*Math.PI*i/64)));
  const sample=saturn.loadPCM(pcm,{baseFrequencyHz:44100/64,loopStartSamples:0});
  const original=core.readRam(sample.address,sample.byteLength);
  saturn.setPreset(0,{sample,totalLevel:0,directLevel:0,dspSend:7,
    envelope:{attackRate:31,releaseRate:31}});
  saturn.setDspDelay({enabled:true,timeMs:120,feedback:0.5});
  saturn.setDspReturn({level:7,pan:0});
  const setup=saturn.getDspProgram();
  console.log(disassembleScspDsp(setup.words));
  console.log({delay:setup.delay,ring:setup.ram,coefficients:setup.coefficients});
  saturn.noteOn(0,'A3'); render(0.05);
  saturn.noteOff(0); render(1); // The note has stopped; echoes continue in DSP RAM.
  const after=core.readRam(sample.address,sample.byteLength);
  if(!original.every((value,index)=>value===after[index]))throw new Error('Delay changed PCM');
  saturn.stopVoices();render(0.1); // Stop clears the tail but retains setup / ring.
  console.log('SCSP_DSP_RESULT '+JSON.stringify({kind:'delay',pcmUnchanged:true,frames,
    profile:setup.profile,delay:setup.delay,ram:setup.ram}));
} finally {saturn.dispose();}
const left = new Float32Array(frames), right = new Float32Array(frames);
let offset = 0;
for (const chunk of chunks) {left.set(chunk.left,offset); right.set(chunk.right,offset); offset += chunk.left.length;}
if (!left.every(Number.isFinite) || !right.every(Number.isFinite)) throw new Error('Invalid PCM');
const output = process.argv[2] ? resolve(process.argv[2])
  : fileURLToPath(new URL('../../../../../output/saturn-scsp-05-dsp-delay.wav', import.meta.url));
await mkdir(dirname(output),{recursive:true});
await writeFile(output,encodeWav({left,right,sampleRate},{gain:0.35}));
console.log(`${output}\n${frames} frames · ${sampleRate} Hz · stereo PCM16 · SCSP DSP`);
