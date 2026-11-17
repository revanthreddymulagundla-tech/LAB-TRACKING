import { FileSpreadsheet, ShieldCheck, AlertTriangle } from 'lucide-react';
import { meta, dataNotes, computeStats } from '../utils/searchUtils.js';

export default function AboutPage() {
  const notes = dataNotes();
  const s = computeStats();
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold text-navy-800 sm:text-4xl">About LabTrack</h1>
      <p className="mt-3 text-slate-600">
        LabTrack is a frontend-only portal that turns the official <b>{meta.academicSession}</b> End Semester Lab/Skill schedule workbook into a searchable timetable.
        Find Your Lab Exam. Know Your Venue. Be Prepared.
      </p>

      <div className="card mt-8 p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-navy-800"><FileSpreadsheet className="h-5 w-5 text-violet-600" />Source worksheets</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-500"><tr><th className="py-2">Worksheet</th><th>Source rows</th><th>With course code</th><th>Exam events</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {meta.sheets.map((w) => (
                <tr key={w.name}><td className="py-2 font-semibold text-navy-800">{w.name}<div className="text-xs font-normal text-slate-500">{w.category}</div></td><td>{w.sourceRows.toLocaleString()}</td><td>{w.rowsWithCourseCode.toLocaleString()}</td><td>{w.events.toLocaleString()}</td></tr>
              ))}
              <tr className="font-bold text-navy-800"><td className="py-2">Total</td><td>{s.sourceRows.toLocaleString()}</td><td>{s.rowsWithCode.toLocaleString()}</td><td>{s.events.toLocaleString()}</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500">Source rows are the rows below each worksheet header; a few are blank or note rows. For the three IV B.Tech student-wise sheets, rows are grouped into one examination event per course, section, date, time and venue.</p>
      </div>

      <div className="card mt-6 p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-navy-800"><ShieldCheck className="h-5 w-5 text-violet-600" />Privacy</h2>
        <p className="mt-2 text-sm text-slate-600">Student names and registration numbers from the IV B.Tech sheets are used only while building the data to count students per exam. They are not stored in the website data and are never displayed.</p>
      </div>

      <div className="card mt-6 p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-navy-800"><AlertTriangle className="h-5 w-5 text-amber-500" />Data notes (flagged, not altered)</h2>
        <p className="mt-2 text-sm text-slate-600">These source values look questionable. LabTrack shows them exactly as supplied and marks the affected records.</p>
        <ul className="mt-3 space-y-2 text-sm">
          {notes.length === 0 && <li>No questionable values found.</li>}
          {notes.map((n) => <li key={n.note} className="flex justify-between gap-4 rounded-lg bg-amber-50 px-3 py-2 text-amber-900"><span>{n.note}</span><b>{n.count} record{n.count > 1 ? 's' : ''}</b></li>)}
          {meta.notices.map((n) => <li key={n.row} className="rounded-lg bg-violet-50 px-3 py-2 text-violet-900"><b>{n.sheet}:</b> {n.text}</li>)}
        </ul>
      </div>
    </div>
  );
}
