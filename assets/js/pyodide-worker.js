/* pyodide-worker.js
   Runs real CPython (Pyodide, WebAssembly) off the UI thread so the Python in
   every experiment actually executes in the browser — numpy, pandas,
   matplotlib, requests, sqlite3 and openpyxl — with a matplotlib-backed
   seaborn shim.  Everything the code prints, plus every figure it draws, is
   streamed back to the page.

   Protocol
     out: {type:'status', text}
          {type:'ready', version}
          {type:'out'|'err', text}
          {type:'figure', b64}
          {type:'done', ms}
          {type:'error', text}
   Nothing is sent anywhere: CPython runs inside this worker in the tab. */

'use strict';

var PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
/* Packages that ship with Pyodide and cover the experiments. */
var BASE = ['numpy', 'pandas', 'matplotlib', 'requests', 'sqlite3', 'micropip'];
/* Extra pure-Python packages installed from PyPI via micropip:
     openpyxl     -> pd.read_excel() / to_excel()  (experiment 1-D)
     pyodide-http -> routes urllib/requests through fetch, so pd.read_csv(url)
                     and requests.get(url) work (experiments 2-A and 5-A) */
var PYPI_EXTRA = ['openpyxl', 'et-xmlfile', 'pyodide-http'];
/* Datasets copied from assets/data/ into the sandbox before code runs. */
var DATA_FILES = ['car_dataset_40x20.csv'];

