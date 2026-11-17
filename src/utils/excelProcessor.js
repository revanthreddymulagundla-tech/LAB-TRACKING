// LabTrack – Excel → JSON processor (SheetJS).
// Used by scripts/build-data.mjs. Personal student data (names, registration numbers)
// is read ONLY to group student-wise rows into examination events and to count students;
// it is never written to the output JSON.
import * as XLSX from 'xlsx';

export const SHEET_CONFIG = [
  { match: 'Y25 II BTECH', kind: 'labA', yr: 'II', yearLabel: 'II B.Tech – Y25', category: 'Regular Lab / Skill' },
  { match: 'Y24 III BTECH', kind: 'labB', yr: 'III', yearLabel: 'III B.Tech – Y24', category: 'Regular Lab / Skill' },
  { match: 'Y23 IV BTECH REG PHY AND CHEM', kind: 'phyChem', yr: 'IV', yearLabel: 'IV B.Tech – Y23', category: 'Regular Physics & Chemistry' },
  { match: 'Y23 IV BTECH REG & ADDL COURSES', kind: 'regAddl', yr: 'IV', yearLabel: 'IV B.Tech – Y23', category: 'Regular & Additional Courses' },
  { match: 'Y23 IV BTECH PSICP', kind: 'psicp', yr: 'IV', yearLabel: 'IV B.Tech – Y23', category: 'PS / ICP' }
];

export const clean = (v) => {
  if (v === null || v === undefined) return null;
  const s = String(v).replace(/\s+/g, ' ').trim();
  return s === '' ? null : s;
};
const norm = (s) => (clean(s) || '').toLowerCase();

export function parseDate(v) {
  if (v === null || v === undefined || v === '') return { iso: null, raw: null };
  if (typeof v === 'number') {
    const d = new Date(Date.UTC(1899, 11, 30) + Math.round(v) * 86400000);
    return { iso: d.toISOString().slice(0, 10), raw: String(v) };
  }
  const s = clean(v);
  const m = s && s.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2,4})$/);
  if (!m) return { iso: null, raw: s };
  const y = +m[3] < 100 ? 2000 + +m[3] : +m[3];
  const iso = `${y}-${String(+m[2]).padStart(2, '0')}-${String(+m[1]).padStart(2, '0')}`;
  return { iso, raw: s };
}

