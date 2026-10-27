const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, LevelFormat, AlignmentType, Footer, PageNumber,
} = require('docx');

const W = 9638; // content width A4, margini 2 cm

function runs(t, opts = {}) {
  return t.split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((s) =>
    s.startsWith('**')
      ? new TextRun({ text: s.slice(2, -2), bold: true, ...opts })
      : new TextRun({ text: s, ...opts })
  );
}

class Doc {
  constructor(title, sub) {
    this.c = [];
    this.nums = 0;
    this.numCfg = [];
    this.c.push(new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: title, font: 'Georgia', size: 44, bold: true, color: '4A3426' })] }));
    this.c.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: sub, font: 'Georgia', italics: true, size: 24, color: '7A5C17' })] }));
    this.c.push(new Paragraph({
      spacing: { after: 280 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: 'C9A24B', space: 6 } },
      children: [new TextRun({ text: 'Versione 1 · 27 ottobre 2026', size: 18, color: '6B5443' })],
    }));
  }
  h1(t) { this.c.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] })); return this; }
  h2(t) { this.c.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] })); return this; }
  h3(t) { this.c.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(t)] })); return this; }
  p(t) { this.c.push(new Paragraph({ spacing: { after: 120, line: 300 }, children: runs(t) })); return this; }
  quote(t) {
    this.c.push(new Paragraph({
      spacing: { before: 60, after: 140, line: 300 }, indent: { left: 360 },
      border: { left: { style: BorderStyle.SINGLE, size: 18, color: 'C9A24B', space: 10 } },
      children: runs(t, { italics: true, color: '4A3426' }),
    }));
    return this;
  }
  note(t) {
    this.c.push(new Paragraph({
      spacing: { before: 80, after: 160, line: 290 },
      shading: { type: ShadingType.CLEAR, fill: 'F6EEDD', color: 'auto' },
      border: { left: { style: BorderStyle.SINGLE, size: 24, color: 'C9A24B', space: 8 } },
      indent: { left: 160, right: 160 },
      children: runs(t, { size: 21 }),
    }));
    return this;
  }
  ul(items) {
    items.forEach((t) => this.c.push(new Paragraph({ numbering: { reference: 'bul', level: 0 }, spacing: { after: 60, line: 290 }, children: runs(t) })));
    return this;
  }
  ol(items) {
    const ref = 'n' + this.nums++;
    this.numCfg.push({
      reference: ref,
      levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 360 } } } }],
    });
    items.forEach((t) => this.c.push(new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 60, line: 290 }, children: runs(t) })));
    return this;
  }
  table(head, rows, fr) {
    const widths = fr.map((f) => Math.round(W * f));
    widths[widths.length - 1] += W - widths.reduce((a, b) => a + b, 0);
    const b = { style: BorderStyle.SINGLE, size: 4, color: 'D9C6A5' };
    const borders = { top: b, bottom: b, left: b, right: b };
    const cell = (t, i, header) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA },
      borders,
      margins: { top: 70, bottom: 70, left: 110, right: 110 },
      shading: header ? { type: ShadingType.CLEAR, fill: '4A3426', color: 'auto' } : undefined,
      children: String(t).split('\n').map((line) => new Paragraph({
        spacing: { after: 20 },
        children: runs(line, header ? { bold: true, color: 'F4EBDD', size: 20 } : { size: 20 }),
      })),
    });
    const trs = [new TableRow({ tableHeader: true, children: head.map((h, i) => cell(h, i, true)) })];
    rows.forEach((r) => trs.push(new TableRow({ children: r.map((t, i) => cell(t, i, false)) })));
    this.c.push(new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: widths, rows: trs }));
    this.c.push(new Paragraph({ spacing: { after: 140 }, children: [] }));
    return this;
  }
  pb() { this.c.push(new Paragraph({ pageBreakBefore: true, children: [] })); return this; }
  async save(file) {
    const doc = new Document({
      creator: 'Allevamento degli Arduini',
      styles: {
        default: { document: { run: { font: 'Calibri', size: 22, color: '2B1D14' } } },
        paragraphStyles: [
          { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
            run: { font: 'Georgia', size: 32, bold: true, color: '4A3426' },
            paragraph: { spacing: { before: 400, after: 140 }, outlineLevel: 0,
              border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'C9A24B', space: 4 } } } },
          { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
            run: { font: 'Georgia', size: 26, bold: true, color: '7F4F46' },
            paragraph: { spacing: { before: 280, after: 100 }, outlineLevel: 1 } },
          { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
            run: { font: 'Calibri', size: 22, bold: true, color: '7A5C17' },
            paragraph: { spacing: { before: 200, after: 60 }, outlineLevel: 2 } },
        ],
      },
      numbering: {
        config: [
          { reference: 'bul', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] },
          ...this.numCfg,
        ],
      },
      sections: [{
        properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
        footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
          new TextRun({ text: 'Allevamento degli Arduini · ', size: 16, color: '8F7B63' }),
          new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '8F7B63' }),
        ] })] }) },
        children: this.c,
      }],
    });
    fs.writeFileSync(file, await Packer.toBuffer(doc));
    console.log('ok', file);
  }
}
module.exports = { Doc };
