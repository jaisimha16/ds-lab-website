# Data Science Digital Library — Mohan Babu University

A four-page interactive laboratory website: search experiments, watch a 10-second
hover preview, open the overview, then open any section (A, B, C …) for its
video and syntax-highlighted code.

## Open it

**Live:** https://jaisimha16.github.io/friends-website/

Or run it locally (a server is needed for the Copy-Code button — don't just
double-click `index.html`):

```powershell
python -m http.server 8000
```

(A local server is needed so the Copy-Code clipboard button works. The site
itself is plain HTML/CSS/JS — no build step, no framework.)

## Navigation flow (fixed by requirement)

```
MAIN PAGE  (logo · university · subject code · search · student ID card)
   ↓  click a card, or "+ ADD"
EXPERIMENT PREVIEW  (hover video left · experiment name right · "Overview")
   ↓  click "Overview"
EXPERIMENT DETAILS  (video left · name + sections A/B/C… right ·
                     YouTube video, YouTube link, GitHub link, summary below)
   ↓  click a section letter
INDIVIDUAL SECTION  ("Experiment N" + letter · video left · Code below)
```

## Everything editable lives in one file

**`assets/js/data.js`** — the only file you need to touch:

```js
var LAB = {
  brand: {
    university: "Mohan Babu University",
    laboratory: "Data Science Digital Library",
    subjectCode: "22DS102006",
    logo: "assets/img/mbu-logo.svg"       // ← your MBU logo file
  },
  student: {                              // ← the ID card on page 1
    photo: "assets/img/student-photo.png",//    replace this image file
    name: "...", idNumber: "...", section: "...", branch: "...",
    faculty: "...", profession: "..."
  },
  experiments: [
    {
      id: 1,
      name: "...",
      previewVideo: "assets/video/exp1-preview.mp4",  // hover preview
      youtubeVideo: null,        // YouTube video ID, e.g. "dQw4w9WgXcQ"
      youtubeLink: null,         // https://youtu.be/...
      githubLink: "https://github.com/...",
      summary: "Summary of Experiment",
      sections: [                // as many sections as THIS experiment needs
        { letter: "A", title: "...", video: "assets/video/exp1-a.mp4", code: "..." },
        { letter: "B", title: "...", video: "assets/video/exp1-b.mp4", code: "..." }
      ]
    }
  ],
  materials: [                             // ← the PDFs in the modules/ folder
    {
      id: 1,
      title: "Types of Data Analysis",
      file: "modules/DS1.pdf",             // the original file is never changed
      pages: 30,
      description: "...",
      chapters: [                          // chapter N opens on PDF page N+1
        "Introduction to Data Analysis",
        "Major Types of Data Analysis"
      ]
    }
  ]
};
```

- **New experiment** — copy a whole `{ ... }` block inside `experiments`.
- **New section** — copy a `{ letter, title, video, code }` line. Section count
  is dynamic: Experiment 1 has A–D, Experiment 5 has A–G.
- **New module file** — drop the file in `modules/` and add an entry to
  `materials`. List the chapter titles in order; the site opens each chapter in
  an embedded viewer (PDF/HTML in a frame, `.txt`/`.md` as text, anything else
  falls back to an "open the original file" link). The Modules page shows one
  card per file with its chapter list and an Open button.
- Search looks at names, summaries, section titles and `import` lines, so
  `sqlite`, `seaborn`, `numpy` all work.

## Replacing files

| What | File |
|---|---|
| MBU logo | `assets/img/mbu-logo.svg` (or point `brand.logo` to a PNG) |
| Student photo | `assets/img/student-j14.png` |
| Module study files | `modules/DS1.pdf` … `DS5.pdf` (linked from `data.js → materials`) |
| Hover previews (10 s) | `assets/video/exp1-preview.mp4` … `exp5-preview.mp4` |
| Section videos | `assets/video/exp1-a.mp4`, `exp1-b.mp4`, … (20 files) |
| Datasets shown in code | `assets/data/` (includes `car_dataset_40x20.csv`) |

### The 25 videos are generated, real executions

Every video is **1920×1080 (HD), H.264, 30 fps, at least 15 seconds**, and was
produced by actually running the code that `data.js` shows — the video plays
back the file being typed, the `python expN-x.py` command, the real stdout and
every matplotlib figure that code draws, then ends on `process finished -
exit code 0`.

| | |
|---|---|
| Section videos | 20 files, 15–44 s (Experiment 5A shows all five plots) |
| Preview videos | 5 files, 15–25 s (title card → one card per section → outro) |
| Original placeholders | `assets/video/_original_samples/` |

Regenerate after editing any `code` block in `data.js`:

```powershell
python -m pip install pandas numpy matplotlib seaborn requests openpyxl imageio-ffmpeg
python tools\make_videos.py                # all 25 videos
python tools\make_videos.py exp3-b         # just one section (+ its preview)
python tools\make_videos.py --exec-only    # run the code only, print a report
```

The generator (`tools/make_videos.py`) parses `data.js`, executes each section
in a scratch folder, records stdout and figures, and renders the frames itself
— no screen recording involved, which is why the output is always the real
output.

## Pages / files

```
index.html            shell (header, view container, footer)
assets/css/style.css  theme + responsive layout (desktop / tablet / mobile)
assets/js/data.js     ← EDIT THIS: student + experiments + module materials
assets/js/app.js      router, search, hover player, highlighter, copy button
assets/img/           logo, student photo
assets/video/         25 generated execution videos (20 sections + 5 previews)
assets/data/          datasets the experiment code reads
modules/              the 5 module PDFs shown on the Modules page (never edited)
tools/make_videos.py  regenerates every video from data.js
```
