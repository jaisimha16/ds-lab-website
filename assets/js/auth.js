/* =====================================================================
   auth.js — Firebase Authentication wrapper.

   Exposes window.DS_Auth. It is the ONLY thing the rest of the app asks
   "is an administrator signed in?" — but it is NOT the security boundary.
   The security boundary is firestore.rules, which runs on Google's
   servers and rejects any write that is not from the administrator's
   account (the one UID you put in firestore.rules).

   No password, key or secret lives in this file.
   ===================================================================== */
window.DS_Auth = (function () {
  'use strict';

  var cfg = window.DS_FIREBASE_CONFIG || null;
  var auth = null;
  var currentUser = null;
  var observers = [];
  var initialized = false;
  var resolved = false;
  var readyCbs = [];

  /* configured only when a plausible Firebase web config is present */
  function isConfigured() {
    return !!(cfg && cfg.apiKey && cfg.projectId && cfg.appId);
  }

  function notify() {
    observers.forEach(function (cb) {
      try { cb(isAdmin()); } catch (e) { /* observer errors must not break auth */ }
    });
  }

  function markReady() {
    if (resolved) return;
    resolved = true;
    var cbs = readyCbs.slice();
    readyCbs = [];
    cbs.forEach(function (cb) { try { cb(); } catch (e) {} });
  }

  function onReady(cb) {
    if (typeof cb !== 'function') return;
    if (resolved) cb();
    else readyCbs.push(cb);
  }

  function init() {
    if (initialized) return;
    initialized = true;

    if (!isConfigured()) { markReady(); return; }

    if (!window.firebase || typeof window.firebase.initializeApp !== 'function') {
      console.warn('[DS_Auth] Firebase SDK did not load — admin login disabled.');
      markReady();
      return;
    }

    try {
      if (!window.firebase.apps || !window.firebase.apps.length) {
        window.firebase.initializeApp(cfg);
      }
      auth = window.firebase.auth();
    } catch (e) {
      console.error('[DS_Auth] init failed', e);
      markReady();
      return;
    }

    auth.onAuthStateChanged(function (user) {
      currentUser = user || null;
      notify();
      markReady();
    }, function (err) {
      console.warn('[DS_Auth] auth state error', err && err.message);
      markReady();
    });
  }

  function signIn(email, password) {
    if (!auth) return Promise.reject(new Error('Authentication is not configured yet.'));
    return auth.signInWithEmailAndPassword(String(email || '').trim(), password);
  }

  function signOut() {
    if (!auth) return Promise.resolve();
    return auth.signOut();
  }

  /* Only the administrator has an account (public sign-up is disabled in
     the Firebase console), so "signed in" === "administrator". Firestore
     rules independently re-check the UID on every write. */
  function isAdmin() { return !!currentUser; }
  function user() { return currentUser; }
  function email() { return currentUser ? currentUser.email : null; }
  function uid() { return currentUser ? currentUser.uid : null; }

  function onChange(cb) {
    if (typeof cb !== 'function') return;
    observers.push(cb);
    if (resolved) { try { cb(isAdmin()); } catch (e) {} }
  }

  return {
    init: init,
    onReady: onReady,
    isConfigured: isConfigured,
    signIn: signIn,
    signOut: signOut,
    onChange: onChange,
    isAdmin: isAdmin,
    user: user,
    email: email,
    uid: uid
  };
})();
