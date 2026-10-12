/* =====================================================================
   store.js — persistence + CRUD for experiments, modules and experiment
   meta (aim / theory / algorithm / output / result).

   The project has no backend, so this is the "database" layer:
     • data.js holds the default (seed) content
     • any add / edit / delete is written to localStorage
     • on the next page load the saved copy is applied over the defaults

   It does not touch the DOM — app.js renders, this file only stores.
   Exposed as window.DS_Store.
   ===================================================================== */
window.DS_Store = (function () {
  'use strict';

  var LS_KEY = 'dslab-data-v1';
  var LAB = window.LAB = window.LAB || {};

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* the untouched seed data from data.js, kept for "reset" */
  var seed = {
    experiments: clone(LAB.experiments || []),
    modules: clone(LAB.modules || []),
    meta: clone(LAB.meta || {})
  };

  function readSaved() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  var saved = readSaved();
  var hasSaved = !!(saved && saved.experiments && saved.modules);
  if (hasSaved) {
    LAB.experiments = saved.experiments;
    LAB.modules = saved.modules;
    LAB.meta = saved.meta || {};
  }

  function persist() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        experiments: LAB.experiments || [],
        modules: LAB.modules || [],
        meta: LAB.meta || {}
      }));
      hasSaved = true;
      return true;
    } catch (e) {
      return false;
    }
  }

  function experiments() { return LAB.experiments || []; }
  function modules() { return LAB.modules || []; }
  function meta() { return LAB.meta || (LAB.meta = {}); }

  function nextId() {
    var max = 0;
    experiments().forEach(function (e) {
      var n = parseInt(e.id, 10);
      if (!isNaN(n) && n > max) max = n;
    });
    return max + 1;
  }

  function assignModule(expId, moduleId) {
    modules().forEach(function (m) {
      m.expIds = (m.expIds || []).filter(function (x) {
        return String(x) !== String(expId);
      });
    });
    var target = null;
    modules().forEach(function (m) {
      if (String(m.id) === String(moduleId)) target = m;
    });
    if (target) {
      target.expIds = target.expIds || [];
      if (target.expIds.map(String).indexOf(String(expId)) < 0) target.expIds.push(expId);
    }
  }

  /* data = { id, name, summary, sections, moduleId, meta:{...} } */
  function addExperiment(data) {
    var m = data.meta || {};
    delete data.meta;
    if (data.id == null || data.id === '') data.id = nextId();
    data.id = parseInt(data.id, 10);
    data.createdAt = Date.now();
    var moduleId = data.moduleId;
    delete data.moduleId;
    experiments().push(data);
    meta()[data.id] = m;
    if (moduleId != null && moduleId !== '') assignModule(data.id, moduleId);
    persist();
    return data;
  }

  function updateExperiment(oldId, data) {
    var m = data.meta || {};
    delete data.meta;
    data.id = parseInt(data.id, 10);
    var moduleId = data.moduleId;
    delete data.moduleId;

    var list = experiments();
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].id) === String(oldId)) {
        var created = list[i].createdAt;
        var oldKey = list[i].id;
        if (String(oldKey) !== String(data.id)) {
          if (meta()[oldKey]) { meta()[data.id] = meta()[oldKey]; delete meta()[oldKey]; }
          modules().forEach(function (mod) {
            mod.expIds = (mod.expIds || []).map(function (x) {
              return String(x) === String(oldId) ? data.id : x;
            });
          });
        }
        list[i] = data;
        if (created) list[i].createdAt = created;
        break;
      }
    }
    meta()[data.id] = m;
    if (moduleId != null && moduleId !== '') assignModule(data.id, moduleId);
    persist();
    return data;
  }

  function deleteExperiment(id) {
    LAB.experiments = experiments().filter(function (e) { return String(e.id) !== String(id); });
    if (meta()[id]) delete meta()[id];
    modules().forEach(function (m) {
      m.expIds = (m.expIds || []).filter(function (x) { return String(x) !== String(id); });
    });
    persist();
  }

  function resetAll() {
    try { localStorage.removeItem(LS_KEY); } catch (e) {}
    LAB.experiments = clone(seed.experiments);
    LAB.modules = clone(seed.modules);
    LAB.meta = clone(seed.meta);
    hasSaved = false;
  }

  function toolCount() {
    var n = 0;
    (LAB.tools || []).forEach(function (cat) { n += (cat.items || []).length; });
    return n;
  }

  return {
    experiments: experiments,
    modules: modules,
    meta: meta,
    nextId: nextId,
    assignModule: assignModule,
    addExperiment: addExperiment,
    updateExperiment: updateExperiment,
    deleteExperiment: deleteExperiment,
    resetAll: resetAll,
    toolCount: toolCount,
    hasSaved: function () { return hasSaved; }
  };
})();
