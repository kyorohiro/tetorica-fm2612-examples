// Build first. Checks the final static site under /examples-site/.
// node scripts/check-pokey-browser.mjs [--root=dist|docs|/absolute/site]
//   [--chromium|--webkit] [--case=tone|noise|dual] [--out=/path/receipt.json]
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import http from 'node:http';
import {mkdir, readFile, stat, writeFile} from 'node:fs/promises';
import {dirname, extname, join, relative, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium, webkit} from 'playwright';

const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arguments_ = process.argv.slice(2);
for (const argument of arguments_) assert(/^(--(?:root|case|out)=.+|--chromium|--webkit)$/.test(argument), `Unknown argument: ${argument}`);
assert(!(arguments_.includes('--chromium') && arguments_.includes('--webkit')), 'Choose one browser flag, or omit both to check both');
const option = name => arguments_.find(value => value.startsWith(`--${name}=`))?.slice(name.length + 3);
const site = resolve(repository, option('root') ?? 'dist');
const receiptPath = option('out') ? resolve(option('out')) : undefined;
const selected = option('case');
const cases = {tone:'pokey/tone/01-four-channels', noise:'pokey/noise/01-distortion-joined', dual:'pokey/dual/01-eight-channels'};
if (selected) assert(Object.hasOwn(cases, selected), `Unknown case: ${selected}`);
const prefix = '/examples-site/';
const sha256 = data => createHash('sha256').update(data).digest('hex');
const served = new Map(), missingRequests = [];
const mime = {'.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css', '.wasm':'application/wasm', '.json':'application/json', '.svg':'image/svg+xml'};
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === '/favicon.ico') {response.writeHead(204).end(); return;}
    assert(pathname.startsWith(prefix), 'Request escaped the repository subpath');
    let file = resolve(site, pathname.slice(prefix.length));
    const local = relative(site, file);
    assert(local !== '..' && !local.startsWith('..' + sep) && !local.startsWith(sep), 'Request escaped site root');
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    const bytes = await readFile(file);
    const path = relative(site, file).split(sep).join('/');
    const asset = {path, bytes:bytes.length, sha256:sha256(bytes)};
    if (served.has(path)) assert.deepEqual(asset, served.get(path), `Asset changed during check: ${path}`);
    served.set(path, asset);
    response.setHeader('Content-Type', mime[extname(file)] ?? 'application/octet-stream');
    response.setHeader('Cache-Control', 'no-store');
    response.end(bytes);
  } catch (error) {missingRequests.push(request.url);response.writeHead(404).end(String(error));}
});

/** Capture every final PCM frame before replacing physical output with zero.
 * One capture node receives the actual host sum for an AudioContext. This
 * checks the final gain/mix, including the two-chip example, without a second
 * audible connection or analyser resampling gaps. */