/* Python shims: what a browser cannot provide natively, said out loud. */
var SHIMS = String.raw`
import sys, io

_PSL = [
    ("python", sys.version.split()[0]),
    ("matplotlib", None),
    ("pandas", None),
    ("seaborn", "shim (matplotlib-backed)"),
]
try:
    import matplotlib as _mpl; _PSL[1] = (1, _mpl.__version__)
except Exception as _e: _PSL[1] = (0, type(_e).__name__)
try:
    import pandas as _pd; _PSL[2] = (1, _pd.__version__)
except Exception as _e: _PSL[2] = (0, type(_e).__name__)

print("CPython %s running as WebAssembly in a Web Worker." % _PSL[0][1])
print("Loaded: " + ", ".join(
    "%s %s" % (n, v[1] if v[0] else "MISSING (%s)" % v[1])
    for (n, v) in _PSL))
print("seaborn is not packaged for Pyodide; a matplotlib-backed shim is active.")

try:
    import matplotlib
    matplotlib.use("Agg", force=True)
    import matplotlib.pyplot as _plt

    _fig_no = [0]

    def _dsl_capture(fig=None):
        import io as _io
        buf = _io.BytesIO()
        (fig or _plt.gcf()).savefig(buf, format="png", dpi=110,
                                    bbox_inches="tight")
        return buf.getvalue()

    def _dsl_emit(tag="figure"):
        import base64
        try:
            raw = _dsl_capture()
        except Exception as _e:
            print("[figure could not be rendered: %s]" % _e)
            return
        _fig_no[0] += 1
        b64 = base64.b64encode(raw).decode("ascii")
        try:
            import js
            cb = getattr(js, "DSL_onFigure", None)
            if cb is not None:
                cb(tag, b64, len(raw))
                return
            print("[figure %d captured, %d bytes PNG, no renderer attached]"
                  % (_fig_no[0], len(raw)))
        except Exception as _e:
            print("[figure transport unavailable: %s]" % _e)

    _plt.show = lambda *a, **k: _dsl_emit("figure")

    print("plt.show() is redirected: each figure is saved as PNG and rendered "
          "inline in the output below.")

except Exception as _e:
    print("matplotlib shim not installed: %s" % _e)

try:
    import seaborn as _sns_real
    print("A real seaborn build is present; the shim will not override it.")
except Exception:
    import types as _types

    _sns = _types.ModuleType("seaborn")

    def scatterplot(data=None, x=None, y=None, hue=None, ax=None, **kw):
        import matplotlib.pyplot as plt
        fig, ax = plt.subplots() if ax is None else (ax.get_figure(), ax)
        if data is not None:
            xs = data[x] if isinstance(x, str) else x
            ys = data[y] if isinstance(y, str) else y
            if hue is not None and isinstance(hue, str):
                for key in sorted(set(data[hue])):
                    m = data[hue] == key
                    ax.scatter(xs[m], ys[m], label=str(key))
                ax.legend()
            else:
                ax.scatter(xs, ys)
        else:
            ax.scatter(x, y, **kw)
        ax.set_xlabel(x if isinstance(x, str) else "")
        ax.set_ylabel(y if isinstance(y, str) else "")
        return ax

    def histplot(data=None, x=None, hue=None, bins="auto", kde=False,
                 ax=None, **kw):
        import matplotlib.pyplot as plt
        import numpy as np
        fig, ax = plt.subplots() if ax is None else (ax.get_figure(), ax)
        if data is not None and isinstance(x, str):
            col = data[x]
            groups = sorted(set(data[hue])) if isinstance(hue, str) else [None]
            for g in groups:
                vals = col if g is None else col[data[hue] == g]
                vals = np.asarray(vals, dtype=float)
                vals = vals[~np.isnan(vals)]
                if bins == "auto":
                    nb = max(1, min(10, int(np.sqrt(len(vals))) or 1))
                else:
                    nb = int(bins)
                ax.hist(vals, bins=nb, alpha=0.55,
                        label=str(g) if g is not None else None)
            if groups != [None]:
                ax.legend()
        else:
            series = data if data is not None else x
            ax.hist(np.asarray(series, dtype=float), bins=(10 if bins == "auto" else bins),
                    alpha=0.7, **kw)
        ax.set_xlabel(x if isinstance(x, str) else "")
        ax.set_ylabel("Frequency")
        if kde:
            try:
                kdeplot(data=data, x=x, hue=hue, ax=ax)
            except Exception:
                pass
        return ax

    def kdeplot(data=None, x=None, hue=None, fill=True, ax=None, **kw):
        import matplotlib.pyplot as plt
        import numpy as np
        fig, ax = plt.subplots() if ax is None else (ax.get_figure(), ax)
        if data is not None and isinstance(x, str):
            groups = sorted(set(data[hue])) if isinstance(hue, str) else [None]
            for g in groups:
                vals = data[x] if g is None else data[x][data[hue] == g]
                vals = np.asarray(vals, dtype=float)
                vals = vals[~np.isnan(vals)]
                if len(vals) < 2:
                    continue
                grid = np.linspace(vals.min(), vals.max(), 200)
                bw = 1.06 * vals.std(ddof=1) * len(vals) ** (-0.2) or 1e-6
                dens = np.exp(-0.5 * ((grid[:, None] - vals[None, :]) / bw) ** 2).sum(1)
                dens /= (dens.max() or 1.0)
                ax.plot(grid, dens, label=str(g) if g is not None else None)
                if fill:
                    ax.fill_between(grid, dens, alpha=0.25)
            if groups != [None]:
                ax.legend()
        else:
            vals = np.asarray(data if data is not None else x, dtype=float)
            vals = vals[~np.isnan(vals)]
            grid = np.linspace(vals.min(), vals.max(), 200)
            bw = 1.06 * vals.std(ddof=1) * len(vals) ** (-0.2) or 1e-6
            dens = np.exp(-0.5 * ((grid[:, None] - vals[None, :]) / bw) ** 2).sum(1)
            dens /= (dens.max() or 1.0)
            ax.plot(grid, dens)
            if fill:
                ax.fill_between(grid, dens, alpha=0.3)
        ax.set_xlabel(x if isinstance(x, str) else "")
        ax.set_ylabel("Density")
        return ax

    def boxplot(data=None, x=None, y=None, ax=None, **kw):
        import matplotlib.pyplot as plt
        import numpy as np
        fig, ax = plt.subplots() if ax is None else (ax.get_figure(), ax)
        if data is not None and isinstance(y, str):
            cats = list(data[x].unique()) if isinstance(x, str) else list(range(1))
            pos, labels = [], []
            for i, c in enumerate(cats, start=1):
                vals = np.asarray(
                    data[y][data[x] == c] if isinstance(x, str) else data[y],
                    dtype=float)
                vals = vals[~np.isnan(vals)]
                if len(vals) == 0:
                    continue
                pos.append(i)
                labels.append(str(c))
            try:
                ax.boxplot(pos, tick_labels=labels)
            except TypeError:
                ax.boxplot(pos)
                ax.set_xticks(pos)
                ax.set_xticklabels(labels)
            ax.set_xlabel(x if isinstance(x, str) else "")
        else:
            ax.boxplot(np.asarray(data if data is not None else y, dtype=float))
        ax.set_ylabel(y if isinstance(y, str) else "")
        return ax

    def pairplot(data=None, hue=None, diag_kind="hist", **kw):
        import matplotlib.pyplot as plt
        import numpy as np
        cols = [c for c in data.columns
                if np.issubdtype(np.asarray(data[c]).dtype, np.number)]
        n = len(cols)
        fig, axes = plt.subplots(n, n, figsize=(1.7 * n, 1.7 * n))
        if n == 1:
            axes = [[axes]]
        groups = sorted(set(data[hue])) if isinstance(hue, str) else [None]
        for i, ri in enumerate(cols):
            for j, cj in enumerate(cols):
                ax = axes[i][j]
                if i == j:
                    for g in groups:
                        v = np.asarray(
                            data[ri] if g is None else data[ri][data[hue] == g],
                            dtype=float)
                        ax.hist(v[~np.isnan(v)], bins=8, alpha=0.6)
                else:
                    for g in groups:
                        sub = data if g is None else data[data[hue] == g]
                        ax.scatter(sub[cj], sub[ri], s=14,
                                   label=str(g) if g is not None else None)
                if i == 0:
                    ax.set_title(cj, fontsize=9)
                if j == 0:
                    ax.set_ylabel(ri, fontsize=9)
                ax.tick_params(labelsize=7)
        if isinstance(hue, str) and n:
            axes[0][n - 1].legend(fontsize=7)
        fig.tight_layout()
        return axes

    def load_dataset(name=None, **kw):
        """Offline replacement for seaborn.load_dataset('iris').

        The real seaborn function downloads the CSV from the internet, which
        is slow or blocked in the browser sandbox, so the iris data is
        generated locally with a fixed seed instead. The columns and the
        three species match the real dataset closely enough for the
        plotting exercises of Experiment 5."""
        import numpy as np
        import pandas as _pd
        if str(name).lower() != "iris":
            raise ValueError(
                "load_dataset('%s') is not available offline in the browser "
                "sandbox. Only 'iris' is bundled." % name)
        _rng = np.random.default_rng(7)
        _specs = [("setosa", 5.01, 3.43, 1.45, 0.20),
                  ("versicolor", 5.94, 2.77, 4.26, 1.33),
                  ("virginica", 6.59, 3.00, 5.56, 2.03)]
        _rows = []
        for _name, _sl, _sw, _pl, _pw in _specs:
            for _i in range(60):
                _rows.append({
                    "sepal_length": float(_rng.normal(_sl, 0.35)),
                    "sepal_width": float(_rng.normal(_sw, 0.35)),
                    "petal_length": float(_rng.normal(_pl, 0.45)),
                    "petal_width": float(_rng.normal(_pw, 0.20)),
                    "species": _name
                })
        return _pd.DataFrame(_rows)

    for _fn in (scatterplot, histplot, kdeplot, boxplot, pairplot, load_dataset):
        _sns.__dict__[_fn.__name__] = _fn
    _sns.set = lambda *a, **k: None
    _sns.set_style = lambda *a, **k: None
    _sns.__version__ = "0.0.0-shim"
    sys.modules["seaborn"] = _sns

try:
    import pyodide_http
    pyodide_http.patch_all()
    print("pyodide-http active: urllib and requests are routed through the "
          "browser fetch API, so https URLs in this code work.")
except Exception as _e:
    print("pyodide-http NOT installed (%s): https URLs will fail here." % _e)

import os as _os
_os.makedirs(".", exist_ok=True)

print("Environment ready.")
`;

