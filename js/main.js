/* ===== AgroNord — Main JavaScript ===== */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initScrollAnimations();
  initSmoothScroll();
});

/* ---------- Header scroll effect ---------- */
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  const hasHero = document.querySelector('.hero');
  if (!hasHero) {
    header.classList.add('scrolled');
    return;
  }

  const update = () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ---------- Mobile menu ---------- */
function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.mobile-menu');
  if (!toggle || !menu) return;

  // состояние иконок «бургер/крестик» задаётся классом .is-open (css/style.css),
  // а не инлайновыми стилями из JS
  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.classList.toggle('is-open', isOpen);
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.classList.remove('is-open');
    });
  });
}

/* ---------- Scroll-triggered animations ---------- */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-up');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
}

/* ---------- Smooth scroll for anchor links ---------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}
