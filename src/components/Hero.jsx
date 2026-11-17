import { Search, Table2, CalendarDays, Clock, MapPin, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-800 to-violet-900 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(167,139,250,.45), transparent 40%), radial-gradient(circle at 85% 70%, rgba(124,58,237,.5), transparent 45%)' }} />
      <div className="pointer-events-none absolute inset-0 opacity-[.07]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '44px 44px' }} />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2">
        <div className="animate-fadeUp">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-violet-100">
            <Sparkles className="h-3.5 w-3.5" /> Smart Lab Examination Schedule Portal
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Your Lab Exam Schedule, <span className="bg-gradient-to-r from-violet-300 to-white bg-clip-text text-transparent">Simplified.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-navy-100 sm:text-lg">
            Find your laboratory examination date, time and venue in seconds. Select your academic year, section and subject to discover your complete exam details.
          </p>
          <p className="mt-3 text-sm font-medium text-violet-200">Find Your Lab Exam. Know Your Venue. Be Prepared.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#find" className="btn-primary"><Search className="h-4 w-4" /> Find My Exam</a>
            <Link to="/timetable" className="btn border border-white/25 bg-white/10 text-white hover:bg-white/20"><Table2 className="h-4 w-4" /> View Full Timetable</Link>
          </div>
        </div>

        {/* Illustration */}
        <div className="relative mx-auto hidden h-[380px] w-full max-w-md lg:block" aria-hidden="true">
          <div className="absolute inset-x-6 top-6 animate-float rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-violet-500"><Search className="h-5 w-5" /></div>
              <div className="flex-1 space-y-2"><div className="h-3 w-2/3 rounded bg-white/70" /><div className="h-2.5 w-1/3 rounded bg-white/30" /></div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[[CalendarDays, 'Date'], [Clock, 'Time'], [MapPin, 'Venue']].map(([I, t]) => (
                <div key={t} className="rounded-xl bg-white/15 p-3 text-center">
                  <I className="mx-auto h-5 w-5 text-violet-200" />
                  <div className="mt-1 text-xs font-semibold">{t}</div>
                  <div className="mx-auto mt-2 h-2 w-3/4 rounded bg-white/40" />
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -left-2 bottom-6 w-44 rotate-[-6deg] rounded-2xl bg-white p-4 text-navy-800 shadow-glow">
            <div className="text-xs font-bold text-violet-600">LAB EXAM</div>
            <div className="mt-2 h-2.5 w-full rounded bg-navy-100" /><div className="mt-1.5 h-2.5 w-2/3 rounded bg-navy-100" />
          </div>
          <div className="absolute -right-2 bottom-0 grid h-24 w-24 rotate-6 place-items-center rounded-3xl bg-gradient-to-br from-violet-500 to-violet-700 shadow-glow">
            <svg viewBox="0 0 64 64" className="h-14 w-14"><path d="M26 10h12v4h-2v13l11 20a4 4 0 0 1-3.5 6h-23A4 4 0 0 1 17 47l11-20V14h-2z" fill="rgba(255,255,255,.25)" stroke="#fff" strokeWidth="3" strokeLinejoin="round" /><path d="M23 42h18" stroke="#fff" strokeWidth="3" strokeLinecap="round" /></svg>
          </div>
        </div>
      </div>
    </section>
  );
}