function installOutputAudit() {
  let run = 'load', phase = 'load', sequence = 0;
  const contexts = [], nodes = [], commands = [], outputs = [], failures = [];
  const NativeContext = window.AudioContext, NativeWorklet = window.AudioWorkletNode;
  const nativeConnect = AudioNode.prototype.connect, nativeDisconnect = AudioNode.prototype.disconnect;
  const nodeIds = new WeakMap(), contextInfo = new WeakMap();
  const processor = `class PokeyCapture extends AudioWorkletProcessor {
    constructor(options) { super(); this.label = options.processorOptions.label; this.blocks = [new Float32Array(4096),new Float32Array(4096)]; this.offset=0;
      this.port.onmessage=({data})=>{this.label=data.label; this.offset=0; this.port.postMessage({ack:data.id});}; }
    process(inputs,outputs) {
      const input=inputs[0]??[], output=outputs[0]??[], size=output[0]?.length??128;
      for(const channel of output)channel.fill(0);
      const pcm=[input[0]??new Float32Array(size),input[1]??input[0]??new Float32Array(size)];
      const means=pcm.map(p=>p.reduce((a,b)=>a+b,0)/size), levels=[],frequencies=[0,0];
      let finite=true,maxAbs=0,difference=0,clipped=0;
      for(let ch=0;ch<2;ch++) {let energy=0;for(let i=0;i<size;i++) {const value=pcm[ch][i];
        finite=finite&&Number.isFinite(value);maxAbs=Math.max(maxAbs,Math.abs(value));if(Math.abs(value)>=0.99999)clipped++;
        energy+=(value-means[ch])**2;this.blocks[ch][this.offset+i]=value;
      }levels.push(Math.sqrt(energy/size));}
      for(let i=0;i<size;i++)difference=Math.max(difference,Math.abs(pcm[0][i]-pcm[1][i]));
      this.offset+=size;
      if(this.offset===4096) {
        for(let ch=0;ch<2;ch++) {const samples=this.blocks[ch],mean=samples.reduce((a,b)=>a+b,0)/4096,crossings=[];
          for(let j=1;j<4096;j++)if(samples[j-1]<=mean&&samples[j]>mean)crossings.push(j-1+(mean-samples[j-1])/(samples[j]-samples[j-1]));
          frequencies[ch]=crossings.length>4?sampleRate*(crossings.length-1)/(crossings[crossings.length-1]-crossings[0]):0;
        }this.offset=0;
      }
      this.port.postMessage({label:this.label,time:currentTime,frames:size,finite,maxAbs,difference,clipped,mean:means,acRms:levels,frequency:frequencies});
      return true;
    }
  } registerProcessor('pokey-final-pcm-audit',PokeyCapture);`;
  const moduleURL = URL.createObjectURL(new Blob([processor], {type:'text/javascript'}));
  window.AudioContext = new Proxy(NativeContext, {construct(Target, args) {
    const context = Reflect.construct(Target, args);
    const info = {context, run, sampleRate:context.sampleRate, blocks:[], pending:new Map(), closeRequests:0};
    contexts.push(info); contextInfo.set(context, info);
    const nativeAddModule = context.audioWorklet.addModule.bind(context.audioWorklet);
    info.ready = nativeAddModule(moduleURL).then(() => {
      if (context.state==='closed') return;
      const capture = new NativeWorklet(context, 'pokey-final-pcm-audit', {numberOfInputs:1, numberOfOutputs:1, outputChannelCount:[2], channelCount:2, channelCountMode:'explicit', channelInterpretation:'speakers', processorOptions:{label:phase}});
      capture.port.onmessage = ({data}) => {
        if (data.ack !== undefined) {info.pending.get(data.ack)?.(); info.pending.delete(data.ack);}
        else info.blocks.push(data);
      };
      capture.onprocessorerror = () => failures.push('PCM capture worklet failed');
      info.capture = capture; nativeConnect.call(capture, context.destination);
    }).catch(error => {if(context.state!=='closed'){info.auditError=String(error);failures.push(info.auditError);}});
    // Endpoint creation awaits addModule before making its final connection.
    context.audioWorklet.addModule = async (...values) => {await info.ready;if(info.auditError)throw new Error(info.auditError);return nativeAddModule(...values);};
    const close = context.close.bind(context);
    context.close = (...values) => {info.closeRequests++; return close(...values);};
    return context;
  }});
  if (window.webkitAudioContext === NativeContext) window.webkitAudioContext = window.AudioContext;
  window.AudioWorkletNode = new Proxy(NativeWorklet, {construct(Target, args) {
    const node = Reflect.construct(Target, args), binary = args[2]?.processorOptions?.wasmBinary;
    const bytes = binary instanceof ArrayBuffer ? new Uint8Array(binary) : ArrayBuffer.isView(binary) ? new Uint8Array(binary.buffer, binary.byteOffset, binary.byteLength) : null;
    const info = {id:++sequence, run, processor:args[1], chip:args[2]?.processorOptions?.name, clock:args[2]?.processorOptions?.chipOptions?.clock, wasmBytes:bytes?.length ?? 0, wasmMagic:bytes ? Array.from(bytes.subarray(0,4)) : [], disconnects:0};
    nodes.push(info); nodeIds.set(node, info);
    const post = node.port.postMessage.bind(node.port);
    node.port.postMessage = (data, ...rest) => {
      if (data?.method) commands.push({run, phase, node:info.id, time:node.context.currentTime, method:data.method,
        ...(data.method === 'writeRegister' ? {register:data.args?.[0], value:data.args?.[1], channel:data.channel} : {}),
        ...(data.method === 'schedule-writes' ? {count:data.args?.[0]?.length} : {})});
      return post(data, ...rest);
    };
    return node;
  }});
  AudioNode.prototype.connect = function(destination, ...args) {
    if (destination !== this.context.destination) return nativeConnect.call(this, destination, ...args);
    const info = contextInfo.get(this.context);
    if (!info?.capture) throw new Error('Output connected before PCM audit became ready');
    outputs.push({run, gain:this instanceof GainNode ? this.gain.value : null});
    nativeConnect.call(this, info.capture, ...args);
    return destination;
  };
  AudioNode.prototype.disconnect = function(...args) {
    const info = nodeIds.get(this); if (info) info.disconnects++;
    return nativeDisconnect.call(this, ...args);
  };
  window.__pokeyAudit = {
    reset(label) {run=phase=label;},
    async phase(label) {
      phase=label;
      await Promise.all(contexts.filter(info => info.run===run && info.context.state==='running').map(async info => {
        await info.ready; const id=++sequence;
        await new Promise(resolve => {info.pending.set(id,resolve); info.capture.port.postMessage({id,label});});
      }));
    },
    read(label=run) {return {run:label, failures:[...failures],
      contexts:contexts.map(info => ({run:info.run,state:info.context.state,sampleRate:info.sampleRate,closeRequests:info.closeRequests})),
      nodes:nodes.filter(node=>node.run===label), commands:commands.filter(command=>command.run===label), outputs:outputs.filter(output=>output.run===label),
      meters:contexts.filter(info=>info.run===label).map(info=>({sampleRate:info.sampleRate,blocks:info.blocks}))};},
  };
}

