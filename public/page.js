const labels = {'genesis/fm': 'Genesis FM — 発音・音色・チャンネル', 'chip-raw': 'Chip raw — レジスタ操作', 'genesis/psg': 'Genesis PSG — トーン・ノイズ', 'genesis/pcm': 'Genesis PCM — ファイル出力', 'audio-worklet': 'AudioWorklet — 音声スレッドで再生'};
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
      for (const [text, file] of [['Web →', 'web/index.html'], ['Node source', 'node/main.mjs'], ['README', 'README.md']]) {
        const link = document.createElement('a'); link.textContent = text; link.href = `./examples/${example.id}/${file}`; links.append(link);
      }
      const command = document.createElement('pre');
      const code = document.createElement('code'); code.textContent = `node examples/${example.id}/node/main.mjs`; command.append(code);
      card.append(id, title, description, links, command); grid.append(card);
    }
    section.append(heading, grid); catalog.append(section);
  }
} catch (error) {
  catalog.textContent = `読み込みに失敗しました: ${error.message}。npm install 後、npm run dev で開いてください。`;
}
