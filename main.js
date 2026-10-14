'use strict';
(() => {
  const URLS = Object.freeze({
    football: 'https://www.realtimesportsapi.com/embed/scoreboard/premier-league',
    basketball: 'https://www.realtimesportsapi.com/embed/scoreboard/nba',
    hockey: 'https://www.realtimesportsapi.com/embed/scoreboard/nhl'
  });
  document.querySelectorAll('[data-score-widget]').forEach(widget => {
    const iframe = widget.querySelector('iframe');
    widget.querySelectorAll('[data-league]').forEach(button => {
      button.addEventListener('click', () => {
        const league = button.dataset.league;
        if (!Object.hasOwn(URLS, league) || !iframe) return;
        widget.querySelectorAll('[data-league]').forEach(tab => tab.setAttribute('aria-pressed', String(tab === button)));
        iframe.title = `${button.textContent.trim()} live scores, fixtures and results`;
        if (iframe.src !== URLS[league]) iframe.src = URLS[league];
      });
    });
  });
  const toggle = document.querySelector('.mobile-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.textContent = isOpen ? '✕' : '☰';
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = '☰';
    }));
  }
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), {threshold:.07, rootMargin:'0px 0px 40px 0px'});
    revealItems.forEach(item => observer.observe(item));
  } else revealItems.forEach(item => item.classList.add('visible'));

  const form = document.getElementById('contact-form');
  if (form) {
    // Create a free Formspree form at https://formspree.io/ and paste its endpoint below.
    // Never put private API keys in client-side JavaScript.
    const FORM_ENDPOINT = 'https://formspree.io/f/https://formspree.io/f/xwlvrzkl';
    const status = document.getElementById('form-status');
    const submit = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      if (FORM_ENDPOINT.includes('https://formspree.io/f/xwlvrzkl')) {
        status.textContent = 'Contact delivery is not configured yet. The site owner must add their Formspree form ID.';
        return;
      }
      const fields = new FormData(form);
      const name = String(fields.get('name') || '').trim();
      const email = String(fields.get('email') || '').trim();
      const message = String(fields.get('message') || '').trim();
      if (!name || !email || !message) {
        status.textContent = 'Please complete all required fields.';
        return;
      }
      fields.set('_subject', `Betão Scores support — ${fields.get('topic') || 'General inquiry'}`);
      submit.disabled = true;
      submit.textContent = 'SENDING…';
      status.textContent = 'Sending your message…';
      try {
        const response = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          body: fields,
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) {
          let detail = '';
          try {
            const data = await response.json();
            if (Array.isArray(data.errors)) detail = data.errors.map(e => e.message).filter(Boolean).join(' ');
          } catch (_) { /* Some error responses are not JSON. */ }
          throw new Error(detail || `The service returned HTTP ${response.status}.`);
        }
        form.reset();
        status.textContent = 'Message sent successfully. Thank you for contacting Betão Scores!';
      } catch (error) {
        status.textContent = `Your message could not be sent. Please try again. ${error.message || ''}`.trim();
      } finally {
        submit.disabled = false;
        submit.textContent = 'SEND MESSAGE ↗';
      }
    });
  }
})();
