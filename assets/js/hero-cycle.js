/* ==========================================================================
   hero-cycle.js — Cycling words for the hero tagline and about page.

   Targets:
     .hero-cycle-word  — hero tagline + about headline (brand/illustration/…)
     .bio-cycle-word   — about bio intro (graphic design / branding / …)

   After each hero-word change on mobile, calls window.fitHeadingMobile() on
   any .about-headline that fitHeadings.js has already processed, so the
   per-word fit-text sizing stays correct as the word changes.
   ========================================================================== */

(function () {
  'use strict';

  /* -----------------------------------------------------------------------
   * Word lists
   * ----------------------------------------------------------------------- */
  var HERO_WORDS = {
    en: ['brand', 'illustration', 'animation', 'website', 'app'],
    es: ['marca', 'ilustraci\u00f3n', 'animaci\u00f3n', 'sitio web', 'app']
  };

  var BIO_WORDS = {
    en: ['graphic design', 'web design', 'vector & pixel illustration',
         'infographics', 'motion graphics', 'animation',
         'branding', 'merchandising'],
    es: ['dise\u00f1o gr\u00e1fico', 'dise\u00f1o web', 'ilustraci\u00f3n vectorial y pixel',
         'infograf\u00edas', 'motion graphics', 'animaci\u00f3n',
         'branding', 'merchandising']
  };

  var HERO_INTERVAL = 3000;  /* ms between hero word changes */
  var BIO_INTERVAL  = 2200;  /* ms between bio phrase changes */
  var FADE_OUT      = 250;   /* ms fade-out duration          */

  var heroIdx = 0, bioIdx = 0;
  var heroTimer = null, bioTimer = null;

  /* -----------------------------------------------------------------------
   * Helpers
   * ----------------------------------------------------------------------- */
  function getLang() {
    return (window.tnzsLang && window.tnzsLang.getLang()) ||
           localStorage.getItem('tnzs-lang') || 'en';
  }

  function getHeroWords() { var l = getLang(); return HERO_WORDS[l] || HERO_WORDS.en; }
  function getBioWords()  { var l = getLang(); return BIO_WORDS[l]  || BIO_WORDS.en;  }

  /* Set text on all elements matching selector, no transition */
  function setAll(selector, word) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = word;
    });
  }

  /* Fade out → swap text → fade in, then call optional callback */
  function cycleWord(selector, word, afterSwap) {
    var els = document.querySelectorAll(selector);
    if (!els.length) return;

    els.forEach(function (el) { el.classList.add('is-changing'); });

    setTimeout(function () {
      els.forEach(function (el) { el.textContent = word; });
      if (afterSwap) afterSwap();

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          els.forEach(function (el) { el.classList.remove('is-changing'); });
        });
      });
    }, FADE_OUT);
  }

  /*
   * Re-measure any .about-headline that fitHeadings.js has processed.
   * Called after the hero cycling word changes so the per-word span sizes
   * are correct for the new word on mobile.
   */
  function remeasureHeadlines() {
    if (!window.fitHeadingMobile) return;
    document.querySelectorAll('.about-headline[data-fit-done]').forEach(function (h) {
      window.fitHeadingMobile(h);
    });
  }

  /* -----------------------------------------------------------------------
   * Cycle ticks
   * ----------------------------------------------------------------------- */
  function tickHero() {
    heroIdx = (heroIdx + 1) % getHeroWords().length;
    cycleWord('.hero-cycle-word', getHeroWords()[heroIdx], remeasureHeadlines);
  }

  function tickBio() {
    bioIdx = (bioIdx + 1) % getBioWords().length;
    cycleWord('.bio-cycle-word', getBioWords()[bioIdx], null);
  }

  function startCycles() {
    if (heroTimer) clearInterval(heroTimer);
    if (bioTimer)  clearInterval(bioTimer);
    heroTimer = setInterval(tickHero, HERO_INTERVAL);
    bioTimer  = setInterval(tickBio,  BIO_INTERVAL);
  }

  /* -----------------------------------------------------------------------
   * Language change — keep same slot index, show word in new language
   * ----------------------------------------------------------------------- */
  document.addEventListener('tnzs:lang-change', function () {
    setAll('.hero-cycle-word', getHeroWords()[heroIdx % getHeroWords().length]);
    setAll('.bio-cycle-word',  getBioWords()[bioIdx   % getBioWords().length]);

    /* Re-measure in next frame so fitHeadings.js finishes its own
       lang-change handler (registered before this one) first */
    requestAnimationFrame(function () {
      remeasureHeadlines();
    });
  });

  /* -----------------------------------------------------------------------
   * Init on load
   * ----------------------------------------------------------------------- */
  window.addEventListener('load', function () {
    setAll('.hero-cycle-word', getHeroWords()[0]);
    setAll('.bio-cycle-word',  getBioWords()[0]);
    startCycles();
  });

})();
