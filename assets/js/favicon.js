/* ==========================================================================
   favicon.js — Animated favicon: cycles T → N → Z → S using PNG files
   ========================================================================== */

(function () {
  'use strict';

  var frames   = [
    '/assets/images/favicon/tFavicon.png',
    '/assets/images/favicon/nFavicon.png',
    '/assets/images/favicon/zFavicon.png',
    '/assets/images/favicon/sFavicon.png'
  ];
  var idx      = 0;
  var INTERVAL = 750; /* ms per frame */

  var link = document.getElementById('favicon');
  if (!link) {
    link = document.createElement('link');
    link.rel  = 'icon';
    link.type = 'image/png';
    link.id   = 'favicon';
    document.head.appendChild(link);
  }

  function tick() {
    link.href = frames[idx];
    idx = (idx + 1) % frames.length;
  }

  tick();
  setInterval(tick, INTERVAL);

}());
