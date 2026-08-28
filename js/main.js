/* FRONTIER — bootstrap: wire layout + dispatch to per-page modules */
(function () {
  'use strict';
  /* capture errors for support/debug */
  window.addEventListener('error', function (e) { (window.__errs = window.__errs || []).push((e.message || 'error') + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno); });
  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason || {};
    var stack = (r.stack || '').split('\n').slice(0, 3).join(' << ');
    (window.__errs = window.__errs || []).push('promise:' + (r.message || e.reason) + ' :: ' + stack);
  });

  /* generic newsletter forms anywhere */
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f.matches('[data-news-form]')) {
      e.preventDefault();
      UI.toast('success', 'You are subscribed!', 'Welcome to the FRONTIER insider list.');
      f.reset();
    }
  }, true);

  var ready = function (fn) { document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn); };
  ready(function () {
    var page = document.body.dataset.page || '';
    UI.initDelegates();
    try { FRLAYOUT.init(page); }
    catch (e) { console.error('layout init failed', e); }
  });
})();
