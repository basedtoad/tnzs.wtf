/* ==========================================================================
   heroScroll.js — Scroll-driven hero logo shrink + nav reveal
   ========================================================================== */

(function () {
  'use strict';

  const hero        = document.getElementById('hero');
  const logoWrap    = document.getElementById('heroLogoWrap');
  const scrollNav   = document.getElementById('scrollNav');
  const siteFooter  = document.querySelector('.site-footer');
  const burgerBtn   = document.getElementById('burgerBtn');

  /* Only runs on the homepage (hero present) */
  if (!hero || !logoWrap || !scrollNav) return;

  /* -------------------------------------------------------------------------
   * Scroll handler
   * - progress: 0 (top of hero) → 1 (bottom of hero)
   * - Logo scale: 1 → ~0.1 (mimics nav logo size)
   * - Logo opacity: 1 → 0 (fades out over first 65% of hero scroll)
   * - Scroll nav: visible once scrollY ≥ 50% of hero height
   * ---------------------------------------------------------------------- */
  function lerp(a, b, t) {
    return a + (b - a) * Math.min(Math.max(t, 0), 1);
  }

  function onScroll() {
    const heroH    = hero.offsetHeight;
    const scrollY  = window.scrollY;
    const progress = scrollY / heroH; // unbounded, we clamp inside

    /* Logo scale: full (1) → nav-proportional size (0.09) */
    const scale   = lerp(1, 0.09, Math.min(progress, 1));
    /* Logo opacity: fades out over the first 65% of the scroll */
    const opacity = lerp(1, 0, Math.min(progress / 0.65, 1));

    logoWrap.style.transform = `translate(-50%, -50%) scale(${scale})`;
    logoWrap.style.opacity   = opacity;

    /* Scroll nav + footer: appear at 50% of hero height */
    if (scrollY >= heroH * 0.5) {
      scrollNav.classList.add('is-visible');
      if (siteFooter) siteFooter.classList.add('is-visible');
    } else {
      scrollNav.classList.remove('is-visible');
      if (siteFooter) siteFooter.classList.remove('is-visible');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  /* Run once on load so state is correct if page is mid-scroll on refresh */
  onScroll();

}());
