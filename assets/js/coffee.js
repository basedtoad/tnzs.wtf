/* ==========================================================================
   coffee.js — Brewing calculator logic
   ========================================================================== */

(function () {
  'use strict';

  var METHODS = [
    { id: 'v60',         ratio: 16, water: 300,  clicks: 15, clickRange: '12–18', grind: 'mediumfine', temp: '93–98°C' },
    { id: 'cloth',       ratio: 16, water: 300,  clicks: 15, clickRange: '12–18', grind: 'mediumfine', temp: '94–96°C' },
    { id: 'frenchpress', ratio: 15, water: 500,  clicks: 19, clickRange: '16–22', grind: 'coarse',     temp: '90–96°C' },
    { id: 'aeropress',   ratio: 16, water: 200,  clicks: 14, clickRange: '10–18', grind: 'mediumfine', temp: '85–95°C' },
    { id: 'espresso',    ratio: 2,  water: 36,   clicks: 9,  clickRange: '6–12',  grind: 'fine',       temp: '90–96°C' },
    { id: 'mokapot',     ratio: 8,  water: 150,  clicks: 11, clickRange: '8–14',  grind: 'mediumfine', temp: '100°C'   },
    { id: 'coldbrew',    ratio: 8,  water: 1000, clicks: 24, clickRange: '20–28', grind: 'coarse',     temp: '4–20°C'  },
  ];

  var state = {
    methodId: 'v60',
    water: 300,
    ratio: 16,
  };

  function getMethod(id) {
    for (var i = 0; i < METHODS.length; i++) {
      if (METHODS[i].id === id) return METHODS[i];
    }
    return METHODS[0];
  }

  function t(key) {
    return window.tnzsLang ? window.tnzsLang.t(key) : key;
  }

  function render() {
    var method = getMethod(state.methodId);
    var coffee = Math.round((state.water / state.ratio) * 10) / 10;

    var elCoffee = document.getElementById('resultCoffee');
    var elWater  = document.getElementById('resultWater');
    var elClicks = document.getElementById('resultClicks');
    var elRange  = document.getElementById('resultRange');
    var elGrind  = document.getElementById('resultGrindName');
    var elTemp   = document.getElementById('resultTemp');

    if (elCoffee) elCoffee.textContent = coffee;
    if (elWater)  elWater.textContent  = state.water;
    if (elClicks) elClicks.textContent = method.clicks;
    if (elRange)  elRange.textContent  = method.clickRange;
    if (elGrind)  elGrind.textContent  = t('coffee.grind.' + method.grind);
    if (elTemp)   elTemp.textContent   = method.temp;
  }

  function selectMethod(id) {
    var method = getMethod(id);
    state.methodId = id;
    state.ratio    = method.ratio;
    state.water    = method.water;

    var waterSlider = document.getElementById('waterSlider');
    var waterVal    = document.getElementById('waterValue');
    var ratioSlider = document.getElementById('ratioSlider');
    var ratioVal    = document.getElementById('ratioValue');
    var ratioRec    = document.getElementById('ratioRecommended');
    var methodLabel = document.getElementById('methodLabel');

    if (waterSlider) waterSlider.value = method.water;
    if (waterVal)    waterVal.textContent = method.water;
    if (ratioSlider) ratioSlider.value = method.ratio;
    if (ratioVal)    ratioVal.textContent = method.ratio;
    if (ratioRec)    ratioRec.textContent = '1 : ' + method.ratio;

    /* Update dropdown display */
    document.querySelectorAll('.cp-dropdown-item').forEach(function (item) {
      var active = item.dataset.method === id;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', active ? 'true' : 'false');
      if (active && methodLabel) methodLabel.textContent = item.textContent;
    });

    render();
  }

  document.addEventListener('DOMContentLoaded', function () {

    /* === Custom Dropdown === */
    var dropdown        = document.getElementById('methodDropdown');
    var dropdownTrigger = dropdown && dropdown.querySelector('.cp-dropdown-trigger');

    function closeDropdown() {
      if (!dropdown) return;
      dropdown.classList.remove('is-open');
      dropdown.setAttribute('aria-expanded', 'false');
    }

    if (dropdownTrigger) {
      dropdownTrigger.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = dropdown.classList.toggle('is-open');
        dropdown.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    }

    document.querySelectorAll('.cp-dropdown-item').forEach(function (item) {
      item.addEventListener('click', function () {
        closeDropdown();
        selectMethod(item.dataset.method);
      });
    });

    /* Close on outside click or Escape */
    document.addEventListener('click', function (e) {
      if (dropdown && !dropdown.contains(e.target)) closeDropdown();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDropdown();
    });

    /* === Water slider === */
    var waterSlider = document.getElementById('waterSlider');
    if (waterSlider) {
      waterSlider.addEventListener('input', function () {
        state.water = parseInt(this.value, 10);
        var elVal = document.getElementById('waterValue');
        if (elVal) elVal.textContent = state.water;
        render();
      });
    }

    /* === Ratio slider === */
    var ratioSlider = document.getElementById('ratioSlider');
    if (ratioSlider) {
      ratioSlider.addEventListener('input', function () {
        var val = parseFloat(this.value);
        state.ratio = val;
        var elVal = document.getElementById('ratioValue');
        if (elVal) elVal.textContent = val % 1 === 0 ? val : val.toFixed(1);
        render();
      });
    }

    /* Re-render grind label on language change */
    document.addEventListener('tnzs:lang-change', function () { render(); });

    /* Initial render */
    selectMethod('v60');
  });

})();
