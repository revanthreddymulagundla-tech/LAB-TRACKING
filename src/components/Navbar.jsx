import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FlaskConical, Menu, X, CalendarDays } from 'lucide-react';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/find', label: 'Find Exam' },
  { to: '/timetable', label: 'Complete Timetable' },
  { to: '/about', label: 'About' }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const cls = ({ isActive }) =>
    `rounded-lg px-3.5 py-2 text-sm font-medium transition ${isActive ? 'bg-white/15 text-white' : 'text-navy-100 hover:bg-white/10 hover:text-white'}`;
  return (
    <header className="no-print sticky top-0 z-50 border-b border-white/10 bg-navy-900/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 shadow-glow">
            <FlaskConical className="h-5 w-5 text-white" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-white">Lab<span className="text-violet-400">Track</span></span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => <NavLink key={l.to} {...l} className={cls}>{l.label}</NavLink>)}
        </nav>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-violet-400/40 bg-violet-500/20 px-3 py-1.5 text-xs font-semibold text-violet-100 sm:inline-flex">
            <CalendarDays className="h-3.5 w-3.5" /> Academic Year 2026–27
          </span>
          <button aria-label="Menu" className="rounded-lg p-2 text-white md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="space-y-1 border-t border-white/10 px-4 pb-4 pt-2 md:hidden">
          {links.map((l) => <NavLink key={l.to} {...l} className={cls} onClick={() => setOpen(false)}><span className="block">{l.label}</span></NavLink>)}
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-violet-500/20 px-3 py-1.5 text-xs font-semibold text-violet-100">
            <CalendarDays className="h-3.5 w-3.5" /> Academic Year 2026–27
          </span>
        </nav>
      )}
    </header>
  );
}
