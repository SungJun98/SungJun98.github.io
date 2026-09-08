(function () {
  'use strict';

  function scrollBehavior() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  }

  function animatePanel(panel) {
    if (scrollBehavior() === 'auto' || !panel.animate) return;
    panel.animate([
      { opacity: 0.25, transform: 'translateY(10px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 350, easing: 'cubic-bezier(0.2, 0.65, 0.3, 1)' });
  }

  function initResearch() {
    var section = document.getElementById('research');
    if (!section) return;
    var compass = section.querySelector('.philosophy-compass');
    var nodes = Array.prototype.slice.call(section.querySelectorAll('.axis-node'));
    var activeIndex = 0;

    function selectAxis(index, focus) {
      activeIndex = (index + nodes.length) % nodes.length;
      var selected = nodes[activeIndex];
      var axis = selected.dataset.axis;
      var changed = compass.dataset.activeAxis !== axis;

      nodes.forEach(function (node) {
        var active = node === selected;
        node.classList.toggle('active', active);
        node.setAttribute('aria-selected', String(active));
        node.tabIndex = active ? 0 : -1;
        document.getElementById(node.getAttribute('aria-controls')).hidden = !active;
      });
      section.querySelectorAll('.philosophy-connection').forEach(function (connection) {
        connection.classList.toggle('active', connection.dataset.axis === axis);
      });
      compass.dataset.activeAxis = axis;
      if (changed) animatePanel(document.getElementById(selected.getAttribute('aria-controls')));
      if (focus) selected.focus({ preventScroll: true });
    }

    nodes.forEach(function (node, index) {
      node.addEventListener('click', function () { selectAxis(index, false); });
      node.addEventListener('keydown', function (event) {
        var target;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = activeIndex + 1;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = activeIndex - 1;
        if (event.key === 'Home') target = 0;
        if (event.key === 'End') target = nodes.length - 1;
        if (target === undefined) return;
        event.preventDefault();
        selectAxis(target, true);
      });
    });
    section.querySelector('.philosophy-prev').addEventListener('click', function () { selectAxis(activeIndex - 1, false); });
    section.querySelector('.philosophy-next').addEventListener('click', function () { selectAxis(activeIndex + 1, false); });

    // Decorative motion runs only while the section is on screen.
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { section.classList.toggle('is-in-view', entry.isIntersecting); });
      }, { threshold: 0.1 });
      observer.observe(section);
    }
  }

  function initCareer() {
    var timeline = document.getElementById('career-timeline');
    if (!timeline) return;

    var controls = document.querySelector('.career-controls');
    var previous = controls.querySelector('.career-prev');
    var next = controls.querySelector('.career-next');
    var stage = timeline.closest('.career-stage');
    var pinnedToLatest = true;
    var wheelTimer;

    function updateControls() {
      var maxScroll = timeline.scrollWidth - timeline.clientWidth;
      previous.disabled = timeline.scrollLeft <= 1;
      next.disabled = timeline.scrollLeft >= maxScroll - 1;
      pinnedToLatest = next.disabled;
      stage.classList.toggle('at-start', previous.disabled);
      stage.classList.toggle('at-end', next.disabled);
      stage.style.setProperty('--career-progress', maxScroll > 0 ? Math.min(1, Math.max(0, timeline.scrollLeft / maxScroll)) : 1);
    }

    function showLatest() {
      timeline.scrollLeft = timeline.scrollWidth - timeline.clientWidth;
      updateControls();
    }

    function move(direction) {
      var entries = timeline.querySelectorAll('.career-entry');
      var step = entries.length > 1 ? entries[1].offsetLeft - entries[0].offsetLeft : timeline.clientWidth;
      timeline.scrollBy({ left: direction * step, behavior: scrollBehavior() });
    }

    previous.addEventListener('click', function () { move(-1); });
    next.addEventListener('click', function () { move(1); });
    timeline.addEventListener('scroll', updateControls, { passive: true });
    window.addEventListener('resize', function () {
      if (pinnedToLatest) showLatest();
      else updateControls();
    });

    timeline.addEventListener('keydown', function (event) {
      if (event.target !== timeline) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        move(event.key === 'ArrowRight' ? 1 : -1);
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        timeline.scrollTo({ left: event.key === 'Home' ? 0 : timeline.scrollWidth, behavior: scrollBehavior() });
      }
    });

    // Let touchpads scroll natively; translate a mouse wheel only while the row can move.
    timeline.addEventListener('wheel', function (event) {
      if (event.ctrlKey || event.metaKey || event.shiftKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      var unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? timeline.clientWidth : 1;
      var delta = event.deltaY * unit;
      var maxScroll = timeline.scrollWidth - timeline.clientWidth;
      if ((delta > 0 && timeline.scrollLeft >= maxScroll - 1) || (delta < 0 && timeline.scrollLeft <= 1)) return;

      event.preventDefault();
      timeline.classList.add('is-wheel-scrolling');
      timeline.scrollLeft += delta;
      window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(function () {
        timeline.classList.remove('is-wheel-scrolling');
      }, 180);
    }, { passive: false });

    // Chronological DOM order keeps keyboard navigation natural; start at the newest end.
    showLatest();
    if (document.fonts) {
      document.fonts.ready.then(function () { if (pinnedToLatest) showLatest(); });
    }
    controls.hidden = false;
  }

  function initPublications() {
    var toggle = document.getElementById('publications-toggle');
    var selected = document.getElementById('selected-publications');
    var archive = document.getElementById('publication-archive');
    var label = document.getElementById('publications-view-label');
    if (!toggle || !selected || !archive) return;

    var papers = Array.prototype.slice.call(archive.querySelectorAll('[data-selected-order]'));
    papers.sort(function (a, b) { return Number(a.dataset.selectedOrder) - Number(b.dataset.selectedOrder); });
    papers.forEach(function (paper) {
      var card = document.createElement('article');
      card.className = 'publication-featured reveal';
      // The archive is the single source for figures, summaries, authors, and links.
      Array.prototype.forEach.call(paper.children, function (child) {
        card.appendChild(child.cloneNode(true));
      });
      var title = card.querySelector('h5');
      var heading = document.createElement('h4');
      while (title.firstChild) heading.appendChild(title.firstChild);
      title.replaceWith(heading);
      selected.appendChild(card);
    });

    function setView(showAll) {
      toggle.setAttribute('aria-checked', String(showAll));
      toggle.querySelector('.publications-switch-state').textContent = showAll ? 'On' : 'Off';
      selected.hidden = showAll;
      archive.hidden = !showAll;
      label.textContent = showAll ? 'All publications' : 'Selected papers';
      if (!showAll) animatePanel(selected);
      if (window.jQuery) window.jQuery('body').scrollspy('refresh');
    }

    toggle.addEventListener('click', function () {
      setView(toggle.getAttribute('aria-checked') !== 'true');
    });

    if (papers.length) {
      toggle.hidden = false;
      setView(false);
    }

    function revealPublication(id) {
      var paper = document.getElementById(id);
      if (!paper || !archive.contains(paper)) return;
      setView(true);

      function focusPaper() {
        paper.classList.add('revealed');
        paper.focus({ preventScroll: true });
        paper.scrollIntoView({ block: 'start', behavior: scrollBehavior() });
      }

      var group = paper.closest('.collapse, .collapsing');
      if (group && window.jQuery && window.jQuery.fn.collapse && !group.classList.contains('show')) {
        var $group = window.jQuery(group);
        if (group.classList.contains('collapsing')) {
          $group.off('.publicationLink').on('shown.bs.collapse.publicationLink hidden.bs.collapse.publicationLink', function (event) {
            $group.off('.publicationLink');
            if (event.type === 'hidden') $group.one('shown.bs.collapse', focusPaper).collapse('show');
            else focusPaper();
          });
        } else {
          $group.one('shown.bs.collapse', focusPaper).collapse('show');
        }
      } else {
        if (group) group.classList.add('show');
        window.requestAnimationFrame(focusPaper);
      }
    }

    document.querySelectorAll('[data-publication-target]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        if (window.location.hash !== link.hash) window.history.pushState(null, '', link.hash);
        revealPublication(link.dataset.publicationTarget);
      });
    });

    function revealLinkedPublication() {
      var id = window.location.hash.slice(1);
      if (id) revealPublication(id);
    }
    window.addEventListener('hashchange', revealLinkedPublication);
    revealLinkedPublication();
  }

  initResearch();
  initCareer();
  initPublications();
})();
