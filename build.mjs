// Build do site Mopi Digital: npm run build  ->  dist/
import * as esbuild from 'esbuild';
import {minify} from 'html-minifier-terser';
import sharp from 'sharp';
import fs from 'node:fs';
import crypto from 'node:crypto';
import zlib from 'node:zlib';

const out = 'dist';
const SITE = 'https://mopidigital.pt';
fs.rmSync(out, {recursive: true, force: true});
fs.mkdirSync(`${out}/assets/fonts`, {recursive: true});
fs.mkdirSync(`${out}/assets/img`, {recursive: true});
fs.mkdirSync('src/_gen', {recursive: true});
const hash = b => crypto.createHash('sha256').update(b).digest('hex').slice(0, 8);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// 1) Fontes alojadas no site (só o subconjunto latino, variáveis)
const fdir = 'node_modules/@fontsource-variable';
const fonts = {
  PJS: `${fdir}/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2`,
  SORA: `${fdir}/sora/files/sora-latin-wght-normal.woff2`,
};
const fontUrl = {};
for (const [k, p] of Object.entries(fonts)) {
  const b = fs.readFileSync(p);
  const n = `${k.toLowerCase()}-${hash(b)}.woff2`;
  fs.writeFileSync(`${out}/assets/fonts/${n}`, b);
  fontUrl[k] = `assets/fonts/${n}`;
}

// 2) Imagens: cada pasta de src/img/<nome>/ -> WebP em 480/960/1600 px (qualidade 80) + manifesto
//    "cover.*" é a capa da miniatura; sem "cover", usa-se a primeira imagem.
const manifest = {};
const imgReport = [];
if (fs.existsSync('src/img')) {
  for (const d of fs.readdirSync('src/img', {withFileTypes: true}).filter(e => e.isDirectory())) {
    const files = fs.readdirSync(`src/img/${d.name}`).filter(f => /\.(png|jpe?g|webp|tiff?)$/i.test(f)).sort();
    const items = [];
    for (const f of files) {
      const buf = fs.readFileSync(`src/img/${d.name}/${f}`);
      const meta = await sharp(buf).rotate().metadata();
      const rot = (meta.orientation || 1) >= 5; // metadados já trocados pelo rotate()
      const W = meta.width, H = meta.height;
      const base = f.replace(/\.[^.]+$/, '').replace(/[^a-z0-9_-]+/gi, '-'), h = hash(buf);
      const widths = [...new Set([480, 960, 1600].map(w => Math.min(w, W)))].sort((a, b) => a - b);
      const variants = [];
      let bytes = 0;
      for (const w of widths) {
        const name = `${d.name}-${base}-${w}-${h}.webp`;
        const info = await sharp(buf).rotate().resize({width: w, withoutEnlargement: true}).webp({quality: 80, effort: 5}).toFile(`${out}/assets/img/${name}`);
        bytes += info.size; variants.push({w, src: `assets/img/${name}`});
      }
      const top = variants[variants.length - 1];
      const mid = [...variants].reverse().find(v => v.w <= 960) || variants[0];
      items.push({file: f, base, w: top.w, h: Math.round(H * top.w / W), src: mid.src,
        srcset: variants.map(v => `${v.src} ${v.w}w`).join(', '), variants});
      imgReport.push({imagem: `${d.name}/${f}`, original_kb: Math.round(buf.length / 1024), webp_kb_960: Math.round(fs.statSync(`${out}/${mid.src}`).size / 1024), tamanhos: widths.join('/')});
    }
    const gallery = items.filter(i => i.base !== 'cover');
    manifest[d.name] = {cover: items.find(i => i.base === 'cover') || gallery[0] || null, items: gallery};
    if (!manifest[d.name].cover) delete manifest[d.name];
  }
}
fs.writeFileSync('src/_gen/img-manifest.json', JSON.stringify(manifest));
// 2b) Projetos: src/projects/*.json (um por página de projeto)
const projects = fs.readdirSync('src/projects').filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(`src/projects/${f}`, 'utf8'))).sort((a, b) => (a.order || 99) - (b.order || 99));
for (const p of projects) { const m = manifest[p.slug]; p.items = m ? m.items : []; p.cover = m ? m.cover : null; }
fs.writeFileSync('src/_gen/projects.json', JSON.stringify(projects.map(p => ({slug: p.slug, cat: p.category, title: p.title, pos: p.thumbPos || 'top',
  cover: p.items.length && p.cover ? {src: p.cover.src, srcset: p.cover.srcset, w: p.cover.w, h: p.cover.h} : null}))));
const em = manifest['email-marketing'];
const hasEmail = !!(em && em.items.length);

// 3) JavaScript: bundle, tree shaking, minificação e code splitting (import() dinâmico)
const js = await esbuild.build({
  entryPoints: ['src/main.js', 'src/page.js'], bundle: true, splitting: true, format: 'esm',
  minify: true, target: ['es2020'], outdir: `${out}/assets`,
  entryNames: '[name]-[hash]', chunkNames: 'c-[name]-[hash]',
  metafile: true, legalComments: 'none', logLevel: 'warning',
});
const entry = n => Object.entries(js.metafile.outputs).find(([, o]) => o.entryPoint === n)[0].replace(`${out}/`, '');
const mainOut = entry('src/main.js'), pageOut = entry('src/page.js');