const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(page, predicate, message, timeout=25000) {
  const deadline = Date.now()+timeout;
  while (Date.now()<deadline) {if (await predicate()) return; await pause(30);}
  throw Error(`${message}; status=${await page.locator('#status').textContent()}; detail=${await page.locator('#detail').textContent()}`);
}
const status = (page, expected) => until(page, async () => (await page.locator('#status').textContent()).startsWith(expected), `Expected ${expected}`);
const readAudit = page => page.evaluate(() => window.__pokeyAudit.read());
const resetAudit = (page,label) => page.evaluate(label => window.__pokeyAudit.reset(label), label);
async function closed(page) {await until(page, async () => (await readAudit(page)).contexts.every(context => context.state==='closed'), 'AudioContext leak');}
async function controls(page, playing=false) {
  assert.equal(await page.locator('#play').isEnabled(), !playing);
  assert.equal(await page.locator('#stop').isEnabled(), playing);
  assert(await page.locator('#code').isEnabled(), 'Source editor is not editable');
}
function summary(result, {audible=true, chips=1, released=true, phase, mono=true}={}) {
  assert.deepEqual(result.failures, [], 'Capture worklet failed');
  const blocks = result.meters.flatMap(meter => meter.blocks).filter(block => !phase || block.label===phase);
  assert(blocks.length>0, `No final PCM frames captured: ${result.run}/${phase??'all'}`);
  assert(blocks.every(block=>block.finite), 'Non-finite final PCM');
  const maxAbs = Math.max(0,...blocks.map(block=>block.maxAbs));
  const acRms = Math.max(0,...blocks.flatMap(block=>block.acRms));
  const channelDifference = Math.max(0,...blocks.map(block=>block.difference));
  assert(maxAbs<0.99999 && blocks.every(block=>block.clipped===0), `Clipped final PCM: ${maxAbs}`);
  if (audible) assert(acRms>0.0005, `Silent/DC-only final PCM: ${acRms}`);
  else assert.equal(maxAbs,0, `Expected exact digital silence: ${maxAbs}`);
  if (mono) assert(channelDifference<=1e-7, `Documented mono output differs between L/R: ${channelDifference}`);
  assert.equal(result.nodes.length,chips,'Wrong number of independent chip worklets');
  for (const node of result.nodes) {
    assert.equal(node.processor,'tetorica-soundchip'); assert.equal(node.chip,'pokey');
    assert.equal(node.clock,chips===2?1789773:1789790,'Example clock'); assert(node.wasmBytes>1000,'Missing real WASM binary');
    assert.deepEqual(node.wasmMagic,[0,97,115,109],'Chip received non-WASM bytes');
    if (released) {
      assert(node.disconnects>0,'Chip node was not disconnected');
      assert(result.commands.some(command=>command.node===node.id && command.method==='dispose'),'Chip was not disposed');
    }
  }
  if (audible) {
    assert(result.outputs.length>=chips, 'Missing actual final output connections');
    assert(result.outputs.every(output=>output.gain===0.25),'Expected explicit endpoint gain 0.25, once per chip');
  }
  if (released) assert(result.contexts.every(context=>context.state==='closed'),'AudioContext leak');
  return {frames:blocks.reduce((sum,block)=>sum+block.frames,0), maxAbs, acRms, channelDifference,
    worklets:result.nodes.map(({id,processor,chip,clock,wasmBytes,wasmMagic,disconnects})=>({id,processor,chip,clock,wasmBytes,wasmMagic,disconnects})),
    finalGains:result.outputs.map(output=>output.gain), physicalOutput:'zeroed after capture'};
}
function channelWrites(result, chips, expectedChannels=[0,1,2,3]) {
  assert.equal(result.nodes.length,chips);
  return result.nodes.map(node => {
    const writes=result.commands.filter(command=>command.node===node.id && command.method==='writeRegister');
    const channels=[0,1,2,3].filter(channel=>writes.some(write=>write.register===channel*2+1 && (write.value&15)>0));
    assert.deepEqual(channels,expectedChannels,`Expected physical voices were not gated on chip ${node.id}`);
    for (const channel of channels) assert(writes.some(write=>write.register===channel*2 && write.channel===channel),'Missing owned channel timer write');
    return {node:node.id, channels, writes:writes.length};
  });
}
function noiseWrites(result) {
  const writes=result.commands.filter(command=>command.method==='writeRegister'), registers=new Uint8Array(16);
  let joined=false, low=false, high=false, poly9=false, poly17=false;
  const distortions=new Set();
  for (const write of writes) {
    registers[write.register]=write.value;
    if (write.register===8) {
      if(write.value&128)poly9=true; else if(poly9)poly17=true;
      if(write.value&16) {joined=true; assert.equal(registers[1]&15,0,'Joined lower timer helper is audible');}
    }
    if ((registers[8]&16) && write.register===0) low=true;
    if ((registers[8]&16) && write.register===2) high=true;
    if ((registers[8]&16) && write.register===1) assert.equal(write.value&15,0,'Joined helper channel 0 was gated');
    if(write.register<8 && (write.register&1) && (write.value&15))distortions.add(write.value>>5);
  }
  assert(joined&&low&&high,'Joined pair did not write both low helper 0 and upper voice 1 timer bytes');
  assert(poly9&&poly17,'Noise sequence must select poly9 and return to poly17');
  assert(distortions.size>=2,'Missing distinct distortion stages');
  const stages=[];let control=0,period=0,stage;
  for(const write of writes) {
    if(write.register===8)control=write.value;
    if(write.register===0)period=write.value;
    if(write.register!==1)continue;
    if((write.value&15)&&!stage)stage={begin:write.time,distortion:write.value>>5,poly9:!!(control&128),period};
    if(!(write.value&15)&&stage){stages.push({...stage,end:write.time});stage=undefined;}
  }
  assert.deepEqual(stages.map(({distortion,poly9})=>({distortion,poly9})),[{distortion:5,poly9:false},{distortion:2,poly9:false},{distortion:0,poly9:false},{distortion:0,poly9:true}],'Unexpected noise comparison sequence');
  const expectedPeriod=Math.round(1789790/(56*(440*2**(2/12)))-1);
  const blocks=result.meters.flatMap(meter=>meter.blocks);
  const measured=stages.map(stage=>{
    assert.equal(stage.period,expectedPeriod,'Noise comparison must use quantized B4 to avoid the poly9 A4 phase alias');
    const samples=blocks.filter(block=>block.time>stage.begin+0.03&&block.time<stage.end-0.02);
    const nonDcFrames=samples.filter(block=>block.acRms[0]>0.0005).reduce((sum,block)=>sum+block.frames,0);
    assert(nonDcFrames>4096,`Noise stage produced DC/silence: ${JSON.stringify(stage)}`);
    return {...stage,nonDcFrames,acRms:Math.max(...samples.map(block=>block.acRms[0]))};
  });
  const joinedRegisters=new Uint8Array(16),joinedStages=[];let joinedStage;
  for(const write of writes) {
    joinedRegisters[write.register]=write.value;
    if(!(joinedRegisters[8]&16)||write.register!==3)continue;
    if((write.value&15)&&!joinedStage) {
      assert(joinedRegisters[8]&64,'Joined example must use the high input clock');
      joinedStage={begin:write.time,low:joinedRegisters[0],high:joinedRegisters[2],period:joinedRegisters[0]|joinedRegisters[2]<<8};
    }
    if(!(write.value&15)&&joinedStage){joinedStages.push({...joinedStage,end:write.time});joinedStage=undefined;}
  }
  assert.equal(joinedStages.length,4,'Expected four joined notes on upper voice 1');
  const joinedNotes=joinedStages.map((stage,index)=>{
    const requestedHz=440*2**(([36,43,48,52][index]-69)/12),expected=Math.round(1789790/(2*requestedHz)-7);
    assert.equal(stage.period,expected,'Joined 16-bit low/high timer period');
    const samples=blocks.filter(block=>block.time>stage.begin+0.03&&block.time<stage.end-0.02);
    const nonDcFrames=samples.filter(block=>block.acRms[0]>0.0005).reduce((sum,block)=>sum+block.frames,0);
    assert(nonDcFrames>4096,'Joined upper voice produced DC/silence');
    return {...stage,requestedHz,quantizedHz:1789790/(2*(stage.period+7)),nonDcFrames};
  });
  return {joinedHelper:0, joinedVoice:1, lowTimerWritten:low, highTimerWritten:high, poly9, returnedToPoly17:poly17, distortions:[...distortions].sort(), stages:measured, joinedNotes};
}
function dualIsolation(result) {
  const ids=result.nodes.map(node=>node.id), levels=ids.map(()=>[0,0,0,0]), windows=[];
  let begin,maxSimultaneous=0;
  for(const command of result.commands) {
    if(command.method!=='writeRegister'||command.register>=8||!(command.register&1))continue;
    const index=ids.indexOf(command.node);levels[index][command.register>>1]=command.value&15;
    maxSimultaneous=Math.max(maxSimultaneous,levels.flat().filter(value=>value>0).length);
    const isolated=levels[0].every(value=>value===0)&&levels[1].some(value=>value>0);
    if(isolated&&begin===undefined)begin=command.time;
    if(!isolated&&begin!==undefined){if(command.time-begin>=0.08)windows.push({begin,end:command.time});begin=undefined;}
  }
  const blocks=result.meters.flatMap(meter=>meter.blocks);
  assert.equal(maxSimultaneous,8,'Dual example never gated eight physical voices together');
  const audible=windows.map(window=>({...window,frames:blocks.filter(block=>block.time>window.begin+0.03&&block.time<window.end-0.02&&block.acRms[0]>0.0005).reduce((sum,block)=>sum+block.frames,0)}));
  assert(audible.length>=4&&audible.every(window=>window.frames>512),'Second POKEY did not remain audible after first core allNotesOff');
  return {maxSimultaneousVoices:maxSimultaneous,firstCoreAllOffWhileSecondContinues:audible};
}
const resources = key => key==='dual'
  ? `const {pokeys,transports,context}=await startAudio(); const pokey=pokeys[0],transport=transports[0];`
  : `const {pokey,transport,context}=await startAudio();`;
