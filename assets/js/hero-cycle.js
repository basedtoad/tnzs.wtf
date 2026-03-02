/* ==========================================================================
   hero-cycle.js — Cycling noun for the hero tagline
   Targets .hero-cycle-word spans with a separate word list from cta-cycle.js.
   ========================================================================== */

(function () {
  'use strict';

  var WORDS = {
    en: ['brand', 'illustration', 'animation', 'website', 'app'],
    es: ['marca', 'ilustraci\u00f3n', 'animaci\u00f3n', 'sitio web', 'app']
  };

  var INTERVAL = 3000; /* ms between word changes */
  var FADE_OUT = 250;  /* ms fade-out duration    */

  var idx        = 0;
  var intervalId = null;

  function getLang() {
    return (window.tnzsLang && window.tnzsLang.getLang()) ||
           localStorage.getItem('tnzs-lang') || 'en';
  }

  function getWords() {
    var lang = getLang();
    return WORDS[lang] || WORDS.en;
  }

  function setWord(word) {
    document.querySelectorAll('.hero-cycle-word').forEach(function (el) {
      el.textContent = word;
    });
  }

  function update() {
    var words = getWords();
    idx = (idx + 1) % words.length;
    var next = words[idx];

    var els = document.querySelectorAll('.hero-cycle-word');
    if (!els.length) return;

    els.forEach(function (el) { el.classList.add('is-changing'); });

    setTimeout(function () {
      els.forEach(function (el) { el.textContent = next; });

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          els.forEach(function (el) { el.classList.remove('is-changing'); });
        });
      });
    }, FADE_OUT);
  }

  function startCycle() {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(update, INTERVAL);
  }

  document.addEventListener('tnzs:lang-change', function () {
    var words = getWords();
    setWord(words[idx % words.length]);
  });

  window.addEventListener('load', function () {
    var words = getWords();
    setWord(words[0]);
    startCycle();
  });

})();
