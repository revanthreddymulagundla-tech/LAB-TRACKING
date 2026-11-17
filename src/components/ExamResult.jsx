import { useState } from 'react';
import { CalendarDays, Clock, MapPin, BookOpen, User, Users, Building2, Copy, Check, Download, AlertTriangle, FileSpreadsheet, GraduationCap, Layers, Hash, Timer } from 'lucide-react';
import { formatDate, courseTitle, venueLabel, durationText, ltpsText, examToText } from '../utils/searchUtils.js';
import { downloadExamPDF } from '../utils/pdfUtils.js';

const Tile = ({ icon: I, label, value, sub }) => (
  <div className="rounded-xl bg-white/10 p-4 ring-1 ring-white/15">
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-200"><I className="h-4 w-4" />{label}</div>
    <div className="mt-1.5 text-lg font-bold leading-snug text-white">{value || 'Not available'}</div>
    {sub && <div className="text-xs text-navy-100">{sub}</div>}
  </div>
);

const Info = ({ icon: I, label, value }) =>
  value ? (
    <div className="flex gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-600"><I className="h-4 w-4" /></span>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
        <div className="break-words text-sm font-medium text-navy-800">{value}</div>
      </div>
    </div>
  ) : null;

export default function ExamResult({ exam: r, index }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(examToText(r)); }
    catch { const t = document.createElement('textarea'); t.value = examToText(r); document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); }
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  };
  const faculty = (name, id, dept) => name && `${name}${id ? ` · ID ${id}` : ''}${dept ? ` · ${dept}` : ''}`;
  const timeSub = r.flags?.some((f) => f.startsWith('End time')) ? 'Shown exactly as in the source' : null;
  return (
    <article className="card animate-fadeUp overflow-hidden">
      <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-violet-800 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge bg-violet-500/30 text-violet-100"><GraduationCap className="h-3.5 w-3.5" />{r.yearLabel}</span>
          <span className="badge bg-white/15 text-white"><Layers className="h-3.5 w-3.5" />Section {r.section}</span>
          <span className="badge bg-white/15 text-white">{r.category}</span>
          {index !== undefined && <span className="badge ml-auto bg-white/10 text-navy-100">Record {index + 1}</span>}
        </div>
        <h3 className="mt-3 text-xl font-extrabold leading-snug text-white sm:text-2xl">{courseTitle(r)}</h3>
        <p className="mt-1 font-mono text-sm text-violet-200">{r.courseCode}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Tile icon={CalendarDays} label="Examination Date" value={r.date ? formatDate(r.date) : null} />
          <Tile icon={Clock} label="Time" value={r.timeDisplay || r.time} sub={timeSub || durationText(r)} />
          <Tile icon={MapPin} label={venueLabel(r)} value={r.venue} />
        </div>
      </div>

      <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
        <Info icon={Timer} label="Duration" value={durationText(r)} />
        <Info icon={User} label="Faculty A" value={faculty(r.facultyA, r.facultyAId, r.facultyADept)} />
        <Info icon={User} label="Faculty B" value={faculty(r.facultyB, r.facultyBId, r.facultyBDept)} />
        <Info icon={Building2} label="Offered By Dept" value={r.offeredByDept} />
        <Info icon={Building2} label="Offered To" value={r.offeredTo?.join(', ')} />
        <Info icon={Users} label="Number of Students" value={r.studentCount} />
        <Info icon={Users} label="Students In Lab" value={r.studentsInLab} />
        <Info icon={Building2} label="Lab Capacity" value={r.labCapacity} />
        <Info icon={BookOpen} label="LTPS" value={ltpsText(r.ltps)} />
        <Info icon={BookOpen} label="Course Nature" value={r.courseNature} />
        <Info icon={BookOpen} label="PS / ICP" value={r.psIcp} />
        <Info icon={Hash} label="Slot" value={r.slotLabel} />
        <Info icon={BookOpen} label="Subject Group" value={r.subject} />
        <Info icon={FileSpreadsheet} label="Original Worksheet" value={r.sheet} />
      </div>

      {r.flags?.length > 0 && (
        <div className="mx-5 mb-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 sm:mx-6">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div><b>Source data note:</b> {r.flags.join(' · ')}. Please confirm with your department.</div>
        </div>
      )}

      <div className="no-print flex flex-wrap gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3 sm:px-6">
        <button className="btn-ghost btn-sm" onClick={copy}>{copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}{copied ? 'Copied!' : 'Copy details'}</button>
        <button className="btn-ghost btn-sm" onClick={() => downloadExamPDF([r], `LabTrack-${r.courseCode}-${r.section}.pdf`, 'Lab Examination Details')}><Download className="h-4 w-4" />Download PDF</button>
      </div>
    </article>
  );
}