const initialize = key => key==='dual' ? `for(const synth of pokeys)synth.initialize();` : `pokey.initialize();`;
const start = key => key==='dual' ? `await Promise.all(transports.map(transport=>transport.start()));` : `await transport.start();`;
const allOff = key => key==='dual' ? `for(const synth of pokeys)synth.allNotesOff();` : `pokey.allNotesOff();`;
function toneSource(key, seconds=0.7) {
  return `${resources(key)}\n${initialize(key)}\npokey.setVolume(0,8); globalThis.__pokeyExpectedHz=pokey.setNote(0,'A4'); pokey.keyOn(0);\n${start(key)}\nconsole.log('EDITED_POKEY_SOURCE'); await sleep(${seconds});\n${allOff(key)} await sleep(0.12);`;
}
function zeroSource(key) {
  return `${resources(key)}\n${initialize(key)}\npokey.setVolume(0,0); pokey.noteOn(0,'A4');\nglobalThis.__pokeyZeroVolume=pokey.getRegisterSnapshot()[1]&15;\n${start(key)}\nawait globalThis.__pokeyAudit.phase('retained-zero'); await sleep(0.35);\nawait globalThis.__pokeyAudit.phase('restored-volume');\npokey.setVolume(0,8); pokey.keyOn(0); await sleep(0.45);\n${key==='dual'?'await Promise.all(transports.map(transport=>transport.stop()));':'await transport.stop();'}\nawait globalThis.__pokeyAudit.phase('transport-stopped'); await sleep(0.35);`;
}
async function gateWasm(page) {
  let release, requested;
  const held=new Promise(resolve=>{release=resolve;}), started=new Promise(resolve=>{requested=resolve;});
  await page.route('**/generated/pokey_wasm.wasm*',async route=>{
    requested(); await held;
    try{await route.continue();}catch(error){if(!/closed|cancel|abort|Target/i.test(String(error)))throw error;}
  });
  return {release, async wait(){let timer;try{await Promise.race([started,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('POKEY WASM was not requested')),20000);})]);}finally{clearTimeout(timer);}}};
}
async function checkExample(browser,base,key,path) {
  const page=await browser.newPage({serviceWorkers:'block'}), errors=[], missing=[], failed=[];
  page.setDefaultTimeout(25000);
  await page.addInitScript(installOutputAudit);
  page.on('pageerror',error=>errors.push(error.stack??error.message));
  page.on('response',response=>{if(response.status()===404)missing.push(response.url());});
  page.on('requestfailed',request=>{if(!/cancel|abort|ERR_FAILED/i.test(request.failure()?.errorText??''))failed.push({url:request.url(),error:request.failure()?.errorText});});
  const gate=await gateWasm(page), chips=key==='dual'?2:1;
  const checks={path};
  try {
    await page.goto(`${base}examples/${path}/web/index.html`);await status(page,'Ready.');await controls(page);
    assert.deepEqual((await readAudit(page)).contexts,[],'Page load began audio');
    assert.match(await page.locator('body').innerText(),/mono/i,'Output topology must be documented');
    const original=await page.locator('#code').inputValue();
    await resetAudit(page,'cancelled-initialization');
    await page.locator('#code').fill(`${resources(key)} globalThis.__pokeyCancelledSourceRan=true;`);
    await page.click('#play');await gate.wait();await page.click('#stop');gate.release();
    await status(page,'Stopped.');await closed(page);await controls(page);
    const cancelled=await readAudit(page);
    assert.equal(await page.evaluate(()=>globalThis.__pokeyCancelledSourceRan),undefined,'Cancelled initialization resumed edited source');
    assert.equal(cancelled.nodes.length,0,'Cancelled initialization created a chip');
    assert(cancelled.meters.flatMap(meter=>meter.blocks).every(block=>block.maxAbs===0),'Cancelled fetch emitted PCM');
    checks.cancelledInitialization={closedContexts:cancelled.contexts.filter(context=>context.run===cancelled.run).length, chipWorklets:0, sourceResumed:false};
    await page.unroute('**/generated/pokey_wasm.wasm*');

    await resetAudit(page,'original');await page.locator('#code').fill(original);await page.click('#play');
    await status(page,'Finished.');await closed(page);await controls(page);
    const originalAudit=await readAudit(page);
    checks.original=summary(originalAudit,{chips});
    checks.physicalChannels=channelWrites(originalAudit,chips,key==='noise'?[0,1]:[0,1,2,3]);
    if(key==='noise')checks.noiseSequence=noiseWrites(originalAudit);
    if(key==='dual') {
      assert.equal(new Set(originalAudit.nodes.map(node=>node.id)).size,2,'Dual shares one worklet');
      const perNode=originalAudit.nodes.map(node=>originalAudit.commands.filter(command=>command.node===node.id&&command.method==='writeRegister'&&command.register<8).map(({register,value})=>[register,value]));
      assert.notDeepEqual(perNode[0],perNode[1],'Dual chips received identical authored parts');
      checks.dualTopology='two independent four-channel worklets; mono host sum duplicated to L/R';
      checks.dualIsolation=dualIsolation(originalAudit);
    }

    await resetAudit(page,'edited-a4');await page.locator('#code').fill(toneSource(key,30));await page.click('#play');
    await status(page,'Playing');await controls(page,true);
    await page.evaluate(()=>window.__pokeyAudit.phase('steady-a4'));
    await until(page,async()=>((await readAudit(page)).meters.flatMap(meter=>meter.blocks).filter(block=>block.label==='steady-a4'&&block.acRms[0]>0.0005&&block.frequency[0]>0).length>=6),'Edited A4 did not produce six final PCM pitch windows');
    const steady=await readAudit(page), expected=await page.evaluate(()=>globalThis.__pokeyExpectedHz);
    checks.steadyA4=summary(steady,{chips,released:false,phase:'steady-a4'});
    assert(Number.isFinite(expected)&&Math.abs(expected-437.8)<0.2,`Unexpected 64 kHz timer quantization: ${expected}`);
    const frequencies=steady.meters.flatMap(meter=>meter.blocks).filter(block=>block.label==='steady-a4'&&block.acRms[0]>0.0005).flatMap(block=>block.frequency).filter(value=>value>0).sort((a,b)=>a-b);
    const measured=frequencies[Math.floor(frequencies.length/2)];
    assert(Number.isFinite(measured)&&Math.abs(measured-expected)<2,`A4 PCM pitch ${measured} Hz differs from quantized ${expected} Hz`);
    checks.steadyA4.pitch={requestedHz:440,quantizedHz:expected,measuredHz:measured,toleranceHz:2};
    await page.click('#stop');await status(page,'Stopped.');await closed(page);await controls(page);
    const stopped=await readAudit(page);summary(stopped,{chips});
    for(const node of stopped.nodes)assert(stopped.commands.some(command=>command.node===node.id&&command.method==='clear-scheduled-writes'),'Stop left queued register writes');
    checks.stoppedPlayback=true;

    await resetAudit(page,'retained-volume-zero');await page.locator('#code').fill(zeroSource(key));await page.click('#play');
    await status(page,'Finished.');await closed(page);await controls(page);
    const zero=await readAudit(page);assert.equal(await page.evaluate(()=>globalThis.__pokeyZeroVolume),0,'Silent retained volume changed on keyOn');
    checks.retainedZeroVolume=summary(zero,{chips,audible:false,phase:'retained-zero'});
    checks.restoredVolume=summary(zero,{chips,phase:'restored-volume'});
    checks.stoppedTransport=summary(zero,{chips,audible:false,phase:'transport-stopped'});

    await resetAudit(page,'syntax-error');await page.locator('#code').fill('const = ;');await page.click('#play');
    await status(page,'Error');await closed(page);await controls(page);
    assert.equal((await readAudit(page)).nodes.length,0,'Syntax error created audio');checks.syntaxErrorHandled=true;

    await resetAudit(page,'runtime-error');await page.locator('#code').fill(`${resources(key)} ${initialize(key)} pokey.noteOn(0,'A4'); ${start(key)} await sleep(0.35); throw new Error('EXPECTED_POKEY_RUNTIME_ERROR');`);await page.click('#play');
    await status(page,'Error');await closed(page);await controls(page);
    assert.match(await page.locator('#detail').textContent(),/EXPECTED_POKEY_RUNTIME_ERROR/);summary(await readAudit(page),{chips});checks.runtimeErrorHandled=true;

    await resetAudit(page,'rerun');await page.locator('#code').fill(toneSource(key));await page.click('#play');
    await status(page,'Finished.');await closed(page);await controls(page);
    assert.match(await page.locator('#detail').textContent(),/EDITED_POKEY_SOURCE/);checks.editedSourceRerun=summary(await readAudit(page),{chips});

    await resetAudit(page,'pagehide');await page.locator('#code').fill(toneSource(key,30));await page.click('#play');await status(page,'Playing');
    await until(page,async()=>(await readAudit(page)).meters.flatMap(meter=>meter.blocks).some(block=>block.acRms[0]>0.0005),'Pagehide run was silent');
    await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));await closed(page);
    summary(await readAudit(page),{chips});checks.pagehideReleased=true;
    assert.deepEqual(errors,[],'Unexpected page errors');assert.deepEqual(missing,[],'Missing static assets');assert.deepEqual(failed,[],'Unexpected request failures');
    checks.no404=true;checks.noPageErrors=true;
    return checks;
  }finally{gate.release();await page.close();}
}

