/* ==========================================================================
   lang.js — Language toggle (EN / ES)
   ========================================================================== */

(function () {
  'use strict';

  var STRINGS = {
    en: {
      /* Navigation */
      'nav.work':    'Work',
      'nav.about':   'About',
      'nav.contact': 'Contact',

      /* Hero */
      'hero.scroll': 'scroll',

      /* About page */
      'about.eyebrow':              'About',
      'about.bio':                  'One guy creative operation ready to tackle your visual design needs.',
      'about.whatIDo':              'What I do',
      'about.info':                 'Info',
      'about.basedIn.label':        'Based in',
      'about.basedIn.value':        'Costa Rica',
      'about.availableFor.label':   'Available for',
      'about.availableFor.value':   'Freelance & collaborations',
      'about.contact.label':        'Contact',
      'about.software':             'Software',
      'about.getInTouch':           'Get in touch',
      'about.letsWork':             'Let\'s work together',

      /* Contact page */
      'contact.eyebrow':      'Get in touch',
      'contact.headline.1':   'Let\'s make',
      'contact.headline.2':   'something',
      'contact.headline.3':   'real.',
      'contact.whatDoYouNeed':'What do you need?',
      'contact.branding':     'Branding',
      'contact.illustration': 'Illustration',
      'contact.identity':     'Identity',
      'contact.somethingElse':'Something else',
      'contact.yourName':     'Your name',
      'contact.emailAddress': 'Email address',
      'contact.projectDesc':  'Tell me about your project',
      'contact.send':         'Send it',
      'contact.sending':      'Sending\u2026',
      'contact.tryAgain':     'Try again',
      'contact.gotIt':        'Got it.',
      'contact.inTouch':      'I\'ll be in touch soon.',
      'contact.backToWork':   '\u2190 Back to work',

      /* Project page */
      'project.allWork':      'All Work',
      'project.previous':     '\u2190 Previous',
      'project.next':         'Next \u2192',
      'project.visitProject': 'Visit project \u2192',
      'project.client':       'Client',
      'project.role':         'Role',
      'project.deliverables': 'Deliverables',
      'project.tools':        'Tools',
      'project.duration':     'Duration',
      'project.year':         'Year',
      'project.link':         'Link',
      'project.error':        'Failed to load project data.',

      /* Grid */
      'grid.error': 'Could not load projects.',
      'grid.empty': 'No projects yet.',
    },

    es: {
      /* Navigation */
      'nav.work':    'Trabajo',
      'nav.about':   'Sobre m\u00ed',
      'nav.contact': 'Contacto',

      /* Hero */
      'hero.scroll': 'bajar',

      /* About page */
      'about.eyebrow':              'Sobre m\u00ed',
      'about.bio':                  'Una operaci\u00f3n creativa de un solo tipo, lista para cubrir tus necesidades de dise\u00f1o visual.',
      'about.whatIDo':              'Lo que hago',
      'about.info':                 'Info',
      'about.basedIn.label':        'Ubicaci\u00f3n',
      'about.basedIn.value':        'Costa Rica',
      'about.availableFor.label':   'Disponible para',
      'about.availableFor.value':   'Freelance y colaboraciones',
      'about.contact.label':        'Contacto',
      'about.software':             'Software',
      'about.getInTouch':           'Contactar',
      'about.letsWork':             'Trabajemos juntos',

      /* Contact page */
      'contact.eyebrow':      'Hablemos',
      'contact.headline.1':   'Hagamos',
      'contact.headline.2':   'algo',
      'contact.headline.3':   'real.',
      'contact.whatDoYouNeed':'\u00bfQu\u00e9 necesitas?',
      'contact.branding':     'Branding',
      'contact.illustration': 'Ilustraci\u00f3n',
      'contact.identity':     'Identidad',
      'contact.somethingElse':'Algo m\u00e1s',
      'contact.yourName':     'Tu nombre',
      'contact.emailAddress': 'Correo electr\u00f3nico',
      'contact.projectDesc':  'Cu\u00e9ntame tu proyecto',
      'contact.send':         'Enviar',
      'contact.sending':      'Enviando\u2026',
      'contact.tryAgain':     'Intentar de nuevo',
      'contact.gotIt':        'Recibido.',
      'contact.inTouch':      'Estar\u00e9 en contacto pronto.',
      'contact.backToWork':   '\u2190 Volver al trabajo',

      /* Project page */
      'project.allWork':      'Todo el trabajo',
      'project.previous':     '\u2190 Anterior',
      'project.next':         'Siguiente \u2192',
      'project.visitProject': 'Ver proyecto \u2192',
      'project.client':       'Cliente',
      'project.role':         'Rol',
      'project.deliverables': 'Entregables',
      'project.tools':        'Tools',
      'project.duration':     'Duraci\u00f3n',
      'project.year':         'A\u00f1o',
      'project.link':         'Enlace',
      'project.error':        'Error al cargar el proyecto.',

      /* Grid */
      'grid.error': 'No se pudieron cargar los proyectos.',
      'grid.empty': 'Sin proyectos a\u00fan.',
    }
  };

  /* --- Helpers --- */

  function getLang() {
    return localStorage.getItem('tnzs-lang') || 'en';
  }

  function t(key) {
    var lang = getLang();
    return (STRINGS[lang] && STRINGS[lang][key]) || (STRINGS.en[key]) || key;
  }

  function applyLang(lang) {
    /* Text content */
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var str = (STRINGS[lang] && STRINGS[lang][key]) || (STRINGS.en[key]) || key;
      el.textContent = str;
    });

    /* Placeholder attributes */
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      var str = (STRINGS[lang] && STRINGS[lang][key]) || (STRINGS.en[key]) || key;
      el.setAttribute('placeholder', str);
    });

    /* Label elements that mirror a placeholder field */
    document.querySelectorAll('[data-i18n-label]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-label');
      var str = (STRINGS[lang] && STRINGS[lang][key]) || (STRINGS.en[key]) || key;
      el.textContent = str;
    });

    /* Active state on lang buttons */
    document.querySelectorAll('[data-lang]').forEach(function (el) {
      el.classList.toggle('is-active', el.getAttribute('data-lang') === lang);
    });

    /* html[lang] attribute */
    document.documentElement.lang = lang;

    /* Notify other scripts that language changed */
    document.dispatchEvent(new CustomEvent('tnzs:lang-change', { detail: { lang: lang } }));
  }

  function setLang(lang) {
    localStorage.setItem('tnzs-lang', lang);
    applyLang(lang);
  }

  /* --- Init --- */
  document.addEventListener('DOMContentLoaded', function () {
    applyLang(getLang());

    /* Bind all lang toggle buttons */
    document.addEventListener('click', function (e) {
      var target = e.target.closest('[data-lang]');
      if (!target) return;
      e.preventDefault();
      setLang(target.getAttribute('data-lang'));
    });
  });

  /* --- Public API (used by project.js, grid.js, contact.js) --- */
  window.tnzsLang = { t: t, getLang: getLang };

})();
