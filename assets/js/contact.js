/* ==========================================================================
   contact.js — Contact form interactions
   ========================================================================== */

(function () {
  const form      = document.getElementById('contactForm');
  const success   = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('submitBtn');
  const btnLabel  = submitBtn?.querySelector('.btn-label');

  if (!form) return;

  /* --- Validate a single field --- */
  function validate(el) {
    const wrap = el.closest('.float-field');
    if (!wrap) return true;
    const empty = !el.value.trim();
    wrap.classList.toggle('is-error', empty);
    return !empty;
  }

  /* --- Clear error on input --- */
  form.querySelectorAll('.field-input').forEach(el => {
    el.addEventListener('input', () => validate(el));
  });

  /* --- Submit --- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fields  = [...form.querySelectorAll('[required]')];
    const allGood = fields.map(validate).every(Boolean);
    if (!allGood) {
      fields.find(f => !f.value.trim())?.focus();
      return;
    }

    submitBtn.disabled = true;
    if (btnLabel) btnLabel.textContent = window.tnzsLang ? window.tnzsLang.t('contact.sending') : 'Sending\u2026';

    try {
      const res = await fetch('https://formspree.io/f/xjgelnwv', {
        method:  'POST',
        headers: { 'Accept': 'application/json' },
        body:    new FormData(form),
      });

      if (!res.ok) throw new Error('Formspree error ' + res.status);

      form.hidden    = true;
      success.hidden = false;

    } catch (err) {
      console.error('Form submission error:', err);
      submitBtn.disabled = false;
      if (btnLabel) btnLabel.textContent = window.tnzsLang ? window.tnzsLang.t('contact.tryAgain') : 'Try again';
    }
  });
}());
