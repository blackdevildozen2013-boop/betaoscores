'use strict';
(() => {
  const FORM_ENDPOINT = 'https://formspree.io/f/xwlvrzkl';
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (menu && nav) {
    menu.addEventListener('click', () => {
      const expanded = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(expanded));
      menu.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
      nav.classList.toggle('open', expanded);
      menu.textContent = expanded ? '×' : '☰';
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.textContent = '☰';
    }));
  }
  const filters = [...document.querySelectorAll('[data-sport-filter]')];
  const scoreCards = [...document.querySelectorAll('[data-sport-card]')];
  filters.forEach(button => button.addEventListener('click', () => {
    const selected = button.dataset.sportFilter;
    filters.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    scoreCards.forEach(card => { card.hidden = selected !== 'all' && card.dataset.sportCard !== selected; });
  }));
  const form = document.querySelector('#contact-form');
  if (form) {
    const status = document.querySelector('#form-status');
    const submit = form.querySelector('button[type="submit"]');
    const setStatus = (message, state = '') => { status.textContent = message; status.dataset.state = state; };
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const email = String(data.get('email') || '').trim();
      const message = String(data.get('message') || '').trim();
      if (!name || !email || !message) { setStatus('Please complete all required fields.', 'error'); return; }
      data.set('_subject', `Bettao Scores support — ${data.get('topic') || 'General question'}`);
      submit.disabled = true; submit.textContent = 'SENDING…';
      setStatus('Sending your message…');
      try {
        const response = await fetch(FORM_ENDPOINT, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } });
        if (!response.ok) {
          let detail = 'Please try again in a moment.';
          try { const result = await response.json(); if (Array.isArray(result.errors)) detail = result.errors.map(e => e.message).join(' ') || detail; } catch (_) { /* No JSON body */ }
          throw new Error(detail);
        }
        form.reset();
        setStatus('Your message was submitted successfully. Thank you for contacting Bettao Scores.', 'success');
      } catch (error) {
        setStatus(`We could not send your message. ${error.message || 'Please try again later.'}`, 'error');
      } finally {
        submit.disabled = false; submit.textContent = 'SEND MESSAGE ↗';
      }
    });
  }
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: .08, rootMargin: '0px 0px 50px 0px' });
    reveals.forEach(el => observer.observe(el));
  } else reveals.forEach(el => el.classList.add('visible'));
})();
