const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell,
  WidthType, BorderStyle, ShadingType, ImageRun, PageBreak, Footer, Header, PageNumber, NumberFormat,
  TableOfContents, StyleLevel, LevelFormat, TabStopType, VerticalAlign, SimpleField,
} = require('docx');

const S = path.resolve(__dirname, '..');
const R = 'C:/nuru/docs/report';
const T = 'C:/nuru/docs/testing';
const FIG = R + '/figures';
const IMG = S + '/img';
const MM = S + '/mmd';
const OUT = process.argv[2] || R + '/Nuru_Capstone_Report.docx';

const FONT = 'Times New Roman';
const BODY = 24;          // 12 pt
const CONTENT_W = 9026;   // A4 width minus 1" margins (DXA)
const CONTENT_IN = CONTENT_W / 1440;

// ---------- image helpers ----------
function imgSize(file) {
  const b = fs.readFileSync(file);
  if (b[0] === 0x89 && b[1] === 0x50) return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), type: 'png', data: b };
  // JPEG: scan for SOF marker
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xFF) { i++; continue; }
    const m = b[i + 1];
    if ([0xC0, 0xC1, 0xC2].includes(m)) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7), type: 'jpg', data: b };
    i += 2 + b.readUInt16BE(i + 2);
  }
  throw new Error('unknown image ' + file);
}
function imageRun(file, maxWin, maxHin) {
  const s = imgSize(file);
  let w = maxWin * 96, h = w * s.h / s.w;
  if (h > maxHin * 96) { h = maxHin * 96; w = h * s.w / s.h; }
  return new ImageRun({ type: s.type, data: s.data, transformation: { width: Math.round(w), height: Math.round(h) } });
}

// ---------- figure map ----------
const rp = f => IMG + '/crop-' + f;           // cropped responsiveness screenshots
const fn = f => T + '/functional/' + f;
const F = {
  '2.1': [[MM + '/fig2-1.png'], 'Theoretical framework of the study'],
  '3.1': [['C:/nuru/docs/mockups/mermaid-diagram.png'], 'Iterative development cycle'],
  '3.2': [[MM + '/fig3-2.png'], 'Content review and publication workflow'],
  '3.3': [[MM + '/fig3-3.png'], 'System architecture'],
  '3.4': [[MM + '/fig3-4.png'], 'Use case diagram'],
  '3.5': [[MM + '/fig3-5.png'], 'Entity–relationship diagram of the implemented database'],
  '3.6': [[MM + '/fig3-6.png'], 'Publication sequence diagram'],
  '3.7': [[IMG + '/mockup-01-home.png', IMG + '/mockup-03-information-detail.png'], 'Interface mock-ups: (a) home page; (b) entry detail page'],
  '4.1': [[rp('1366-explore.png')], 'Explore page with search, category filter and destination filter'],
  '4.2': [[fn('fr02-search-keyword-match.png'), fn('fr02-search-no-match.png')], 'Keyword search: (a) match found in entry content; (b) no matching entries'],
  '4.3': [[rp('1366-article.png')], 'Entry detail page showing the source, source publication date and last-checked date'],
  '4.4': [[rp('1366-report.png')], 'Report form'],
  '4.5': [[rp('1366-login.png')], 'Administrator login page'],
  '4.6': [[rp('1366-admin-dashboard.png')], 'Administrator dashboard'],
  '4.7': [[rp('1366-admin-form.png')], 'Entry form with source fields and publish option'],
  '4.8': [[fn('fr09-publish-rejected-no-review-v2.png'), fn('fr09-publish-accepted-after-review.png'), fn('fr09-edit-requires-new-review-v3.png'), fn('fr09-republish-accepted-after-new-review.png')],
    'Publication control during testing: (a) rejected without a review for version 2; (b) accepted after review; (c) rejected after an edit created version 3; (d) accepted after a new review'],
  '4.9': [[fn('fr12-revision-version-3.png'), fn('fr12-revision-version-4.png')], 'Stored revisions of the same entry: (a) version 3; (b) version 4'],
  '4.10': [[fn('fr11-resolve-without-notes-rejected.png'), fn('fr11-resolved-with-attribution.png'), fn('fr11-in-progress-no-attribution.png'), fn('fr11-dashboard-report-status.png')],
    'Report resolution: (a) resolution without notes rejected; (b) resolved with administrator and time recorded; (c) attribution cleared when reopened; (d) status change from the web dashboard'],
  '4.11': [[fn('kirundi-entry.png')], 'Entry page displayed in Kirundi'],
  '4.12': [[fn('mobile-app.jpeg')], 'Home screen of the mobile prototype'],
  '4.13': [[rp('360-explore.png'), rp('360-article.png')], 'Web interface at 360 pixels: (a) Explore page; (b) entry detail page'],
  '4.14': [[FIG + '/fig4-needs.png'], 'Return-related information most needed (n = 25)'],
  '4.15': [[FIG + '/fig4-sources.png'], 'Where participants would expect people to look for information (n = 25)'],
  '4.16': [[FIG + '/fig4-difficulties.png'], 'Difficulties in using return-related information (n = 25)'],
  '4.17': [[FIG + '/fig4-conflict.png'], 'First response when two sources disagree (n = 25)'],
  '4.18': [[FIG + '/fig4-importance.png'], 'Importance of showing the source and the date (n = 25)'],
  '4.19': [[FIG + '/fig4-devices.png'], 'Device participants would use to access the website (n = 25)'],
  '4.20': [[FIG + '/fig4-access.png'], 'Access needs the website should accommodate (n = 25)'],
  '4.21': [[FIG + '/fig4-features.png'], 'Most useful website features (n = 25)'],
  '4.22': [[FIG + '/fig4-tasks.png'], 'Usability task completion (n = 5)'],
  '4.23': [[FIG + '/fig4-ratings.png'], 'Mean agreement with usability statements (n = 5)'],
  '4.24': [[fn('test-run.png')], 'Automated test run: 30 tests passed'],
  '4.25': [[fn('coverage-report.png')], 'Code coverage report'],
  '4.26': [[fn('e2e-1-published-admin.png'), fn('e2e-2-visible-public.png'), fn('e2e-3-hidden-after-unpublish.png')],
    'End-to-end check on the deployed system: (a) test entry published in the dashboard; (b) entry returned by a public search; (c) entry hidden after unpublishing'],
  '4.27': [[FIG + '/fig4-latency.png'], 'Response times of the deployed API (warm requests)'],
  '4.28': [[rp('360-explore.png'), rp('768-explore.png'), rp('1366-explore.png')], 'Explore page at (a) 360, (b) 768 and (c) 1366 pixels'],
  '4.29': [[T + '/accessibility/Lighthouse-explore-before-fix.png', T + '/accessibility/Lighthouse-explore-after-fix.png'], 'Lighthouse accessibility audit of the Explore page: (a) before fixes (84); (b) after fixes (100)'],
  '4.30': [[T + '/accessibility/zoom-200-home.png'], 'Home page at 200% browser zoom'],
};
const usedFigures = new Set();


