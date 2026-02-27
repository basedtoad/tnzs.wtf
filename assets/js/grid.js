/* ==========================================================================
   grid.js — Load projects and render masonry grid
   ========================================================================== */

(async function () {
  'use strict';

  const grid = document.getElementById('masonry-grid');
  if (!grid) return;

  /* --- Load data --- */
  let projects;
  try {
    const res = await fetch('/data/projects.json');
    if (!res.ok) throw new Error('Fetch failed');
    projects = await res.json();
  } catch (err) {
    grid.innerHTML = '<p class="grid-error">' + (window.tnzsLang ? window.tnzsLang.t('grid.error') : 'Could not load projects.') + '</p>';
    return;
  }

  /* --- Filter to published projects, shuffled randomly on each load --- */
  const published = projects
    .filter(function (p) { return p.project_meta.status === 'published'; });

  for (let i = published.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = published[i]; published[i] = published[j]; published[j] = tmp;
  }

  if (published.length === 0) {
    grid.innerHTML = '<p class="grid-empty">' + (window.tnzsLang ? window.tnzsLang.t('grid.empty') : 'No projects yet.') + '</p>';
    return;
  }

  /* --- Render grid items --- */
  published.forEach(function (project) {
    const meta = project.project_meta;
    const item = project.grid_item;

    const el = document.createElement('div');
    el.className = 'grid-item';
    el.setAttribute('role', 'listitem');

    el.innerHTML =
      '<a class="item-link"' +
        ' href="/project.html?p=' + meta.slug + '"' +
        ' aria-label="View ' + escapeAttr(meta.title) + '">' +
        '<div class="item-image-wrapper">' +
          (item.thumbnail_video
            ? '<video src="' + escapeAttr(item.thumbnail_video) + '" autoplay muted loop playsinline></video>'
            : '<img' +
                ' src="' + escapeAttr(item.thumbnail) + '"' +
                ' alt="' + escapeAttr(item.thumbnail_alt) + '"' +
                ' loading="lazy"' +
                ' decoding="async"' +
              '>') +
        '</div>' +
        '<div class="item-overlay" aria-hidden="true">' +
          '<span class="item-title">' + escapeHTML(meta.title) + '</span>' +
        '</div>' +
      '</a>';

    grid.appendChild(el);
  });

  /* --- Helpers --- */
  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function escapeAttr(str) {
    return String(str).replace(/"/g, '&quot;');
  }

})();
