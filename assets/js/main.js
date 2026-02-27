/* ==========================================================================
   main.js — Page transitions, shared utilities
   ========================================================================== */

(function () {
  'use strict';

  const overlay = document.querySelector('.page-transition');

  /* --- Fade in on arrival --- */
  window.addEventListener('pageshow', function () {
    if (overlay) overlay.classList.remove('is-active');
  });

  /* --- Fade out on internal navigation --- */
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Skip: external, mailto, tel, hash, blank target
    if (
      href.startsWith('http') ||
      href.startsWith('//') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('#') ||
      link.target === '_blank' ||
      link.hasAttribute('download')
    ) return;

    e.preventDefault();

    if (overlay) overlay.classList.add('is-active');

    setTimeout(function () {
      window.location.href = href;
    }, 380);
  });

  /* --- Burger / Nav Drawer --- */
  var burgerBtn = document.getElementById('burgerBtn');
  var navDrawer = document.getElementById('navDrawer');

  function openDrawer() {
    burgerBtn.setAttribute('aria-expanded', 'true');
    burgerBtn.classList.add('is-open');
    navDrawer.classList.add('is-open');
    navDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    burgerBtn.setAttribute('aria-expanded', 'false');
    burgerBtn.classList.remove('is-open');
    navDrawer.classList.remove('is-open');
    navDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (burgerBtn && navDrawer) {
    burgerBtn.addEventListener('click', function () {
      var isOpen = this.getAttribute('aria-expanded') === 'true';
      if (isOpen) closeDrawer();
      else openDrawer();
    });

    navDrawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeDrawer);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burgerBtn.getAttribute('aria-expanded') === 'true') {
        closeDrawer();
      }
    });
  }

})();