// ---------- Zotero citation fields ----------
const ZOT = JSON.parse(fs.readFileSync(path.join(__dirname, 'zot.json'), 'utf8'));
const ZUSER = '42K8jgXy';
const zstats = { fields: 0, unmatched: new Set() };
function normAuthor(a) {
  return a.toLowerCase()
    .replace('united nations high commissioner for refugees [unhcr]', 'unhcr')
    .replace('united nations high commissioner for refugees', 'unhcr')
    .replace(/[’']s$/, '').replace(/ and | & /g, ' ').replace('et al.', 'et al').replace(/\s+/g, ' ').trim();
}
function citeKey(author, year) { return ZOT.citekeys[normAuthor(author) + '|' + year]; }
let cidN = 0;
function zField(items, cached) {
  const citationItems = items.map(it => {
    const o = { id: it.key, uris: [`http://zotero.org/users/local/${ZUSER}/items/${it.key}`], itemData: ZOT.items[it.key] };
    if (it.suppress) o['suppress-author'] = true;
    if (it.prefix) o.prefix = it.prefix;
    return o;
  });
  const json = { citationID: 'nuru' + (++cidN).toString(36).padStart(4, '0'), properties: { formattedCitation: cached, plainCitation: cached, noteIndex: 0 }, citationItems, schema: 'https://github.com/citation-style-language/schema/raw/master/csl-citation.json' };
  zstats.fields++;
  return new SimpleField('ADDIN ZOTERO_ITEM CSL_CITATION ' + JSON.stringify(json), cached);
}
const YEAR = String.raw`(\d{4}[ab]?|n\.d\.)`;
// returns array of TextRun / SimpleField for a plain-text segment
function citeSplit(text, base) {
  const out = [];
  const re = /\(([^()]*?)\)/g;
  let last = 0, m;
  const push = s => { if (s) out.push(new TextRun({ text: s, ...base })); };
  while ((m = re.exec(text))) {
    const inner = m[1];
    let field = null, start = m.index;
    if (new RegExp('^' + YEAR + '$').test(inner)) {
      // narrative citation: Author (Year)
      const before = text.slice(last, m.index);
      const am = before.match(/((?:van |Van )?[A-Z][\w.\u00C0-\u017F-]+(?:(?: and | & )[A-Z][\w\u00C0-\u017F-]+| et al\.)?)(?:[’']s)? $/);
      if (am) {
        const key = citeKey(am[1], inner);
        if (key) field = zField([{ key, suppress: true }], m[0]);
        else zstats.unmatched.add(am[1] + ' (' + inner + ')');
      }
    } else if (new RegExp(YEAR).test(inner) && /, /.test(inner)) {
      const parts = inner.split('; ');
      const items = [];
      for (const pt of parts) {
        const pm = pt.match(new RegExp('^(.+), ' + YEAR + '$'));
        const key = pm && citeKey(pm[1], pm[2]);
        if (!key) { items.length = 0; if (pm) zstats.unmatched.add(pt); break; }
        const a = normAuthor(pm[1]);
        if (a === 'unhcr') items.push({ key, suppress: true, prefix: pm[1].startsWith('United') ? 'United Nations High Commissioner for Refugees [UNHCR],' : 'UNHCR,' });
        else items.push({ key });
      }
      if (items.length) field = zField(items, m[0]);
    }
    if (field) { push(text.slice(last, start)); out.push(field); last = m.index + m[0].length; }
  }
  push(text.slice(last));
  return out;
}

// ---------- inline markdown ----------
function runs(text, base = {}) {
  const out = [];
  const re = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`)/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(...citeSplit(text.slice(last, m.index), base));
    const t = m[0];
    if (t.startsWith('**')) out.push(new TextRun({ text: t.slice(2, -2), bold: true, ...base }));
    else if (t.startsWith('`')) out.push(new TextRun({ text: t.slice(1, -1), font: 'Consolas', size: (base.size || BODY) - 2, ...base, }));
    else out.push(new TextRun({ text: t.slice(1, -1), italics: true, ...base }));
    last = m.index + t.length;
  }
  if (last < text.length) out.push(...citeSplit(text.slice(last), base));
  return out;
}
const para = (text, opts = {}) => new Paragraph({ children: runs(text), alignment: AlignmentType.LEFT, spacing: { before: 120, after: 120, line: 360 }, indent: { firstLine: 720 }, ...opts });

// ---------- captions ----------
function figureCaption(num, caption) {
  return new Paragraph({ style: 'FigureCaption', keepNext: true, children: [new TextRun({ text: `Figure ${num}`, bold: true }), new TextRun({ text: caption, italics: true, break: 1 })] });
}
function tableCaption(text) {
  const m = text.match(/^(Table [0-9A-Z]+\.\d+): (.*)$/);
  return new Paragraph({ style: 'TableCaption', keepNext: true, children: [new TextRun({ text: m[1], bold: true }), new TextRun({ text: m[2], italics: true, break: 1 })] });
}
function placeholder(text) {
  return new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text, highlight: 'yellow', italics: true })] });
}

