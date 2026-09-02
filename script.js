/* VSR Edge docs — nav scrollspy, section filter, theme persistence. */

(function () {
  'use strict';

  /* ---------------------------------------------------------- theme ---- */

  var root = document.documentElement;
  var toggle = document.getElementById('themeToggle');
  var STORAGE_KEY = 'vsr-docs-theme';

  var saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* private mode */ }
  if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);

  toggle.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* ignore */ }
  });

  /* ------------------------------------------------------- scrollspy --- */

  var links = Array.prototype.slice.call(document.querySelectorAll('#nav a'));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  function setActive(id) {
    links.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + id);
    });
  }

  if ('IntersectionObserver' in window) {
    // Track every section's visibility, then pick the topmost visible one so
    // fast scrolling can't leave two entries highlighted.
    var visible = Object.create(null);

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visible[entry.target.id] = true;
        else delete visible[entry.target.id];
      });

      var current = null;
      for (var i = 0; i < sections.length; i++) {
        if (visible[sections[i].id]) { current = sections[i].id; break; }
      }
      if (current) setActive(current);
    }, { rootMargin: '-10% 0px -70% 0px', threshold: 0 });

    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ---------------------------------------------------- nav filtering --- */

  var search = document.getElementById('navSearch');

  search.addEventListener('input', function () {
    var q = search.value.trim().toLowerCase();
    links.forEach(function (a) {
      var match = !q || a.textContent.toLowerCase().indexOf(q) !== -1;
      a.parentElement.classList.toggle('hidden', !match);
    });
  });

  search.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { search.value = ''; search.dispatchEvent(new Event('input')); }
    if (e.key === 'Enter') {
      var first = links.filter(function (a) { return !a.parentElement.classList.contains('hidden'); })[0];
      if (first) first.click();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== search) {
      e.preventDefault();
      search.focus();
    }
  });

  /* ------------------------------------------------------ figure hint --- */

  var figures = Array.prototype.slice.call(document.querySelectorAll('.fig'));

  figures.forEach(function (fig) {
    var hint = document.createElement('div');
    hint.className = 'fig-hint';
    hint.textContent = '\u2194 scroll to see full diagram';
    fig.insertBefore(hint, fig.firstChild);
  });

  function syncFigureHints() {
    figures.forEach(function (fig) {
      fig.classList.toggle('is-scrollable', fig.scrollWidth > fig.clientWidth + 1);
    });
  }

  syncFigureHints();
  window.addEventListener('resize', syncFigureHints);
})();
