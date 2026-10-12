/* =====================================================================
   app.js — navigation + every page
   HOME → search, student ID card, experiments overview
   EXPERIMENTS → all experiments grouped by the five modules
   EXPERIMENT → detailed view (aim, description, tools, procedure,
                code, expected output, result)
   MODULES → five module cards → module page with its experiments
   TOOLS → Data Science tools and libraries grouped by category
   All content comes from assets/js/data.js (window.LAB).
   ===================================================================== */
(function () {
  'use strict';

  var LAB = window.LAB || null;
  var STORE = window.DS_Store || null;
  var PREVIEW_SECONDS = 10;
  var searchQuery = '';
  var suggestIndex = -1;
  var expSearch = '';
  var expModuleFilter = 'all';
  var toolQuery = '';
  var toolCat = 'all';

  /* ---------------- helpers ---------------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function allExperiments() { return (LAB && LAB.experiments) || []; }
  function allModules() { return (LAB && LAB.modules) || []; }
  function allToolCategories() { return (LAB && LAB.tools) || []; }

  function getExperiment(id) {
    var list = allExperiments();
    for (var i = 0; i < list.length; i++) if (String(list[i].id) === String(id)) return list[i];
    return null;
  }

  function getModule(id) {
    var list = allModules();
    for (var i = 0; i < list.length; i++) if (String(list[i].id) === String(id)) return list[i];
    return null;
  }

  function moduleOfExperiment(exp) {
    var list = allModules();
    for (var i = 0; i < list.length; i++) {
      var ids = list[i].expIds || [];
      for (var j = 0; j < ids.length; j++) if (String(ids[j]) === String(exp.id)) return list[i];
    }
    return { id: '—', title: 'Unassigned', description: '', expIds: [] };
  }

  function experimentsOfModule(m) {
    if (!m) return [];
    return (m.expIds || []).map(getExperiment).filter(Boolean);
  }

  /* module study files (the PDFs in the modules/ folder) ------------------ */
  function allMaterials() { return (LAB && LAB.materials) || []; }

  function getMaterial(id) {
    var list = allMaterials();
    for (var i = 0; i < list.length; i++) if (String(list[i].id) === String(id)) return list[i];
    return null;
  }

  /* chapters are stored as an ordered list of titles; chapter N opens on
     PDF page N+1 in every module file. */
  function materialChapters(m) {
    var titles = (m && m.chapters) || [];
    return titles.map(function (title, idx) {
      return { n: idx + 1, title: title, page: idx + 2 };
    });
  }

  function getChapter(m, n) {
    n = parseInt(n, 10);
    if (!m || !n || n < 1) return null;
    return materialChapters(m)[n - 1] || null;
  }

  function metaOf(exp) { return (LAB && LAB.meta && LAB.meta[exp.id]) || {}; }

  function recentExperiments(n) {
    var list = allExperiments().slice();
    list.sort(function (a, b) {
      var ac = a.createdAt != null, bc = b.createdAt != null;
      if (ac && bc) return b.createdAt - a.createdAt;
      if (ac) return -1;
      if (bc) return 1;
      return (parseInt(b.id, 10) || 0) - (parseInt(a.id, 10) || 0);
    });
    return list.slice(0, n);
  }

  function toolTotal() {
    if (STORE) return STORE.toolCount();
    var n = 0;
    allToolCategories().forEach(function (c) { n += (c.items || []).length; });
    return n;
  }

  function toolBySlug(s) {
    var cats = allToolCategories();
    for (var i = 0; i < cats.length; i++) {
      for (var j = 0; j < cats[i].items.length; j++) {
        if (slug(cats[i].items[j].name) === s) return { tool: cats[i].items[j], category: cats[i].category };
      }
    }
    return null;
  }

  function algorithmHTML(text) {
    var steps = String(text || '').split('\n')
      .map(function (s) { return s.replace(/^\s*\d+[.)]\s*/, '').trim(); })
      .filter(Boolean);
    if (!steps.length) return '';
    return '<ol class="proc-list">' + steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>';
  }

  function statCard(label, value, href, icon) {
    return '<a class="stat-card" href="' + href + '">' +
      '<span class="stat-ico">' + icon + '</span>' +
      '<span class="stat-val">' + esc(value) + '</span>' +
      '<span class="stat-lbl">' + esc(label) + '</span>' +
    '</a>';
  }

  function getSection(exp, letter) {
    if (!exp) return null;
    var L = String(letter || '').toUpperCase();
    for (var i = 0; i < exp.sections.length; i++) {
      if (String(exp.sections[i].letter).toUpperCase() === L) return exp.sections[i];
    }
    return null;
  }

  function lettersOf(exp) { return (exp.sections || []).map(function (s) { return s.letter; }); }

  function slug(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function toolByName(name) {
    var cats = allToolCategories();
    var want = String(name || '').toLowerCase();
    for (var i = 0; i < cats.length; i++) {
      for (var j = 0; j < cats[i].items.length; j++) if (cats[i].items[j].name.toLowerCase() === want) return cats[i].items[j];
    }
    return null;
  }

  function setTxt(id, txt) {
    var el = document.getElementById(id);
    if (el && txt != null) el.textContent = txt;
  }

  /* wide (non-square) logos are fitted instead of cropped into a circle */
  function fitLogos(root) {
    $$('.brand-logo, .uni-logo, .id-head img', root || document).forEach(function (img) {
      function apply() {
        if (!img.naturalWidth) return;
        var wide = Math.abs(img.naturalWidth / img.naturalHeight - 1) > 0.15;
        img.classList.toggle('logo-wide', wide);
      }
      if (img.complete && img.naturalWidth) apply();
      else if (!img.getAttribute('data-logofit')) {
        img.setAttribute('data-logofit', '1');
        img.addEventListener('load', apply);
      }
    });
  }

  var toastTimer = null;
  function showToast(msg, type) {
    var t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.className = 'toast' + (type ? ' toast-' + type : '');
    var icon = type === 'error' ? '⚠' : type === 'success' ? '✓' : '';
    t.innerHTML = (icon ? '<span class="toast-ico">' + icon + '</span>' : '') + '<span>' + esc(msg) + '</span>';
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  /* ---------------- social icons (student ID card) ---------------- */
  var GITHUB_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.05 11.05 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z"/></svg>';
  var INSTAGRAM_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>';

  /* ---------------- video helpers ---------------- */
  var FILM_ICON = '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#2b6a43" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="M7 4.5v15M17 4.5v15M2.5 9.5H7M2.5 14.5H7M17 9.5h4.5M17 14.5h4.5"/></svg>';

  function missingVideoHTML(path) {
    return '<div class="video-placeholder">' +
      '<span class="vp-icon">' + FILM_ICON + '</span>' +
      '<b>Recording not found</b>' +
      '<p>Drop the file into <code>assets/video/</code>, then check its path in <code>assets/js/data.js</code>.</p>' +
      '<p>Expected file: <code>' + esc(path || 'not set') + '</code></p>' +
      '</div>';
  }

  function mountHoverVideo(host, src) {
    if (!host) return;
    if (!src) { host.innerHTML = missingVideoHTML(''); return; }

    host.innerHTML =
      '<video class="hover-video" playsinline muted preload="metadata" src="' + esc(src) + '"></video>' +
      '<span class="vid-hint"><span class="vid-dot"></span>Hover to preview · ' + PREVIEW_SECONDS + ' s</span>';

    var v = $('video', host);
    var hint = $('.vid-hint', host);
    if (!v) return;

    v.addEventListener('error', function () { host.innerHTML = missingVideoHTML(src); });

    var canHover = !(window.matchMedia && window.matchMedia('(hover: none)').matches);

    if (!canHover) {
      v.setAttribute('controls', '');
      if (hint) hint.textContent = 'Tap to play';
      return;
    }

    function play() {
      if (v.currentTime >= PREVIEW_SECONDS - 0.25) v.currentTime = 0;
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
      host.classList.add('playing');
    }
    function reset() {
      v.pause(); v.currentTime = 0; host.classList.remove('playing');
    }

    host.addEventListener('mouseenter', play);
    host.addEventListener('mouseleave', reset);
    v.addEventListener('timeupdate', function () {
      if (v.currentTime >= PREVIEW_SECONDS) { v.pause(); v.currentTime = PREVIEW_SECONDS; }
    });
    v.addEventListener('ended', function () { v.currentTime = 0; });
  }

  function mountVideo(host, src) {
    if (!host) return;
    if (!src) { host.innerHTML = missingVideoHTML(''); return; }
    host.innerHTML = '<video class="hover-video" controls playsinline preload="metadata" src="' + esc(src) + '"></video>';
    var v = $('video', host);
    if (v) v.addEventListener('error', function () { host.innerHTML = missingVideoHTML(src); });
  }

  /* ---------------- python syntax highlighting ---------------- */
  var KEYWORDS = {};
  ('False None True and as assert async await break class continue def del elif else except finally ' +
    'for from global if import in is lambda nonlocal not or pass raise return try while with yield match case').split(' ')
    .forEach(function (k) { KEYWORDS[k] = true; });

  var BUILTINS = {};
  ('print len range int float str bool list dict set tuple type input open sum min max abs round sorted ' +
    'enumerate zip map filter isinstance super repr bytes bytearray vars id hex oct bin ord chr ' +
    'any all iter next slice format property staticmethod classmethod Exception ValueError ' +
    'TypeError KeyError RuntimeError').split(' ')
    .forEach(function (k) { BUILTINS[k] = true; });

  var TOKEN_RE =
    /(#[^\n]*)|("""[\s\S]*?"""|'''[\s\S]*?'''|[rbfuRBFU]{0,2}"(?:\\.|[^"\\])*"|[rbfuRBFU]{0,2}'(?:\\.|[^'\\])*')|(@[A-Za-z_][\w.]*)|\b(\d+\.?\d*(?:[eE][+-]?\d+)?)\b|([A-Za-z_]\w*)|([+\-*/%=<>!&|^~]+)/g;

  function highlightPython(code) {
    var out = '', last = 0, m;
    TOKEN_RE.lastIndex = 0;
    while ((m = TOKEN_RE.exec(code)) !== null) {
      out += esc(code.slice(last, m.index));
      if (m[1] !== undefined) out += '<span class="tk-com">' + esc(m[1]) + '</span>';
      else if (m[2] !== undefined) out += '<span class="tk-str">' + esc(m[2]) + '</span>';
      else if (m[3] !== undefined) out += '<span class="tk-dec">' + esc(m[3]) + '</span>';
      else if (m[4] !== undefined) out += '<span class="tk-num">' + esc(m[4]) + '</span>';
      else if (m[5] !== undefined) {
        var w = m[5];
        if (KEYWORDS[w]) out += '<span class="tk-kw">' + esc(w) + '</span>';
        else if (/^\s*\(/.test(code.slice(TOKEN_RE.lastIndex))) out += '<span class="tk-fn">' + esc(w) + '</span>';
        else if (BUILTINS[w]) out += '<span class="tk-bi">' + esc(w) + '</span>';
        else out += esc(w);
      } else if (m[6] !== undefined) out += '<span class="tk-op">' + esc(m[6]) + '</span>';
      last = TOKEN_RE.lastIndex;
    }
    out += esc(code.slice(last));
    return out;
  }

  function copyText(text, btn) {
    function done() {
      if (!btn) { showToast('Code copied'); return; }
      var old = btn.textContent;
      btn.classList.add('done');
      btn.textContent = 'Copied!';
      setTimeout(function () { btn.classList.remove('done'); btn.textContent = old; }, 1800);
      showToast('Code copied to clipboard');
    }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); }
      catch (e) { showToast('Copy failed — select the code manually'); }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else fallback();
  }

  function codeBlockHTML(code) {
    if (!code || !code.trim()) {
      return '<div class="code-empty">No code added for this section yet — set <b>code</b> in assets/js/data.js</div>';
    }
    var lines = code.split('\n').length;
    var gutter = [];
    for (var i = 1; i <= lines; i++) gutter.push(i);
    return '<div class="code-scroll" tabindex="0" role="region" aria-label="Section source code">' +
        '<pre class="code-gutter" aria-hidden="true">' + gutter.join('\n') + '</pre>' +
        '<pre class="code-body"><code>' + highlightPython(code) + '</code></pre>' +
      '</div>';
  }

  /* ---------------- search ---------------- */
  function normaliseQuery(q) {
    q = String(q || '').trim().toLowerCase();
    if (/^exps?\b/.test(q)) q = 'experiment ' + q.replace(/^exps?\s*/, '');
    if (/^mods?\b/.test(q)) q = 'module ' + q.replace(/^mods?\s*/, '');
    return q;
  }

  function toolText(t, cat) {
    return [t.name, cat.category, t.explanation, t.mainUse, t.example, 'library tool'].join(' ').toLowerCase();
  }

  function experimentText(e) {
    var hay = ['experiment ' + e.id, e.name, e.summary];
    var m = moduleOfExperiment(e);
    hay.push('module ' + m.id, m.title);
    var meta = metaOf(e);
    if (meta.aim) hay.push(meta.aim);
    if (meta.description) hay.push(meta.description);
    if (meta.requirements) hay.push(meta.requirements);
    if (meta.theory) hay.push(meta.theory);
    if (meta.algorithm) hay.push(meta.algorithm);
    if (meta.tools) hay.push(meta.tools.join(' '));
    (e.sections || []).forEach(function (s) {
      hay.push(s.letter, s.title);
      String(s.code || '').split('\n').forEach(function (line) {
        if (/^\s*(import|from)\s/.test(line)) hay.push(line);
      });
    });
    return hay.join(' ').toLowerCase();
  }

  function moduleText(m) {
    var hay = ['module ' + m.id, m.title, m.description];
    experimentsOfModule(m).forEach(function (e) { hay.push(e.name); });
    return hay.join(' ').toLowerCase();
  }

  function searchAll(q) {
    q = normaliseQuery(q);
    if (!q) return null;
    var res = { experiments: [], modules: [], tools: [] };
    allExperiments().forEach(function (e) { if (experimentText(e).indexOf(q) !== -1) res.experiments.push(e); });
    allModules().forEach(function (m) { if (moduleText(m).indexOf(q) !== -1) res.modules.push(m); });
    allToolCategories().forEach(function (cat) {
      cat.items.forEach(function (t) {
        if (toolText(t, cat).indexOf(q) !== -1) res.tools.push({ tool: t, category: cat.category });
      });
    });
    return res;
  }

  function hasResults(res) {
    return !!res && (res.experiments.length || res.modules.length || res.tools.length);
  }

  function filterExperiments(q) {
    var nq = normaliseQuery(q);
    if (!nq) return allExperiments();
    return allExperiments().filter(function (e) { return experimentText(e).indexOf(nq) !== -1; });
  }

  function highlightMatch(name, q) {
    if (!q) return esc(name);
    var i = String(name).toLowerCase().indexOf(q);
    if (i < 0) return esc(name);
    return esc(name.slice(0, i)) + '<mark>' + esc(name.slice(i, i + q.length)) + '</mark>' + esc(name.slice(i + q.length));
  }

  /* ---------------- shared fragments ---------------- */
  function crumb(items) {
    return '<nav class="crumbs" aria-label="Breadcrumb">' + items.map(function (it, i) {
      var sep = i ? '<span class="crumb-sep">/</span>' : '';
      if (it.href) return sep + '<a class="back-link" href="' + it.href + '">← ' + esc(it.label) + '</a>';
      return sep + '<span class="crumb-now">' + esc(it.label) + '</span>';
    }).join('') + '</nav>';
  }

  function sectionDots(e) {
    return lettersOf(e).map(function (L) { return '<span class="sec-dot">' + esc(L) + '</span>'; }).join('');
  }

  function expCardHTML(e) {
    var m = moduleOfExperiment(e);
    return '<article class="exp-card" data-exp="' + esc(e.id) + '" tabindex="0" role="button" ' +
        'aria-label="Experiment ' + esc(e.id) + ': ' + esc(e.name) + '">' +
        '<div class="exp-card-top">' +
          '<span class="exp-num">Experiment ' + esc(e.id) + '</span>' +
          '<span class="exp-mod">Module ' + esc(m.id) + '</span>' +
        '</div>' +
        '<h3>' + esc(e.name) + '</h3>' +
        '<p class="exp-sum">' + esc(e.summary) + '</p>' +
        '<div class="exp-meta">' +
          '<span class="sec-dots">' + sectionDots(e) + '</span>' +
        '</div>' +
        '<div class="exp-card-actions">' +
          '<button class="card-btn view" type="button" data-act="view" data-exp="' + esc(e.id) + '"><span class="ci">👁</span> View</button>' +
          '<button class="card-btn edit" type="button" data-act="edit" data-exp="' + esc(e.id) + '"><span class="ci">✏️</span> Edit</button>' +
          '<button class="card-btn del" type="button" data-act="delete" data-exp="' + esc(e.id) + '"><span class="ci">🗑</span> Delete</button>' +
        '</div>' +
      '</article>';
  }

  function expGridHTML(list, q) {
    if (!list.length) {
      return '<div class="empty-state">No experiment matches <b>“' + esc(q) + '”</b>. ' +
        'Try another keyword — for example <b>pandas</b>, <b>sqlite</b> or <b>visualisation</b>.</div>';
    }
    return list.map(expCardHTML).join('');
  }

  function moduleCardHTML(m) {
    var exps = experimentsOfModule(m);
    var n = exps.length;
    var names = exps.length
      ? '<ul class="module-exp-list">' + exps.map(function (e) {
          return '<li><span class="meli-num">' + esc(e.id) + '</span>' + esc(e.name) + '</li>';
        }).join('') + '</ul>'
      : '<p class="module-empty">No experiments assigned yet.</p>';
    return '<a class="module-card" href="#/module/' + esc(m.id) + '">' +
        '<span class="module-num">Module ' + esc(m.id) + '</span>' +
        '<h3>' + esc(m.title) + '</h3>' +
        '<p>' + esc(m.description) + '</p>' +
        names +
        '<span class="module-foot">' +
          '<span class="module-count">' + n + ' experiment' + (n === 1 ? '' : 's') + '</span>' +
          '<span class="btn-view">View Module →</span>' +
        '</span>' +
      '</a>';
  }

  /* card for a study-file module (modules/DSx.pdf) */
  function materialCardHTML(m) {
    var chapters = materialChapters(m);
    var n = chapters.length;
    var list = chapters.map(function (c) {
      return '<li><a class="mat-chapter-link" href="#/material/' + esc(m.id) + '/' + c.n + '">' +
          '<span class="mat-ch-num">' + c.n + '</span>' +
          '<span class="mat-ch-title">' + esc(c.title) + '</span>' +
        '</a></li>';
    }).join('');
    return '<article class="module-card material-card">' +
        '<span class="module-num">Module ' + esc(m.id) + '</span>' +
        '<h3>' + esc(m.title) + '</h3>' +
        '<p>' + esc(m.description) + '</p>' +
        '<ul class="mat-chapter-preview" aria-label="Chapters of Module ' + esc(m.id) + '">' + list + '</ul>' +
        '<div class="module-foot">' +
          '<span class="module-count">' + n + ' chapter' + (n === 1 ? '' : 's') + ' · PDF</span>' +
          '<a class="btn-view" href="#/material/' + esc(m.id) + '">Open Module →</a>' +
        '</div>' +
      '</article>';
  }

  function toolCardHTML(t, category) {
    var color = t.color || '#2b6a43';
    return '<article class="tool-card" id="tool-' + esc(slug(t.name)) + '" data-cat="' + esc(category) + '">' +
        '<div class="tool-head">' +
          '<span class="tool-icon" style="background:' + esc(color) + '">' + esc(t.icon || '📦') + '</span>' +
          '<div class="tool-title"><h3>' + esc(t.name) + '</h3><span class="tool-tag">' + esc(category) + '</span></div>' +
        '</div>' +
        '<p class="tool-exp">' + esc(t.explanation) + '</p>' +
        '<dl class="tool-meta">' +
          '<div><dt>Main use</dt><dd>' + esc(t.mainUse || '—') + '</dd></div>' +
          '<div><dt>Example in Data Science</dt><dd>' + esc(t.example || '—') + '</dd></div>' +
        '</dl>' +
        '<div class="tool-actions">' +
          '<button class="card-btn view" type="button" data-tool="' + esc(slug(t.name)) + '">View Details</button>' +
          (t.url ? '<a class="tool-link" href="' + esc(t.url) + '" target="_blank" rel="noopener noreferrer">' +
            'Documentation ↗</a>' : '') +
        '</div>' +
      '</article>';
  }

  /* ============================================================
     student ID card — editable in the browser (saved to localStorage)
     assets/js/data.js keeps the default values; "Reset" restores them.
     ============================================================ */
  var LS_KEY = 'mbu-ds-lab-idcard-v1';
  var ID_FIELDS = [
    ['name', 'Name:'], ['idNumber', 'ID Number:'], ['section', 'Section:'],
    ['branch', 'Branch:'], ['faculty', 'Faculty:'], ['profession', 'Profession:']
  ];
  var idEditing = false;
  var pendingPhoto = null;

  function loadOverrides() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveOverrides(ov) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(ov)); return true; }
    catch (e) { showToast('Could not save — storage is full (photo too large)'); return false; }
  }
  function clearOverrides() { try { localStorage.removeItem(LS_KEY); } catch (e) {} }

  function studentData() {
    var base = (LAB && LAB.student) || {};
    var ov = loadOverrides();
    var out = {};
    Object.keys(base).forEach(function (k) { out[k] = base[k]; });
    Object.keys(ov).forEach(function (k) { out[k] = ov[k]; });
    return out;
  }

  function idRow(label, value) {
    return '<div class="id-row"><dt>' + esc(label) + '</dt><dd>' + esc(value || '—') + '</dd></div>';
  }

  function idCardHTML() {
    var b = (LAB && LAB.brand) || {};
    var s = studentData();
    var photo = pendingPhoto || s.photo || 'assets/img/student-photo.png';

    var head =
      '<div class="id-head">' +
        '<span class="id-head-txt"><b>' + esc(b.laboratory || 'Data Science Digital Library') + '</b><span>Student ID Card</span></span>' +
        (idEditing ? '' : '<button class="id-edit-btn" id="id-edit" type="button">Edit</button>') +
      '</div>';

    var photoHTML = idEditing
      ? '<button type="button" class="id-photo id-photo-btn" id="photo-btn" title="Change photo">' +
          '<img src="' + esc(photo) + '" alt="Student photo">' +
          '<span class="photo-overlay">Change photo</span>' +
        '</button>'
      : '<div class="id-photo">' +
          '<img src="' + esc(photo) + '" alt="Photo of ' + esc(s.name || 'student') + '" ' +
          'onerror="this.onerror=null;this.src=\'assets/img/student-photo.png\'">' +
        '</div>';

    var fields = idEditing
      ? ID_FIELDS.map(function (f) {
          return '<div class="id-row"><dt><label for="f-' + f[0] + '">' + f[1] + '</label></dt>' +
            '<dd><input class="id-input" id="f-' + f[0] + '" type="text" value="' +
            esc(s[f[0]] || '') + '" autocomplete="off"></dd></div>';
        }).join('')
      : ID_FIELDS.map(function (f) { return idRow(f[1], s[f[0]]); }).join('');

    var actions = idEditing
      ? '<div class="id-actions">' +
          '<button class="btn-save" id="id-save" type="button">Save</button>' +
          '<button class="btn-cancel" id="id-cancel" type="button">Cancel</button>' +
          '<button class="btn-reset" id="id-reset" type="button" title="Restore the values from assets/js/data.js">Reset</button>' +
        '</div>'
      : '';

    var socials = [];
    if (s.github) socials.push('<a class="id-social-btn gh" href="' + esc(s.github) + '" target="_blank" rel="noopener noreferrer" aria-label="GitHub profile" title="GitHub">' + GITHUB_ICON + '</a>');
    if (s.instagram) socials.push('<a class="id-social-btn ig" href="' + esc(s.instagram) + '" target="_blank" rel="noopener noreferrer" aria-label="Instagram profile" title="Instagram">' + INSTAGRAM_ICON + '</a>');
    var socialHTML = socials.length ? '<div class="id-social">' + socials.join('') + '</div>' : '';

    return '<aside class="card id-card' + (idEditing ? ' editing' : '') + '" id="id-card" aria-label="Student ID card">' +
      head +
      '<div class="id-body">' +
        photoHTML +
        '<dl class="id-fields">' + fields + '</dl>' +
        actions +
        '<input type="file" id="photo-file" accept="image/png,image/jpeg,image/webp,image/gif" hidden>' +
      '</div>' +
      '<div class="id-foot"><div class="id-rule"></div>' +
        '<div class="barcode" aria-hidden="true"></div>' +
        '<div class="barcode-txt"><span>' + esc(b.laboratory || '') + '</span><span>' + esc(b.subjectCode || '') + '</span></div>' +
        socialHTML +
      '</div>' +
    '</aside>';
  }

  function rerenderIdCard() {
    var old = document.getElementById('id-card');
    if (!old) return;
    var tmp = document.createElement('div');
    tmp.innerHTML = idCardHTML();
    var fresh = tmp.firstChild;
    old.parentNode.replaceChild(fresh, old);
    wireIdCard();
    fitLogos(fresh);
  }

  function wireIdCard() {
    var card = document.getElementById('id-card');
    if (!card) return;
    var file = card.querySelector('#photo-file');

    function enterEdit() { idEditing = true; pendingPhoto = null; rerenderIdCard(); }
    function leaveEdit(msg) {
      idEditing = false; pendingPhoto = null; rerenderIdCard();
      if (msg) showToast(msg);
    }
    function saveEdit() {
      var ov = loadOverrides();
      var missing = false;
      ID_FIELDS.forEach(function (f) {
        var inp = card.querySelector('#f-' + f[0]);
        if (!inp) { missing = true; return; }
        ov[f[0]] = inp.value.trim();
      });
      if (missing) { showToast('Something went wrong — try again'); return; }
      if (pendingPhoto) ov.photo = pendingPhoto;
      if (!saveOverrides(ov)) return;
      leaveEdit('ID card updated');
      fillChrome();
    }

    var edit = card.querySelector('#id-edit');
    if (edit) edit.addEventListener('click', enterEdit);

    var cancel = card.querySelector('#id-cancel');
    if (cancel) cancel.addEventListener('click', function () { leaveEdit(); });

    var save = card.querySelector('#id-save');
    if (save) save.addEventListener('click', saveEdit);

    var reset = card.querySelector('#id-reset');
    if (reset) reset.addEventListener('click', function () {
      clearOverrides();
      leaveEdit('ID card reset to data.js values');
      fillChrome();
    });

    var photoBtn = card.querySelector('#photo-btn');
    if (photoBtn && file) photoBtn.addEventListener('click', function () { file.click(); });

    if (file) file.addEventListener('change', function () {
      var f = file.files && file.files[0];
      file.value = '';
      if (!f) return;
      if (f.size > 3 * 1024 * 1024) { showToast('Photo must be under 3 MB'); return; }
      var fr = new FileReader();
      fr.onload = function () {
        pendingPhoto = fr.result;
        var img = card.querySelector('#photo-btn img');
        if (img) img.src = pendingPhoto;
      };
      fr.readAsDataURL(f);
    });

    $$('.id-input', card).forEach(function (inp) {
      inp.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter') { ev.preventDefault(); saveEdit(); }
        else if (ev.key === 'Escape') { ev.preventDefault(); leaveEdit(); }
      });
    });
  }

  /* ============================================================
     HOME
     ============================================================ */
  function homeView() {
    var b = (LAB && LAB.brand) || {};
    var searching = !!searchQuery.trim();
    var recent = recentExperiments(3);

    var listBlock =
      '<div class="section-head">' +
        '<div>' +
          '<h2 id="home-list-title">' + (searching ? 'Search Results' : 'Recently Added') + '</h2>' +
          '<p class="section-sub" id="home-list-sub">' +
            (searching ? 'Experiments matching your search' : 'The newest experiments in the library') + '</p>' +
        '</div>' +
        '<a class="btn-add" href="#/experiments"><span class="plus">≡</span> ALL EXPERIMENTS</a>' +
      '</div>' +
      '<div class="exp-grid" id="home-grid">' +
        (searching
          ? expGridHTML(filterExperiments(searchQuery), searchQuery)
          : (recent.length ? recent.map(expCardHTML).join('')
            : '<div class="empty-state">No experiments yet. Use “Add Experiment” to create one.</div>')) +
      '</div>';

    return '<section class="page">' +
      '<div class="hero">' +
        '<div class="card uni-card">' +
          '<div class="uni-row">' +
            '<div>' +
              '<span class="uni-eyebrow">Data Science Laboratory</span>' +
              '<h1 class="uni-title">' + esc(b.laboratory || 'Data Science Digital Library') + '</h1>' +
            '</div>' +
          '</div>' +
          '<p class="subject-code">Subject Code: <b>' + esc(b.subjectCode || '—') + '</b></p>' +

          '<div class="search-wrap">' +
            '<div class="search-box">' +
              '<svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
                '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/></svg>' +
              '<input id="search" class="search-input" type="text" placeholder="Search experiments, modules, tools and libraries..." autocomplete="off" ' +
                'role="combobox" aria-expanded="false" aria-controls="suggest" aria-autocomplete="list" aria-label="Search the library" ' +
                'value="' + esc(searchQuery) + '">' +
              '<button id="search-clear" class="search-clear' + (searchQuery ? ' show' : '') + '" type="button" aria-label="Clear search">×</button>' +
            '</div>' +
            '<ul class="suggest" id="suggest" role="listbox" aria-label="Search suggestions" hidden></ul>' +
          '</div>' +
          '<p class="search-hint">Search across <b>experiments</b>, <b>modules</b>, <b>tools</b> and <b>libraries</b> — try <kbd>pandas</kbd>, <kbd>module 3</kbd> or <kbd>experiment 5</kbd>.</p>' +
        '</div>' +

        idCardHTML() +
      '</div>' +

      '<div class="stat-row">' +
        statCard('Experiments', allExperiments().length, '#/experiments', '🧪') +
        statCard('Modules', allModules().length, '#/modules', '📚') +
        statCard('Tools &amp; Libraries', toolTotal(), '#/tools', '🧰') +
      '</div>' +

      '<div class="quick-links">' +
        '<a class="quick-link" href="#/experiments">🔬 <span>Browse Experiments</span></a>' +
        '<a class="quick-link" href="#/modules">📚 <span>View Modules</span></a>' +
        '<a class="quick-link" href="#/tools">🧰 <span>Explore Tools</span></a>' +
        '<button class="quick-link" type="button" id="quick-add">➕ <span>Add Experiment</span></button>' +
      '</div>' +

      listBlock +
    '</section>';
  }

  function refreshHomeResults() {
    var grid = $('#home-grid');
    var title = $('#home-list-title');
    var sub = $('#home-list-sub');
    var searching = !!searchQuery.trim();
    if (grid) {
      if (searching) grid.innerHTML = expGridHTML(filterExperiments(searchQuery), searchQuery);
      else {
        var recent = recentExperiments(3);
        grid.innerHTML = recent.length ? recent.map(expCardHTML).join('')
          : '<div class="empty-state">No experiments yet. Use “Add Experiment” to create one.</div>';
      }
    }
    if (title) title.textContent = searching ? 'Search Results' : 'Recently Added';
    if (sub) sub.textContent = searching ? 'Experiments matching your search' : 'The newest experiments in the library';
  }

  function renderSuggest() {
    var input = $('#search');
    var suggest = $('#suggest');
    if (!input || !suggest) return;
    var q = searchQuery.trim();
    if (!q) {
      suggest.hidden = true; suggest.innerHTML = ''; suggestIndex = -1;
      input.setAttribute('aria-expanded', 'false');
      return;
    }
    var res = searchAll(q);
    var nq = normaliseQuery(q);
    var rows = [];
    if (res) {
      res.experiments.slice(0, 5).forEach(function (e) {
        rows.push('<li class="suggest-item" role="option" data-nav="experiment" data-id="' + esc(e.id) + '">' +
          '<span class="s-num">EXP ' + esc(e.id) + '</span>' +
          '<span class="s-name">' + highlightMatch(e.name, nq) + '</span>' +
          '<span class="s-kind">Experiment</span></li>');
      });
      res.modules.slice(0, 3).forEach(function (m) {
        rows.push('<li class="suggest-item" role="option" data-nav="module" data-id="' + esc(m.id) + '">' +
          '<span class="s-num">MOD ' + esc(m.id) + '</span>' +
          '<span class="s-name">' + highlightMatch(m.title, nq) + '</span>' +
          '<span class="s-kind">Module</span></li>');
      });
      res.tools.slice(0, 6).forEach(function (r) {
        rows.push('<li class="suggest-item" role="option" data-nav="tool" data-id="' + esc(slug(r.tool.name)) + '">' +
          '<span class="s-num">TOOL</span>' +
          '<span class="s-name">' + highlightMatch(r.tool.name, nq) + '</span>' +
          '<span class="s-kind">' + esc(r.category) + '</span></li>');
      });
    }
    suggest.innerHTML = rows.length ? rows.join('') : '<li class="suggest-empty">No match for “' + esc(q) + '”</li>';
    suggest.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  function wireHome() {
    var input = $('#search');
    var suggest = $('#suggest');
    var clear = $('#search-clear');
    if (!input) return;

    function refresh() {
      if (clear) clear.classList.toggle('show', searchQuery.length > 0);
      suggestIndex = -1;
      renderSuggest();
      refreshHomeResults();
    }

    input.addEventListener('input', function () { searchQuery = input.value; refresh(); });

    input.addEventListener('keydown', function (ev) {
      var items = $$('.suggest-item', suggest);
      if (ev.key === 'ArrowDown' && items.length) {
        ev.preventDefault();
        suggestIndex = (suggestIndex + 1) % items.length;
        renderSuggest();
      } else if (ev.key === 'ArrowUp' && items.length) {
        ev.preventDefault();
        suggestIndex = suggestIndex <= 0 ? items.length - 1 : suggestIndex - 1;
        renderSuggest();
      } else if (ev.key === 'Enter') {
        var pick = suggestIndex >= 0 ? items[suggestIndex] : items[0];
        if (pick) { ev.preventDefault(); goSuggestion(pick); }
      } else if (ev.key === 'Escape') {
        suggest.hidden = true; suggestIndex = -1;
        input.setAttribute('aria-expanded', 'false');
      }
    });

    if (clear) clear.addEventListener('click', function () {
      searchQuery = ''; input.value = ''; refresh(); input.focus();
    });

    if (suggest) suggest.addEventListener('click', function (ev) {
      var li = ev.target.closest('.suggest-item');
      if (li) goSuggestion(li);
    });

    wireIdCard();
  }

  function goSuggestion(li) {
    var nav = li.getAttribute('data-nav');
    var id = li.getAttribute('data-id');
    if (nav === 'experiment') location.hash = '#/experiment/' + id;
    else if (nav === 'module') location.hash = '#/module/' + id;
    else if (nav === 'tool') location.hash = '#/tools/' + id;
  }

  /* ============================================================
     EXPERIMENTS — all experiments grouped by module
     ============================================================ */
  function groupedExperimentsHTML(list) {
    if (!list.length) return '<div class="empty-state">No experiments yet.</div>';
    var used = {}, html = '';
    allModules().forEach(function (m) {
      var exps = experimentsOfModule(m).filter(function (e) { return list.indexOf(e) !== -1; });
      if (!exps.length) return;
      exps.forEach(function (e) { used[e.id] = true; });
      html += '<div class="module-block">' +
        '<div class="module-block-head"><span class="module-num">Module ' + esc(m.id) + '</span>' +
          '<h2>' + esc(m.title) + '</h2></div>' +
        '<p class="module-block-desc">' + esc(m.description) + '</p>' +
        '<div class="exp-grid">' + exps.map(expCardHTML).join('') + '</div>' +
      '</div>';
    });
    var leftovers = list.filter(function (e) { return !used[e.id]; });
    if (leftovers.length) {
      html += '<div class="module-block"><div class="module-block-head"><h2>Other Experiments</h2></div>' +
        '<div class="exp-grid">' + leftovers.map(expCardHTML).join('') + '</div></div>';
    }
    return html;
  }

  function filteredExperiments() {
    var list = filterExperiments(expSearch);
    if (String(expModuleFilter) !== 'all') {
      list = list.filter(function (e) { return String(moduleOfExperiment(e).id) === String(expModuleFilter); });
    }
    return list;
  }

  function renderExperimentsGrid() {
    var grid = $('#exp-grid');
    if (!grid) return;
    var list = filteredExperiments();
    grid.innerHTML = list.length ? list.map(expCardHTML).join('')
      : '<div class="empty-state">No experiment matches. Try another keyword or filter, or add a new experiment.</div>';
    var cnt = $('#exp-count');
    if (cnt) cnt.textContent = list.length + ' experiment' + (list.length === 1 ? '' : 's');
  }

  function experimentsView() {
    var chips = ['<button class="filter-chip' + (String(expModuleFilter) === 'all' ? ' on' : '') +
      '" data-mod="all" type="button">All modules</button>'];
    allModules().forEach(function (m) {
      chips.push('<button class="filter-chip' + (String(expModuleFilter) === String(m.id) ? ' on' : '') +
        '" data-mod="' + esc(m.id) + '" type="button">Module ' + esc(m.id) + '</button>');
    });

    return '<section class="page">' +
      crumb([{ label: 'Home', href: '#/' }, { label: 'Experiments' }]) +
      '<div class="page-head page-head-row">' +
        '<div>' +
          '<h1>Experiments</h1>' +
          '<p>All experiments in the library. Add, edit or delete them — your changes are saved in this browser.</p>' +
        '</div>' +
        '<button class="btn-add" id="add-experiment" type="button"><span class="plus">＋</span> Add Experiment</button>' +
      '</div>' +
      '<div class="exp-toolbar">' +
        '<div class="search-box compact">' +
          '<svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
            '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/></svg>' +
          '<input id="exp-search" class="search-input" type="text" placeholder="Search experiments by name, number or topic..." ' +
            'value="' + esc(expSearch) + '" autocomplete="off" aria-label="Search experiments">' +
          '<button id="exp-search-clear" class="search-clear' + (expSearch ? ' show' : '') + '" type="button" aria-label="Clear search">×</button>' +
        '</div>' +
        '<div class="filter-chips">' + chips.join('') + '</div>' +
      '</div>' +
      '<p class="exp-count" id="exp-count"></p>' +
      '<div class="exp-grid" id="exp-grid"></div>' +
      '<div class="exp-foot"><button class="btn-reset big" id="reset-data" type="button">↺ Reset all experiments to defaults</button></div>' +
    '</section>';
  }

  function wireExperiments() {
    renderExperimentsGrid();

    var input = $('#exp-search');
    var clear = $('#exp-search-clear');
    if (input) input.addEventListener('input', function () {
      expSearch = input.value;
      if (clear) clear.classList.toggle('show', expSearch.length > 0);
      renderExperimentsGrid();
    });
    if (clear) clear.addEventListener('click', function () {
      expSearch = ''; input.value = ''; clear.classList.remove('show');
      renderExperimentsGrid(); input.focus();
    });

    $$('.exp-toolbar .filter-chip[data-mod]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        expModuleFilter = chip.getAttribute('data-mod');
        $$('.exp-toolbar .filter-chip[data-mod]').forEach(function (c) { c.classList.toggle('on', c === chip); });
        renderExperimentsGrid();
      });
    });
  }

  /* ============================================================
     EXPERIMENT — detailed view
     ============================================================ */
  function detailView(exp) {
    var m = moduleOfExperiment(exp);
    var meta = metaOf(exp);
    var tools = meta.tools || [];

    var toolChips = tools.length
      ? tools.map(function (name) {
          var t = toolByName(name);
          var href = t ? '#/tools/' + slug(t.name) : '#/tools';
          return '<a class="tool-chip" href="' + esc(href) + '">' +
            (t && t.icon ? '<span class="tc-icon">' + esc(t.icon) + '</span>' : '') + esc(name) + '</a>';
        }).join('')
      : '<span class="muted">Not specified</span>';

    var procedure = (meta.procedure || []).length
      ? '<ol class="proc-list">' + meta.procedure.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ol>'
      : '<p class="muted">No procedure recorded.</p>';

    var expected = (meta.expectedOutput || []).length
      ? '<ul class="bullet-list">' + meta.expectedOutput.map(function (o) { return '<li>' + esc(o) + '</li>'; }).join('') + '</ul>'
      : '<p class="muted">No expected output recorded.</p>';

    var extraPanels = '';
    if (meta.theory || meta.algorithm || meta.requirements) {
      extraPanels = '<div class="det-grid det-grid-2">' +
        (meta.theory ? '<div class="card det-panel"><h3><span class="h-icon">📘</span>Theory</h3><p class="pre-wrap">' + esc(meta.theory) + '</p></div>' : '') +
        (meta.algorithm ? '<div class="card det-panel"><h3><span class="h-icon">🧮</span>Algorithm</h3>' + algorithmHTML(meta.algorithm) + '</div>' : '') +
        (meta.requirements ? '<div class="card det-panel"><h3><span class="h-icon">🧰</span>Requirements</h3><p class="pre-wrap">' + esc(meta.requirements) + '</p></div>' : '') +
      '</div>';
    }

    var codeBlocks = exp.sections.map(function (sec) {
      return '<div class="code-card det-code">' +
        '<div class="code-head">' +
          '<span class="code-title">Section ' + esc(sec.letter) + '</span>' +
          '<span class="sec-code-title">' + esc(sec.title || '') + '</span>' +
          '<span class="spacer"></span>' +
          '<button class="run-btn" type="button" data-run-sec="' + esc(sec.letter) + '"><span class="run-ico">▶</span> Run</button>' +
          '<a class="watch-btn" href="#/experiment/' + esc(exp.id) + '/section/' + esc(sec.letter) + '">▶ Watch</a>' +
          '<button class="copy-btn" type="button" data-copy-sec="' + esc(sec.letter) + '">Copy Code</button>' +
        '</div>' +
        codeBlockHTML(sec.code) +
        '<div class="run-output" id="run-' + esc(exp.id) + '-' + esc(sec.letter) + '" hidden></div>' +
      '</div>';
    }).join('');

    return '<section class="page">' +
      crumb([{ label: 'Experiments', href: '#/experiments' }, { label: 'Experiment ' + exp.id }]) +

      '<div class="det-hero">' +
        '<div class="card video-card det-video-card">' +
          '<div class="video-slot" id="detail-video" tabindex="0" aria-label="Experiment preview video"></div>' +
        '</div>' +
        '<div class="det-head">' +
          '<span class="tag">Experiment ' + esc(exp.id) + '</span>' +
          '<h1>' + esc(exp.name) + '</h1>' +
          '<div class="det-tags">' +
            '<span class="det-tag">Module ' + esc(m.id) + ' · ' + esc(m.title) + '</span>' +
            '<span class="det-tag">' + exp.sections.length + ' sections</span>' +
          '</div>' +
          '<div class="det-tools">' + toolChips + '</div>' +
        '</div>' +
      '</div>' +

      '<div class="det-grid">' +
        '<div class="card det-panel"><h3><span class="h-icon">🎯</span>Aim</h3><p>' + esc(meta.aim || exp.summary) + '</p></div>' +
        '<div class="card det-panel"><h3><span class="h-icon">📝</span>Description</h3><p>' + esc(meta.description || exp.summary) + '</p></div>' +
        '<div class="card det-panel"><h3><span class="h-icon">🧰</span>Required Tools / Libraries</h3><div class="det-tools">' + toolChips + '</div></div>' +
        '<div class="card det-panel"><h3><span class="h-icon">📋</span>Procedure</h3>' + procedure + '</div>' +
      '</div>' +

      extraPanels +

      '<div class="section-head"><h2>Code</h2><p class="section-sub">Every section of Experiment ' + esc(exp.id) + '</p></div>' +
      codeBlocks +

      '<div class="det-grid det-grid-2">' +
        '<div class="card det-panel"><h3><span class="h-icon">▶</span>Expected Output</h3>' + expected + '</div>' +
        '<div class="card det-panel"><h3><span class="h-icon">✅</span>Result</h3><p>' + esc(meta.result || '') + '</p></div>' +
      '</div>' +

      '<div class="det-actions">' +
        '<a class="back-link big" href="#/experiments">← Back to Experiments</a>' +
        '<a class="back-link big" href="#/module/' + esc(m.id) + '">View Module ' + esc(m.id) + ' →</a>' +
        '<button class="btn-add" type="button" data-act="edit" data-exp="' + esc(exp.id) + '">✏️ Edit Experiment</button>' +
        '<button class="btn-danger big" type="button" data-act="delete" data-exp="' + esc(exp.id) + '">🗑 Delete</button>' +
      '</div>' +
    '</section>';
  }

  function wireDetail(exp) {
    mountHoverVideo($('#detail-video'), exp.previewVideo);
    $$('.copy-btn[data-copy-sec]').forEach(function (btn) {
      var letter = btn.getAttribute('data-copy-sec');
      var sec = getSection(exp, letter);
      if (sec) btn.addEventListener('click', function () { copyText(sec.code || '', btn); });
    });
    $$('.run-btn[data-run-sec]').forEach(function (btn) {
      var letter = btn.getAttribute('data-run-sec');
      var sec = getSection(exp, letter);
      var host = document.getElementById('run-' + exp.id + '-' + letter);
      if (!sec || !host) return;
      btn.addEventListener('click', function () {
        if (window.DS_Runner) window.DS_Runner.run(sec.code || '', host, btn);
      });
    });
  }

  /* ============================================================
     MODULES
     ============================================================ */
  function modulesView() {
    var mats = allMaterials();
    var materialsBlock = mats.length
      ? '<div class="section-head">' +
          '<div>' +
            '<h2 id="materials-title">Module Study Material</h2>' +
            '<p class="section-sub">Open a module to read its chapters from the original PDF files in the modules folder.</p>' +
          '</div>' +
        '</div>' +
        '<div class="module-grid" id="materials-grid">' + mats.map(materialCardHTML).join('') + '</div>'
      : '';
    return '<section class="page">' +
      crumb([{ label: 'Home', href: '#/' }, { label: 'Modules' }]) +
      '<div class="page-head">' +
        '<h1>Modules</h1>' +
        '<p>The Data Science laboratory is organised into ' + allModules().length + ' modules.</p>' +
      '</div>' +
      materialsBlock +
      '<div class="section-head">' +
        '<div>' +
          '<h2>Experiments by Module</h2>' +
          '<p class="section-sub">Every experiment grouped under its course module.</p>' +
        '</div>' +
      '</div>' +
      '<div class="module-grid">' + allModules().map(moduleCardHTML).join('') + '</div>' +
    '</section>';
  }

  function moduleView(m) {
    var exps = experimentsOfModule(m);
    return '<section class="page">' +
      crumb([{ label: 'Modules', href: '#/modules' }, { label: 'Module ' + m.id }]) +
      '<div class="page-head">' +
        '<span class="module-num">Module ' + esc(m.id) + '</span>' +
        '<h1>' + esc(m.title) + '</h1>' +
        '<p>' + esc(m.description) + '</p>' +
        '<p class="module-count-line">' + exps.length + ' experiment' + (exps.length === 1 ? '' : 's') + ' in this module</p>' +
      '</div>' +
      '<div class="exp-grid">' + (exps.length ? exps.map(expCardHTML).join('') :
        '<div class="empty-state">No experiments are assigned to this module yet.</div>') + '</div>' +
      '<div class="det-actions"><a class="back-link big" href="#/modules">← Back to Modules</a></div>' +
    '</section>';
  }

  /* study-file module — chapter list */
  function materialView(m) {
    var chapters = materialChapters(m);
    var rows = chapters.map(function (c) {
      return '<a class="mat-chapter-row" href="#/material/' + esc(m.id) + '/' + c.n + '">' +
          '<span class="mat-ch-num">' + c.n + '</span>' +
          '<span class="mat-ch-body">' +
            '<span class="mat-ch-title">' + esc(c.title) + '</span>' +
            '<span class="mat-ch-meta">PDF page ' + c.page + '</span>' +
          '</span>' +
          '<span class="mat-ch-go">Read →</span>' +
        '</a>';
    }).join('');
    return '<section class="page">' +
      crumb([{ label: 'Home', href: '#/' }, { label: 'Modules', href: '#/modules' }, { label: 'Module ' + m.id }]) +
      '<div class="page-head">' +
        '<span class="module-num">Module ' + esc(m.id) + '</span>' +
        '<h1>' + esc(m.title) + '</h1>' +
        '<p>' + esc(m.description) + '</p>' +
        '<p class="module-count-line">' + chapters.length + ' chapter' + (chapters.length === 1 ? '' : 's') +
          ' · ' + esc(m.pages) + '-page PDF</p>' +
      '</div>' +
      '<div class="det-actions">' +
        '<a class="mat-open" href="#/material/' + esc(m.id) + '/full">Read full module (PDF)</a>' +
        '<a class="back-link" href="' + esc(m.file) + '" target="_blank" rel="noopener">Open original PDF ↗</a>' +
      '</div>' +
      '<div class="section-head">' +
        '<div>' +
          '<h2>Chapters</h2>' +
          '<p class="section-sub">Select a chapter to read it inside the embedded PDF viewer.</p>' +
        '</div>' +
      '</div>' +
      '<div class="mat-chapter-list">' + rows + '</div>' +
      '<div class="det-actions"><a class="back-link big" href="#/modules">← Back to Modules</a></div>' +
    '</section>';
  }

  /* embedded reader for a chapter (or the whole module) */
  function materialReaderView(m, ch) {
    var isFull = !ch;
    var page = isFull ? 1 : ch.page;
    var heading = isFull ? m.title : ('Chapter ' + ch.n + ': ' + ch.title);
    var fileUrl = m.file + '#page=' + page;
    var ext = String(m.file).split('.').pop().toLowerCase();
    var viewer;

    if (ext === 'pdf' || ext === 'html' || ext === 'htm') {
      viewer = '<iframe class="pdf-frame" title="' + esc(heading) + '" src="' + esc(fileUrl) + '"></iframe>';
    } else if (ext === 'txt' || ext === 'md') {
      viewer = '<div class="reader-text" id="reader-text" data-src="' + esc(m.file) + '">' +
        '<p class="reader-loading">Loading ' + esc(m.file) + '…</p></div>';
    } else {
      viewer = '<div class="reader-unsupported">' +
        '<p><b>' + (esc(ext.toUpperCase()) || 'This') + ' files</b> can not be shown inside the page.</p>' +
        '<a class="back-link" href="' + esc(m.file) + '" target="_blank" rel="noopener">Open the original file ↗</a>' +
      '</div>';
    }

    var crumbItems = [
      { label: 'Home', href: '#/' },
      { label: 'Modules', href: '#/modules' },
      { label: 'Module ' + m.id, href: '#/material/' + m.id }
    ];
    crumbItems.push({ label: isFull ? 'Full document' : 'Chapter ' + ch.n });

    return '<section class="page">' +
      crumb(crumbItems) +
      '<div class="reader-head">' +
        '<div class="reader-head-txt">' +
          '<span class="module-num">Module ' + esc(m.id) + '</span>' +
          '<h1>' + esc(heading) + '</h1>' +
          '<p class="reader-sub">' + esc(m.title) + (isFull ? ' · full document' : ' · PDF page ' + page) + '</p>' +
        '</div>' +
        '<div class="reader-actions">' +
          '<a class="back-link" href="#/material/' + esc(m.id) + '">← Chapter list</a>' +
          '<a class="back-link" href="' + esc(fileUrl) + '" target="_blank" rel="noopener">Open in new tab ↗</a>' +
        '</div>' +
      '</div>' +
      '<div class="reader-frame-wrap">' + viewer + '</div>' +
      '<p class="reader-hint">If the embedded viewer does not load in your browser, use “Open in new tab”.</p>' +
      '<div class="det-actions">' +
        '<a class="back-link big" href="#/material/' + esc(m.id) + '">← Back to Module</a>' +
        '<a class="back-link big" href="#/modules">← Back to Modules</a>' +
      '</div>' +
    '</section>';
  }

  function wireMaterialReader() {
    var host = document.getElementById('reader-text');
    if (!host) return;
    var src = host.getAttribute('data-src');
    fetch(src).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    }).then(function (txt) {
      var pre = document.createElement('pre');
      pre.className = 'reader-pre';
      pre.textContent = txt;
      host.innerHTML = '';
      host.appendChild(pre);
    }).catch(function () {
      host.innerHTML = '<p class="reader-loading">Could not load this file here. ' +
        '<a href="' + esc(src) + '" target="_blank" rel="noopener">Open the original file ↗</a></p>';
    });
  }

  /* ============================================================
     TOOLS
     ============================================================ */
  function toolsView() {
    var cats = allToolCategories();
    var chips = ['<button class="filter-chip' + (toolCat === 'all' ? ' on' : '') + '" data-cat="all" type="button">All</button>'];
    cats.forEach(function (cat) {
      chips.push('<button class="filter-chip' + (toolCat === cat.category ? ' on' : '') + '" data-cat="' +
        esc(cat.category) + '" type="button">' + esc(cat.category) + '</button>');
    });

    return '<section class="page">' +
      crumb([{ label: 'Home', href: '#/' }, { label: 'Tools' }]) +
      '<div class="page-head">' +
        '<h1>Tools &amp; Libraries</h1>' +
        '<p>The Data Science libraries and tools used throughout the experiments. Search or filter by category.</p>' +
      '</div>' +
      '<div class="exp-toolbar">' +
        '<div class="search-box compact">' +
          '<svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
            '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/></svg>' +
          '<input id="tool-search" class="search-input" type="text" placeholder="Search tools and libraries..." ' +
            'value="' + esc(toolQuery) + '" autocomplete="off" aria-label="Search tools">' +
          '<button id="tool-search-clear" class="search-clear' + (toolQuery ? ' show' : '') + '" type="button" aria-label="Clear search">×</button>' +
        '</div>' +
        '<div class="filter-chips">' + chips.join('') + '</div>' +
      '</div>' +
      '<p class="exp-count" id="tool-count"></p>' +
      '<div id="tool-results"></div>' +
    '</section>';
  }

  function renderToolResults() {
    var host = document.getElementById('tool-results');
    if (!host) return;
    var q = toolQuery.trim().toLowerCase();
    var cats = allToolCategories();
    var html = '', count = 0;
    cats.forEach(function (cat) {
      if (toolCat !== 'all' && cat.category !== toolCat) return;
      var items = cat.items.filter(function (t) { return !q || toolText(t, cat).indexOf(q) !== -1; });
      if (!items.length) return;
      count += items.length;
      html += '<section class="tool-cat">' +
        '<div class="tool-cat-head"><h2>' + esc(cat.category) + '</h2>' +
          '<span class="tool-cat-count">' + items.length + ' item' + (items.length === 1 ? '' : 's') + '</span></div>' +
        '<div class="tool-grid">' + items.map(function (t) { return toolCardHTML(t, cat.category); }).join('') + '</div>' +
      '</section>';
    });
    host.innerHTML = html || '<div class="empty-state">No tool matches your search. Try another keyword.</div>';
    var cnt = document.getElementById('tool-count');
    if (cnt) cnt.textContent = count + ' tool' + (count === 1 ? '' : 's') + ' shown';
  }

  function wireTools(highlight) {
    renderToolResults();

    var input = $('#tool-search');
    var clear = $('#tool-search-clear');
    if (input) input.addEventListener('input', function () {
      toolQuery = input.value;
      if (clear) clear.classList.toggle('show', toolQuery.length > 0);
      renderToolResults();
    });
    if (clear) clear.addEventListener('click', function () {
      toolQuery = ''; input.value = ''; clear.classList.remove('show');
      renderToolResults(); input.focus();
    });

    $$('.exp-toolbar .filter-chip[data-cat]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        toolCat = chip.getAttribute('data-cat');
        $$('.exp-toolbar .filter-chip[data-cat]').forEach(function (c) { c.classList.toggle('on', c === chip); });
        renderToolResults();
      });
    });

    if (highlight) {
      var el = document.getElementById('tool-' + highlight);
      if (el) {
        el.classList.add('tool-flash');
        setTimeout(function () { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 80);
      }
    }
  }

  /* ============================================================
     SECTION — single experiment section (video + code)
     ============================================================ */
  function sectionView(exp, sec) {
    var idx = exp.sections.indexOf(sec);
    var prev = exp.sections[idx - 1];
    var next = exp.sections[idx + 1];

    function navBtn(target, label, disabled) {
      if (disabled) return '<span class="nav-btn" aria-disabled="true">' + label + '</span>';
      return '<a class="nav-btn" href="' + target + '">' + label + '</a>';
    }

    return '<section class="page">' +
      crumb([{ label: 'Experiments', href: '#/experiments' },
        { label: 'Experiment ' + exp.id, href: '#/experiment/' + exp.id },
        { label: 'Section ' + sec.letter }]) +

      '<div class="sec-hero">' +
        '<h1 class="exp-no">Experiment ' + esc(exp.id) + '</h1>' +
        '<span class="letter-big">' + esc(sec.letter) + '</span>' +
        '<p class="exp-name">' + esc(exp.name) + '</p>' +
      '</div>' +
      (sec.title ? '<p class="sec-title">' + esc(sec.title) + '</p>' : '') +

      '<div class="grid-2">' +
        '<div class="card video-card">' +
          '<div class="video-slot" id="section-video" aria-label="Section video"></div>' +
        '</div>' +
        '<div class="card info-card">' +
          '<h3>Section details</h3>' +
          '<p class="info-lead">' + esc(sec.title || ('Section ' + sec.letter)) + '</p>' +
          '<dl class="info-meta">' +
            '<div><dt>Experiment</dt><dd>' + esc(exp.id) + '</dd></div>' +
            '<div><dt>Section</dt><dd>' + esc(sec.letter) + '</dd></div>' +
            '<div><dt>Total sections</dt><dd>' + exp.sections.length + '</dd></div>' +
          '</dl>' +
          '<div class="sec-nav">' +
            navBtn('#/experiment/' + exp.id, '← Experiment', false) +
            navBtn(prev ? '#/experiment/' + exp.id + '/section/' + prev.letter : '', '← ' + (prev ? 'Section ' + prev.letter : 'Previous'), !prev) +
            navBtn(next ? '#/experiment/' + exp.id + '/section/' + next.letter : '', (next ? 'Section ' + next.letter : 'Next') + ' →', !next) +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="code-card">' +
        '<div class="code-head">' +
          '<span class="code-title">Code</span>' +
          '<span class="lang-chip">python</span>' +
          '<span class="spacer"></span>' +
          '<button class="run-btn" id="run-btn" type="button"><span class="run-ico">▶</span> Run</button>' +
          '<button class="copy-btn" id="copy-btn" type="button">Copy Code</button>' +
        '</div>' +
        codeBlockHTML(sec.code) +
        '<div class="run-output" id="run-sec-out" hidden></div>' +
      '</div>' +
    '</section>';
  }

  function wireSection(exp, sec) {
    mountVideo($('#section-video'), sec.video);
    var btn = $('#copy-btn');
    if (btn) btn.addEventListener('click', function () { copyText(sec.code || '', btn); });
    var runBtn = $('#run-btn');
    var runOut = $('#run-sec-out');
    if (runBtn && runOut) {
      runBtn.addEventListener('click', function () {
        if (window.DS_Runner) window.DS_Runner.run(sec.code || '', runOut, runBtn);
      });
    }
  }

  /* ============================================================
     EXPERIMENT CRUD — add / edit / delete via modal forms
     (all changes persist through store.js → localStorage)
     ============================================================ */
  function rerender() { route(); }

  function modalRoot() {
    var root = document.getElementById('dslab-modal');
    if (!root) {
      root = document.createElement('div');
      root.id = 'dslab-modal';
      root.className = 'modal-overlay';
      root.hidden = true;
      document.body.appendChild(root);
    }
    return root;
  }
  function openModal(html) {
    var root = modalRoot();
    root.innerHTML = '<div class="modal" role="dialog" aria-modal="true">' + html + '</div>';
    root.hidden = false;
    document.body.classList.add('modal-open');
  }
  function closeModal() {
    var root = modalRoot();
    root.hidden = true;
    root.innerHTML = '';
    document.body.classList.remove('modal-open');
  }

  function formField(name, label, type, value, hint) {
    var id = 'ef-' + name;
    var control;
    if (type === 'textarea' || type === 'code') {
      control = '<textarea class="form-input' + (type === 'code' ? ' code-textarea' : '') + '" id="' + id +
        '" name="' + name + '" rows="' + (type === 'code' ? 9 : 3) + '">' + esc(value) + '</textarea>';
    } else {
      control = '<input class="form-input" id="' + id + '" name="' + name + '" type="' + type + '" value="' + esc(value) + '">';
    }
    return '<div class="form-field">' +
      '<label for="' + id + '">' + esc(label) + (hint ? ' <span class="form-hint">' + esc(hint) + '</span>' : '') + '</label>' +
      control + '</div>';
  }

  function expFormHTML(exp) {
    var isEdit = !!exp;
    var meta = exp ? metaOf(exp) : {};
    var first = (exp && exp.sections && exp.sections.length) ? exp.sections[0] : {};
    var total = (exp && exp.sections) ? exp.sections.length : 0;
    var data = exp ? {
      id: exp.id,
      name: exp.name || '',
      summary: exp.summary || '',
      aim: meta.aim || '',
      requirements: meta.requirements || (meta.tools ? meta.tools.join(', ') : ''),
      theory: meta.theory || '',
      algorithm: meta.algorithm || '',
      code: first.code || '',
      output: (meta.expectedOutput || []).join('\n'),
      result: meta.result || ''
    } : {
      id: STORE ? STORE.nextId() : allExperiments().length + 1,
      name: '', summary: '', aim: '', requirements: '', theory: '', algorithm: '', code: '', output: '', result: ''
    };
    var moduleId = exp ? moduleOfExperiment(exp).id : (allModules()[0] && allModules()[0].id);
    var moduleOptions = allModules().map(function (m) {
      return '<option value="' + esc(m.id) + '"' + (String(moduleId) === String(m.id) ? ' selected' : '') + '>' +
        'Module ' + esc(m.id) + ' — ' + esc(m.title) + '</option>';
    }).join('');

    var sectionNote = (isEdit && total > 1)
      ? '<p class="form-note">This experiment has ' + total + ' sections; the code box edits Section ' +
        esc(first.letter || 'A') + '. The other sections and their videos are kept.</p>'
      : '';

    return '<form id="exp-form" novalidate>' +
      '<div class="modal-head">' +
        '<h2>' + (isEdit ? '✏️ Edit Experiment' : '➕ Add Experiment') + '</h2>' +
        '<button class="modal-x" type="button" data-close aria-label="Close">×</button>' +
      '</div>' +
      '<div class="modal-body">' +
        '<div class="form-row">' +
          formField('id', 'Experiment Number', 'number', data.id, 'required') +
          formField('name', 'Title', 'text', data.name, 'required') +
        '</div>' +
        '<div class="form-field"><label for="ef-module">Module</label>' +
          '<select class="form-input" id="ef-module" name="module">' + moduleOptions + '</select></div>' +
        formField('summary', 'Description', 'textarea', data.summary, 'required') +
        formField('aim', 'Aim', 'textarea', data.aim) +
        formField('requirements', 'Requirements', 'textarea', data.requirements, 'comma or line separated') +
        formField('theory', 'Theory', 'textarea', data.theory) +
        formField('algorithm', 'Algorithm', 'textarea', data.algorithm, 'one step per line') +
        sectionNote +
        formField('code', 'Program / Code', 'code', data.code, 'Python') +
        formField('output', 'Output', 'textarea', data.output, 'one line per output item') +
        formField('result', 'Result', 'textarea', data.result) +
        '<p class="form-error" id="form-error" hidden></p>' +
      '</div>' +
      '<div class="modal-foot">' +
        '<button class="btn-cancel" type="button" data-close>Cancel</button>' +
        '<button class="btn-save" type="submit">💾 Save Changes</button>' +
      '</div>' +
    '</form>';
  }

  function openExperimentForm(id) {
    var exp = (id != null) ? getExperiment(id) : null;
    if (id != null && !exp) return;
    openModal(expFormHTML(exp));
    wireExperimentForm(exp);
  }

  function wireExperimentForm(exp) {
    var form = $('#exp-form');
    if (!form) return;
    var errEl = $('#form-error');

    function fail(msg) {
      if (errEl) {
        errEl.textContent = msg;
        errEl.hidden = false;
        errEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      function val(name) { var el = form.querySelector('#ef-' + name); return el ? String(el.value) : ''; }

      var id = parseInt(val('id'), 10);
      if (isNaN(id) || id <= 0) return fail('Experiment number must be a positive whole number.');
      var name = val('name').trim();
      if (!name) return fail('Title is required.');
      var summary = val('summary').trim();
      if (!summary) return fail('Description is required.');
      var dup = allExperiments().some(function (e) {
        return String(e.id) === String(id) && (!exp || String(exp.id) !== String(e.id));
      });
      if (dup) return fail('Experiment number ' + id + ' is already used by another experiment.');

      var sections = exp ? JSON.parse(JSON.stringify(exp.sections || [])) : [];
      var code = val('code');
      if (sections.length) {
        sections[0].code = code;
        if (!sections[0].title) sections[0].title = 'Program';
      } else {
        sections = [{ letter: 'A', title: 'Program', video: '', code: code }];
      }

      var requirements = val('requirements').trim();
      var output = val('output').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
      var metaObj = {
        aim: val('aim').trim(),
        description: summary,
        requirements: requirements,
        tools: requirements
          ? requirements.split(/[,\n]/).map(function (s) { return s.trim(); }).filter(Boolean)
          : ((exp && metaOf(exp).tools) || []),
        theory: val('theory').trim(),
        algorithm: val('algorithm').trim(),
        procedure: (exp && metaOf(exp).procedure) || [],
        expectedOutput: output,
        result: val('result').trim()
      };

      var payload = { id: id, name: name, summary: summary, sections: sections, meta: metaObj, moduleId: val('module') };
      if (exp) {
        ['previewVideo', 'youtubeVideo', 'youtubeLink', 'githubLink'].forEach(function (k) {
          if (exp[k] != null) payload[k] = exp[k];
        });
      }

      var ok;
      try {
        ok = exp ? STORE.updateExperiment(exp.id, payload) : STORE.addExperiment(payload);
      } catch (e) { ok = false; }
      if (!ok) return fail('Could not save — your browser storage may be full.');

      closeModal();
      showToast(exp ? 'Experiment updated' : 'Experiment added', 'success');
      rerender();
      return true;
    });
  }

  function handleExpAction(act, id) {
    if (act === 'view') { location.hash = '#/experiment/' + id; return; }
    if (act === 'edit') { openExperimentForm(id); return; }
    if (act === 'delete') { confirmDeleteExperiment(id); }
  }

  function confirmDeleteExperiment(id) {
    var exp = getExperiment(id);
    if (!exp) return;
    openModal(
      '<div class="modal-head"><h2>🗑 Delete Experiment</h2>' +
        '<button class="modal-x" type="button" data-close aria-label="Close">×</button></div>' +
      '<div class="modal-body"><p class="confirm-text">Are you sure you want to delete <b>' + esc(exp.name) +
        '</b> (Experiment ' + esc(exp.id) + ')? This cannot be undone.</p></div>' +
      '<div class="modal-foot">' +
        '<button class="btn-cancel" type="button" data-close>Cancel</button>' +
        '<button class="btn-danger" id="confirm-delete" type="button">🗑 Delete</button>' +
      '</div>'
    );
    var btn = $('#confirm-delete');
    if (btn) btn.addEventListener('click', function () {
      STORE.deleteExperiment(id);
      closeModal();
      showToast('Experiment deleted', 'success');
      if (location.hash.indexOf('#/experiment/' + id) === 0) location.hash = '#/experiments';
      else rerender();
    });
  }

  function openToolModal(s) {
    var found = toolBySlug(s);
    if (!found) return;
    var t = found.tool;
    openModal(
      '<div class="modal-head"><h2>' + esc(t.icon || '') + ' ' + esc(t.name) + '</h2>' +
        '<button class="modal-x" type="button" data-close aria-label="Close">×</button></div>' +
      '<div class="modal-body">' +
        '<span class="tool-tag">' + esc(found.category) + '</span>' +
        '<p class="tool-detail-desc">' + esc(t.explanation) + '</p>' +
        '<dl class="tool-meta">' +
          '<div><dt>Main applications</dt><dd>' + esc(t.mainUse || '—') + '</dd></div>' +
          '<div><dt>Example of use</dt><dd>' + esc(t.example || '—') + '</dd></div>' +
        '</dl>' +
      '</div>' +
      '<div class="modal-foot">' +
        (t.url ? '<a class="tool-link" href="' + esc(t.url) + '" target="_blank" rel="noopener noreferrer">📖 Official documentation ↗</a>' : '') +
        '<button class="btn-cancel" type="button" data-close>Close</button>' +
      '</div>'
    );
  }

  function confirmResetData() {
    openModal(
      '<div class="modal-head"><h2>↺ Reset to defaults</h2>' +
        '<button class="modal-x" type="button" data-close aria-label="Close">×</button></div>' +
      '<div class="modal-body"><p class="confirm-text">This removes every experiment you added or edited in this browser ' +
        'and restores the original experiments from data.js. Continue?</p></div>' +
      '<div class="modal-foot">' +
        '<button class="btn-cancel" type="button" data-close>Cancel</button>' +
        '<button class="btn-danger" id="confirm-reset" type="button">Reset</button>' +
      '</div>'
    );
    var b = $('#confirm-reset');
    if (b) b.addEventListener('click', function () {
      if (STORE) STORE.resetAll();
      expSearch = ''; expModuleFilter = 'all';
      closeModal();
      showToast('Restored the default experiments', 'success');
      rerender();
    });
  }

  /* one delegated click handler covers every View / Edit / Delete / Add control */
  document.addEventListener('click', function (ev) {
    var t = ev.target;
    if (!t || !t.closest) return;

    var actBtn = t.closest('[data-act]');
    if (actBtn) {
      ev.preventDefault();
      handleExpAction(actBtn.getAttribute('data-act'), actBtn.getAttribute('data-exp'));
      return;
    }
    var toolBtn = t.closest('[data-tool]');
    if (toolBtn) { ev.preventDefault(); openToolModal(toolBtn.getAttribute('data-tool')); return; }

    if (t.closest('#add-experiment') || t.closest('#quick-add')) { ev.preventDefault(); openExperimentForm(null); return; }
    if (t.closest('#reset-data')) { ev.preventDefault(); confirmResetData(); return; }
    if (t.closest('[data-close]')) { ev.preventDefault(); closeModal(); return; }
    if (t.closest('#dslab-modal') && !t.closest('.modal')) { closeModal(); return; }

    var card = t.closest('.exp-card');
    if (card) { location.hash = '#/experiment/' + card.getAttribute('data-exp'); }
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') {
      var root = document.getElementById('dslab-modal');
      if (root && !root.hidden) closeModal();
    }
  });

  /* ============================================================
     router
     ============================================================ */
  function documentTitle(label) {
    var lab = (LAB && LAB.brand && LAB.brand.laboratory) || 'Data Science Digital Library';
    document.title = label ? label + ' · ' + lab : lab;
  }

  function notFound() {
    return '<section class="page"><div class="card empty-state" style="grid-column:auto">' +
      '<b>Page not found.</b><p>Go back to the <a href="#/">home page</a>.</p></div></section>';
  }

  function setActiveNav(page) {
    $$('.nav-link').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-nav') === page);
    });
  }

  function route() {
    closeMenu();
    if (!LAB || !LAB.experiments) {
      view().innerHTML = '<section class="page"><div class="card empty-state" style="grid-column:auto">' +
        '<b>assets/js/data.js did not load.</b><p>Check that the file exists and refresh the page.</p></div></section>';
      return;
    }

    var raw = location.hash.replace(/^#\/?/, '');
    var parts = raw.split('/').filter(function (p) { return p !== ''; });
    var html = '', wire = null, title = '', nav = 'home';

    if (parts.length === 0) {
      html = homeView(); wire = wireHome; title = ''; nav = 'home';
    } else if (parts[0] === 'experiments') {
      html = experimentsView(); wire = wireExperiments; nav = 'experiments'; title = 'Experiments';
    } else if (parts[0] === 'experiment' && getExperiment(parts[1])) {
      var e = getExperiment(parts[1]);
      if (parts[2] === 'section') {
        var s = getSection(e, parts[3]);
        if (s) {
          html = sectionView(e, s); wire = function () { wireSection(e, s); };
          nav = 'experiments'; title = 'Experiment ' + e.id + ' · Section ' + s.letter;
        } else html = notFound();
      } else {
        html = detailView(e); wire = function () { wireDetail(e); };
        nav = 'experiments'; title = 'Experiment ' + e.id + ' · ' + e.name;
      }
    } else if (parts[0] === 'modules') {
      html = modulesView(); nav = 'modules'; title = 'Modules';
    } else if (parts[0] === 'module' && getModule(parts[1])) {
      var m = getModule(parts[1]);
      html = moduleView(m);
      nav = 'modules'; title = 'Module ' + m.id + ' · ' + m.title;
    } else if (parts[0] === 'material' && getMaterial(parts[1])) {
      var mt = getMaterial(parts[1]);
      if (parts[2] === 'full') {
        html = materialReaderView(mt, null); wire = wireMaterialReader;
        nav = 'modules'; title = 'Module ' + mt.id + ' · ' + mt.title;
      } else if (parts[2]) {
        var mc = getChapter(mt, parts[2]);
        if (mc) {
          html = materialReaderView(mt, mc); wire = wireMaterialReader;
          nav = 'modules'; title = 'Module ' + mt.id + ' · Chapter ' + mc.n;
        } else {
          html = notFound();
        }
      } else {
        html = materialView(mt);
        nav = 'modules'; title = 'Module ' + mt.id + ' · ' + mt.title;
      }
    } else if (parts[0] === 'tools') {
      var hl = parts[1] || '';
      html = toolsView(); wire = function () { wireTools(hl); };
      nav = 'tools'; title = 'Tools & Libraries';
    } else {
      html = notFound();
    }

    var host = view();
    host.innerHTML = html;
    if (wire) wire();
    fitLogos(host);
    setActiveNav(nav);
    documentTitle(title);
    window.scrollTo(0, 0);
  }

  function view() { return document.getElementById('view'); }

  /* ---------------- chrome from data.js ---------------- */
  function fillChrome() {
    var b = (LAB && LAB.brand) || {};
    var s = studentData();
    setTxt('brand-lab', b.laboratory);
    setTxt('nav-subject', 'Subject Code: ' + (b.subjectCode || '—'));
    setTxt('foot-lab', b.laboratory);
    setTxt('foot-note', 'Subject Code: ' + (b.subjectCode || '—') + (s.name ? '  ·  ' + s.name : ''));
  }

  /* ---------------- mobile menu ---------------- */
  function toggleMenu() {
    var nav = document.getElementById('topnav');
    var btn = document.getElementById('hamburger');
    if (!nav || !btn) return;
    var open = nav.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  function closeMenu() {
    var nav = document.getElementById('topnav');
    var btn = document.getElementById('hamburger');
    if (nav) nav.classList.remove('open');
    if (btn) { btn.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
  }

  /* ---------------- boot ---------------- */
  var hamburger = document.getElementById('hamburger');
  if (hamburger) hamburger.addEventListener('click', function (e) { e.stopPropagation(); toggleMenu(); });

  var topnav = document.getElementById('topnav');
  if (topnav) topnav.addEventListener('click', function (e) {
    if (e.target.closest('.nav-link')) closeMenu();
  });

  document.addEventListener('click', function (ev) {
    var suggest = document.getElementById('suggest');
    if (suggest && !suggest.hidden && (!ev.target.closest || !ev.target.closest('.search-wrap'))) {
      suggest.hidden = true; suggest.innerHTML = '';
      var input = document.getElementById('search');
      if (input) input.setAttribute('aria-expanded', 'false');
    }
    var nav = document.getElementById('topnav');
    if (nav && nav.classList.contains('open') &&
        (!ev.target.closest || !ev.target.closest('.site-header'))) {
      closeMenu();
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 860) closeMenu();
  });

  fillChrome();
  fitLogos(document);
  window.addEventListener('hashchange', route);
  route();
})();