// ---------- figures ----------
function figureBlock(num) {
  const f = F[num];
  if (!f) return [placeholder(`[Figure ${num} — image to be inserted]`)];
  usedFigures.add(num);
  const [files, caption] = f;
  const missing = files.filter(x => !fs.existsSync(x));
  if (missing.length) return [placeholder(`[Figure ${num}: missing file ${missing.join(', ')}]`), figureCaption(num, caption)];
  const out = [figureCaption(num, caption)];
  if (files.length === 1) {
    const s = imgSize(files[0]);
    const tall = s.h / s.w > 1.3;
    // diagrams and charts need room to stay legible; screenshots are capped smaller
    const big = { '3.2': [4.4, 6.2], '3.5': [6.0, 7.0], '2.1': [5.6, 3.8], '3.1': [3.8, 4.2], '3.3': [6.27, 2.8], '3.4': [5.6, 3.9], '3.6': [6.27, 3.2] };
    const [mw, mh] = big[num] || (num.startsWith('4.') && ((+num.split('.')[1] >= 14 && +num.split('.')[1] <= 23) || num === '4.27') ? [5.4, 2.9] : tall ? [2.2, 4.0] : [5.0, 3.2]);
    out.push(new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 120, after: 60 }, children: [imageRun(files[0], mw, mh)] }));
  } else {
    const cols = files.length === 3 ? 3 : 2;
    const cellW = Math.floor(CONTENT_W / cols);
    const rows = [];
    const letters = 'abcd';
    for (let i = 0; i < files.length; i += cols) {
      const cells = [];
      for (let j = 0; j < cols; j++) {
        const fi = files[i + j];
        const children = fi ? [
          new Paragraph({ alignment: AlignmentType.CENTER, children: [imageRun(fi, cellW / 1440 - 0.2, cols === 3 ? 3.0 : 2.4)] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: `(${letters[i + j]})`, size: 20 })] }),
        ] : [new Paragraph('')];
        cells.push(new TableCell({ width: { size: cellW, type: WidthType.DXA }, verticalAlign: VerticalAlign.BOTTOM, borders: noBorders, children }));
      }
      rows.push(new TableRow({ cantSplit: true, children: cells }));
    }
    out.push(new Table({ width: { size: cellW * cols, type: WidthType.DXA }, columnWidths: Array(cols).fill(cellW), borders: noBorders, rows }));
  }
  out.push(new Paragraph({ spacing: { after: 240 }, children: [] }));
  return out;
}
const nb = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const noBorders = { top: nb, bottom: nb, left: nb, right: nb, insideHorizontal: nb, insideVertical: nb };

