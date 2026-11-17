import { useMemo, useState } from 'react';
import { GraduationCap, Layers, BookOpen, Search, CalendarDays, RotateCcw, Loader2, Download, Copy, Check, ListChecks, SearchX, Printer, MousePointerClick } from 'lucide-react';
import { YEARS, getSections, getDates, getCourses, filterRecords, sortExams, formatDate, examToText } from '../utils/searchUtils.js';
import { downloadExamPDF, downloadTimetablePDF } from '../utils/pdfUtils.js';
import ExamResult from './ExamResult.jsx';
import Timetable from './Timetable.jsx';

export default function ExamSearch() {
  const [yr, setYr] = useState('');
  const [sec, setSec] = useState('');
  const [key, setKey] = useState('');
  const [q, setQ] = useState('');
  const [date, setDate] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [copied, setCopied] = useState(false);

  const sections = useMemo(() => (yr ? getSections(yr) : []), [yr]);
  const dates = useMemo(() => (yr && sec ? getDates(yr, sec) : []), [yr, sec]);
  const courses = useMemo(() => (yr && sec ? getCourses(yr, sec, date) : []), [yr, sec, date]);
  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    return n ? courses.filter((c) => c.name.toLowerCase().includes(n) || c.code.toLowerCase().includes(n)) : courses;
  }, [courses, q]);
  const allForSection = useMemo(() => (yr && sec ? sortExams(filterRecords({ yr, sec, date })) : []), [yr, sec, date]);

  const reset = () => { setResults(null); setShowAll(false); };
  const onYear = (v) => { setYr(v); setSec(''); setKey(''); setQ(''); setDate(''); reset(); };
  const onSec = (v) => { setSec(v); setKey(''); setQ(''); setDate(''); reset(); };
  const onDate = (v) => { setDate(v); setKey(''); reset(); };
  const clearAll = () => onYear('');

  const find = () => {
    if (!key) return;
    setLoading(true); setShowAll(false); setResults(null);
    setTimeout(() => { setResults(sortExams(filterRecords({ yr, sec, key, date }))); setLoading(false); }, 550);
  };
  const copyAll = async () => {
    const text = results.map(examToText).join('\n\n');
    try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  };
  const title = `${YEARS.find((y) => y.id === yr)?.label || ''} – Section ${sec}`;

  return (
    <section id="find" className="scroll-mt-24">
      <div className="card no-print p-5 sm:p-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-navy-800 sm:text-3xl">Find My Examination</h2>
            <p className="mt-1 text-sm text-slate-500">Academic year → Section → Subject. Options are generated from the official workbook.</p>
          </div>
          <button className="btn-ghost btn-sm" onClick={clearAll}><RotateCcw className="h-4 w-4" />Clear all filters</button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="label" htmlFor="yr"><GraduationCap className="h-4 w-4" />1 · Academic Year</label>
            <select id="yr" className="input" value={yr} onChange={(e) => onYear(e.target.value)}>
              <option value="">Select academic year</option>
              {YEARS.map((y) => <option key={y.id} value={y.id}>{y.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="sec"><Layers className="h-4 w-4" />2 · Section {sections.length > 0 && <span className="font-normal normal-case text-slate-400">({sections.length})</span>}</label>
            <select id="sec" className="input" value={sec} disabled={!yr} onChange={(e) => onSec(e.target.value)}>
              <option value="">{yr ? 'Select section' : 'Select year first'}</option>
              {sections.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="dt"><CalendarDays className="h-4 w-4" />Exam Date <span className="font-normal normal-case text-slate-400">(optional)</span></label>
            <select id="dt" className="input" value={date} disabled={!sec} onChange={(e) => onDate(e.target.value)}>
              <option value="">All dates</option>
              {dates.map((d) => <option key={d} value={d}>{formatDate(d, true)}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-5">
          <label className="label" htmlFor="course"><BookOpen className="h-4 w-4" />3 · Subject / Course Code {sec && <span className="font-normal normal-case text-slate-400">({shown.length} of {courses.length})</span>}</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input id="course" className="input pl-10" placeholder={sec ? 'Search by subject name or course code…' : 'Select a section to see subjects'} value={q} disabled={!sec} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/60" role="listbox" aria-label="Subjects">
            {!sec && <p className="p-4 text-sm text-slate-400">Subjects for your section will appear here.</p>}
            {sec && shown.length === 0 && <p className="p-4 text-sm text-slate-500">No subject matches “{q}”.</p>}
            {shown.map((c) => (
              <button key={c.key} role="option" aria-selected={key === c.key} onClick={() => { setKey(c.key); reset(); }}
                className={`flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5 text-left text-sm transition last:border-0 ${key === c.key ? 'bg-violet-600 text-white' : 'hover:bg-violet-50'}`}>
                <span className="font-semibold">{c.name}</span>
                <span className={`shrink-0 font-mono text-xs ${key === c.key ? 'text-violet-100' : 'text-slate-500'}`}>{c.code}{c.exams > 1 ? ` · ${c.exams} exams` : ''}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button className="btn-primary" disabled={!key || loading} onClick={find}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}Find My Examination
          </button>
          <button className="btn-ghost" disabled={!sec} onClick={() => { setShowAll(!showAll); setResults(null); }}>
            <ListChecks className="h-4 w-4" />{showAll ? 'Hide' : 'View'} all subjects for this section
          </button>
        </div>
      </div>

      <div className="mt-6" aria-live="polite">
        {loading && (
          <div className="card flex flex-col items-center gap-3 p-12 text-center">
            <Loader2 className="h-9 w-9 animate-spin text-violet-600" />
            <p className="font-medium text-navy-700">Searching the lab examination schedule…</p>
          </div>
        )}

        {!loading && results === null && !showAll && (
          <div className="card no-print flex flex-col items-center gap-3 border-dashed p-10 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-violet-50 text-violet-600"><MousePointerClick className="h-7 w-7" /></span>
            <h3 className="text-lg font-bold text-navy-800">Your exam details will appear here</h3>
            <p className="max-w-md text-sm text-slate-500">Choose your academic year, section and subject, then press “Find My Examination”.</p>
          </div>
        )}

        {!loading && results && results.length === 0 && (
          <div className="card flex flex-col items-center gap-3 p-10 text-center">
            <SearchX className="h-10 w-10 text-slate-400" />
            <h3 className="text-lg font-bold text-navy-800">No examination found</h3>
            <p className="text-sm text-slate-500">No record matches this selection. Try clearing the date filter or choose another subject.</p>
          </div>
        )}

        {!loading && results && results.length > 0 && (
          <div className="space-y-4">
            <div className="no-print flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-navy-800">{results.length} examination record{results.length > 1 ? 's' : ''} found</h3>
              <div className="flex flex-wrap gap-2">
                <button className="btn-ghost btn-sm" onClick={copyAll}>{copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}{copied ? 'Copied!' : 'Copy all'}</button>
                <button className="btn-ghost btn-sm" onClick={() => downloadExamPDF(results, `LabTrack-${results[0].courseCode}-${sec}.pdf`, title)}><Download className="h-4 w-4" />Download PDF</button>
                <button className="btn-ghost btn-sm" onClick={() => window.print()}><Printer className="h-4 w-4" />Print</button>
              </div>
            </div>
            {results.map((r, i) => <ExamResult key={r.id} exam={r} index={results.length > 1 ? i : undefined} />)}
          </div>
        )}

        {!loading && showAll && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-navy-800">All subjects · {title} <span className="text-sm font-medium text-slate-500">({allForSection.length} exams)</span></h3>
              <div className="no-print flex gap-2">
                <button className="btn-ghost btn-sm" onClick={() => downloadTimetablePDF(allForSection, `Lab Examination Timetable – ${title}`, `${allForSection.length} examinations`, `LabTrack-${yr}-${sec}-timetable.pdf`)}><Download className="h-4 w-4" />PDF</button>
                <button className="btn-ghost btn-sm" onClick={() => window.print()}><Printer className="h-4 w-4" />Print</button>
              </div>
            </div>
            <Timetable rows={allForSection} showCategory={yr === 'IV'} />
          </div>
        )}
      </div>
    </section>
  );
}
