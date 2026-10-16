/* =====================================================================
   store.js — the data-access layer (the site's "database").

   READ  : Firestore document  site/content  — world-readable, so every
           visitor sees the real content.
   WRITE : the same document — allowed only for the administrator account,
           enforced SERVER-SIDE by firestore.rules on Google's servers.
           This file also refuses to write unless an admin is signed in,
           but that is a convenience, not the security boundary.

   When Firebase is not configured (window.DS_FIREBASE_CONFIG === null)
   the site stays in read-only "static" mode: content comes from data.js
   and nobody — not even you — can edit through the website.

   PUBLIC API (mutating methods return a Promise):
     ready(cb)                    run cb once content has loaded
     experiments() cards          LAB.experiments
     modules()                    LAB.modules
     meta()                       LAB.meta
     student()                    LAB.student
     nextId()                     next free experiment number
     assignModule(expId, modId)   re-group an experiment
     addExperiment(data)          → Promise
     updateExperiment(id, data)   → Promise
     deleteExperiment(id)         → Promise
     saveStudent(obj)             → Promise
     resetStudent()               → Promise
     resetAll()                   → Promise
     toolCount()                  number
     hasSaved()                   boolean
   ===================================================================== */
window.DS_Store = (function () {
  'use strict';

  var LAB = window.LAB = window.LAB || {};
  var AUTH = window.DS_Auth || null;

  var COLLECTION = 'site';
  var DOC_ID = 'content';

  var seed = {
    student: clone(LAB.student || {}),
    experiments: clone(LAB.experiments || []),
    modules: clone(LAB.modules || []),
    meta: clone(LAB.meta || {})
  };

  var hasSaved = false;
  var resolved = false;
  var readyCbs = [];

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function db() {
    if (window.firebase && window.firebase.apps && window.firebase.apps.length &&
        typeof window.firebase.firestore === 'function') {
      return window.firebase.firestore();
    }
    return null;
  }

  function configured() {
    return !!(AUTH && AUTH.isConfigured && AUTH.isConfigured());
  }

  /* ---------------- load ---------------- */

  function applyRemote(data) {
    if (!data) return;
    if (Array.isArray(data.experiments)) LAB.experiments = data.experiments;
    if (Array.isArray(data.modules)) LAB.modules = data.modules;
    if (data.meta && typeof data.meta === 'object') LAB.meta = data.meta;
    if (data.student && typeof data.student === 'object') LAB.student = data.student;
    // Preserve remote/user data and add shipped experiments that are missing.
    (seed.experiments || []).forEach(function (se) {
      var exists = (LAB.experiments || []).some(function (e) { return String(e.id) === String(se.id); });
      if (!exists) LAB.experiments.push(JSON.parse(JSON.stringify(se)));
    });
    if (seed.meta) {
      Object.keys(seed.meta).forEach(function (k) {
        if (!LAB.meta[k]) LAB.meta[k] = JSON.parse(JSON.stringify(seed.meta[k]));
      });
    }
    if (Array.isArray(data.experiments) || Array.isArray(data.modules)) hasSaved = true;
  }

  function finishReady() {
    if (resolved) return;
    resolved = true;
    var cbs = readyCbs.slice();
    readyCbs = [];
    cbs.forEach(function (cb) { try { cb(); } catch (e) {} });
  }

  function ready(cb) {
    if (typeof cb === 'function') {
      if (resolved) cb();
      else readyCbs.push(cb);
    }
    if (resolved) return;

    var store = db();
    if (!store) { finishReady(); return; }

    store.collection(COLLECTION).doc(DOC_ID).get().then(function (snap) {
      if (snap && snap.exists) applyRemote(snap.data());
    }).catch(function (err) {
      console.warn('[DS_Store] could not load content from Firestore:', err && err.message);
    }).then(finishReady, finishReady);
  }

  /* ---------------- helpers ---------------- */

  function experiments() { return LAB.experiments || []; }
  function modules() { return LAB.modules || []; }
  function meta() { return LAB.meta || (LAB.meta = {}); }
  function student() { return LAB.student || (LAB.student = {}); }

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

  function toolCount() {
    var n = 0;
    (LAB.tools || []).forEach(function (cat) { n += (cat.items || []).length; });
    return n;
  }

  /* ---------------- write guard + persistence ---------------- */

  function permissionError() {
    var err = new Error('Only the administrator can make changes. Please sign in.');
    err.code = 'permission-denied';
    return err;
  }

  function requireAdmin() {
    if (!configured()) {
      return new Error('The editable backend is not configured yet. See the Admin setup steps in README.md.');
    }
    if (!AUTH || !AUTH.isAdmin || !AUTH.isAdmin()) return permissionError();
    return null;
  }

  function snapshot() {
    return {
      student: student(),
      experiments: experiments(),
      modules: modules(),
      meta: meta(),
      updatedAt: Date.now(),
      updatedBy: (AUTH && AUTH.uid && AUTH.uid()) || null
    };
  }

  function backup() {
    return {
      student: clone(LAB.student || {}),
      experiments: clone(LAB.experiments || []),
      modules: clone(LAB.modules || []),
      meta: clone(LAB.meta || {})
    };
  }

  function restore(b) {
    LAB.student = b.student;
    LAB.experiments = b.experiments;
    LAB.modules = b.modules;
    LAB.meta = b.meta;
  }

  function commit() {
    var guard = requireAdmin();
    if (guard) return Promise.reject(guard);
    var store = db();
    if (!store) return Promise.reject(permissionError());
    return store.collection(COLLECTION).doc(DOC_ID).set(snapshot()).then(function () {
      hasSaved = true;
      return true;
    });
  }

  /* apply a synchronous mutation; persist it; roll back if the server
     rejects the write (e.g. rules changed, offline) or the mutation throws */
  function persist(mutate, value) {
    var b = backup();
    try {
      mutate();
    } catch (e) {
      restore(b);
      return Promise.reject(e);
    }
    return commit().then(function () {
      return value;
    }, function (err) {
      restore(b);
      throw err;
    });
  }

  /* ---------------- experiment CRUD ---------------- */

  /* data = { id, name, summary, sections, moduleId, meta:{...} } */
  function addExperiment(data) {
    var guard = requireAdmin();
    if (guard) return Promise.reject(guard);
    data = clone(data);

    return persist(function () {
      var m = data.meta || {};
      delete data.meta;
      if (data.id == null || data.id === '') data.id = nextId();
      data.id = parseInt(data.id, 10);
      data.createdAt = Date.now();
      var moduleId = data.moduleId;
      delete data.moduleId;

      LAB.experiments = experiments().slice();
      LAB.experiments.push(data);
      meta()[data.id] = m;
      if (moduleId != null && moduleId !== '') assignModule(data.id, moduleId);
      return data;
    }, data);
  }

  function updateExperiment(oldId, data) {
    var guard = requireAdmin();
    if (guard) return Promise.reject(guard);
    data = clone(data);

    return persist(function () {
      var m = data.meta || {};
      delete data.meta;
      data.id = parseInt(data.id, 10);
      var moduleId = data.moduleId;
      delete data.moduleId;

      var list = experiments().slice();
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
      LAB.experiments = list;
      meta()[data.id] = m;
      if (moduleId != null && moduleId !== '') assignModule(data.id, moduleId);
      return data;
    }, data);
  }

  function deleteExperiment(id) {
    var guard = requireAdmin();
    if (guard) return Promise.reject(guard);

    return persist(function () {
      LAB.experiments = experiments().filter(function (e) { return String(e.id) !== String(id); });
      if (meta()[id]) delete meta()[id];
      modules().forEach(function (m) {
        m.expIds = (m.expIds || []).filter(function (x) { return String(x) !== String(id); });
      });
      return true;
    }, true);
  }

  /* ---------------- student ID card ---------------- */

  function saveStudent(obj) {
    var guard = requireAdmin();
    if (guard) return Promise.reject(guard);
    obj = clone(obj);
    return persist(function () {
      LAB.student = obj;
      return obj;
    }, obj);
  }

  function resetStudent() {
    var guard = requireAdmin();
    if (guard) return Promise.reject(guard);
    return persist(function () {
      LAB.student = clone(seed.student);
      return LAB.student;
    }, LAB.student);
  }

  function deleteStudent() {
    var guard = requireAdmin();
    if (guard) return Promise.reject(guard);
    return persist(function () {
      LAB.student = {};
      return true;
    }, true);
  }

  /* ---------------- reset everything ---------------- */

  function resetAll() {
    var guard = requireAdmin();
    if (guard) return Promise.reject(guard);
    return persist(function () {
      LAB.experiments = clone(seed.experiments);
      LAB.modules = clone(seed.modules);
      LAB.meta = clone(seed.meta);
      return true;
    }, true);
  }

  return {
    ready: ready,
    experiments: experiments,
    modules: modules,
    meta: meta,
    student: student,
    nextId: nextId,
    assignModule: assignModule,
    addExperiment: addExperiment,
    updateExperiment: updateExperiment,
    deleteExperiment: deleteExperiment,
    saveStudent: saveStudent,
    resetStudent: resetStudent,
    deleteStudent: deleteStudent,
    resetAll: resetAll,
    toolCount: toolCount,
    hasSaved: function () { return hasSaved; }
  };
})();