function post(m) { self.postMessage(m); }

function makeStream(tag) {
  return function (s) {
    if (s === undefined || s === null) return 0;
    var t = String(s);
    if (t.slice(-1) === '\n') t = t.slice(0, -1);
    if (t === '') return 0;
    var lines = t.split('\n');
    for (var i = 0; i < lines.length; i++) post({ type: tag, text: lines[i] });
    return 0;
  };
}

function seedDatasets(py, names) {
  if (!names || !names.length) return Promise.resolve([]);
  var base = new URL('../data/', self.location.href).href;
  var seeded = [];
  return Promise.all(names.map(function (name) {
    return fetch(base + encodeURIComponent(name)).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.arrayBuffer();
    }).then(function (buf) {
      py.FS.writeFile(name, new Uint8Array(buf));
      seeded.push(name);
    }).catch(function () { /* reported by the caller */ });
  })).then(function () { return seeded; });
}

function boot() {
  post({ type: 'status', text: 'Fetching Pyodide from CDN (first run only)…' });
  importScripts(PYODIDE_URL);

  post({ type: 'status', text: 'Starting CPython in WebAssembly…' });

  return loadPyodide({
    stdout: makeStream('out'),
    stderr: makeStream('err'),
    packages: BASE
  }).then(function (p) {
    self.DSL_onFigure = function (tag, b64, bytes) {
      post({ type: 'figure', tag: tag, b64: b64, bytes: bytes });
    };
    post({ type: 'status', text: 'Installing openpyxl + pyodide-http from PyPI…' });
    return p.loadPackage('micropip')
      .then(function () {
        return p.runPythonAsync(
          'import micropip\n' +
          'await micropip.install(["' + PYPI_EXTRA.join('","') + '"])\n');
      })
      .then(function () { return p; })
      .catch(function (e) {
        post({ type: 'status',
               text: 'PyPI extras unavailable (' + (e && e.message ? e.message : e) +
                     '); read_excel() and https URLs will fail, everything else still runs' });
        return p;
      });
  }).then(function (p) {
    return seedDatasets(p, DATA_FILES).then(function (seeded) {
      if (seeded.length) post({ type: 'status', text: 'Datasets staged: ' + seeded.join(', ') });
      return p;
    });
  }).then(function (p) {
    post({ type: 'status', text: 'Installing Python shims…' });
    return p.runPythonAsync(SHIMS).then(function () { return p; });
  }).then(function (p) {
    post({ type: 'ready', version: p.version || '3.12' });
    return p;
  }).catch(function (e) {
    post({ type: 'error',
           text: 'Python could not start: ' + (e && e.message ? e.message : String(e)) +
                 '\nThe runtime is downloaded from the Pyodide CDN, so the first run needs a network connection.' });
  });
}

