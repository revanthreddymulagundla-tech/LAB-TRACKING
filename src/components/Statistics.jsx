import { useEffect, useMemo, useRef, useState } from 'react';
import { GraduationCap, FileSpreadsheet, Rows3, Hash, BookOpen, Layers, CalendarCheck } from 'lucide-react';
import { computeStats } from '../utils/searchUtils.js';

function CountUp({ value }) {
  const [n, setN] = useState(0);
  const raf = useRef();
  useEffect(() => {
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / 900);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);
  return <>{n.toLocaleString('en-IN')}</>;
}

export default function Statistics() {
  const s = useMemo(computeStats, []);
  const items = [
    [GraduationCap, 'Academic Years', s.academicYears],
    [FileSpreadsheet, 'Worksheets', s.worksheets],
    [Rows3, 'Source Data Rows', s.sourceRows],
    [Hash, 'Rows With Course Code', s.rowsWithCode],
    [BookOpen, 'Unique Courses', s.uniqueCourses],
    [Layers, 'Unique Sections', s.uniqueSections],
    [CalendarCheck, 'Examination Events', s.events]
  ];
  return (
    <section className="relative z-10 mx-auto -mt-10 max-w-7xl px-4 sm:px-6" aria-label="Statistics">
      <div className="card grid grid-cols-2 gap-px overflow-hidden bg-slate-200/60 sm:grid-cols-4 lg:grid-cols-7">
        {items.map(([I, label, v]) => (
          <div key={label} className="bg-white p-4 text-center">
            <I className="mx-auto h-5 w-5 text-violet-600" />
            <div className="mt-1.5 text-2xl font-extrabold text-navy-800"><CountUp value={v} /></div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