// 4) CSS: crítico (inline no HTML) e diferido (ficheiro com hash)
const min = async c => (await esbuild.transform(c, {loader: 'css', minify: true})).code.trim();
let crit = fs.readFileSync('src/critical.css', 'utf8').replace('{{PJS}}', () => fontUrl.PJS).replace('{{SORA}}', () => fontUrl.SORA);
crit = await min(crit);
const rest = await min(fs.readFileSync('src/rest.css', 'utf8'));
const restName = `rest-${hash(rest)}.css`;
fs.writeFileSync(`${out}/assets/${restName}`, rest);

const headAssets = (pre, mod) => [
  `<link rel="preload" href="${pre}${fontUrl.PJS}" as="font" type="font/woff2" crossorigin>`,
  `<link rel="preload" href="${pre}${fontUrl.SORA}" as="font" type="font/woff2" crossorigin>`,
  `<link rel="modulepreload" href="${pre}${mod}">`,
  `<link rel="preload" href="${pre}assets/${restName}" as="style" onload="this.onload=null;this.rel='stylesheet'">`,
  `<noscript><link rel="stylesheet" href="${pre}assets/${restName}"></noscript>`,
].join('\n');
const htmlMin = h => minify(h, {collapseWhitespace: true, conservativeCollapse: true, removeComments: true, minifyJS: false, minifyCSS: false, decodeEntities: false});

// 5) Página inicial
let html = fs.readFileSync('src/template.html', 'utf8');
html = html.replace(/style="--d:[^";]*;?/g, 'style="').replace(/ style=""/g, '');
html = html.replace('@@EMAILURL@@', hasEmail ? `"url":"${SITE}/email-marketing/",` : '');
html = html.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/, (m, a, b, c) => a + JSON.stringify(JSON.parse(b)) + c);
html = html.replace('<!--HEAD_ASSETS-->', () => headAssets('', mainOut)).replace('/*CRIT*/', () => crit).replace('%MAIN%', () => mainOut);
const tpl = fs.readFileSync('src/template.html', 'utf8');
fs.writeFileSync(`${out}/index.html`, await htmlMin(html));

