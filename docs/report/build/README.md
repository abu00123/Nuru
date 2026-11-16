# Report build

`build.js` assembles the report (.docx) from the Markdown chapters in the parent folder. The submitted report, `appendices.md` and `img/ethics-letter.png` are kept out of this public repository, so the build needs local copies of the last two.

```
cd docs/report/build
npm install docx@9
node build.js ../Nuru_Capstone_Report.docx          # citations as Zotero fields, Zotero bibliography field
STATIC_REFS=1 node build.js ../Nuru_Capstone_Report.docx   # typed APA reference list instead
```

- `zot.json` maps each citation to its item key in the author's local Zotero library.
- `../mmd/` holds the Mermaid sources for the diagrams (rendered with `@mermaid-js/mermaid-cli`).
- `../img/` holds cropped screenshots, mock-up captures and the ethics letter image used by the build.
- After building, open the file in Word and update the table of contents (the build marks fields for update).
- The script that drew the Chapter 4 charts is not included because it contains row-level questionnaire responses; the charts themselves are in `../figures/`.
