import { Link } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="no-print mt-16 bg-navy-950 text-navy-200">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-white">
            <FlaskConical className="h-5 w-5 text-violet-400" />
            <span className="text-lg font-extrabold">Lab<span className="text-violet-400">Track</span></span>
          </div>
          <p className="mt-2 max-w-md text-sm">Find Your Lab Exam. Know Your Venue. Be Prepared.</p>
          <p className="mt-1 text-xs text-navy-300">Data source: 2026-27 Odd Semester II, III, IV End Sem Lab/Skill Schedule workbook. Always confirm with your department notice.</p>
        </div>
        <nav className="flex flex-wrap gap-5 text-sm">
          <Link className="hover:text-white" to="/">Home</Link>
          <Link className="hover:text-white" to="/find">Find Exam</Link>
          <Link className="hover:text-white" to="/timetable">Complete Timetable</Link>
          <Link className="hover:text-white" to="/about">About</Link>
        </nav>
      </div>
    </footer>
  );
}
