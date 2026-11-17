// Usage: npm run build:data  → reads source-data/*.xlsx and writes src/data/*.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readWorkbook } from '../src/utils/excelProcessor.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'source-data');
const file = fs.readdirSync(srcDir).find((f) => /\.xlsx$/i.test(f));
if (!file) throw new Error('Place the Excel workbook in /source-data');
const { records, sheets, notices } = readWorkbook(fs.readFileSync(path.join(srcDir, file)));

const sourceRows = sheets.reduce((a, s) => a + s.sourceRows, 0);
const rowsWithCourseCode = sheets.reduce((a, s) => a + s.rowsWithCourseCode, 0);
const data = {
  meta: { workbook: file, academicSession: '2026-27 Odd Semester', sourceRows, rowsWithCourseCode, sheets, notices },
  records
};
fs.writeFileSync(path.join(root, 'src/data/examinationData.json'), JSON.stringify(data));
const flagged = records.filter((r) => r.flags?.length);
fs.writeFileSync(path.join(root, 'src/data/validationReport.json'), JSON.stringify({
  sheets, notices, sourceRows, rowsWithCourseCode, events: records.length,
  flaggedEvents: flagged.map((r) => ({ id: r.id, sheet: r.sheet, section: r.section, courseCode: r.courseCode, date: r.date, time: r.time, sourceRows: r.sourceRows, flags: r.flags }))
}, null, 2));
console.log(`Source rows: ${sourceRows} | rows with course code: ${rowsWithCourseCode} | events: ${records.length} | flagged: ${flagged.length}`);
sheets.forEach((s) => console.log(` - ${s.name}: ${s.sourceRows} rows, ${s.rowsWithCourseCode} with code, ${s.events} events`));