// ---------- tables ----------
const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: '808080' };
function mdTable(lines) {
  const rows = lines.filter((l, i) => i !== 1).map(l => l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim()));
  const n = rows[0].length;
  const lens = Array(n).fill(0);
  rows.forEach(r => r.forEach((c, i) => { lens[i] = Math.max(lens[i], Math.min(c.replace(/\*/g, '').length, 60)); }));
  const minW = 700;
  let widths = lens.map(l => Math.max(l, 4));
  const tot = widths.reduce((a, b) => a + b, 0);
  widths = widths.map(w => Math.max(minW, Math.floor(w / tot * CONTENT_W)));
  const diff = CONTENT_W - widths.reduce((a, b) => a + b, 0);
  widths[widths.indexOf(Math.max(...widths))] += diff;
  const trows = rows.map((r, ri) => new TableRow({
    tableHeader: ri === 0, cantSplit: true,
    children: r.map((c, ci) => new TableCell({
      width: { size: widths[ci], type: WidthType.DXA },
      shading: ri === 0 ? { type: ShadingType.CLEAR, color: 'auto', fill: 'DCE6F1' } : undefined,
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      borders: { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder },
      children: [new Paragraph({ spacing: { after: 0, line: 260 }, children: runs(c, { size: 20, bold: ri === 0 ? true : undefined }) })],
    })),
  }));
  return [new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: widths, rows: trows }), new Paragraph({ spacing: { after: 120 }, children: [] })];
}

