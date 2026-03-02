/* ==========================================================================
   fitHeadings.js — Mobile word-fill typography
   On screens ≤768px, splits headings into individual word/phrase blocks
   and sizes each to fill the full container width.
   Nav drawer links (.drawer-link) are treated as single blocks — each
   link text fills the viewport width.
   ========================================================================== */

(function () {
  'use strict';

  var BP = 768;
  var HEADING_SELECTORS = '.about-headline, .hero-headline, .project-title';
  var LINK_SELECTORS    = '.drawer-link';

  function isMobile() { return window.innerWidth <= BP; }

  /* Width to fill = viewport minus horizontal padding (24px each side) */
  function getMaxW() {
    return window.innerWidth - 48;
  }

  /*
   * Get the rendered TEXT content width via the Range API.
   *
   * Using el.scrollWidth / el.offsetWidth is WRONG for display:block elements
   * because they return the element's layout width (= parent/container width),
   * not the text glyph width.
   *
   * Range.getBoundingClientRect() returns the bounding box of the actual text
   * content regardless of the block element's layout width. This is the only
   * reliable way to measure text width without changing the element's display.
   */
  function getTextWidth(el) {
    var range = document.createRange();
    range.selectNodeContents(el);
    return range.getBoundingClientRect().width;
  }

  /*
   * Collect word/phrase segments from a heading element.
   * - Plain text nodes  → split into one token per whitespace-separated word
   * - <em> / <strong>  → kept as a single token (element intact)
   * - <span data-i18n> → split its translated text by whitespace
   * - <br>             → ignored (we stack word-by-word)
   */
  function getSegments(heading) {
    var segs = [];
    Array.from(heading.childNodes).forEach(function (node) {
      if (node.nodeName === 'BR') return;

      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.trim().split(/\s+/).forEach(function (w) {
          if (w) segs.push({ type: 'text', value: w });
        });
      } else if (node.nodeName === 'EM' || node.nodeName === 'STRONG' ||
                 (node.nodeName === 'SPAN' && node.hasAttribute('data-fit-group'))) {
        segs.push({ type: 'element', node: node.cloneNode(true) });
      } else if (node.nodeName === 'SPAN') {
        node.textContent.trim().split(/\s+/).forEach(function (w) {
          if (w) segs.push({ type: 'text', value: w });
        });
      }
    });
    return segs;
  }

  /*
   * remeasureHeading — re-sizes all [data-fit-line] spans inside a heading.
   *
   * Pattern (avoids layout thrashing):
   *   1. Reset all spans to 8px baseline
   *   2. Force ONE synchronous reflow
   *   3. Batch-read text widths via Range (no style writes between reads)
   *   4. Batch-write correct font-sizes
   */
  function remeasureHeading(heading) {
    var maxW     = getMaxW();
    var fitSpans = Array.from(heading.querySelectorAll('[data-fit-line]'));
    if (!fitSpans.length) return;

    fitSpans.forEach(function (s) { s.style.fontSize = '8px'; });
    heading.offsetWidth; // force synchronous reflow

    var widths = fitSpans.map(getTextWidth); // batch reads

    fitSpans.forEach(function (s, i) {       // batch writes
      if (!widths[i]) return;
      s.style.fontSize = Math.floor(maxW / widths[i] * 8 * 0.93) + 'px';
    });
  }

  /* -----------------------------------------------------------------------
   * processHeading — first-time setup: splits heading into per-word spans,
   * each independently sized to fill the full viewport width.
   * ----------------------------------------------------------------------- */
  function processHeading(heading) {
    if (heading.hasAttribute('data-fit-done')) {
      if (isMobile()) {
        remeasureHeading(heading); /* resize: re-measure existing spans */
      } else {
        /* Desktop: restore original markup */
        if (heading._fitOriginal !== undefined) {
          heading.innerHTML = heading._fitOriginal;
          delete heading._fitOriginal;
        }
        heading.removeAttribute('data-fit-done');
        heading.style.lineHeight = '';
      }
      return;
    }

    if (!isMobile()) return;

    /* Parse segments BEFORE clearing innerHTML */
    var segs = getSegments(heading);
    if (!segs.length) return;

    heading._fitOriginal     = heading.innerHTML;
    heading.innerHTML        = '';
    heading.style.lineHeight = '1.0';
    heading.setAttribute('data-fit-done', '');

    /* Append all word spans at 8px baseline */
    segs.forEach(function (seg) {
      var span = document.createElement('span');
      span.setAttribute('data-fit-line', '');
      span.style.display    = 'block';
      span.style.whiteSpace = 'nowrap';
      span.style.overflow   = 'hidden';
      span.style.fontSize   = '8px';

      if (seg.type === 'text') {
        span.textContent = seg.value;
      } else {
        span.appendChild(seg.node);
      }
      heading.appendChild(span);
    });

    /* Measure and size (forces reflow internally) */
    remeasureHeading(heading);
  }

  /* -----------------------------------------------------------------------
   * processLink — sizes an entire drawer link to fill the full viewport width.
   * ----------------------------------------------------------------------- */
  function processLink(link) {
    if (link.hasAttribute('data-fit-done')) {
      if (isMobile()) {
        /* Resize: re-measure at new viewport width */
        link.style.fontSize = '8px';
        link.offsetWidth; // force reflow
        var w = getTextWidth(link);
        if (w) link.style.fontSize = Math.floor(getMaxW() / w * 8 * 0.93) + 'px';
      } else {
        /* Desktop: restore CSS defaults */
        link.removeAttribute('data-fit-done');
        link.style.fontSize   = '';
        link.style.whiteSpace = '';
        link.style.overflow   = '';
      }
      return;
    }

    if (!isMobile()) return;

    link.setAttribute('data-fit-done', '');
    link.style.whiteSpace = 'nowrap';
    link.style.overflow   = 'visible';
    link.style.fontSize   = '8px';

    link.offsetWidth; // force reflow
    var w = getTextWidth(link);
    if (w) link.style.fontSize = Math.floor(getMaxW() / w * 8 * 0.93) + 'px';
  }

  function runAll() {
    document.querySelectorAll(HEADING_SELECTORS).forEach(processHeading);
    document.querySelectorAll(LINK_SELECTORS).forEach(processLink);
  }

  /* Debounced resize */
  var resizeTid;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTid);
    resizeTid = setTimeout(runAll, 100);
  });

  /*
   * Multi-strategy init for display:swap fonts (BBH Bartle via Google Fonts).
   *
   * Pass 1 — window.load + rAF: fast first render. Correct when font is cached.
   *   If not cached, fallback sans-serif is measured and words may be oversized.
   *
   * Pass 2 — document.fonts.load(): resolves when the actual BBH Bartle file
   *   is downloaded. No weight specified so any variant triggers it.
   *
   * Pass 3 — loadingdone event: fires when the browser's font loading queue
   *   drains. Belt-and-suspenders for browsers where fonts.load() behaves oddly.
   *
   * Pass 4 — 350 ms timeout: last-resort fallback for very slow connections
   *   where the font may not be downloaded until well after window.load.
   *
   * All passes are cheap re-runs: processHeading/processLink see data-fit-done
   * and call remeasureHeading/processLink which only resize existing spans.
   */
  window.addEventListener('load', function () {
    requestAnimationFrame(runAll);

    document.fonts.load("1em 'BBH Bartle'").then(function () {
      requestAnimationFrame(runAll);
    });

    document.fonts.addEventListener('loadingdone', function () {
      requestAnimationFrame(runAll);
    }, { once: true });

    setTimeout(function () { requestAnimationFrame(runAll); }, 350);
  });

  /*
   * After language change: restore, re-translate, re-fit.
   * lang.js dispatches 'tnzs:lang-change' AFTER the DOM is translated.
   */
  document.addEventListener('tnzs:lang-change', function (e) {
    var lang = e.detail && e.detail.lang;

    document.querySelectorAll('[data-fit-done]').forEach(function (el) {
      if (el.matches(LINK_SELECTORS)) {
        el.removeAttribute('data-fit-done');
        el.style.fontSize   = '';
        el.style.whiteSpace = '';
        el.style.overflow   = '';
        processLink(el);
        return;
      }

      /* Heading: restore markup, re-translate, re-fit */
      if (el._fitOriginal !== undefined) {
        el.innerHTML = el._fitOriginal;
        delete el._fitOriginal;
      }
      el.removeAttribute('data-fit-done');
      el.style.lineHeight = '';

      if (lang && window.tnzsLang) {
        el.querySelectorAll('[data-i18n]').forEach(function (node) {
          node.textContent = window.tnzsLang.t(node.getAttribute('data-i18n'));
        });
      }

      processHeading(el);
    });
  });

  /* Public API — called by project.js after async content injection */
  window.fitHeadingsMobile = runAll;
  window.fitHeadingMobile  = processHeading;
})();