const hhmm = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
const fmt12 = (min) => {
  const h = Math.floor(min / 60), m = min % 60;
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

export function parseTimeRange(raw) {
  const s = clean(raw);
  if (!s) return { raw: null, flag: 'Time missing in source' };
  const hits = [...s.matchAll(/(\d{1,2})\s*[.:]\s*(\d{2})\s*(AM|PM)?/gi)];
  if (hits.length < 2) return { raw: s, display: s, flag: `Time format not recognised ("${s}")` };
  const [a, b] = hits;
  const mer1 = (a[3] || b[3] || '').toUpperCase(), mer2 = (b[3] || a[3] || '').toUpperCase();
  const conv = (h, mi, mer) => (+h % 12) * 60 + +mi + (mer === 'PM' ? 720 : 0);
  const start = conv(a[1], a[2], mer1), end = conv(b[1], b[2], mer2);
  if (end <= start) {
    return { raw: s, display: s, start: hhmm(start), startMin: start, flag: `End time is not after start time in the source ("${s}") – shown exactly as supplied` };
  }
  return { raw: s, display: `${fmt12(start)} – ${fmt12(end)}`, start: hhmm(start), end: hhmm(end), startMin: start, endMin: end, minutes: end - start };
}

const hoursLabel = (v) => {
  const s = clean(v);
  if (!s) return null;
  const m = s.match(/^(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)?$/i);
  return m ? `${m[1]} Hours` : s;
};

function parseSection(v) {
  const raw = v === null || v === undefined ? null : String(v);
  const sec = clean(raw);
  if (!sec) return { sec: null, secs: [] };
  const secs = sec.split(',').map((x) => clean(x)).filter(Boolean);
  return { sec, secs };
}

export function readWorkbook(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const records = [];
  const sheets = [];
  const notices = [];

  for (const cfg of SHEET_CONFIG) {
    const sheetName = wb.SheetNames.find((n) => clean(n) === cfg.match);
    if (!sheetName) throw new Error(`Worksheet not found: ${cfg.match}`);
    const ws = wb.Sheets[sheetName];
    const rowOffset = XLSX.utils.decode_range(ws['!ref']).s.r;
    const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null, blankrows: true });
    const hi = aoa.findIndex((r) => norm(r[0]) === 'date');
    if (hi < 0) throw new Error(`Header row not found in ${cfg.match}`);
    const H = aoa[hi].map(norm);
    const col = (name, nth = 0) => H.map((h, i) => (h === name.toLowerCase() ? i : -1)).filter((i) => i >= 0)[nth] ?? -1;
    const g = (row, i) => (i < 0 ? null : row[i]);

    const C = {
      date: col('date'),
      time: cfg.kind === 'labA' ? col('slot') : col('time'),
      slot: cfg.kind === 'labB' ? col('slot') : -1,
      duration: Math.max(col('duration'), col('duration (hrs)')),
      ltps: col('ltps'),
      code: col('coursecode'),
      name: Math.max(col('course name'), col('coursedesc')),
      subject: col('subject'),
      section: col('section'),
      count: col('count'),
      count2: col('count', 1),
      dept: col('offered by dept'),
      fa: col('a faculty'), fai: col('a emp id'),
      fad: Math.max(col('a emp dept'), col('a emp id dept')),
      fb: col('b faculty'), fbi: col('b emp id'),
      fbd: Math.max(col('b emp dept'), col('b emp id dept')),
      venue: Math.max(col('lab venue'), col('room no')),
      cap: col('lab capacity'), inLab: col('students in lab'),
      nature: col('course nature'), psicp: col('ps/icp'), offeredTo: col('student offered to'),
      regd: col('regdno')
    };

    let sourceRows = 0, rowsWithCode = 0;
    const groups = new Map();
    const sheetRecords = [];

    for (let r = hi + 1; r < aoa.length; r++) {
      const row = aoa[r];
      sourceRows++;
      const code = clean(g(row, C.code));
      const excelRow = r + 1 + rowOffset;
      if (!code) {
        const txt = row.map(clean).filter(Boolean).join(' ');
        if (txt) notices.push({ sheet: cfg.match, yr: cfg.yr, row: excelRow, text: txt });
        continue;
      }
      rowsWithCode++;

      const d = parseDate(g(row, C.date));
      const t = parseTimeRange(g(row, C.time));
      const { sec, secs } = parseSection(g(row, C.section));
      const venue = clean(g(row, C.venue));
      const name = clean(g(row, C.name));
      const rec = {
        yr: cfg.yr, yearLabel: cfg.yearLabel, sheet: cfg.match, category: cfg.category,
        date: d.iso, dateRaw: d.raw && typeof g(row, C.date) === 'string' ? d.raw : null,
        time: t.raw, timeDisplay: t.display || null, start: t.start || null, end: t.end || null,
        duration: hoursLabel(g(row, C.duration)),
        durationCalculated: t.minutes ? `${+(t.minutes / 60).toFixed(2)} Hours` : null,
        ltps: clean(g(row, C.ltps)),
        courseCode: code, courseName: name,
        section: sec, sections: secs,
        studentCount: null, studentsInLab: null, labCapacity: null,
        offeredByDept: clean(g(row, C.dept)),
        facultyA: clean(g(row, C.fa)), facultyAId: clean(g(row, C.fai)), facultyADept: clean(g(row, C.fad)),
        facultyB: clean(g(row, C.fb)), facultyBId: clean(g(row, C.fbi)), facultyBDept: clean(g(row, C.fbd)),
        venue, slotLabel: clean(g(row, C.slot)), subject: clean(g(row, C.subject)),
        courseNature: clean(g(row, C.nature)), psIcp: clean(g(row, C.psicp)),
        offeredTo: [],
        sourceRowCount: 1, sourceRows: [excelRow], flags: []
      };
      const num = (v) => (v === null || v === undefined || v === '' ? null : Number(v));

      if (cfg.kind === 'labA' || cfg.kind === 'labB') {
        rec.studentCount = num(g(row, C.count));
        rec.studentsInLab = cfg.kind === 'labA' ? num(g(row, C.inLab)) : num(g(row, C.count2));
        rec.labCapacity = num(g(row, C.cap));
        sheetRecords.push(rec);
        continue;
      }

      // Student-wise sheets → group rows into one examination event
      const regd = clean(g(row, C.regd));
      const key = [d.iso || d.raw, t.raw, code, name, sec, venue, rec.facultyA, rec.courseNature, rec.psIcp, rec.subject, rec.duration].join('|');
      let grp = groups.get(key);
      if (!grp) {
        grp = { rec, regds: new Set(), offeredTo: new Set(), rows: 0 };
        groups.set(key, grp);
        sheetRecords.push(rec);
      } else {
        grp.rec.sourceRows.push(excelRow);
      }
      grp.rows++;
      if (regd) grp.regds.add(regd);
      const ot = clean(g(row, C.offeredTo));
      if (ot) grp.offeredTo.add(ot);
    }
    for (const grp of groups.values()) {
      grp.rec.sourceRowCount = grp.rows;
      grp.rec.studentCount = grp.regds.size || grp.rows;
      grp.rec.offeredTo = [...grp.offeredTo].sort();
    }

    // Validation flags (flag – never invent)
    for (const rec of sheetRecords) {
      if (!rec.date) rec.flags.push('Examination date missing or unreadable in source');
      const t = parseTimeRange(rec.time);
      if (t.flag) rec.flags.push(t.flag);
      if (!rec.venue) rec.flags.push('Lab venue / room missing in source');
      if (!rec.section) rec.flags.push('Section missing in source');
      if (!rec.courseName) rec.flags.push('Course name missing in source');
      if (rec.sections.length > 1) rec.flags.push(`Source lists more than one section in a single row ("${rec.section}")`);
    }

    // drop nulls / empties for a compact JSON
    for (const rec of sheetRecords) {
      for (const k of Object.keys(rec)) {
        const v = rec[k];
        if (v === null || (Array.isArray(v) && v.length === 0 && k !== 'sections')) delete rec[k];
      }
    }
    records.push(...sheetRecords);
    sheets.push({
      name: cfg.match, yr: cfg.yr, yearLabel: cfg.yearLabel, category: cfg.category,
      sourceRows, rowsWithCourseCode: rowsWithCode, events: sheetRecords.length
    });
  }

  records.forEach((r, i) => { r.id = `E${String(i + 1).padStart(4, '0')}`; });
  return { records, sheets, notices };
}