// ---------- block parser ----------
let listCounter = 0;
function convert(md, { chapterBreak = true } = {}) {
  const lines = md.replace(/\r/g, '').split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    let l = lines[i];
    if (!l.trim()) { i++; continue; }
    if (l.startsWith('```')) {
      const code = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) code.push(lines[i++]);
      i++;
      code.forEach((c, k) => out.push(new Paragraph({
        spacing: { after: 0, line: 240 }, keepLines: true, keepNext: k < code.length - 1,
        shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'F2F2F2' },
        children: [new TextRun({ text: c || ' ', font: 'Consolas', size: 17 })],
      })));
      out.push(new Paragraph({ spacing: { after: 160 }, children: [] }));
      continue;
    }
    if (l.startsWith('# ')) {
      out.push(new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: chapterBreak, children: [new TextRun(l.slice(2).trim())] }));
      i++; continue;
    }
    if (l.startsWith('## ')) { out.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: runs(l.slice(3).trim()) })); i++; continue; }
    if (l.startsWith('### ')) { out.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: runs(l.slice(4).trim()) })); i++; continue; }
    if (l.trim().startsWith('|')) {
      const tl = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) tl.push(lines[i++]);
      out.push(...mdTable(tl));
      continue;
    }
    const tcap = l.match(/^\*\*((Table) [0-9A-Z]+\.\d+: .*)\*\*$/);
    if (tcap) { out.push(tableCaption(tcap[1])); i++; continue; }
    if (/^\[/.test(l.trim())) {
      const nums = [];
      const re = /FIGURES? (\d\.\d+)(?:–(\d\.\d+))?/g; let m;
      while ((m = re.exec(l))) {
        nums.push(m[1]);
        if (m[2]) { const [a, b] = [m[1], m[2]].map(x => +x.split('.')[1]); for (let k = a + 1; k <= b; k++) nums.push(m[1].split('.')[0] + '.' + k); }
      }
      if (nums.length) nums.forEach(nm => out.push(...figureBlock(nm)));
      else out.push(placeholder(l.trim()));
      i++; continue;
    }
    if (/^\d+\. /.test(l)) {
      const inst = ++listCounter;
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        out.push(new Paragraph({ numbering: { reference: 'num', level: 0, instance: inst }, alignment: AlignmentType.LEFT, spacing: { after: 0, line: 360 }, children: runs(lines[i].replace(/^\d+\. /, '')) }));
        i++;
      }
      out.push(new Paragraph({ spacing: { after: 80 }, children: [] }));
      continue;
    }
    if (/^- /.test(l)) {
      while (i < lines.length && /^- /.test(lines[i])) {
        out.push(new Paragraph({ numbering: { reference: 'bullet', level: 0 }, spacing: { after: 0, line: 360 }, children: runs(lines[i].slice(2)) }));
        i++;
      }
      continue;
    }
    // paragraph (join soft-wrapped lines)
    const buf = [l.trim()];
    i++;
    while (i < lines.length && lines[i].trim() && !/^(#|\||```|\[|\d+\. |- )/.test(lines[i].trim())) buf.push(lines[i++].trim());
    out.push(para(buf.join(' ')));
  }
  return out;
}
const read = f => fs.readFileSync(path.join(R, f), 'utf8');

// ---------- front matter ----------
const TITLE = 'Design and Development of a Digital Return Information Management and Access System: A Case of Burundian Refugees in Mahama';
const centered = (text, o = {}) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: o.after ?? 240 }, children: [new TextRun({ text, bold: o.bold, size: o.size || BODY, allCaps: o.caps })] });
const frontHeading = t => new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [new TextRun(t)] });

const cover = [
  new Paragraph({ spacing: { before: 1800 }, children: [] }),
  centered('AFRICAN LEADERSHIP UNIVERSITY', { bold: true, size: 28, after: 1200 }),
  centered(TITLE, { bold: true, size: 32, after: 1200 }),
  centered('A capstone report submitted in partial fulfilment of the requirements for the degree of', { after: 120 }),
  centered('Bachelor of Science in Software Engineering', { bold: true, after: 1200 }),
  centered('By', { after: 120 }),
  centered('Abraham Chan Deng Garang', { bold: true, after: 800 }),
  centered('Supervisor', { after: 120 }),
  centered('Simeon Nsabiyumva', { bold: true, after: 1200 }),
  centered('November 2026', { bold: true }),
];

const declaration = [
  frontHeading('Declaration'),
  para(`I, Abraham Chan Deng Garang, declare that this capstone report, ${TITLE}, is my original work. All sources used have been acknowledged through appropriate citations and references. This report has not been submitted to any other institution for an academic award.`),
  para('I take responsibility for the content of this report and acknowledge the contributions and assistance received during its preparation.'),
  new Paragraph({ spacing: { before: 600, after: 200 }, children: [new TextRun('Student name: Abraham Chan Deng Garang')] }),
  new Paragraph({ spacing: { after: 200 }, children: [new TextRun('Signature: ______________________________')] }),
  new Paragraph({ spacing: { after: 600 }, children: [new TextRun('Date: ______________________________')] }),
  new Paragraph({ spacing: { before: 400, after: 200 }, children: [new TextRun({ text: 'Supervisor\'s approval', bold: true })] }),
  para('This report has been submitted for examination with my approval as the supervisor.'),
  new Paragraph({ spacing: { before: 300, after: 200 }, children: [new TextRun('Supervisor: Simeon Nsabiyumva')] }),
  new Paragraph({ spacing: { after: 200 }, children: [new TextRun('Signature: ______________________________')] }),
  new Paragraph({ spacing: { after: 200 }, children: [new TextRun('Date: ______________________________')] }),
];

const dedication = [
  frontHeading('Dedication'),
  para('I dedicate this work to refugees whose lives have been shaped by prolonged uncertainty between resettlement abroad and returning home, especially my family, who have spent more than thirty years in a refugee camp.'),
  frontHeading('Acknowledgements'),
  para('I am grateful to my supervisor, Simeon Nsabiyumva, for his invaluable support and guidance throughout this project; to my full-stack facilitator, Mr. Pelin Mutanguha, for his guidance; to the students who volunteered their time to take part in the questionnaire and usability sessions; and to the African Leadership University for making this journey possible.'),
];

