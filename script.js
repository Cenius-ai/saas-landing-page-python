/* ============================================================
   Loom — Client-side interactivity
   - Smooth scroll (anchor links)
   - Intersection Observer: scroll-triggered reveals
   - FAQ accordion (aria-expanded)
   - Mobile nav toggle
   - Active nav link on scroll
   - Contact form validation + success state
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- DOM refs ---------- */
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  const allNavLinks = document.querySelectorAll('.nav-link[data-section]');
  const sections = document.querySelectorAll('section[id]');
  const revealEls = document.querySelectorAll('.reveal');
  const faqButtons = document.querySelectorAll('.faq-question');
  const ctaForm = document.getElementById('cta-form');
  const ctaSuccess = document.getElementById('cta-success');

  /* ---------- Mobile nav toggle ---------- */
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !expanded);
      navLinks.classList.toggle('open', !expanded);
    });

    // Close nav on link click (mobile)
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('open');
      });
    });

    // Close nav on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        navToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('open');
        navToggle.focus();
      }
    });

    // Trap focus inside mobile nav when open
    navLinks.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' || !navLinks.classList.contains('open')) return;
      const focusable = navLinks.querySelectorAll('a, button');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* ---------- Scroll-triggered reveals ---------- */
  if (revealEls.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    revealEls.forEach(el => observer.observe(el));
  }

  /* ---------- Active nav link on scroll ---------- */
  if (sections.length > 0 && allNavLinks.length > 0) {
    const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 64;

    const highlightNav = () => {
      let currentId = '';

      sections.forEach(section => {
        const top = section.offsetTop - navHeight - 80;
        if (window.scrollY >= top) {
          currentId = section.getAttribute('id');
        }
      });

      allNavLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-section') === currentId);
      });
    };

    window.addEventListener('scroll', highlightNav, { passive: true });
    highlightNav(); // initial call
  }

  /* ---------- FAQ accordion ---------- */
  faqButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const answer = btn.nextElementSibling;

      // Close all others
      faqButtons.forEach(other => {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          other.nextElementSibling.hidden = true;
        }
      });

      // Toggle current
      btn.setAttribute('aria-expanded', !expanded);
      answer.hidden = expanded;
    });

    // Allow Enter/Space on focused button
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  /* ---------- Contact form ---------- */
  if (ctaForm) {
    const nameInput = document.getElementById('cta-name');
    const emailInput = document.getElementById('cta-email');
    const nameError = document.getElementById('cta-name-error');
    const emailError = document.getElementById('cta-email-error');

    const showError = (input, errorEl, message) => {
      input.classList.add('input-error');
      errorEl.textContent = message;
    };

    const clearError = (input, errorEl) => {
      input.classList.remove('input-error');
      errorEl.textContent = '';
    };

    const validateName = () => {
      const val = nameInput.value.trim();
      if (!val) {
        showError(nameInput, nameError, 'Please enter your name.');
        return false;
      }
      if (val.length < 2) {
        showError(nameInput, nameError, 'Name must be at least 2 characters.');
        return false;
      }
      clearError(nameInput, nameError);
      return true;
    };

    const validateEmail = () => {
      const val = emailInput.value.trim();
      if (!val) {
        showError(emailInput, emailError, 'Please enter your email address.');
        return false;
      }
      // Simple but reasonably permissive email regex
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(val)) {
        showError(emailInput, emailError, 'Please enter a valid email address.');
        return false;
      }
      clearError(emailInput, emailError);
      return true;
    };

    // Live validation on blur
    nameInput.addEventListener('blur', validateName);
    emailInput.addEventListener('blur', validateEmail);

    // Clear errors on input
    nameInput.addEventListener('input', () => clearError(nameInput, nameError));
    emailInput.addEventListener('input', () => clearError(emailInput, emailError));

    ctaForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameValid = validateName();
      const emailValid = validateEmail();

      if (nameValid && emailValid) {
        // Simulate submission (static site — show success state)
        // In production, replace with Formspree/Netlify Forms action
        ctaForm.hidden = true;
        if (ctaSuccess) {
          ctaSuccess.hidden = false;
          // Scroll to success message
          ctaSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        // Focus first invalid field
        if (!nameValid) nameInput.focus();
        else if (!emailValid) emailInput.focus();
      }
    });
  }

  /* ---------- Smooth scroll for anchor links (progressive enhancement) ---------- */
  // CSS `scroll-behavior: smooth` handles most; JS fallback for older browsers
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 64;

      try {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (_) {
        // Fallback for very old browsers
        const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }

      // Update URL hash without jump
      history.pushState(null, null, targetId);
    });
  });

});
