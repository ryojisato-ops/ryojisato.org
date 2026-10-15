import { readFile, writeFile } from 'node:fs/promises';

// Local file import only. Keep editorial additions and import only disclosed records.
const input = process.argv[2];
if (!input) throw new Error('Usage: node scripts/import-researchmap-export.mjs EXPORT.jsonl');
const records = (await readFile(input, 'utf8')).trim().split(/\r?\n/).filter(Boolean).map(JSON.parse);
if (!records.some(r => r.insert?.type === 'researchers' && r.merge?.permalink === 'ryoji-sato')) throw new Error('Unexpected researcher');
const disclosed = records.filter(r => r.merge?.display === 'disclosed');
const find = id => disclosed.find(r => r.insert?.id === id)?.merge;
const esc = value => String(value || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const local = value => value?.ja || value?.en || '';
const row = (id, type) => {
  const item = find(id);
  if (!item) throw new Error(`Missing disclosed record ${id}`);
  const title = local(type === 'book' ? item.book_title : item.paper_title);
  const authors = (item.authors?.ja || item.authors?.en || []).map(a => a.name).join('、');
  const detail = [authors, local(type === 'book' ? item.publisher : item.publication_name), item.publication_date, item.identifiers?.isbn?.[0] && `ISBN ${item.identifiers.isbn[0]}`].filter(Boolean).join(' / ');
  return `<li class="pub-item" data-researchmap-id="${id}"><div class="pub-year">${esc(item.publication_date.slice(0,4))}</div><div><div class="pub-title"><a href="https://researchmap.jp/ryoji-sato/${type === 'book' ? 'books_etc' : 'published_papers'}/${id}">${esc(title)}</a></div><div class="pub-detail">${esc(detail)}</div></div></li>`;
};
const page = new URL('../dist/publications/index.html', import.meta.url);
let html = await readFile(page, 'utf8');
for (const [id, type, block] of [['55012887', 'book', 'BOOKS'], ['51834634', 'paper', 'PAPERS'], ['42190853', 'book', 'BOOKS'], ['42190855', 'book', 'BOOKS']]) {
  if (!html.includes(`data-researchmap-id="${id}"`)) html = html.replace(`<!-- RESEARCHMAP:${block}:START --><ol class="pub-list">`, `<!-- RESEARCHMAP:${block}:START --><ol class="pub-list">${row(id,type)}`);
}
html = html.replace(/<ol class="pub-list">([\s\S]*?)<\/ol>/g, (all, body) => {
  const items = body.match(/<li class="pub-item"[\s\S]*?<\/li>/g) || [];
  items.sort((a,b) => Number(b.match(/pub-year">(\d{4})/)?.[1] || 0) - Number(a.match(/pub-year">(\d{4})/)?.[1] || 0));
  return `<ol class="pub-list">${items.join('')}</ol>`;
});
html = html.replace(/<!-- RESEARCHMAP:CREDIT:START -->[\s\S]*?<!-- RESEARCHMAP:CREDIT:END -->/, '<!-- RESEARCHMAP:CREDIT:START --><div class="note">researchmapの本人用エクスポートを2026年10月5日に確認し、公開情報を反映しました。独自に掲載している業績も含みます。<a href="https://researchmap.jp/ryoji-sato">researchmapのプロフィール</a></div><!-- RESEARCHMAP:CREDIT:END -->');
await writeFile(page, html);
const researchPath = new URL('../dist/research/index.html', import.meta.url);
let research = await readFile(researchPath, 'utf8');
if (!research.includes('25K16060')) research = research.replace('</main>', '<section class="section"><div class="wrap content-grid"><div class="content-label">RESEARCH PROJECT</div><div class="prose"><h2>現在の研究課題</h2><h3>自由エネルギー原理からの新たな生命理解の提案</h3><p>日本学術振興会 科学研究費助成事業・若手研究。2025年4月–2029年3月。研究代表者：佐藤亮司。</p><p><a href="https://kaken.nii.ac.jp/grant/KAKENHI-PROJECT-25K16060">研究課題の詳細（KAKEN）</a></p></div></div></section></main>');
await writeFile(researchPath, research);
console.log('Imported disclosed additions; preserved existing editorial content.');