const absMd = read('abstract.md').replace(/\r/g, '');
const absText = absMd.split('\n').find(l => l.startsWith('Refugees'));
const kw = absMd.match(/\*\*Keywords:\*\* (.*)/)[1];
const abstract = [
  new Paragraph({ spacing: { after: 0, line: 360 }, children: runs(absText) }),
  new Paragraph({ spacing: { after: 0, line: 360 }, indent: { firstLine: 720 }, children: [new TextRun({ text: 'Keywords: ', italics: true }), new TextRun(kw)] }),
];
abstract.unshift(frontHeading('Abstract'));

const toc = [
  frontHeading('Table of Contents'),
  new TableOfContents('Table of Contents', { hyperlink: true, headingStyleRange: '1-3' }),
  frontHeading('List of Tables'),
  new TableOfContents('List of Tables', { hyperlink: true, stylesWithLevels: [new StyleLevel('Table Caption', 1)] }),
  frontHeading('List of Figures'),
  new TableOfContents('List of Figures', { hyperlink: true, stylesWithLevels: [new StyleLevel('Figure Caption', 1)] }),
];

const abbrevs = [
  ['ALU', 'African Leadership University'], ['API', 'Application Programming Interface'], ['APA', 'American Psychological Association'],
  ['DRF', 'Django REST Framework'], ['FR', 'Functional Requirement'], ['HTTPS', 'Hypertext Transfer Protocol Secure'],
  ['JSON', 'JavaScript Object Notation'], ['JWT', 'JSON Web Token'], ['REC', 'Research Ethics Committee'],
  ['SDLC', 'Software Development Life Cycle'], ['SUS', 'System Usability Scale'], ['TAM', 'Technology Acceptance Model'],
  ['UI', 'User Interface'], ['UNHCR', 'United Nations High Commissioner for Refugees'], ['URL', 'Uniform Resource Locator'],
];
const abbrevSection = [frontHeading('List of Abbreviations'), ...mdTable(['| Abbreviation | Meaning |', '|---|---|', ...abbrevs.map(([a, b]) => `| ${a} | ${b} |`)])];

