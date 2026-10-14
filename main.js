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
    const status = document.getElementById('form-status');
    const CONTACT_EMAIL = ''; // Set to a real, verified inbox before publishing.
    const getMessage = () => {
      if (!form.reportValidity()) return null;
      const name = form.elements.namedItem('name').value.trim();
      const email = form.elements.namedItem('email').value.trim();
      const topic = form.elements.namedItem('topic').value;
      const message = form.elements.namedItem('message').value.trim();
      if (!name || !email || !message) { status.textContent = 'Please complete every required field.'; return null; }
      return {subject:`Betão Scores — ${topic}`, body:`Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}`};
    };
    form.addEventListener('submit', event => {
      event.preventDefault();
      const data = getMessage(); if (!data) return;
      status.textContent = CONTACT_EMAIL ? 'Opening your email app. Please send the message there.' : 'Opening an email draft. Add the recipient address and send it from your email app.';
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(data.body)}`;
    });
    const copy = document.getElementById('copy-message');
    copy?.addEventListener('click', async () => {
      const data = getMessage(); if (!data) return;
      const text = `${data.subject}\n\n${data.body}`;
      try {
        if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
        else {
          const temp = document.createElement('textarea'); temp.value = text; temp.style.position='fixed'; temp.style.opacity='0'; document.body.appendChild(temp); temp.select();
          if (!document.execCommand('copy')) throw Error('Clipboard unavailable'); temp.remove();
        }
        status.textContent = 'Message copied. It has not been sent.';
      } catch (_) { status.textContent = 'Copy is unavailable here. Select the text in your fields to copy it.'; }
    });
  }
})();
