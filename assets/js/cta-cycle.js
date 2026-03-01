/* ==========================================================================
   cta-cycle.js — Cycling adjective for CTA elements
   Finds all .cta-cycle-word spans and cycles through word lists.
   Syncs with the active language from lang.js.
   ========================================================================== */

(function () {
  'use strict';

  var WORDS = {
    en: ['real', 'effective', 'cool', 'fun', 'new', 'iconic', 'bold', 'memorable', 'unexpected'],
    es: ['real', 'efectivo', 'cool', 'divertido', 'nuevo', 'ic\u00f3nico', 'audaz', 'memorable', 'inesperado']
  };

  var INTERVAL  = 2500; /* ms between word changes  */
  var FADE_OUT  = 250;  /* ms fade-out duration     */

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
    document.querySelectorAll('.cta-cycle-word').forEach(function (el) {
      el.textContent = word;
    });
  }

  function update() {
    var words = getWords();
    idx = (idx + 1) % words.length;
    var next = words[idx];

    var els = document.querySelectorAll('.cta-cycle-word');
    if (!els.length) return;

    /* Fade out */
    els.forEach(function (el) { el.classList.add('is-changing'); });

    setTimeout(function () {
      /* Swap text while invisible */
      els.forEach(function (el) { el.textContent = next; });

      /* Double rAF: ensure browser paints the hidden state before fading in */
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

  /* On language switch — keep the same slot, show word in new language */
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
