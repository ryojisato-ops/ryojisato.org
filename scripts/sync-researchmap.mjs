import { readFile, writeFile } from 'node:fs/promises';

const API_URL = 'https://api.researchmap.jp/ryoji-sato';
const PROFILE_URL = 'https://researchmap.jp/ryoji-sato';
const PAGE_PATH = new URL('../dist/publications/index.html', import.meta.url);
const OUTPUT_PATH = process.env.RESEARCHMAP_OUTPUT_FILE || PAGE_PATH;

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const localized = (value) => value?.ja || value?.en || '';
const yearOf = (date) => String(date || '').slice(0, 4) || '—';
const graphItems = (data, type) => data['@graph']?.find((entry) => entry['@type'] === type)?.items || [];
const firstLink = (item) => {
  const doi = item.identifiers?.doi?.[0];
  if (doi) return `https://doi.org/${doi}`;
  return item.see_also?.find((entry) => entry['@id'])?.['@id'] || '';
};
const authorsOf = (item) => {
  const authors = item.authors?.ja || item.authors?.en || [];
  return authors.map((author) => author.name).filter(Boolean).join('、');
};

const renderItems = (items, type) => {
  const sorted = [...items].sort((a, b) => String(b.publication_date || '').localeCompare(String(a.publication_date || '')));
  const rows = sorted.map((item) => {
    const title = localized(type === 'books_etc' ? item.book_title : item.paper_title);
    const publication = localized(type === 'books_etc' ? item.publisher : item.publication_name);
    const authors = authorsOf(item);
    const isbn = item.identifiers?.isbn?.[0];
    const volumePages = [item.volume, item.number && `(${item.number})`, item.starting_page && item.ending_page && `${item.starting_page}–${item.ending_page}`].filter(Boolean).join(' ');
    const details = [authors, publication, volumePages, isbn && `ISBN ${isbn}`].filter(Boolean).join(' / ');
    const link = firstLink(item);
    const titleHtml = link
      ? `<a href="${escapeHtml(link)}">${escapeHtml(title)}</a>`
      : escapeHtml(title);
    return `<li class="pub-item"><div class="pub-year">${escapeHtml(yearOf(item.publication_date))}</div><div><div class="pub-title">${titleHtml}</div><div class="pub-detail">${escapeHtml(details)}</div></div></li>`;
  }).join('');
  return `<ol class="pub-list">${rows}</ol>`;
};

const replaceBlock = (html, name, content) => {
  const start = `<!-- RESEARCHMAP:${name}:START -->`;
  const end = `<!-- RESEARCHMAP:${name}:END -->`;
  const pattern = new RegExp(`${start}[\\s\\S]*?${end}`);
  if (!pattern.test(html)) throw new Error(`Missing ${name} markers in publications page`);
  return html.replace(pattern, `${start}${content}${end}`);
};

let data;
if (process.env.RESEARCHMAP_DATA_FILE) {
  data = JSON.parse(await readFile(process.env.RESEARCHMAP_DATA_FILE, 'utf8'));
} else {
  const response = await fetch(API_URL, { headers: { accept: 'application/ld+json' } });
  if (!response.ok) throw new Error(`researchmap returned ${response.status}`);
  data = await response.json();
}

let html = await readFile(PAGE_PATH, 'utf8');
html = replaceBlock(html, 'BOOKS', renderItems(graphItems(data, 'books_etc'), 'books_etc'));
html = replaceBlock(html, 'PAPERS', renderItems(graphItems(data, 'published_papers'), 'published_papers'));
const updated = escapeHtml(String(data['rm:modified'] || '').slice(0, 10));
html = replaceBlock(html, 'CREDIT', `<div class="note">researchmapの公開情報を毎週自動同期しています（データ更新日 ${updated}）。 <a href="${PROFILE_URL}">Powered by researchmap</a></div>`);
await writeFile(OUTPUT_PATH, html);

console.log(`Synced ${graphItems(data, 'books_etc').length} books and ${graphItems(data, 'published_papers').length} papers.`);