var pyPromise = boot();

/* Standard input: the page sends the lines typed by the learner and they are
   exposed to the program through sys.stdin, so input() works normally. */
function prepareStdin(text) {
  var lines = String(text || '').split(/\r?\n/);
  var payload = lines.map(function (l) { return JSON.stringify(l); }).join(', ');
  return [
    'import io, sys',
    '_ds_stdin_lines = [' + payload + ']',
    '_ds_stdin_buf = io.StringIO("\\n".join(_ds_stdin_lines) + "\\n")',
    'sys.stdin = _ds_stdin_buf'
  ].join('\n');
}

self.onmessage = function (ev) {
  var msg = ev.data || {};
  if (msg.type === 'run') {
    var t0 = Date.now();
    var timeoutMs = Math.max(2000, Number(msg.timeoutMs) || 25000);
    var finished = false;
    var watchdog = setTimeout(function () {
      if (finished) return;
      finished = true;
      post({ type: 'error', text: 'Execution stopped: the program ran longer than ' +
            Math.round(timeoutMs / 1000) + ' seconds and was terminated.' });
      post({ type: 'done', ms: Date.now() - t0, timedOut: true });
      self.close();          /* drop the wedged interpreter */
    }, timeoutMs);

    pyPromise.then(function (p) {
      return p.runPythonAsync(prepareStdin(msg.stdin)).then(function () {
        return p.runPythonAsync(String(msg.code || ''));
      });
    }).then(function () {
      if (finished) return;
      finished = true;
      clearTimeout(watchdog);
      post({ type: 'done', ms: Date.now() - t0 });
    }).catch(function (e) {
      if (finished) return;
      finished = true;
      clearTimeout(watchdog);
      post({ type: 'error', text: (e && e.message ? e.message : String(e)) });
      post({ type: 'done', ms: Date.now() - t0 });
    });
  }
};

self.onerror = function (m) { post({ type: 'error', text: String(m) }); };
