import ExamSearch from '../components/ExamSearch.jsx';

export default function FindPage() {
  return (
    <div className="bg-gradient-to-b from-navy-900 to-slate-50 pb-4 pt-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Find Your Lab Exam</h1>
        <p className="mb-6 mt-2 text-navy-100">Find Your Lab Exam. Know Your Venue. Be Prepared.</p>
        <ExamSearch />
      </div>
    </div>
  );
}
