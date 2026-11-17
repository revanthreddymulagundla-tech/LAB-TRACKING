import { useMemo, useState } from 'react';
import { Search, Download, Printer, RotateCcw, ArrowDownUp, Info, Megaphone } from 'lucide-react';
import Timetable from '../components/Timetable.jsx';
import { YEARS, meta, records, getSections, getDates, filterRecords, sortExams, formatDate, yearLabel } from '../utils/searchUtils.js';
import { downloadTimetablePDF } from '../utils/pdfUtils.js';

export default function TimetablePage() {
  const [yr, setYr] = useState('II');
  const [sec, setSec] = useState('');
  const [q, setQ] = useState('');
  const [date, setDate] = useState('');
  const [cat, setCat] = useState('');
  const [dir, setDir] = useState('asc');

  const sections = useMemo(() => getSections(yr), [yr]);
  const dates = useMemo(() => getDates(yr, sec), [yr, sec]);
  const cats = useMemo(() => [...new Set(records.filter((r) => r.yr === yr).map((r) => r.category))], [yr]);
  const rows = useMemo(() => sortExams(filterRecords({ yr, sec, q, date, cat }), dir), [yr, sec, q, date, cat, dir]);
  const notices = meta.notices.filter((n) => n.yr === yr);
  const title = `Lab Examination Timetable – ${yearLabel(yr)}${sec ? ` – Section ${sec}` : ' – All Sections'}`;
  const sub = `${rows.length} examination${rows.length === 1 ? '' : 's'}${date ? ` on ${formatDate(date, true)}` : ''}${q ? ` matching “${q}”` : ''}`;

  const clear = () => { setSec(''); setQ(''); setDate(''); setCat(''); setDir('asc'); };
  const onYear = (v) => { setYr(v); clear(); };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="no-print">
        <h1 className="text-3xl font-extrabold text-navy-800 sm:text-4xl">Complete Lab Examination Timetable</h1>
        <p className="mt-1 text-slate-500">Select a year and section to see every subject, date, time and venue.</p>

        <div className="card mt-6 p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="label" htmlFor="t-yr">Academic Year</label>
              <select id="t-yr" className="input" value={yr} onChange={(e) => onYear(e.target.value)}>
                {YEARS.map((y) => <option key={y.id} value={y.id}>{y.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="t-sec">Section</label>
              <select id="t-sec" className="input" value={sec} onChange={(e) => { setSec(e.target.value); setDate(''); }}>
                <option value="">All sections ({sections.length})</option>
                {sections.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="t-dt">Date</label>
              <select id="t-dt" className="input" value={date} onChange={(e) => setDate(e.target.value)}>
                <option value="">All dates</option>
                {dates.map((d) => <option key={d} value={d}>{formatDate(d, true)}</option>)}
              </select>
            </div>
            {cats.length > 1 ? (
              <div>
                <label className="label" htmlFor="t-cat">Worksheet category</label>
                <select id="t-cat" className="input" value={cat} onChange={(e) => setCat(e.target.value)}>
                  <option value="">All categories</option>
                  {cats.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            ) : <div />}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input className="input pl-10" placeholder="Search subject name, course code or section…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <button className="btn-ghost" onClick={() => setDir(dir === 'asc' ? 'desc' : 'asc')}><ArrowDownUp className="h-4 w-4" />Date: {dir === 'asc' ? 'Earliest first' : 'Latest first'}</button>
            <button className="btn-ghost" onClick={clear}><RotateCcw className="h-4 w-4" />Clear</button>
            <button className="btn-primary" disabled={!rows.length} onClick={() => downloadTimetablePDF(rows, title, sub, `LabTrack-${yr}${sec ? '-' + sec : ''}-timetable.pdf`)}><Download className="h-4 w-4" />Download PDF</button>
            <button className="btn-ghost" disabled={!rows.length} onClick={() => window.print()}><Printer className="h-4 w-4" />Print</button>
          </div>
        </div>

        {notices.map((n) => (
          <div key={n.row} className="mt-4 flex items-start gap-2 rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm text-violet-900">
            <Megaphone className="mt-0.5 h-4 w-4 shrink-0" /><span><b>Note from the schedule workbook:</b> {n.text}</span>
          </div>
        ))}
      </div>

      <div className="print-only mb-4"><h1 className="text-xl font-bold">{title}</h1><p className="text-sm">{sub} · LabTrack · Academic Year 2026–27</p></div>

      <div className="mt-6">
        <p className="no-print mb-3 text-sm font-semibold text-navy-700">{sub}</p>
        {rows.length ? <Timetable rows={rows} showCategory={yr === 'IV'} /> : (
          <div className="card flex flex-col items-center gap-2 p-12 text-center">
            <Info className="h-9 w-9 text-slate-400" />
            <h3 className="text-lg font-bold text-navy-800">No examinations match these filters</h3>
            <p className="text-sm text-slate-500">Try clearing the search, date or category filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
