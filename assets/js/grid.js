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
        ' href="/project?p=' + meta.slug + '"' +
        ' aria-label="View ' + escapeAttr(meta.title) + '">' +
        '<div class="item-image-wrapper">' +
          (item.thumbnail_video
            ? '<video src="' + escapeAttr(item.thumbnail_video) + '" autoplay muted loop playsinline' +
              (item.thumbnail_video_clip_start ? ' data-clip-start="' + (+item.thumbnail_video_clip_start) + '"' : '') +
              (item.thumbnail_video_clip_end ? ' data-clip-end="' + (+item.thumbnail_video_clip_end) + '"' : '') +
              '></video>'
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

    /* Clip video to start/end range if specified */
    if (item.thumbnail_video_clip_start || item.thumbnail_video_clip_end) {
      var vid = el.querySelector('video');
      if (vid) {
        var clipStart = item.thumbnail_video_clip_start ? +item.thumbnail_video_clip_start : 0;
        var clipEnd   = item.thumbnail_video_clip_end   ? +item.thumbnail_video_clip_end   : null;
        vid.addEventListener('loadedmetadata', function () {
          vid.currentTime = clipStart;
        });
        vid.addEventListener('timeupdate', function () {
          if (vid.currentTime < clipStart) vid.currentTime = clipStart;
          if (clipEnd !== null && vid.currentTime >= clipEnd) vid.currentTime = clipStart;
        });
      }
    }
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