// ---------- references (APA 7) ----------
const REFS = [
  'Alrababah, A., & Casalis, M. (2024). *Understanding refugee return: Key findings, gaps, and future research* (Quarterly Digest on Forced Displacement, Issue 10). World Bank–UNHCR Joint Data Center on Forced Displacement. https://doi.org/10.47053/jdc.281124',
  'Alrababah, A., Masterson, D., Casalis, M., Hangartner, D., & Weinstein, J. (2023). The dynamics of refugee return: Syrian refugees and their migration intentions. *British Journal of Political Science, 53*(4), 1108–1131. https://doi.org/10.1017/S0007123422000667',
  'Chatman, E. A. (1996). The impoverished life-world of outsiders. *Journal of the American Society for Information Science, 47*(3), 193–206. https://doi.org/10.1002/(SICI)1097-4571(199603)47:3<193::AID-ASI3>3.0.CO;2-T',
  'Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology. *MIS Quarterly, 13*(3), 319–340. https://doi.org/10.2307/249008',
  'Gillespie, M., Osseiran, S., & Cheesman, M. (2018). Syrian refugees and the digital passage to Europe: Smartphone infrastructures and affordances. *Social Media + Society, 4*(1). https://doi.org/10.1177/2056305118764440',
  'Hilligoss, B., & Rieh, S. Y. (2008). Developing a unifying framework of credibility assessment: Construct, heuristics, and interaction in context. *Information Processing & Management, 44*(4), 1467–1484. https://doi.org/10.1016/j.ipm.2007.10.001',
  'International Crisis Group. (2016). *Burundi: A dangerous third term* (Africa Report No. 235). International Crisis Group.',
  'Julisha.Info. (n.d.). *Julisha.Info*. Retrieved September 25, 2026, from https://www.julisha.info/',
  'KoboToolbox. (2026, August 28). *Collecting data using web forms*. https://support.kobotoolbox.org/data_through_webforms.html',
  'Lemarchand, R. (1996). *Burundi: Ethnic conflict and genocide*. Cambridge University Press.',
  'Lloyd, A., Kennan, M. A., Thompson, K. M., & Qayyum, A. (2013). Connecting with new information landscapes: Information literacy practices of refugees. *Journal of Documentation, 69*(1), 121–144. https://doi.org/10.1108/00220411311295351',
  'Madon, S., & Schoemaker, E. (2021). Digital identity as a platform for improving refugee management. *Information Systems Journal, 31*(6), 929–953. https://doi.org/10.1111/isj.12353',
  'Malkki, L. H. (1995). *Purity and exile: Violence, memory, and national cosmology among Hutu refugees in Tanzania*. University of Chicago Press.',
  'Metzger, M. J. (2007). Making sense of credibility on the Web: Models for evaluating online information and recommendations for future research. *Journal of the American Society for Information Science and Technology, 58*(13), 2078–2091. https://doi.org/10.1002/asi.20672',
  'Metzger, M. J., Flanagin, A. J., & Medders, R. B. (2010). Social and heuristic approaches to credibility evaluation online. *Journal of Communication, 60*(3), 413–439. https://doi.org/10.1111/j.1460-2466.2010.01488.x',
  'Mukungu, I., & Ngulube, P. (2026). Navigating refugees\' information landscapes: Examining impediments to refugees\' information access and use in North Western Uganda. *Education for Information*. Advance online publication. https://doi.org/10.1177/01678329261418389',
  'Mukungu, I., Ngulube, P., Mukose, R., & Musuya, W. (2026). Information behaviour of refugees in North Western Uganda: Examining approaches to information seeking and use behaviour patterns among South Sudanese refugees. *Education for Information*. Advance online publication. https://doi.org/10.1177/01678329261453564',
  'Oduntan, O., & Ruthven, I. (2019). The information needs matrix: A navigational guide for refugee integration. *Information Processing & Management, 56*(3), 791–808. https://doi.org/10.1016/j.ipm.2018.12.001',
  'Oduntan, O., & Ruthven, I. (2021). People and places: Bridging the information gaps in refugee integration. *Journal of the Association for Information Science and Technology, 72*(1), 83–96. https://doi.org/10.1002/asi.24366',
  'Refugee.Info. (n.d.). *Refugee.Info*. https://www.refugee.info/',
  'Sibomana, E. (2020, August 29). *First group of Burundian refugees assisted to return home after years in exile*. United Nations High Commissioner for Refugees. https://www.unhcr.org/rw/news/first-group-burundian-refugees-assisted-return-home-after-years-exile',
  'United Nations High Commissioner for Refugees. (n.d.). *Voluntary return*. Retrieved September 25, 2026, from https://help.unhcr.org/rwanda/services/voluntary-return/',
  'United Nations High Commissioner for Refugees. (1996). *Handbook: Voluntary repatriation: International protection*.',
  'United Nations High Commissioner for Refugees. (2016). *Connecting refugees: How internet and mobile connectivity can improve refugee well-being and transform humanitarian action*.',
  'United Nations High Commissioner for Refugees. (2022). *Digital transformation strategy 2022–2026*. https://www.unhcr.org/digitalstrategy/wp-content/uploads/sites/161/2023/07/Digital-Transformation-Strategy-2022-2026-UNHCR-Web.pdf',
  'United Nations High Commissioner for Refugees. (2023, February). *Mahama refugee camp, Rwanda* [Fact sheet]. https://data.unhcr.org/en/documents/download/99716',
  'United Nations High Commissioner for Refugees. (2026a). *Global trends: Forced displacement in 2025*. https://www.unhcr.org/sites/default/files/2026-06/global-trends-report-2025.pdf',
  'United Nations High Commissioner for Refugees. (2026b, July 10). *UNHCR Rwanda—Population statistics dashboard—30 June 2026*. https://data.unhcr.org/en/documents/details/123290',
  'van Dijk, J. (2020). *The digital divide*. Polity Press.',
  'Wall, M., Otis Campbell, M., & Janbek, D. (2017). Syrian refugees and information precarity. *New Media & Society, 19*(2), 240–254. https://doi.org/10.1177/1461444815591967',
  'Wilson, T. D. (1981). On user studies and information needs. *Journal of Documentation, 37*(1), 3–15. https://doi.org/10.1108/eb026702',
  'Wilson, T. D. (1999). Models in information behaviour research. *Journal of Documentation, 55*(3), 249–270. https://doi.org/10.1108/EUM0000000007145',
  'Winkel, M., & Friedrichs-Liesenkötter, H. (2022). Between usability and trustworthiness—The potential of information transfer using digital information platforms for refugees. *Journal of Technology in Human Services, 40*(4), 379–407. https://doi.org/10.1080/15228835.2022.2146031',
];
const references = [
  new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [new TextRun('References')] }),
  ...(process.env.STATIC_REFS ? REFS.map(r => new Paragraph({ spacing: { after: 0, line: 360 }, indent: { left: 720, hanging: 720 }, children: runs(r) }))
    : [new Paragraph({ spacing: { after: 0, line: 360 }, indent: { left: 720, hanging: 720 }, children: [new SimpleField('ADDIN ZOTERO_BIBL {"uncited":[],"omitted":[],"custom":[]} CSL_BIBLIOGRAPHY', '[Zotero bibliography: open the Zotero tab in Word and click Refresh]')] })]),
];