const receipt={checker:'scripts/check-pokey-browser.mjs', checkerSha256:sha256(await readFile(fileURLToPath(import.meta.url))), startedAt:new Date().toISOString(), siteRoot:site, subpath:prefix, results:[], assets:[]};
let failure;
try {
  for(const [key,path]of Object.entries(cases))if(!selected||key===selected)await stat(join(site,'examples',path,'web/index.html'));
  const runtimePackage=await readFile(join(site,'vendor/tetorica-fm2612/package.json'));
  const metadata=JSON.parse(runtimePackage);
  assert.equal(metadata.version,'0.2.31','Static site did not contain published 0.2.31');
  receipt.runtime={name:metadata.name,version:metadata.version,packageSha256:sha256(runtimePackage)};
  const lockBytes=await readFile(join(repository,'package-lock.json'));
  const lock=JSON.parse(lockBytes),installed=lock.packages['node_modules/tetorica-fm2612'];
  receipt.npmProvenance={lockSha256:sha256(lockBytes),version:installed.version,resolved:installed.resolved,integrity:installed.integrity};
  assert.equal(installed.version,metadata.version,'Built runtime and npm lock differ');
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const base=`http://127.0.0.1:${server.address().port}${prefix}`;
  const engines=arguments_.includes('--chromium')?{chromium}:arguments_.includes('--webkit')?{webkit}:{chromium,webkit};
  for(const [name,engine]of Object.entries(engines)) {
    const browser=await engine.launch({headless:true,...(name==='chromium'?{args:['--autoplay-policy=no-user-gesture-required']}: {})});
    try {
      const catalog=await browser.newPage();await catalog.goto(base);
      for(const path of Object.values(cases))await catalog.locator(`a[href="./examples/${path}/web/index.html"]`).waitFor();
      await catalog.close();
      for(const [key,path]of Object.entries(cases)) {
        if(selected&&selected!==key)continue;
        const result={browser:name,browserVersion:browser.version(),case:key,passed:true,...await checkExample(browser,base,key,path)};
        receipt.results.push(result);console.log(JSON.stringify(result));
      }
    }finally{await browser.close();}
  }
  assert([...served.keys()].some(path=>path.endsWith('/generated/pokey_wasm.wasm')),'No real POKEY WASM asset served');
  assert.deepEqual(missingRequests,[],'Missing assets, including catalog requests');
  receipt.passed=true;
}catch(error){failure=error;receipt.passed=false;receipt.error=error.stack??String(error);}
finally{
  if(server.listening)await new Promise(resolve=>server.close(resolve));
  receipt.finishedAt=new Date().toISOString();receipt.assets=[...served.values()].sort((a,b)=>a.path.localeCompare(b.path));
  // Re-read all exercised bytes: a receipt only succeeds for unchanged assets.
  try{for(const asset of receipt.assets)assert.equal(sha256(await readFile(join(site,asset.path))),asset.sha256,`Final asset changed: ${asset.path}`);}
  catch(error){failure??=error;receipt.passed=false;receipt.error=error.stack??String(error);}
  if(receiptPath){await mkdir(dirname(receiptPath),{recursive:true});await writeFile(receiptPath,JSON.stringify(receipt,null,2)+'\n');console.log(`Receipt: ${receiptPath}`);}
}
if(failure)throw failure;
