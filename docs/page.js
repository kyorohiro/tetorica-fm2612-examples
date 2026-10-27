const labels = {'genesis/fm': 'Genesis FM — 発音・音色・チャンネル', dx7: 'DX7 — 6オペレーター FM / SysEx', snes: 'SNES / SPC — 実験的実装', 'chip-raw': 'Chip raw — レジスタ操作', embedding: 'Embedding — アプリ・ゲームへの組み込み', 'transport/direct': 'DirectTransport — PCM 生成・保存', patches: 'Patches — TFI / VGI の音色ファイル', 'genesis/psg': 'Genesis PSG — トーン・ノイズ', 'genesis/pcm': 'Genesis PCM — ファイル出力', 'audio-worklet': 'AudioWorklet — 音声スレッドで再生', opl: 'OPL — YM3526 / YM3812 / Y8950 FM / YMF262', opl2: 'OPL2 — 2オペレーター / Rhythm', opl3: 'OPL3 — 4オペレーター / Stereo', 'master-system': 'Master System — OPLL / PSG', msx: 'MSX — AY / OPLL', 'msx-audio': 'MSX Audio — AY / OPLL / Y8950 FM', pc98: 'PC-98 — YM2608 FM / SSG / ADPCM', 'pc-engine': 'PC Engine — HuC6280 波形 / Noise / LFO', 'pc-engine-cd': 'PC Engine CD-ROM² — HuC6280 / MSM5205 / CD-DA', wonderswan: 'WonderSwan — 4-bit波形 / Noise / Sweep / Voice PCM', pokey: 'POKEY — 4CH / Noise / Joined timers / Dual', gameboy: 'Game Boy — pulse / wave / noise', nes: 'NES — APU / FDS / DMC', x68000: 'X68000 — YM2151 FM / OKIM6258 ADPCM'};
const catalog = document.getElementById('catalog');
try {
  const response = await fetch('./examples/manifest.json');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const examples = await response.json();
  catalog.replaceChildren();
  for (const [group, label] of Object.entries(labels)) {
    const section = document.createElement('section');
    section.className = 'category';
    const heading = document.createElement('h2'); heading.textContent = label;
    const grid = document.createElement('div'); grid.className = 'catalog-grid';
    for (const example of examples.filter(item => item.id.startsWith(group + '/'))) {
      const card = document.createElement('article'); card.className = 'sample-card';
      const id = document.createElement('p'); id.className = 'eyebrow'; id.textContent = example.id;
      const title = document.createElement('h3'); title.textContent = example.title;
      const description = document.createElement('p'); description.textContent = example.description;
      const links = document.createElement('div'); links.className = 'actions';
      const hasNode = !example.environments || example.environments.includes('node');
      const hasWeb = !example.environments || example.environments.includes('web');
      const entries = [...(hasWeb ? [['Web →', 'web/index.html']] : []), ...(hasNode ? [['Node source', 'node/main.mjs']] : []), ['README', 'README.md']];
      for (const [text, file] of entries) {
        const link = document.createElement('a'); link.textContent = text; link.href = `./examples/${example.id}/${file}`; links.append(link);
      }
      const command = document.createElement('pre');
      const code = document.createElement('code'); code.textContent = hasNode ? `node examples/${example.id}/node/main.mjs` : 'Web Audio / ブラウザ専用'; command.append(code);
      card.append(id, title, description, links, command); grid.append(card);
    }
    section.append(heading, grid); catalog.append(section);
  }
} catch (error) {
  catalog.textContent = `読み込みに失敗しました: ${error.message}。npm install 後、npm run dev で開いてください。`;
}
