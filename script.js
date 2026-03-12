/**
 * script.js — Mahmoud Esmat Academic Portfolio
 * ==============================================
 * Modular vanilla JavaScript powering all interactive features.
 * Loaded deferred — runs after DOM is parsed.
 */

/* ============================================================
   Utility: Debounce
   ============================================================ */
function debounce(fn, wait = 200) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

/* ============================================================
   1. Theme System
   ============================================================ */
(function initTheme() {
  const html        = document.documentElement;
  const toggleBtn   = document.getElementById('themeToggle');
  const themeIcon   = document.getElementById('themeIcon');

  /** Apply a theme and persist it. */
  function setTheme(isDark) {
    html.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    // Update icon: moon = dark mode toggle button (shown in light), sun shown in dark
    if (themeIcon) {
      themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
  }

  /** Read saved preference, fall back to system preference. */
  function loadTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) {
      setTheme(saved === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark);
    }
  }

  loadTheme();

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const currentlyDark = html.getAttribute('data-theme') === 'dark';
      setTheme(!currentlyDark);
    });
  }

  // React to OS-level theme changes (when no localStorage preference)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches);
    }
  });
})();

/* ============================================================
   2. Mobile Menu
   ============================================================ */
(function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('navMenu');

  if (!hamburger || !navMenu) return;

  function openMenu() {
    hamburger.classList.add('active');
    navMenu.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close navigation menu');
  }

  function closeMenu() {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open navigation menu');
  }

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.contains('active');
    isOpen ? closeMenu() : openMenu();
  });

  // Close on any nav link click
  navMenu.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (
      navMenu.classList.contains('active') &&
      !navMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeMenu();
    }
  });
})();

/* ============================================================
   3. Navbar Behavior — Scroll state & progress bar
   ============================================================ */
(function initNavbar() {
  const navbar       = document.getElementById('navbar');
  const progressBar  = document.getElementById('scrollProgress');
  const navLinks     = document.querySelectorAll('.nav-link');
  const sections     = document.querySelectorAll('section[id]');

  if (!navbar) return;

  // --- Scroll-based class and progress ---
  function onScroll() {
    const scrollY       = window.scrollY;
    const docHeight     = document.documentElement.scrollHeight;
    const windowHeight  = window.innerHeight;

    // Navbar scrolled state
    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Progress bar width
    if (progressBar) {
      const pct = docHeight - windowHeight > 0
        ? (scrollY / (docHeight - windowHeight)) * 100
        : 0;
      progressBar.style.width = Math.min(pct, 100) + '%';
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // initial call

  // --- Active nav link via IntersectionObserver ---
  if (sections.length && navLinks.length) {
    const observerOptions = {
      root:       null,
      rootMargin: `-${Math.floor(window.innerHeight * 0.4)}px 0px -50% 0px`,
      threshold:  0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            if (href === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach((sec) => observer.observe(sec));
  }
})();

/* ============================================================
   4. Particles Animation (Canvas)
   ============================================================ */
(function initParticles() {
  const canvas = document.getElementById('particlesCanvas');
  if (!canvas) return;

  // Skip if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const ctx = canvas.getContext('2d');
  let width, height, particles, animFrameId;
  let isTabVisible = true;

  const isMobile  = () => window.innerWidth < 768;
  const COUNT     = () => isMobile() ? 20 : 60;
  const MAX_DIST  = 120; // px — max distance for drawing lines

  /** Resize canvas to fill parent */
  function resize() {
    width  = canvas.width  = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }

  /** Create a single particle */
  function createParticle() {
    return {
      x:       Math.random() * width,
      y:       Math.random() * height,
      vx:      (Math.random() - 0.5) * 0.5,
      vy:      (Math.random() - 0.5) * 0.5,
      radius:  Math.random() * 2 + 1,    // 1–3 px
      opacity: Math.random() * 0.4 + 0.1, // 0.1–0.5
    };
  }

  /** (Re-)initialise particle array */
  function initParticleArray() {
    particles = Array.from({ length: COUNT() }, createParticle);
  }

  /** Draw one animation frame */
  function draw() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < 0)       p.x = width;
      if (p.x > width)   p.x = 0;
      if (p.y < 0)       p.y = height;
      if (p.y > height)  p.y = 0;

      // Draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(123, 30, 30, ${p.opacity})`;
      ctx.fill();
    });

    // Draw connection lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.25;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(123, 30, 30, ${alpha})`;
          ctx.lineWidth   = 1;
          ctx.stroke();
        }
      }
    }
  }

  /** Animation loop */
  function loop() {
    if (!isTabVisible) {
      animFrameId = requestAnimationFrame(loop);
      return; // skip draw but keep loop alive
    }
    draw();
    animFrameId = requestAnimationFrame(loop);
  }

  // Pause/resume on visibility change
  document.addEventListener('visibilitychange', () => {
    isTabVisible = !document.hidden;
  });

  // Debounced resize handler
  const handleResize = debounce(() => {
    resize();
    initParticleArray();
  }, 250);

  window.addEventListener('resize', handleResize);

  // Bootstrap
  resize();
  initParticleArray();
  loop();
})();

