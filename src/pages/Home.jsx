import { Link } from 'react-router-dom';
import { Zap, ShieldCheck, Smartphone, FileDown, ArrowRight } from 'lucide-react';
import Hero from '../components/Hero.jsx';
import Statistics from '../components/Statistics.jsx';
import ExamSearch from '../components/ExamSearch.jsx';

const features = [
  [Zap, 'Instant answers', 'Year → section → subject and your date, time and venue appear immediately.'],
  [ShieldCheck, 'Straight from the workbook', 'Every record is traceable to its original worksheet. Unclear source values are flagged, never invented.'],
  [FileDown, 'Download or print', 'Save any exam or a full section timetable as PDF, or print it.'],
  [Smartphone, 'Made for phones', 'Responsive cards and tables that work on any screen.']
];

export default function Home() {
  return (
    <>
      <Hero />
      <Statistics />
      <div className="mx-auto max-w-5xl px-4 pt-12 sm:px-6">
        <ExamSearch />
      </div>
      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(([I, t, d]) => (
            <div key={t} className="card p-5 transition hover:-translate-y-1 hover:shadow-glow">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 text-white"><I className="h-5 w-5" /></span>
              <h3 className="mt-3 font-bold text-navy-800">{t}</h3>
              <p className="mt-1 text-sm text-slate-500">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-navy-900 to-violet-800 p-6 text-white sm:flex-row">
          <div><h3 className="text-xl font-bold">Need the whole picture?</h3><p className="text-sm text-navy-100">Browse the complete lab examination timetable for any section.</p></div>
          <Link to="/timetable" className="btn bg-white text-navy-800 hover:bg-violet-50">Open Timetable <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </>
  );
}
