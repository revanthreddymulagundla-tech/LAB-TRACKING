import { useEffect, useState } from 'react';
import { CalendarDays, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { formatDate, courseTitle, durationText, venueLabel } from '../utils/searchUtils.js';

const PAGE = 120;
const catColor = (c) => (/Physics/.test(c) ? 'bg-sky-100 text-sky-800' : /Additional/.test(c) ? 'bg-amber-100 text-amber-800' : /PS/.test(c) ? 'bg-emerald-100 text-emerald-800' : 'bg-violet-100 text-violet-800');
const warn = (r) => r.flags?.length > 0;

export default function Timetable({ rows, showCategory = false }) {
  const [limit, setLimit] = useState(PAGE);
  useEffect(() => setLimit(PAGE), [rows]);
  const shown = rows.slice(0, limit);
  const faculty = (r) => [r.facultyA, r.facultyB].filter(Boolean).join(' / ');
  return (
    <div>
      {/* Desktop table (also used for printing) */}
      <div className="print-table card hidden overflow-x-auto md:block">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-navy-900 text-xs uppercase tracking-wider text-white">
            <tr>{['Date', 'Time', 'Subject', 'Section', 'Venue', 'Faculty'].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {shown.map((r) => (
              <tr key={r.id} className="align-top transition hover:bg-violet-50/50">
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-navy-800">{formatDate(r.date, true)}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  {r.timeDisplay || r.time || '—'}
                  {warn(r) && <AlertTriangle className="ml-1 inline h-3.5 w-3.5 text-amber-500" title={r.flags.join('; ')} />}
                  {durationText(r) && <div className="text-xs text-slate-500">{r.duration || r.durationCalculated}</div>}
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-navy-800">{courseTitle(r)}</div>
                  <div className="font-mono text-xs text-slate-500">{r.courseCode}{r.ltps ? ` · ${r.ltps}` : ''}</div>
                  {showCategory && <span className={`badge mt-1 ${catColor(r.category)}`}>{r.category}</span>}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-medium">{r.section || '—'}</td>
                <td className="whitespace-nowrap px-4 py-3">{r.venue || '—'}</td>
                <td className="px-4 py-3 text-xs text-slate-600">{faculty(r) || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="print-cards space-y-3 md:hidden">
        {shown.map((r) => (
          <div key={r.id} className="card p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-bold leading-snug text-navy-800">{courseTitle(r)}</div>
                <div className="font-mono text-xs text-slate-500">{r.courseCode}</div>
              </div>
              <span className="badge shrink-0 bg-navy-800 text-white">{r.section || '—'}</span>
            </div>
            <div className="mt-3 space-y-1.5 text-sm">
              <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-violet-600" />{formatDate(r.date, true)}</div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-violet-600" />{r.timeDisplay || r.time || '—'}{warn(r) && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}</div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-violet-600" />{venueLabel(r)}: {r.venue || '—'}</div>
            </div>
            {faculty(r) && <div className="mt-2 text-xs text-slate-500">{faculty(r)}</div>}
            {showCategory && <span className={`badge mt-2 ${catColor(r.category)}`}>{r.category}</span>}
          </div>
        ))}
      </div>

      {rows.length > limit && (
        <div className="no-print mt-4 text-center">
          <button className="btn-ghost" onClick={() => setLimit(limit + PAGE)}>Show more ({rows.length - limit} remaining)</button>
        </div>
      )}
    </div>
  );
}
