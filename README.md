# LabTrack – Smart Lab Examination Schedule Portal

**Find Your Lab Exam. Know Your Venue. Be Prepared.**

Frontend-only React portal built from the *2026-27 ODD SEM II, III, IV END SEM LABSKILL SCHEDULE* workbook.
Pick **Academic Year → Section → Subject** and get the examination date, time and venue instantly.

Stack: React 18 · Vite · JavaScript · Tailwind CSS · Lucide icons · SheetJS (xlsx) · jsPDF (+ autotable) · React Router.
No backend, database or login.

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in /dist
npm run preview    # serve the production build locally
```

## Project structure

```
labtrack/
  source-data/            Original Excel workbook (NOT published – contains student data)
  scripts/
    build-data.mjs        Excel → JSON  (npm run build:data)
    verify-data.mjs       Re-reads the Excel and checks every row against the JSON (npm run test:data)
    test-app.mjs          Search / PDF / render tests (npm run test:app)
  src/
    data/examinationData.json   All extracted examination events (generated)
    data/validationReport.json  Row counts, notices and flagged records (generated)
    utils/excelProcessor.js     SheetJS extraction + normalisation
    utils/searchUtils.js        Dropdown / search / statistics logic
    utils/pdfUtils.js           PDF export (jsPDF)
    components/  Navbar, Hero, Statistics, ExamSearch, ExamResult, Timetable, Footer
    pages/       Home, FindPage, TimetablePage, AboutPage
  netlify.toml            Netlify build + SPA redirect
```

## Updating the data

Replace the workbook in `source-data/`, then:

```bash
npm run build:data     # regenerates src/data/*.json
npm run test:data      # verifies JSON against the Excel
npm run test:app
```

## How the Excel data is processed

* All five worksheets are read; header rows are detected automatically because the sheets have different layouts.
* **Y25 II / Y24 III**: one row = one examination event.
* **IV B.Tech (3 sheets)** are student-wise. Rows are grouped into one event by worksheet + date + time + course + section + venue/room (+ faculty, nature, PS/ICP where present). Student count = number of distinct registration numbers.
  The three worksheet categories are kept (Regular Physics & Chemistry, Regular & Additional Courses, PS/ICP) but searched together under IV B.Tech.
* **Privacy**: student names and registration numbers are used only to group/count and are **never written to the JSON or shown on the site**.
* Dates in the workbook come in several formats (Excel dates, `27-11-2026`, `16.11.26`); all are normalised to ISO dates.
* Times are parsed into start/end where possible; the original text is kept (`time`).
* Whitespace is trimmed/collapsed in text; no other values are changed.
* Nothing is invented. Questionable values are **flagged** (amber warning on the card/table, listed on the About page):
  * `2:30 PM - 4:30 AM` (36 III B.Tech records) and `11.30 AM TO 1.30 AM` (21 IV B.Tech records): the end time is before the start time – shown exactly as supplied.
  * One III B.Tech row lists two sections (`S1,S4`) – it is shown under both S1 and S4 and flagged.
  * Hackathon notes in the Y25 and Y24 sheets are displayed as notices on the timetable page.
* Duration is shown as supplied (II B.Tech, IV B.Tech sheets 4 & 5). For III B.Tech and IV B.Tech Physics/Chemistry, which have no duration column, it is *calculated from start/end time* and labelled as such.

## Verified totals (from this workbook)

| Item | Value |
|---|---|
| Worksheets | 5 |
| Source rows below the headers | 4,393 (244 + 425 + 3,094 + 378 + 252) |
| Rows with a course code | 4,380 |
| Sheet-wise unique course code+name combos | 271 (24 + 102 + 3 + 137 + 5) |
| Globally unique courses | 265 |
| Examination events after grouping | 1,393 |

> The prompt quoted 424 data rows for Y24 III B.Tech and 4,392 overall; the workbook has 425 rows below the header in that sheet (the last is an empty row after the hackathon note), so the total is 4,393. All 4,380 course-code rows match your figure exactly.

## Deploy to Netlify

**Drag and drop**
1. `npm install && npm run build`
2. Open <https://app.netlify.com/drop> and drop the generated `dist` folder.

**Git-based**
1. Push this project to GitHub/GitLab. Add `source-data/` to `.gitignore` if the repository is public (it contains student names and registration numbers).
2. Netlify → *Add new site → Import an existing project*.
3. Build command `npm run build`, publish directory `dist` (already set in `netlify.toml`, which also handles page-refresh routing).

Only the contents of `dist` are published; the Excel file in `source-data/` is never deployed.