/* ============================================================
   5. Typing Effect
   ============================================================ */
(function initTypingEffect() {
  const el = document.getElementById('typingText');
  if (!el) return;

  // Skip animation for reduced-motion users
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = 'Artificial Intelligence';
    return;
  }

  const strings      = [
    'Artificial Intelligence',
    'Cryptography',
    'Blockchain Technology',
    'Quantum Computing',
    'Information Security',
    'Image Encryption',
  ];
  const typeSpeed    = 80;   // ms per char typed
  const deleteSpeed  = 40;   // ms per char deleted
  const pauseTime    = 2000; // ms pause at full word

  let wordIndex  = 0;
  let charIndex  = 0;
  let isDeleting = false;

  function tick() {
    const currentWord = strings[wordIndex];

    if (!isDeleting) {
      // Type
      charIndex++;
      el.textContent = currentWord.slice(0, charIndex);

      if (charIndex === currentWord.length) {
        // Word complete — pause then delete
        isDeleting = true;
        setTimeout(tick, pauseTime);
        return;
      }
      setTimeout(tick, typeSpeed);
    } else {
      // Delete
      charIndex--;
      el.textContent = currentWord.slice(0, charIndex);

      if (charIndex === 0) {
        // Move to next word
        isDeleting = false;
        wordIndex  = (wordIndex + 1) % strings.length;
        setTimeout(tick, 400);
        return;
      }
      setTimeout(tick, deleteSpeed);
    }
  }

  // Small initial delay
  setTimeout(tick, 600);
})();

/* ============================================================
   6. Skill Bars Animation
   ============================================================ */
(function initSkillBars() {
  const section = document.querySelector('.skills-section');
  if (!section) return;

  let animated = false;

  function animateBars() {
    if (animated) return;
    animated = true;

    document.querySelectorAll('.skill-fill').forEach((fill) => {
      const target = fill.getAttribute('data-width');
      if (target) {
        // Tiny delay to trigger CSS transition (width 0 → target)
        requestAnimationFrame(() => {
          fill.style.width = target + '%';
        });
      }
    });
  }

  // Skip IntersectionObserver on reduced-motion — animate immediately
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    animateBars();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        animateBars();
        observer.unobserve(section);
      }
    },
    { threshold: 0.15 }
  );

  observer.observe(section);
})();

/* ============================================================
   7. Publication Filter
   ============================================================ */
(function initPubFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const pubCards   = document.querySelectorAll('.pub-card');

  if (!filterBtns.length || !pubCards.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Update active state and aria-pressed
      filterBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      const filter = btn.getAttribute('data-filter');

      pubCards.forEach((card) => {
        if (filter === 'all') {
          card.classList.remove('hidden');
        } else {
          const type = card.getAttribute('data-type');
          const year = card.getAttribute('data-year');
          const match = type === filter || year === filter;
          if (match) {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        }
      });
    });
  });
})();

/* ============================================================
   8. BibTeX Modal
   ============================================================ */
(function initBibtexModal() {
  const modal       = document.getElementById('bibtexModal');
  const codeEl      = document.getElementById('bibtexCode');
  const closeBtn    = document.getElementById('modalClose');
  const copyBtn     = document.getElementById('copyBibtexBtn');
  const tooltip     = document.getElementById('bibtexTooltip');
  const bibtexBtns  = document.querySelectorAll('.bibtex-btn');

  if (!modal || !codeEl) return;

  // Gather all focusable elements inside modal for focus trapping
  function getFocusable() {
    return Array.from(
      modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.disabled && el.offsetParent !== null);
  }

  function openModal(bibtex) {
    codeEl.textContent = bibtex;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Focus close button
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Open on each bibtex button
  bibtexBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const bibtex = btn.getAttribute('data-bibtex') || '';
      openModal(bibtex);
    });
  });

  // Close on overlay click (outside modal-content)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Close on button
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  // Focus trap
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = getFocusable();
    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Copy BibTeX
  if (copyBtn && tooltip) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(codeEl.textContent);
        tooltip.classList.add('visible');
        setTimeout(() => tooltip.classList.remove('visible'), 2000);
      } catch {
        // Fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = codeEl.textContent;
        ta.style.position = 'fixed';
        ta.style.opacity  = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        tooltip.classList.add('visible');
        setTimeout(() => tooltip.classList.remove('visible'), 2000);
      }
    });
  }
})();

