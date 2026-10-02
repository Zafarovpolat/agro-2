/* ===== AgroNord — Main JavaScript =====
   Шапка, мобильное меню, появление блоков при скролле, плавные переходы.

   Анимация появления сделана «безопасной»: контент виден по умолчанию,
   скрывается только при активном JS (класс js-anim на <html>), плюс есть
   страховка — если наблюдатель не сработал, блоки раскрываются сами. */

/* Класс ставим сразу, до первой отрисовки: без JS анимация не включается,
   поэтому текст никогда не останется невидимым. */
document.documentElement.classList.add('js-anim');

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
  const icon = toggle?.querySelector('.menu-icon');
  const closeIcon = toggle?.querySelector('.close-icon');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    if (icon) icon.style.display = isOpen ? 'none' : 'block';
    if (closeIcon) closeIcon.style.display = isOpen ? 'block' : 'none';
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      if (icon) icon.style.display = 'block';
      if (closeIcon) closeIcon.style.display = 'none';
    });
  });
}

/* ---------- Scroll-triggered animations ---------- */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-up');
  if (!elements.length) return;

  const revealAll = () => elements.forEach(el => el.classList.add('visible'));

  // Браузер без IntersectionObserver — просто показываем всё
  if (!('IntersectionObserver' in window)) { revealAll(); return; }

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

  // Страховка: если через 2 секунды ни один блок не раскрылся (наблюдатель
  // не сработал — например, страница открыта в нестандартном окружении),
  // показываем контент принудительно, чтобы страница не была пустой.
  setTimeout(() => {
    if (!document.querySelector('.fade-up.visible')) revealAll();
  }, 2000);

  // И отдельно — всё, что уже в зоне видимости к моменту подгрузки картинок
  window.addEventListener('load', () => {
    elements.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('visible');
    });
  });
}

/* ---------- Smooth scroll for anchor links ---------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target && typeof target.scrollIntoView === 'function') {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}
