/* runner.js
   Page-side controller for the real Python runtime (pyodide-worker.js).

   Exposes window.DS_Runner.run(code, hostEl, buttonEl): it boots CPython on
   first use, streams stdout / stderr / status lines and every matplotlib
   figure into the given output element, and re-enables the button when done.
   Only one script runs at a time. */
'use strict';

(function () {
  var worker = null;
  var ready = false;
  var running = false;
  var queued = null;              // code waiting for the interpreter to boot
  var current = null;             // { host, cons, figs, label, button }

  function workerURL() {
    var base = document.baseURI || window.location.href;
    return new URL('assets/js/pyodide-worker.js', base).href;
  }

  function prepare(host, button) {
    host.hidden = false;
    host.innerHTML =
      '<div class="run-title">Output</div>' +
      '<div class="run-status"><span class="run-dot"></span>' +
        '<span class="run-label">starting…</span></div>' +
      '<pre class="run-console"></pre>' +
      '<div class="run-figures"></div>';
    current = {
      host: host,
      cons: host.querySelector('.run-console'),
      figs: host.querySelector('.run-figures'),
      label: host.querySelector('.run-label'),
      button: button
    };
    if (button) { button.disabled = true; button.classList.add('is-running'); }
  }

  function releaseButton() {
    if (current && current.button) {
      current.button.disabled = false;
      current.button.classList.remove('is-running');
    }
  }

  function setLabel(text) { if (current && current.label) current.label.textContent = text; }

  function write(kind, text) {
    if (!current || !current.cons) return;
    var span = document.createElement('span');
    span.className = 'c-' + kind;
    span.textContent = (text == null ? '' : text) + '\n';
    current.cons.appendChild(span);
    current.cons.scrollTop = current.cons.scrollHeight;
  }

  function writeFigure(b64) {
    if (!current || !current.figs) return;
    var img = document.createElement('img');
    img.className = 'run-fig';
    img.alt = 'Figure produced by the Python code';
    img.loading = 'lazy';
    img.src = 'data:image/png;base64,' + b64;
    current.figs.appendChild(img);
  }

  function finish() {
    running = false;
    releaseButton();
    current = null;
  }

  function onMessage(ev) {
    var m = ev.data || {};
    switch (m.type) {
      case 'status':
        write('sys', m.text);
        setLabel(m.text);
        break;
      case 'ready':
        ready = true;
        write('sys', 'CPython ' + (m.version || '') + ' ready.');
        if (queued) {
          var code = queued; queued = null;
          send(code);
        } else {
          setLabel('CPython ' + (m.version || '') + ' ready');
        }
        break;
      case 'out':
        write('out', m.text);
        break;
      case 'err':
        write('err', m.text);
        break;
      case 'figure':
        writeFigure(m.b64);
        break;
      case 'done':
        setLabel('finished in ' + m.ms + ' ms');
        finish();
        break;
      case 'error':
        write('err', m.text);
        setLabel('error');
        finish();
        break;
    }
  }

  function onWorkerError(e) {
    write('err', 'Worker error: ' + (e && e.message ? e.message : 'unknown'));
    setLabel('worker error');
    finish();
  }

  function ensureWorker() {
    if (worker) return true;
    try {
      worker = new Worker(workerURL());
    } catch (e) {
      worker = null;
      return false;
    }
    worker.onmessage = onMessage;
    worker.onerror = onWorkerError;
    return true;
  }

  function send(code) {
    write('sys', '— run started —');
    running = true;
    setLabel('running…');
    worker.postMessage({ type: 'run', code: code });
  }

  function run(code, host, button) {
    if (!host) return;

    if (running) {
      host.hidden = false;
      host.innerHTML = '<div class="run-title">Output</div>' +
        '<div class="run-status"><span class="run-dot"></span>' +
        '<span class="run-label">a script is already running — wait for it to finish…</span></div>';
      return;
    }

    if (!ensureWorker()) {
      host.hidden = false;
      host.innerHTML = '<div class="run-title">Output</div>' +
        '<div class="run-status"><span class="run-dot"></span>' +
        '<span class="run-label">Python could not start — open this site over http, not as a file.</span></div>';
      return;
    }

    prepare(host, button);

    if (!ready) {
      queued = code;
      write('sys', 'Starting CPython. The first run downloads the runtime (~10 MB); ' +
        'it is cached after that.');
      return;
    }
    send(code);
  }

  window.DS_Runner = {
    run: run,
    isReady: function () { return ready; },
    isRunning: function () { return running; }
  };
})();
