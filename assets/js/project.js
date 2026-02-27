/* ==========================================================================
   project.js — Load and render individual project page from URL slug
   ========================================================================== */

(async function () {
  'use strict';

  const contentEl = document.getElementById('project-content');
  if (!contentEl) return;

  /* --- i18n shorthand --- */
  function t(key) { return window.tnzsLang ? window.tnzsLang.t(key) : key; }

  /* --- Read slug from ?p=slug --- */
  const params = new URLSearchParams(window.location.search);
  const slug   = params.get('p');

  if (!slug) {
    window.location.href = '/';
    return;
  }

  /* --- Load projects data --- */
  let projects;
  try {
    const res = await fetch('/data/projects.json');
    if (!res.ok) throw new Error('Fetch failed');
    projects = await res.json();
  } catch (_) {
    contentEl.innerHTML = '<p style="text-align:center;padding:5rem 2rem;opacity:.4;">' + (window.tnzsLang ? window.tnzsLang.t('project.error') : 'Failed to load project data.') + '</p>';
    return;
  }

  const project = projects.find(function (p) { return p.project_meta.slug === slug; });
  if (!project) {
    window.location.href = '/';
    return;
  }

  const { project_meta, project_page } = project;
  const { page_design, hero, content, gallery, navigation } = project_page;

  /* --- Apply custom theme --- */
  applyTheme(page_design);

  /* --- Update <head> metadata --- */
  updateMeta(project_meta, content, hero);

  /* --- Resolve prev / next --- */
  const prevProject = navigation.prev_project
    ? projects.find(function (p) { return p.project_meta.id === navigation.prev_project; })
    : null;
  const nextProject = navigation.next_project
    ? projects.find(function (p) { return p.project_meta.id === navigation.next_project; })
    : null;

  /* --- Render --- */
  contentEl.innerHTML =
    renderHero(hero) +
    renderContent(project_meta, content) +
    renderEmbed(content) +
    renderGallery(gallery) +
    '</div>' +   /* closes .project-content */
    renderNavigation(prevProject, nextProject);

  contentEl.classList.remove('project-loading');

  /* Fit project title to viewport width on mobile */
  if (window.fitHeadingsMobile) window.fitHeadingsMobile();

  /* --- Apply current language to translated content fields --- */
  function applyContentLang(lang) {
    contentEl.querySelectorAll('[data-en][data-es]').forEach(function (el) {
      el.textContent = lang === 'es'
        ? el.getAttribute('data-es')
        : el.getAttribute('data-en');
    });
  }

  applyContentLang(window.tnzsLang ? window.tnzsLang.getLang() : 'en');

  document.addEventListener('tnzs:lang-change', function (e) {
    applyContentLang(e.detail.lang);
  });

  /* --- Hero: auto-blur if image is too small to cover without upscaling --- */
  const heroImg = contentEl.querySelector('.project-hero--full-bleed img');
  if (heroImg) {
    function applyHeroFit() {
      const cw = heroImg.parentElement.clientWidth;
      const ch = heroImg.parentElement.clientHeight;
      if (heroImg.naturalWidth < cw || heroImg.naturalHeight < ch) {
        heroImg.style.filter = 'blur(8px)';
        heroImg.style.transform = 'scale(1.05)';
      }
    }
    if (heroImg.complete && heroImg.naturalWidth) applyHeroFit();
    else heroImg.addEventListener('load', applyHeroFit);
  }

  /* ==========================================================================
     Render helpers
     ========================================================================== */

  function renderHero(hero) {
    if (!hero.hero_youtube && !hero.hero_video && !hero.hero_image) return '';

    if (hero.hero_youtube) {
      return (
        '<div class="project-hero project-hero--youtube">' +
          '<div class="project-hero__embed">' +
            '<iframe' +
              ' src="https://www.youtube.com/embed/' + escAttr(hero.hero_youtube) + '?rel=0"' +
              ' title="' + escAttr(hero.hero_alt) + '"' +
              ' frameborder="0"' +
              ' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"' +
              ' allowfullscreen' +
            '></iframe>' +
          '</div>' +
        '</div>'
      );
    }

    const blurCls = hero.hero_blur ? ' project-hero--blurred' : '';
    const cls = 'project-hero project-hero--' + (hero.layout === 'contained' ? 'contained' : 'full-bleed') + blurCls;
    if (hero.hero_video) {
      return (
        '<div class="' + cls + '">' +
          '<video autoplay muted loop playsinline>' +
            '<source src="' + esc(hero.hero_video) + '" type="video/mp4">' +
          '</video>' +
        '</div>'
      );
    }
    return (
      '<div class="' + cls + '">' +
        '<img src="' + esc(hero.hero_image) + '" alt="' + escAttr(hero.hero_alt) + '" loading="eager" decoding="async">' +
      '</div>'
    );
  }

  function renderContent(meta, content) {
    return (
      '<div class="project-content">' +
        '<a href="/" class="back-to-work">' +
          svg('arrow-left') +
          (window.tnzsLang ? window.tnzsLang.t('project.allWork') : 'All Work') +
        '</a>' +
        '<div class="project-info-grid">' +
          '<div class="project-title-area">' +
            '<p class="project-category">' + esc(meta.category) + '</p>' +
            '<h1 class="project-title">' + esc(meta.title) + '</h1>' +
            '<p class="project-subtitle-text" data-en="' + escAttr(meta.subtitle) + '" data-es="' + escAttr(meta.subtitle_es || meta.subtitle) + '">' + esc(meta.subtitle) + '</p>' +
            '<p class="project-brief" data-en="' + escAttr(content.brief) + '" data-es="' + escAttr(content.brief_es || content.brief) + '">' + esc(content.brief) + '</p>' +
          '</div>' +
          '<div class="project-meta-list">' +
            metaItem(t('project.client'),       content.client) +
            metaItem(t('project.role'),         content.role) +
            metaItem(t('project.deliverables'), content.deliverables) +
            metaItem(t('project.tools'),        content.tools) +
            metaItem(t('project.duration'),     content.duration) +
            metaItem(t('project.year'),         String(meta.year)) +
            (content.project_url
              ? '<div class="meta-item"><label>' + t('project.link') + '</label><p><a href="' + escAttr(content.project_url) + '" target="_blank" rel="noopener noreferrer">' + t('project.visitProject') + '</a></p></div>'
              : '') +
          '</div>' +
        '</div>'
      /* .project-content closed by caller after gallery */
    );
  }

  function renderEmbed(content) {
    if (!content.youtube_embed) return '';
    return (
      '<div class="project-embed">' +
        '<div class="project-embed__frame">' +
          '<iframe' +
            ' src="https://www.youtube.com/embed/' + escAttr(content.youtube_embed) + '?rel=0"' +
            ' frameborder="0"' +
            ' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"' +
            ' allowfullscreen' +
          '></iframe>' +
        '</div>' +
      '</div>'
    );
  }

  function renderGallery(gallery) {
    if (!gallery.images || gallery.images.length === 0) return '';

    let html = '<div class="project-gallery">';
    gallery.images.forEach(function (img) {
      const media = img.type === 'video'
        ? '<video src="' + escAttr(img.src) + '" autoplay muted loop playsinline></video>'
        : '<img src="' + escAttr(img.src) + '" alt="' + escAttr(img.alt) + '" loading="lazy" decoding="async">';
      html +=
        '<div class="gallery-item">' +
          media +
          (img.caption ? '<p class="gallery-caption">' + esc(img.caption) + '</p>' : '') +
        '</div>';
    });
    html += '</div>';
    return html;
  }

  function renderNavigation(prev, next) {
    if (!prev && !next) return '';
    return (
      '<nav class="project-navigation" aria-label="Project navigation">' +
        (prev
          ? '<a href="/project.html?p=' + escAttr(prev.project_meta.slug) + '" class="project-nav-link is-prev">' +
              '<span class="project-nav-label">' + t('project.previous') + '</span>' +
              '<span class="project-nav-title">' + esc(prev.project_meta.title) + '</span>' +
            '</a>'
          : '<span></span>') +
        (next
          ? '<a href="/project.html?p=' + escAttr(next.project_meta.slug) + '" class="project-nav-link is-next">' +
              '<span class="project-nav-label">' + t('project.next') + '</span>' +
              '<span class="project-nav-title">' + esc(next.project_meta.title) + '</span>' +
            '</a>'
          : '<span></span>') +
      '</nav>'
    );
  }

  /* ==========================================================================
     Theme application
     ========================================================================== */

  function applyTheme(design) {
    const root = document.documentElement;
    const body = document.body;

    body.style.backgroundColor = design.background_color;
    body.style.color           = design.text_color;

    const rgb = hexToRgb(design.text_color);
    root.style.setProperty('--project-bg',       design.background_color);
    root.style.setProperty('--project-text',      design.text_color);
    root.style.setProperty('--project-accent',    design.accent_color);
    root.style.setProperty('--project-text-rgb',  rgb);

    /* Tint the sticky header to match */
    const header = document.querySelector('.site-header');
    if (header) {
      header.style.backgroundColor = design.background_color;
      header.style.borderBottomColor = 'rgba(' + rgb + ', 0.07)';
    }

    /* Tint footer border */
    const footer = document.querySelector('.site-footer');
    if (footer) {
      footer.style.borderTopColor = 'rgba(' + rgb + ', 0.07)';
    }
  }

  function hexToRgb(hex) {
    const c = hex.replace('#', '');
    const full = c.length === 3
      ? c.split('').map(function (ch) { return ch + ch; }).join('')
      : c;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return r + ', ' + g + ', ' + b;
  }

  /* ==========================================================================
     <head> metadata
     ========================================================================== */

  function updateMeta(meta, content, hero) {
    const title = meta.title + ' — tnzs';
    document.getElementById('page-title').textContent = title;

    setMeta('page-description', content.brief);
    setMeta('og-title',         title);
    setMeta('og-description',   content.brief);
    if (hero.hero_image) {
      setMeta('og-image', 'https://tnzs.wtf' + hero.hero_image);
    }
  }

  function setMeta(id, value) {
    const el = document.getElementById(id);
    if (!el || !value) return;
    if (el.tagName === 'TITLE') {
      el.textContent = value;
    } else {
      el.setAttribute('content', value);
    }
  }

  /* ==========================================================================
     DOM helpers
     ========================================================================== */

  function metaItem(label, value) {
    if (!value || (Array.isArray(value) && value.length === 0)) return '';
    const inner = Array.isArray(value)
      ? '<ul>' + value.map(function (v) { return '<li>' + esc(v) + '</li>'; }).join('') + '</ul>'
      : '<p>' + esc(String(value)) + '</p>';
    return '<div class="meta-item"><label>' + label + '</label>' + inner + '</div>';
  }

  function svg(name) {
    if (name === 'arrow-left') {
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>';
    }
    return '';
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function escAttr(str) {
    return String(str).replace(/"/g, '&quot;');
  }

})();