/* ============================================================
   9. Email Copy
   ============================================================ */
(function initEmailCopy() {
  const copyBtn = document.getElementById('copyEmailBtn');
  const tooltip = document.getElementById('copyTooltip');
  const EMAIL   = 'mesmat@sci.cu.edu.eg';

  if (!copyBtn) return;

  copyBtn.addEventListener('click', async (e) => {
    e.stopPropagation(); // prevent bubbling to parent link if nested
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = EMAIL;
      ta.style.position = 'fixed';
      ta.style.opacity  = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }

    if (tooltip) {
      tooltip.classList.add('visible');
      setTimeout(() => tooltip.classList.remove('visible'), 2000);
    }
  });
})();

/* ============================================================
   10. Card Tilt Effect
   ============================================================ */
(function initTilt() {
  // Only on non-touch, non-reduced-motion devices
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if ('ontouchstart' in window) return;

  const MAX_TILT = 10; // degrees

  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = e.clientX - cx;
      const dy     = e.clientY - cy;
      const rotateX = (-dy / (rect.height / 2)) * MAX_TILT;
      const rotateY = ( dx / (rect.width  / 2)) * MAX_TILT;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(4px)`;
      card.style.transition = 'transform 0.05s linear';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      card.style.transition = 'transform 0.4s ease';
    });
  });
})();

/* ============================================================
   11. Back to Top
   ============================================================ */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener(
    'scroll',
    debounce(() => {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, 50),
    { passive: true }
  );

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ============================================================
   12. AOS Initialisation
   ============================================================ */
(function initAOS() {
  // AOS might not be loaded yet (deferred). Poll briefly.
  function tryInit() {
    if (typeof AOS === 'undefined') {
      setTimeout(tryInit, 50);
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      AOS.init({ disable: true });
    } else {
      AOS.init({
        duration: 700,
        easing:   'ease-out-cubic',
        once:     true,
        offset:   80,
      });
    }
  }

  tryInit();
})();

/* ============================================================
   13. Timeline Vertical Line Animation
   ============================================================ */
(function initTimelineAnimation() {
  const timelines = document.querySelectorAll('.timeline, .exp-timeline');

  if (!timelines.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    timelines.forEach((t) => t.classList.add('animated'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05 }
  );

  timelines.forEach((t) => observer.observe(t));
})();

/* ============================================================
   14. Smooth Scroll for Anchor Links
   ============================================================ */
(function initSmoothScroll() {
  // Handles any in-page anchor links not already covered by CSS scroll-behavior
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href').slice(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      const navHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '70',
        10
      );
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ============================================================
   15. Scholar Metrics — static values from Google Scholar profile
   https://scholar.google.com/citations?user=PDm7niMAAAAJ
   Google Scholar blocks scraping; update these numbers manually
   whenever the profile changes.
   ============================================================ */
(function initScholarMetrics() {
  // ── UPDATE THESE VALUES from your Scholar profile ──
  const CITATIONS = null; // e.g. 12  — set to a number once known
  const H_INDEX   = null; // e.g. 2
  const I10_INDEX = null; // e.g. 1

  function setMetric(id, value) {
    const el = document.getElementById(id);
    if (el && value !== null) el.textContent = value;
  }

  setMetric('metricCitations',  CITATIONS);
  setMetric('metricHIndex',     H_INDEX);
  setMetric('metricI10',        I10_INDEX);
  setMetric('heroStatCitations', CITATIONS);
  setMetric('heroStatHIndex',    H_INDEX);
})();

/* ============================================================
   DOMContentLoaded — Final Bootstrap
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // All module IIFEs above have already registered their listeners.
  // This block handles anything that specifically needs the DOM ready.

  // Set current year in footer if needed (already hardcoded as 2026 in HTML)

  // If the page loads at a hash target, scroll correctly past navbar
  if (window.location.hash) {
    const id = window.location.hash.slice(1);
    const el = document.getElementById(id);
    if (el) {
      setTimeout(() => {
        const navHeight = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '70',
          10
        );
        const top = el.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }, 300);
    }
  }
});
