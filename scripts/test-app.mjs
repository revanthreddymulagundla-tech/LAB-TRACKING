// Smoke/logic tests. Run: npm run test:app  (bundles with esbuild, runs in Node)
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import fs from 'node:fs';
import App from '../src/App.jsx';
import ExamResult from '../src/components/ExamResult.jsx';
import * as S from '../src/utils/searchUtils.js';
import { buildExamPDF, buildTimetablePDF } from '../src/utils/pdfUtils.js';

console.error = () => {};
let pass = 0, fail = 0;
const t = (name, cond, extra = '') => { cond ? pass++ : fail++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${name} ${extra}`); };

// 1. Stats from data
const st = S.computeStats();
console.log('Stats:', JSON.stringify(st));
t('5 worksheets', st.worksheets === 5); t('3 academic years', st.academicYears === 3);
t('4380 rows with course code', st.rowsWithCode === 4380);

// 2. Dependent dropdowns per year
for (const y of S.YEARS) {
  const secs = S.getSections(y.id);
  t(`${y.label}: sections extracted`, secs.length > 0, `(${secs.length}: ${secs.slice(0, 6).join(', ')}…)`);
  // every section has >=1 course, and every course search returns >=1 record
  let bad = 0, nCourses = 0;
  for (const s of secs) for (const c of S.getCourses(y.id, s)) { nCourses++; if (!S.filterRecords({ yr: y.id, sec: s, key: c.key }).length) bad++; }
  t(`${y.label}: every section/course combo resolves to an exam`, bad === 0, `(${nCourses} combos)`);
}
t('IV sections include S-10-A, S-51-B, S-1-MA', ['S-10-A', 'S-51-B', 'S-1-MA'].every((s) => S.getSections('IV').includes(s)));
t('IV also has S-1, S-2, S-51 (Reg & Addl)', ['S-1', 'S-2', 'S-51'].every((s) => S.getSections('IV').includes(s)));
t('III has S1,S4 combined row indexed under S1 and S4', S.filterRecords({ yr: 'III', sec: 'S4', q: '24CS2224F' }).some((r) => r.section === 'S1,S4') && S.filterRecords({ yr: 'III', sec: 'S1', q: '24CS2224F' }).some((r) => r.section === 'S1,S4'));

// 3. Spot searches – II, III, IV categories
const first = (yr, sec, cat) => S.sortExams(S.filterRecords({ yr, sec, cat }))[0];
const II = S.filterRecords({ yr: 'II', sec: 'S-1' })[0];
t('II search returns date/time/venue', II && II.date && II.time && II.venue, `${II.courseCode} ${II.date} ${II.time} ${II.venue}`);
const III = S.filterRecords({ yr: 'III', sec: 'S6', q: 'DATA SCIENCE' })[0];
t('III search DATA SCIENCE S6 = 2026-11-16 R706B', III && III.date === '2026-11-16' && III.venue === 'R706B', JSON.stringify([III?.date, III?.time, III?.venue]));
const cats = ['Regular Physics & Chemistry', 'Regular & Additional Courses', 'PS / ICP'];
for (const c of cats) { const r = S.filterRecords({ yr: 'IV', cat: c })[0]; t(`IV category "${c}" searchable`, !!r && !!r.date && !!r.venue, `${r.courseCode} ${r.section} ${r.date} ${r.time} ${r.venue} students=${r.studentCount}`); }
t('Name search is case-insensitive', S.filterRecords({ yr: 'IV', q: 'engineering chemistry' }).length > 0);
t('Code search works', S.filterRecords({ q: '25BT2103' }).length > 0);
t('Date filter works', S.filterRecords({ yr: 'II', date: '2026-11-21' }).length === 87);
t('No-result query returns empty', S.filterRecords({ yr: 'II', q: 'zzzzzz' }).length === 0);
t('No student personal data in records', !JSON.stringify(S.records).match(/regd|studentname/i));

// 4. PDFs
const ex = S.filterRecords({ yr: 'II', sec: 'S-1' }).slice(0, 3);
const p1 = buildExamPDF(ex, 'Test'); const b1 = p1.output('arraybuffer');
const tt = S.sortExams(S.filterRecords({ yr: 'III', sec: 'S1' }));
const p2 = buildTimetablePDF(tt, 'Timetable', 'sub'); const b2 = p2.output('arraybuffer');
fs.writeFileSync('/tmp/test-exam.pdf', Buffer.from(b1)); fs.writeFileSync('/tmp/test-timetable.pdf', Buffer.from(b2));
t('Exam PDF generated', b1.byteLength > 2000, `(${b1.byteLength} bytes, ${p1.getNumberOfPages()} pages)`);
t('Timetable PDF generated', b2.byteLength > 2000, `(${b2.byteLength} bytes, ${p2.getNumberOfPages()} pages, ${tt.length} rows)`);

// 5. Render every route + a result card (SSR)
for (const path of ['/', '/find', '/timetable', '/about']) {
  let html = ''; try { html = renderToString(React.createElement(MemoryRouter, { initialEntries: [path] }, React.createElement(App))); } catch (e) { console.log(e); }
  t(`Route ${path} renders`, html.length > 1500, `(${html.length} chars)`);
}
for (const r of [II, III, S.filterRecords({ yr: 'IV', cat: cats[2] })[0]]) {
  const h = renderToString(React.createElement(ExamResult, { exam: r }));
  t(`ExamResult card renders (${r.sheet})`, h.includes(r.courseCode));
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
