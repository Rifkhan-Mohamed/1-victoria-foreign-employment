/* Local, opt-in experiment demonstration. No network requests or personal data. */
(function () {
  'use strict';
  var KEY = 'victoria-experiment-hero-cta-v1';
  var query = new URLSearchParams(location.search);
  var state = null;
  function read() {
    try {
      var value = JSON.parse(sessionStorage.getItem(KEY));
      if (value && value.id === 'hero-cta-v1' && ['A', 'B'].includes(value.variant) &&
          ['random', 'forced'].includes(value.assignment)) {
        return { id: value.id, variant: value.variant, assignment: value.assignment,
          events: Object.fromEntries(['exposure', 'hero_click', 'requirement_review', 'handoff_attempt']
            .map(function (name) { return [name, value.events?.[name] === true]; })) };
      }
    } catch (error) { /* An unavailable store keeps the default control. */ }
    return null;
  }
  function save() {
    try { sessionStorage.setItem(KEY, JSON.stringify(state)); return true; }
    catch (error) { return false; }
  }
  if (query.get('experiment') === 'off') {
    try { sessionStorage.removeItem(KEY); } catch (error) { /* No stored state. */ }
  } else {
    state = read();
    if (query.get('experiment') === 'hero-cta') {
      var forced = query.get('variant');
      if (forced === 'A' || forced === 'B') {
        // Explicit QA selection starts a fresh forced run, excluded from real analysis.
        state = { id: 'hero-cta-v1', variant: forced, assignment: 'forced', events: {} };
      } else if (!state) {
        var draw = new Uint32Array(1);
        crypto.getRandomValues(draw);
        state = { id: 'hero-cta-v1', variant: draw[0] < 2147483648 ? 'A' : 'B', assignment: 'random', events: {} };
      }
      if (!save()) state = null;
    }
  }
  function record(name) {
    if (!state || !['exposure', 'hero_click', 'requirement_review', 'handoff_attempt'].includes(name)) return;
    if (name !== 'exposure' && !state.events.exposure) return;
    state.events[name] = true; // One event of each kind per enrolled tab session.
    save();
  }
  window.victoriaExperiment = Object.freeze({
    record: record,
    report: function () { return state ? JSON.parse(JSON.stringify(state)) : null; },
    reset: function () {
      try { sessionStorage.removeItem(KEY); } catch (error) { /* Storage unavailable. */ }
      state = null;
      var label = document.querySelector('[data-cta-label]');
      if (label) label.textContent = 'Build your requirement';
      delete document.documentElement.dataset.experimentVariant;
    }
  });
  if (!state) return;
  document.documentElement.dataset.experimentVariant = state.variant;
  var cta = document.getElementById('hero-cta');
  if (!cta) return;
  if (state.variant === 'B') cta.querySelector('[data-cta-label]').textContent = 'Start your workforce enquiry';
  cta.addEventListener('click', function () { record('hero_click'); });
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      if (entries.some(function (entry) { return entry.isIntersecting && entry.intersectionRatio >= 0.5; })) {
        record('exposure'); observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(cta);
  }
})();
