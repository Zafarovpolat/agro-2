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

/* ---------- Scroll-triggered animations ----------
   Наблюдатель один на страницу и переиспользуется: каталог и страница товара
   отрисовываются из JS уже после загрузки, поэтому одного прохода при
   DOMContentLoaded недостаточно — иначе динамические .fade-up (opacity: 0)
   остаются невидимыми. shop.js зовёт эту же функцию после каждой отрисовки. */
let fadeObserver = null;

function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-up:not(.visible)');
  if (!elements.length) return;

  // страховка для сред без IntersectionObserver: показываем сразу,
  // контент никогда не должен оставаться скрытым
  if (typeof IntersectionObserver === 'undefined') {
    elements.forEach((el) => el.classList.add('visible'));
    return;
  }

  if (!fadeObserver) {
    fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
  }

  elements.forEach(el => fadeObserver.observe(el));
}

// доступно для shop.js: вызывается после отрисовки динамических блоков
window.agroAnimate = initScrollAnimations;

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