// 6) Páginas de projeto (fora do menu; só indexáveis quando têm imagens)
const fix = s => s.replace(/href="#topo"/g, 'href="../"').replace(/href="#(?!")/g, 'href="../#').replace(/<use href="\.\.\/#/g, '<use href="#').replace(/ data-pv/g, ''); // só as ligações <a>; os ícones <use> ficam como estão
const header = fix(tpl.match(/<header>[\s\S]*?<\/header>/)[0]);
const footer = fix(tpl.match(/<footer>[\s\S]*?<\/footer>/)[0]);
const waw = tpl.match(/<div class="waw">[\s\S]*?<\/a><\/div>/)[0];
const sprite = tpl.match(/<svg width="0"[\s\S]*?<\/svg>/)[0];
const pcrit = crit.replace(/url\((["']?)assets\//g, 'url($1../assets/');
const projTpl = fs.readFileSync('src/page-project.html', 'utf8');
for (const p of projects) {
  const live = p.items.length > 0, url = `${SITE}/${p.slug}/`;
  fs.mkdirSync(`${out}/${p.slug}`, {recursive: true});
  const gallery = live
    ? `<div class="xg">${p.items.map((it, i) => {
        const ex = (p.examples || {})[it.file] || {};
        const cap = ex.title || ex.caption ? `<figcaption>${ex.title ? `<b>${esc(ex.title)}</b>` : ''}${esc(ex.caption || '')}</figcaption>` : '';
        return `<figure class="xf rv"><img src="../${it.src}" srcset="${it.variants.map(v => `../${v.src} ${v.w}w`).join(', ')}" sizes="(min-width:900px) 33vw,(min-width:600px) 50vw,92vw" width="${it.w}" height="${it.h}" alt="${esc(ex.alt || `${p.title}, imagem ${i + 1}`)}" loading="lazy" decoding="async">${cap}</figure>`;
      }).join('')}</div>`
    : `<div class="xe rv">Os exemplos estão a caminho.</div>`;
  const behance = live && p.behance ? `<a class="lnk" href="${esc(p.behance)}" target="_blank" rel="noopener">Ver o projeto completo no Behance →</a>` : '';
  const sc = p.schema || {type: 'CreativeWork', name: p.title};
  const node = sc.type === 'Service'
    ? {'@type': 'Service', '@id': `${url}#main`, name: sc.name, serviceType: sc.serviceType, description: sc.description,
       provider: {'@id': `${SITE}/#organization`}, areaServed: {'@type': 'Country', name: 'Portugal'}}
    : {'@type': 'CreativeWork', '@id': `${url}#main`, name: sc.name, genre: sc.genre, description: sc.description, inLanguage: 'pt-PT',
       ...(live && p.cover ? {image: `${SITE}/${p.cover.src}`} : {}), isPartOf: {'@id': `${SITE}/#website`}};
  const ld = {'@context': 'https://schema.org', '@graph': [
    {'@type': 'WebPage', '@id': `${url}#webpage`, url, name: p.metaTitle, inLanguage: 'pt-PT', isPartOf: {'@id': `${SITE}/#website`},
      about: {'@id': `${url}#main`}, breadcrumb: {'@id': `${url}#breadcrumb`}},
    {'@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: [
      {'@type': 'ListItem', position: 1, name: 'Início', item: `${SITE}/`},
      {'@type': 'ListItem', position: 2, name: p.title, item: url}]},
    node]};
  let page = projTpl;
  const rep = (k, v) => { page = page.split(k).join(v); };
  const extra = p.extraHtml ? fs.readFileSync(`src/projects/${p.extraHtml}`, 'utf8') : '';
  rep('<!--ROBOTS-->', live ? '<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">' : '<meta name="robots" content="noindex, follow">');
  rep('<!--OGIMAGE-->', live && p.cover ? `<meta property="og:image" content="${SITE}/${p.cover.src}">\n<meta name="twitter:card" content="summary_large_image">` : '<meta name="twitter:card" content="summary">');
  rep('<!--HEAD_ASSETS-->', headAssets('../', pageOut)); rep('/*CRIT*/', pcrit);
  rep('<!--JSONLD-->', `<script type="application/ld+json">${JSON.stringify(ld)}</script>`);
  rep('<!--SPRITE-->', sprite); rep('<!--HEADER-->', header); rep('<!--FOOTER-->', footer); rep('<!--WAW-->', waw);
  rep('<!--EXTRA-->', extra); rep('<!--BEHANCE-->', behance); rep('<!--GALLERY-->', gallery); rep('%PAGEJS%', `../${pageOut}`);
  rep('%TITLE%', esc(p.metaTitle)); rep('%DESC%', esc(p.metaDesc)); rep('%CANON%', url); rep('%H1%', esc(p.h1)); rep('%LEAD%', esc(p.lead));
  rep('%SEE%', esc(p.seeLabel || 'Ver exemplos')); rep('%GTITLE%', esc(p.galleryTitle)); rep('%GSUB%', esc(p.gallerySub));
  rep('%CTA_TITLE%', esc(p.cta.title)); rep('%CTA_TEXT%', esc(p.cta.text)); rep('%CTA_BTN%', esc(p.cta.button));
  fs.writeFileSync(`${out}/${p.slug}/index.html`, await htmlMin(page));
}
const liveProjects = projects.filter(p => p.items.length);

// 7) Ficheiros para motores de pesquisa / IA e GitHub Pages
fs.copyFileSync('seo/robots.txt', `${out}/robots.txt`);
const today = new Date().toISOString().slice(0, 10);
const urls = [[`${SITE}/`, '1.0'], ...liveProjects.map(p => [`${SITE}/${p.slug}/`, '0.7'])];
fs.writeFileSync(`${out}/sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([u, pr]) => `  <url>\n    <loc>${u}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${pr}</priority>\n  </url>`).join('\n')}\n</urlset>\n`);
let llms = fs.readFileSync('seo/llms.txt', 'utf8');
llms = liveProjects.length
  ? llms.replace('{{PROJETOS}}', liveProjects.map(p => `- ${p.title} (${p.category}, portfólio da fundadora): ${SITE}/${p.slug}/`).join('\n'))
  : llms.replace(/## Projetos\n\n\{\{PROJETOS\}\}\n\n/, '');
fs.writeFileSync(`${out}/llms.txt`, llms);
fs.writeFileSync(`${out}/.nojekyll`, '');
fs.copyFileSync('src/_headers', `${out}/_headers`); // cache longa (Cloudflare Pages/Netlify)

// 8) Relatório
const rows = [];
const walk = d => fs.readdirSync(d, {withFileTypes: true}).forEach(e => {
  const p = `${d}/${e.name}`; if (e.isDirectory()) return walk(p);
  if (e.name === '.nojekyll') return;
  const b = fs.readFileSync(p);
  rows.push([p.replace(`${out}/`, ''), b.length, zlib.gzipSync(b, {level: 9}).length, zlib.brotliCompressSync(b).length]);
});
walk(out);
console.table(rows.map(([f, r, g, b]) => ({ficheiro: f, bytes: r, gzip: g, brotli: b})));
if (imgReport.length) console.table(imgReport);
for (const p of projects) console.log(`${p.slug}: ${p.items.length ? p.items.length + ' imagem(ns), indexável' : 'sem imagens (noindex, miniatura "Em breve")'}`);
fs.writeFileSync('report.json', JSON.stringify({rows, mainOut, pageOut, restName}, null, 1));
