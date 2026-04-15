(function () {
  'use strict';

  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    // Assign stagger index per parent so siblings animate in sequence.
    var groups = new Map();
    items.forEach(function (el) {
      var parent = el.parentElement;
      var arr = groups.get(parent) || [];
      arr.push(el);
      groups.set(parent, arr);
    });
    groups.forEach(function (siblings) {
      siblings.forEach(function (el, i) {
        el.style.setProperty('--i', Math.min(i, 8));
      });
    });

    if (prefersReduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('revealed'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    items.forEach(function (el) { observer.observe(el); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
