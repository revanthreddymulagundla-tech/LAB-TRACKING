// Independent verification: re-reads the Excel workbook and checks examinationData.json against it.
// Usage: npm run test:data
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as XLSX from 'xlsx';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = fs.readdirSync(path.join(root, 'source-data')).find((f) => /\.xlsx$/i.test(f));
const wb = XLSX.read(fs.readFileSync(path.join(root, 'source-data', file)), { type: 'buffer' });
const data = JSON.parse(fs.readFileSync(path.join(root, 'src/data/examinationData.json'), 'utf8'));
const c = (v) => (v == null ? '' : String(v).replace(/\s+/g, ' ').trim());
const MONTHS = null;
const toIso = (v) => {
  if (typeof v === 'number') return new Date(Date.UTC(1899, 11, 30) + v * 864e5).toISOString().slice(0, 10);
  const m = c(v).match(/^(\d{1,2})[.\-](\d{1,2})[.\-](\d{2,4})$/);
  return m ? `${+m[3] < 100 ? 2000 + +m[3] : +m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : null;
};
let fail = 0, checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) { fail++; console.log('FAIL:', msg); } };

const covered = new Map(); // sheet → Set(excel rows)
for (const r of data.records) {
  if (!covered.has(r.sheet)) covered.set(r.sheet, new Set());
  for (const n of r.sourceRows) { ok(!covered.get(r.sheet).has(n), `row ${n} in ${r.sheet} used twice`); covered.get(r.sheet).add(n); }
}
ok(covered.size === 5, 'five worksheets present');
let totalCoded = 0, totalRows = 0;
for (const name of wb.SheetNames) {
  const ws = wb.Sheets[name];
  const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null, blankrows: true });
  const off = XLSX.utils.decode_range(ws['!ref']).s.r;
  const hi = aoa.findIndex((r) => c(r[0]).toLowerCase() === 'date');
  const H = aoa[hi].map((h) => c(h).toLowerCase());
  const ci = H.indexOf('coursecode');
  const venueI = Math.max(H.indexOf('lab venue'), H.indexOf('room no'));
  const secI = H.indexOf('section');
  const tI = H.indexOf(H.includes('time') ? 'time' : 'slot');
  const key = c(name);
  totalRows += aoa.length - hi - 1;
  const recs = data.records.filter((r) => r.sheet === key);
  const byRow = new Map(); recs.forEach((r) => r.sourceRows.forEach((n) => byRow.set(n, r)));
  let coded = 0;
  for (let i = hi + 1; i < aoa.length; i++) {
    const row = aoa[i]; if (!c(row[ci])) continue;
    coded++; totalCoded++;
    const rec = byRow.get(i + 1 + off);
    ok(!!rec, `${key}: coded row ${i + 1 + off} not in JSON`);
    if (!rec) continue;
    ok(rec.courseCode === c(row[ci]), `${key} r${i + 1 + off} code`);
    ok(rec.date === toIso(row[0]), `${key} r${i + 1 + off} date ${rec.date} vs ${toIso(row[0])}`);
    ok(c(rec.time) === c(row[tI]), `${key} r${i + 1 + off} time`);
    ok(c(rec.venue) === c(row[venueI]), `${key} r${i + 1 + off} venue`);
    ok(c(rec.section) === c(row[secI]), `${key} r${i + 1 + off} section`);
  }
  ok(coded === (covered.get(key)?.size || 0), `${key}: ${coded} coded rows vs ${covered.get(key)?.size} mapped`);
  const combos = new Set(aoa.slice(hi + 1).filter((r) => c(r[ci])).map((r) => `${c(r[ci])}|${c(r[H.indexOf('course name') >= 0 ? H.indexOf('course name') : H.indexOf('coursedesc')])}`));
  console.log(`${key}: rows=${aoa.length - hi - 1} coded=${coded} events=${recs.length} uniqueCourseCombos=${combos.size}`);
}
ok(totalCoded === data.meta.rowsWithCourseCode, 'coded rows total matches meta');
ok(totalRows === data.meta.sourceRows, 'source rows total matches meta');
const priv = JSON.stringify(data);
ok(!/regd|studentName|"student name"/i.test(priv), 'no student personal fields in JSON');
console.log(`\nSource rows ${totalRows} | coded rows ${totalCoded} | events ${data.records.length} | checks ${checks} | failures ${fail}`);
process.exit(fail ? 1 : 0);