// ---------- body ----------
const chapters = ['chapter-one-revised.md', 'chapter-two-revised.md', 'chapter-three-revised.md', 'chapter-four-revised.md', 'chapter-five-revised.md']
  .flatMap(f => convert(read(f)));
let appx = read('appendices.md');
const ethicsImg = IMG + '/ethics-letter.png';
if (fs.existsSync(ethicsImg)) appx = appx.replace(/\[INSERT: image or PDF page of the ALU Senate Research Ethics Committee approval letter[^\]]*\]/, '@@ETHICS@@');
let appendices = convert(appx);
appendices = appendices.flatMap(p => {
  // replace the ethics marker paragraph with the image
  const xml = JSON.stringify(p);
  if (xml.includes('@@ETHICS@@')) return [new Paragraph({ alignment: AlignmentType.CENTER, children: [imageRun(ethicsImg, 6.0, 8.6)] })];
  return [p];
});

// ---------- document ----------
const footer = fmt => new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ children: [PageNumber.CURRENT] })] })] });
const pageProps = (fmt, start) => ({ page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }, pageNumbers: start ? { start, formatType: fmt } : undefined } });

const doc = new Document({
  creator: 'Abraham Chan Deng Garang',
  title: TITLE,
  features: { updateFields: true },
  customProperties: [
    { name: 'ZOTERO_PREF_1', value: '<data data-version="3" zotero-version="7.0"><session id="NuruCap1"/><style id="http://www.zotero.org/styles/apa" locale="en-US" hasBibliography="1" bibliographyStyleHasBeenSet="1"/><prefs><pref name="fieldType" value="Field"/><pref name="automaticJournalA' },
    { name: 'ZOTERO_PREF_2', value: 'bbreviations" value="true"/></prefs></data>' },
  ],
  styles: {
    default: { document: { run: { font: FONT, size: BODY } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 24, bold: true }, paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 0, after: 240, line: 360 }, keepNext: true, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 24, bold: true }, paragraph: { spacing: { before: 240, after: 0, line: 360 }, keepNext: true, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 24, bold: true, italics: true }, paragraph: { spacing: { before: 120, after: 0, line: 360 }, keepNext: true, outlineLevel: 2 } },
      { id: 'FigureCaption', name: 'Figure Caption', basedOn: 'Normal', next: 'Normal', run: { font: FONT, size: 24 }, paragraph: { spacing: { before: 240, after: 120 }, keepNext: true } },
      { id: 'TableCaption', name: 'Table Caption', basedOn: 'Normal', next: 'Normal', run: { font: FONT, size: 24 }, paragraph: { spacing: { before: 240, after: 120 }, keepNext: true } },
    ],
  },
  numbering: {
    config: [
      { reference: 'num', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: 'bullet', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [
    { properties: pageProps(), children: cover },
    { properties: pageProps(NumberFormat.LOWER_ROMAN, 1), headers: { default: footer() }, children: [...declaration, ...dedication, ...abstract, ...toc, ...abbrevSection] },
    { properties: pageProps(NumberFormat.DECIMAL, 1), headers: { default: footer() }, children: [...chapters, ...references, ...appendices] },
  ],
});

Packer.toBuffer(doc).then(b => {
  fs.writeFileSync(OUT, b);
  const missing = Object.keys(F).filter(k => !usedFigures.has(k));
  console.log('zotero fields:', zstats.fields, 'unmatched:', [...zstats.unmatched].join(' | ') || 'none');
  console.log('written', OUT, (b.length / 1e6).toFixed(1) + ' MB', 'figures used:', usedFigures.size, 'unused in map:', missing.join(',') || 'none');
});
