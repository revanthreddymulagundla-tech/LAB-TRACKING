import data from '../data/examinationData.json';

export const meta = data.meta;
export const records = data.records;

export const YEARS = [
  { id: 'II', label: 'II B.Tech – Y25' },
  { id: 'III', label: 'III B.Tech – Y24' },
  { id: 'IV', label: 'IV B.Tech – Y23' }
];
export const yearLabel = (id) => YEARS.find((y) => y.id === id)?.label || id;

const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
export const naturalSort = (a, b) => collator.compare(a, b);

export const secsOf = (r) => (r.sections?.length ? r.sections : r.section ? [r.section] : []);
export const courseKey = (r) => `${r.courseCode}||${r.courseName || ''}`;
export const courseTitle = (r) => r.courseName || '(Course name not provided in source)';
export const venueLabel = (r) => (/ADDL|PSICP/.test(r.sheet) ? 'Room No.' : 'Lab Venue');

export const getSections = (yr) => {
  const s = new Set();
  for (const r of records) if (r.yr === yr) secsOf(r).forEach((x) => s.add(x));
  return [...s].sort(naturalSort);
};

export const getDates = (yr, sec) => {
  const s = new Set();
  for (const r of records) if (r.yr === yr && (!sec || secsOf(r).includes(sec)) && r.date) s.add(r.date);
  return [...s].sort();
};

export const getCourses = (yr, sec, date) => {
  const map = new Map();
  for (const r of records) {
    if (r.yr !== yr || !secsOf(r).includes(sec) || (date && r.date !== date)) continue;
    const k = courseKey(r);
    if (!map.has(k)) map.set(k, { key: k, code: r.courseCode, name: courseTitle(r), exams: 0, categories: new Set() });
    const c = map.get(k);
    c.exams++;
    c.categories.add(r.category);
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name) || a.code.localeCompare(b.code));
};

export const sortExams = (list, dir = 'asc') => {
  const f = dir === 'desc' ? -1 : 1;
  return [...list].sort((a, b) =>
    f * ((a.date || '9999').localeCompare(b.date || '9999') || (a.start || '99').localeCompare(b.start || '99')) ||
    a.courseCode.localeCompare(b.courseCode) || naturalSort(a.section || '', b.section || ''));
};

export const filterRecords = ({ yr, sec, key, q, date, cat }) => {
  const n = (q || '').trim().toLowerCase();
  return records.filter((r) => {
    if (yr && r.yr !== yr) return false;
    if (sec && !secsOf(r).includes(sec)) return false;
    if (key && courseKey(r) !== key) return false;
    if (date && r.date !== date) return false;
    if (cat && r.category !== cat) return false;
    if (n && !`${r.courseName || ''} ${r.courseCode} ${secsOf(r).join(' ')}`.toLowerCase().includes(n)) return false;
    return true;
  });
};

export const formatDate = (iso, short = false) => {
  if (!iso) return 'Date not available';
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString('en-GB', short
    ? { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }
    : { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' });
};

export const LTPS_MEANING = { L: 'Lecture', T: 'Tutorial', P: 'Practical', S: 'Skill' };
export const ltpsText = (v) => {
  if (!v) return null;
  const parts = v.split(/[^A-Za-z]+/).filter(Boolean).flatMap((p) => (p.length > 1 && /^[LTPS]+$/i.test(p) ? p.split('') : [p]));
  const names = parts.map((p) => LTPS_MEANING[p.toUpperCase()]).filter(Boolean);
  return names.length ? `${v} (${names.join(' + ')})` : v;
};

export const durationText = (r) => r.duration || (r.durationCalculated ? `${r.durationCalculated} (calculated from time)` : null);

// Ordered [label, value] pairs – only fields that really exist in the source.
export const examFields = (r) => {
  const f = [];
  const add = (l, v) => { if (v !== undefined && v !== null && v !== '') f.push([l, String(v)]); };
  add('Academic Year', r.yearLabel);
  add('Section', secsOf(r).length > 1 ? r.section : r.section);
  add('Subject', courseTitle(r));
  add('Course Code', r.courseCode);
  add('Examination Date', r.date ? formatDate(r.date) : null);
  add('Time', r.timeDisplay || r.time);
  add('Duration', durationText(r));
  add(venueLabel(r), r.venue);
  add('Faculty A', r.facultyA && `${r.facultyA}${r.facultyAId ? ` (ID ${r.facultyAId})` : ''}`);
  add('Faculty A Dept', r.facultyADept);
  add('Faculty B', r.facultyB && `${r.facultyB}${r.facultyBId ? ` (ID ${r.facultyBId})` : ''}`);
  add('Faculty B Dept', r.facultyBDept);
  add('Offered By Dept', r.offeredByDept);
  add('Offered To', r.offeredTo?.join(', '));
  add('Students', r.studentCount);
  add('Students In Lab', r.studentsInLab);
  add('Lab Capacity', r.labCapacity);
  add('LTPS', ltpsText(r.ltps));
  add('Course Nature', r.courseNature);
  add('PS / ICP', r.psIcp);
  add('Slot', r.slotLabel);
  add('Category', r.category);
  add('Source Worksheet', r.sheet);
  if (r.flags?.length) add('Source Note', r.flags.join('; '));
  return f;
};

export const examToText = (r) =>
  ['LABTRACK – Lab Examination Details', ...examFields(r).map(([l, v]) => `${l}: ${v}`)].join('\n');

export const computeStats = () => {
  const years = new Set(), sheets = new Set(), courses = new Set(), sections = new Set();
  let rowsWithCode = 0;
  for (const r of records) {
    years.add(r.yr); sheets.add(r.sheet);
    courses.add(`${r.courseCode.toUpperCase()}||${(r.courseName || '').toUpperCase()}`);
    secsOf(r).forEach((s) => sections.add(s));
    rowsWithCode += r.sourceRowCount || 1;
  }
  return {
    academicYears: years.size, worksheets: sheets.size, sourceRows: meta.sourceRows,
    rowsWithCode, uniqueCourses: courses.size, uniqueSections: sections.size, events: records.length
  };
};

export const dataNotes = () => {
  const m = new Map();
  for (const r of records) for (const fl of r.flags || []) {
    const k = fl.replace(/\("[^"]*"\)/, '').trim();
    m.set(k, (m.get(k) || 0) + 1);
  }
  return [...m.entries()].map(([note, count]) => ({ note, count }));
};
