/* ============================================================
   AgroNord — доработка по запросу клиента
   • статус товара: в наличии / в дороге / забронировано / продан
   • счётчик поставки: сколько дней осталось до прибытия
   • кнопка «Забронировать» + форма (Имя, Фамилия, Телефон)
   • стикер «Забронировано» после подтверждения менеджером
   • фильтры: поиск по серии, «только свободные», сортировка
   Логика использует существующий движок i18n (js/i18n.js),
   поэтому все подписи автоматически работают на RU и RO.

   Оформление (см. блок «ДОРАБОТКА» в конце css/style.css):
   иконки — инлайновые SVG в стиле остальных страниц, цвета —
   только из переменных дизайн-системы, эмодзи не используются.
   ============================================================ */
(function () {
  const DAY = 86400000;
  const SHOP = window.AGRO_SHOP;
  if (!SHOP) return;

  const LS = { bookings: 'agronord-bookings', overrides: 'agronord-overrides' };
  /* данные и контакты приходят из WordPress */
  const CFG = window.AGRO_CFG || {};
  const CAT = CFG.catalog || '/';
  const catUrl = (q) => CAT + (CAT.indexOf('?') > -1 ? '&' : '?') + q;

  /* ---------- доступ к словарю и языку сайта ---------- */
  const T = (typeof translations !== 'undefined') ? translations : {};
  const lang = () => (typeof getLang === 'function' ? getLang() : (localStorage.getItem('agronord-lang') || 'ru'));
  const t = (key, fallback) => {
    const rec = T[key];
    if (!rec) return fallback || key;
    const l = lang();
    return rec[l] || rec.ru || fallback || key;
  };
  // applyLang() без аргумента сбросил бы язык на RU по умолчанию,
  // поэтому всегда передаём текущий язык интерфейса
  const relang = () => {
    if (typeof applyLang === 'function') applyLang(typeof getLang === 'function' ? getLang() : 'ru');
  };
  // динамические блоки (карточки каталога, страница товара) появляются уже
  // после DOMContentLoaded, поэтому после каждой отрисовки просим main.js
  // показать новые .fade-up — иначе они остаются с opacity: 0
  const animate = () => {
    if (typeof window.agroAnimate === 'function') window.agroAnimate();
  };

  /* ---------- экранирование ----------
     Данные из формы брони (имя, телефон, комментарий) приходят от
     посетителя и выводятся в админке: без экранирования это хранимая
     XSS в браузере менеджера. Экранируем всё, что попадает в innerHTML. */
  const esc = (v) => String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  /* ---------- иконки (24×24, stroke=currentColor) ---------- */
  const ICONS = {
    truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    percent: '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m15 9-6 6"/><path d="M9 9h.01"/><path d="M15 15h.01"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>'
  };
  const ico = (name, cls) => `<svg class="${cls || 'ico'}" xmlns="http://www.w3.org/2000/svg" width="16" height="16"` +
    ` viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"` +
    ` stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;


  /* Логотип WhatsApp — сплошная форма (fill), как у бренда */
  const WA_PATH = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z';
  const VIBER_PATH = 'M11.4 0C9.473.028 5.333.344 3.02 2.467 1.302 4.187.696 6.7.633 9.817.57 12.933.488 18.776 6.12 20.36h.003l-.004 2.416s-.037.977.61 1.177c.777.242 1.234-.5 1.98-1.302.407-.44.972-1.084 1.397-1.58 3.85.326 6.812-.416 7.15-.525.776-.252 5.176-.816 5.892-6.657.74-6.02-.36-9.83-2.34-11.546-.596-.55-3.006-2.3-8.375-2.323 0 0-.395-.025-1.037-.017zm.058 1.693c.545-.004.88.017.88.017 4.542.02 6.717 1.388 7.222 1.846 1.675 1.435 2.53 4.868 1.906 9.897v.002c-.604 4.878-4.174 5.184-4.832 5.395-.28.09-2.882.737-6.153.524 0 0-2.436 2.94-3.197 3.704-.12.12-.26.167-.352.144-.13-.033-.166-.188-.165-.414l.02-4.018c-4.762-1.32-4.485-6.292-4.43-8.895.054-2.604.543-4.738 1.996-6.173 1.96-1.773 5.474-2.018 7.11-2.03zm.38 2.602c-.167 0-.303.135-.304.302 0 .167.133.303.3.305 1.624.01 2.946.537 4.028 1.592 1.073 1.046 1.62 2.468 1.633 4.334.002.167.14.3.307.3.166-.002.3-.138.3-.304-.014-1.984-.618-3.596-1.816-4.764-1.19-1.16-2.692-1.753-4.447-1.765zm-3.96.695c-.19-.032-.4.005-.616.117l-.01.002c-.43.247-.816.562-1.146.932-.002.004-.006.004-.008.008-.267.323-.42.638-.46.948-.008.046-.01.093-.007.14 0 .136.022.27.065.4l.013.01c.135.48.473 1.276 1.205 2.604.42.768.903 1.5 1.446 2.186.27.344.56.673.87.984l.132.132c.31.308.64.6.984.87.686.543 1.418 1.027 2.186 1.447 1.328.733 2.126 1.07 2.604 1.206l.01.014c.13.042.265.064.402.063.046.002.092 0 .138-.008.31-.036.627-.19.948-.46.004 0 .003-.002.008-.005.37-.33.683-.72.93-1.148l.003-.01c.225-.432.15-.842-.18-1.12-.004 0-.698-.58-1.037-.83-.36-.255-.73-.492-1.113-.71-.51-.285-1.032-.106-1.248.174l-.447.564c-.23.283-.657.246-.657.246-3.12-.796-3.955-3.955-3.955-3.955s-.037-.426.248-.656l.563-.448c.277-.215.456-.737.17-1.248-.217-.383-.454-.756-.71-1.115-.25-.34-.826-1.033-.83-1.035-.137-.165-.31-.265-.502-.297zm4.49.88c-.158.002-.29.124-.3.282-.01.167.115.312.282.324 1.16.085 2.017.466 2.645 1.15.63.688.93 1.524.906 2.57-.002.168.13.306.3.31.166.003.305-.13.31-.297.025-1.175-.334-2.193-1.067-2.994-.74-.81-1.777-1.253-3.05-1.346h-.024zm.463 1.63c-.16.002-.29.127-.3.287-.008.167.12.31.288.32.523.028.875.175 1.113.422.24.245.388.62.416 1.164.01.167.15.295.318.287.167-.008.295-.15.287-.317-.03-.644-.215-1.178-.58-1.557-.367-.378-.893-.574-1.52-.607h-.018z';
  const viberIcon = () => `<svg class="ico ico-viber" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${VIBER_PATH}"/></svg>`;
  const waIcon = () => `<svg class="ico-wa" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${WA_PATH}"/></svg>`;

  /* ---------- работа с датами ---------- */
  const parse = (iso) => new Date(iso + 'T00:00:00');
  const fmt = (iso) => parse(iso).toLocaleDateString(lang() === 'ro' ? 'ro-RO' : 'ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const leftDays = (iso) => Math.round((parse(iso) - SHOP.today) / DAY);
  function plural(n, one, few, many) {
    const a = Math.abs(n) % 100, b = a % 10;
    if (a > 10 && a < 20) return many;
    if (b > 1 && b < 5) return few;
    if (b === 1) return one;
    return many;
  }
  const dayWord = (n) => {
    if (lang() === 'ro') return n === 1 ? 'zi' : 'zile';
    return plural(n, 'день', 'дня', 'дней');
  };
  const daysLabel = (n) => `${n} ${dayWord(n)}`;
  const posWord = (n) => (lang() === 'ro' ? (n === 1 ? 'poziție' : 'poziții') : plural(n, 'позиция', 'позиции', 'позиций'));
  const hourWord = (n) => (lang() === 'ro' ? (n === 1 ? 'oră' : 'ore') : plural(n, 'час', 'часа', 'часов'));
  const minWord  = (n) => (lang() === 'ro' ? (n === 1 ? 'minut' : 'minute') : plural(n, 'минута', 'минуты', 'минут'));

  /* ---------- обратный отсчёт до поставки ----------
     Считается от часов браузера, поэтому цифры живые и тикают без перезагрузки. */
  function cdParts(iso) {
    const ms = parse(iso) - new Date();
    if (ms <= 0) return null;
    return { d: Math.floor(ms / DAY), h: Math.floor((ms % DAY) / 3600000), m: Math.floor((ms % 3600000) / 60000) };
  }
  function cdUnits(c) {
    return [[c.d, dayWord(c.d)], [c.h, hourWord(c.h)], [c.m, minWord(c.m)]];
  }
  function countdownWidget(iso) {
    const c = cdParts(iso);
    if (!c) return '';
    return `<div class="countdown" data-until="${esc(iso)}">` +
      cdUnits(c).map(([v, w]) => `<div class="cd-unit"><b>${v}</b><span>${esc(w)}</span></div>`).join('') +
      `</div>`;
  }
  function tickCountdowns() {
    document.querySelectorAll('.countdown[data-until]').forEach((el) => {
      const c = cdParts(el.dataset.until);
      if (!c) { el.remove(); return; }
      const nodes = el.querySelectorAll('.cd-unit');
      cdUnits(c).forEach(([v, w], i) => {
        if (!nodes[i]) return;
        nodes[i].querySelector('b').textContent = v;
        nodes[i].querySelector('span').textContent = w;
      });
    });
  }
  setInterval(tickCountdowns, 20000);
  // склонение: «1 позиция свободна» / «3 позиции свободны» / «7 позиций свободно»
  const freeWord = (n) => {
    const a = Math.abs(n) % 100, b = a % 10;
    const form = (a > 10 && a < 20) ? 'many' : (b >= 2 && b <= 4 ? 'few' : (b === 1 ? 'one' : 'many'));
    return t('cont.free.' + form);
  };

  /* ---------- правки, которые делает менеджер в админке (демо) ---------- */
  function overrides() {
    return {}; // статусами управляет админка WordPress
  }
  function allProducts() {
    const ov = overrides();
    return SHOP.products.map((p) => {
      const o = ov[p.id] || {};
      const np = Object.assign({}, p, o);
      if (o.days !== undefined && o.arrival === undefined) np.arrival = SHOP.plus(o.days);
      return np;
    });
  }
  function saveOverride(id, patch) {
    const ov = overrides();
    ov[id] = Object.assign(ov[id] || {}, patch);
    localStorage.setItem(LS.overrides, JSON.stringify(ov));
  }
  function bookings() {
    try { return JSON.parse(localStorage.getItem(LS.bookings) || '[]'); } catch (e) { return []; }
  }
  function saveBooking(b) {
    if (!CFG.ajax) return Promise.resolve();
    const fd = new FormData();
    fd.append('action', 'agro_lead');
    fd.append('nonce', CFG.nonce || '');
    fd.append('kind', 'booking');
    fd.append('product', b.productId || '');
    fd.append('name', b.name || '');
    fd.append('phone', b.phone || '');
    fd.append('comment', b.comment || '');
    return fetch(CFG.ajax, { method: 'POST', body: fd, credentials: 'same-origin' })
      .then((r) => r.json()).catch(() => ({ success: false }));
  }

  /* ---------- статусы ---------- */
  const STATUS = { stock: 'st-stock', transit: 'st-transit', reserved: 'st-reserved', sold: 'st-sold' };
  const statusLabel = (s) => t('status.' + s, s);
  const isInCountry = (p) => p.container === 'склад' || !!p.arrived || p.status === 'stock';

  /* Кнопка в карточке зависит от статуса: «Купить» превращается в «Забронировать» */
  function actionFor(p) {
    if (p.status === 'sold')     return { key: 'btn.similar', act: 'similar', cls: 'btn-secondary' };
    if (p.status === 'reserved') return { key: 'status.reserved', act: 'none', cls: 'btn-secondary', disabled: true };
    if (p.status === 'stock')    return { key: 'btn.inquiry', act: 'book', cls: 'btn-primary' };
    return { key: 'btn.reserve', act: 'book', cls: 'btn-accent' };
  }
  const ctaLabel = (p) => t(actionFor(p).key);

  /* ---------- счётчик поставки (та же логика, что в демо-админке) ----------
     1) в пути: «До прибытия N дней» + полоса прогресса
     2) 0–7 дней: «Ожидается со дня на день»
     3) срок истёк: «Рейс задерживается, дату подтверждает менеджер» (без минусов)
     4) прибыло: «В Молдове с <дата>» — счётчик убирается
     Считается в браузере от даты прибытия, поэтому не «застывает».
     Состояние передаётся иконкой и цветом строки, а не цветной заливкой.  */
  function countdownHTML(p, compact) {
    if (p.status === 'sold') return '';
    const mod = compact ? ' is-compact' : '';

    if (isInCountry(p)) {
      const here = p.arrived || (leftDays(p.arrival) <= 0 ? p.arrival : null);
      const label = here ? `${t('cnt.arrived', 'В Молдове с')} ${fmt(here)}` : t('cnt.instock', 'В наличии на складе');
      return `<div class="count-box is-done${mod}">
        <span class="count-main">${ico('checkCircle')}<span>${esc(label)}</span></span></div>`;
    }

    const left = leftDays(p.arrival);
    const total = Math.max(1, Math.round((parse(p.arrival) - parse(p.start)) / DAY));
    const passed = Math.min(100, Math.max(4, Math.round(((total - left) / total) * 100)));
    const bar = `<span class="count-bar"><i style="width:${passed}%"></i></span>`;
    const container = p.container && p.container !== 'склад'
      ? ' · ' + t('cnt.container', 'Контейнер') + ' ' + esc(p.container)
      : '';

    // компактная карточка: одна строка, без подписи и полосы прогресса —
    // блоки во всех карточках получаются одной высоты
    if (left < 0) {
      return `<div class="count-box is-late${mod}">
        <span class="count-main">${ico('alert')}<span>${esc(t('cnt.late', 'Рейс задерживается'))}</span></span>${compact ? '' : `
        <span class="count-sub">${esc(t('cnt.late.sub', 'точную дату подтверждает менеджер'))} · ${esc(t('cnt.calc', 'расчётная дата'))} ${fmt(p.arrival)}</span>`}</div>`;
    }
    if (left <= 7) {
      return `<div class="count-box is-soon${mod}">
        <span class="count-main">${ico('clock')}<span>${esc(t('cnt.soon', 'Ожидается со дня на день'))}</span></span>${compact ? '' : `
        ${countdownWidget(p.arrival)}
        <span class="count-sub">${esc(t('cnt.expected', 'поставка ожидается'))} ${fmt(p.arrival)}${container}</span>${bar}
        ${compact ? '' : `<span class="count-note">${esc(t('cnt.approx', 'Дата прибытия примерная — уточняйте у менеджера'))}</span>`}`}</div>`;
    }
    // в карточке подпись короче, чтобы строка счётчика не переносилась
    const headDays = compact ? ` <b>${esc(daysLabel(left))}</b>` : '';
    const head = p.status === 'reserved'
      ? (compact
          ? `${esc(t('status.reserved', 'Забронировано'))} · <b>${esc(daysLabel(left))}</b>`
          : `${esc(t('cnt.resdays', 'Забронировано, до прибытия'))}`)
      : `${esc(t('cnt.left', 'До прибытия'))}${headDays}`;
    return `<div class="count-box${mod}">
      <span class="count-main">${ico(p.status === 'reserved' ? 'lock' : 'truck')}<span>${head}</span></span>${compact ? '' : `
      ${countdownWidget(p.arrival)}
      <span class="count-sub">${esc(t('cnt.expected', 'поставка ожидается'))} ${fmt(p.arrival)}${container}</span>${bar}
      ${compact ? '' : `<span class="count-note">${esc(t('cnt.approx', 'Дата прибытия примерная — уточняйте у менеджера'))}</span>`}`}</div>`;
  }

  /* обрезка описания до N слов — как wp_trim_words() на стороне PHP */
  const trimWords = (txt, n) => {
    const w = String(txt || '').trim().split(/\s+/).filter(Boolean);
    return w.length > n ? w.slice(0, n).join(' ') + ' …' : w.join(' ');
  };

  /* ---------- карточка товара ----------
     Разметка совпадает с прежней вёрсткой, но карточка — не <a>:
     клик по всей площади даёт растянутая ссылка .product-card-hit,
     а кнопки лежат рядом с ней, а не внутри (валидный HTML).          */
  function cardHTML(p, delay) {
    const st = STATUS[p.status];
    const a = actionFor(p);
    const img = (p.images && p.images[0]) || '';
    const name = lang() === 'ro' ? p.name_ro : p.name_ru;
    // плашку «забронирован» в карточке не показываем: статус уже виден стикером
    // и строкой счётчика; подробное пояснение осталось на странице товара
    const note = '';
    const action = a.act === 'similar' ? '' :
      `<button type="button" class="btn ${a.cls} btn-sm product-card-book" data-act="${a.act}" data-id="${p.id}"${a.disabled ? ' disabled' : ''}>${esc(ctaLabel(p))}</button>`;

    return `<article class="product-card fade-up${delay ? ' delay-' + delay : ''}" data-category="${esc(p.cat)}" data-id="${p.id}" data-status="${esc(p.status)}">
      <a class="product-card-hit" href="${esc(p.url || CAT)}" aria-label="${esc(name)}"></a>
      <div class="product-card-image">
        <img src="${esc(img)}" alt="${esc(name)}" />
        <span class="st-badge st-badge-float ${st}">${esc(statusLabel(p.status))}</span>
        ${p.container && p.container !== 'склад' ? `<span class="cont-tag">${esc(t('cnt.container', 'Контейнер'))} ${esc(p.container)}</span>` : ''}
        <button type="button" class="product-card-fav${isFav(p.id) ? ' is-active' : ''}" aria-label="${esc(t('card.fav', 'В избранное'))}" aria-pressed="${isFav(p.id)}" data-fav-id="${p.id}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        </button>
      </div>
      <h3>${esc(name)}</h3>
      <div class="product-card-price">${p.price ? p.price.toLocaleString('ru-RU') + ' €' : esc(t('prod.price.request', 'По запросу'))}</div>
      ${countdownHTML(p, true)}
      ${note}
      ${action}
    </article>`;
  }

  /* ---------- избранное ----------
     Список id хранится в localStorage, поэтому лайки переживают перезагрузку
     и видны на всех страницах. Ничего не уходит на сервер. */
  const FAV_KEY = 'agro_fav';
  let favIds = (() => {
    try { return (JSON.parse(localStorage.getItem(FAV_KEY)) || []).map(Number).filter(Boolean); }
    catch (e) { return []; }
  })();
  const isFav = (id) => favIds.indexOf(+id) !== -1;

  function favSave() {
    try { localStorage.setItem(FAV_KEY, JSON.stringify(favIds)); } catch (e) {}
    favPaint();
  }
  /* счётчики в шапке и в бургере + чип «Избранное» в каталоге */
  function favPaint() {
    const n = favIds.length;
    document.querySelectorAll('[data-fav-count]').forEach((el) => {
      el.textContent = n;
      el.classList.toggle('is-empty', n === 0);
    });
  }

  /* Страница «Избранное» — отдельная, без фильтров: рисуем ровно отмеченное. */
  function renderFavPage() {
    const grid = document.getElementById('fav-grid');
    if (!grid) return;
    const list = allProducts().filter((p) => isFav(p.id));
    grid.innerHTML = list.map((p, i) => cardHTML(p, i % 4)).join('');
    const empty = document.getElementById('fav-empty');
    const cnt = document.getElementById('fav-count');
    if (empty) empty.hidden = list.length > 0;
    if (cnt) {
      cnt.hidden = list.length === 0;
      cnt.textContent = `${list.length} ${posWord(list.length)}`;
    }
    animate();
    relang();
  }
  function favToggle(id) {
    id = +id;
    favIds = isFav(id) ? favIds.filter((x) => x !== id) : favIds.concat(id);
    favSave();
  }

  /* ---------- каталог: фильтры ---------- */
  const state = { q: '', cat: 'all', status: 'all', free: false, sort: 'arrival', cont: '' };

  /* Проданная техника в витрине не показывается: её видно только если
     явно выбрать статус «Продан» в фильтре (и в админке — там всё). */
  const showSold = () => state.status === 'sold';

  function visible() {
    let list = allProducts().filter((p) => {
      if (p.status === 'sold' && !showSold()) return false;
      if (state.cont && p.container !== state.cont) return false;
      if (state.cat !== 'all' && p.cat !== state.cat) return false;
      const unavailable = p.status === 'reserved' || p.status === 'sold';
      if (state.free && unavailable) return false;
      if (state.status !== 'all' && p.status !== state.status) return false;
      if (state.q) {
        const hay = `${p.name_ru} ${p.name_ro} ${p.brand} ${p.serial} ${p.container}`.toLowerCase();
        if (!hay.includes(state.q.toLowerCase().trim())) return false;
      }
      return true;
    });
    const rank = { stock: 0, transit: 1, reserved: 2, sold: 3 };
    if (state.sort === 'arrival') list.sort((a, b) => rank[a.status] - rank[b.status] || parse(a.arrival) - parse(b.arrival));
    if (state.sort === 'new') list.sort((a, b) => parse(b.start) - parse(a.start));
    if (state.sort === 'name') list.sort((a, b) => (lang() === 'ro' ? a.name_ro : a.name_ru).localeCompare(lang() === 'ro' ? b.name_ro : b.name_ru));
    return list;
  }

  /* Сколько позиций за каждой кнопкой-фильтром. Считается от того же набора,
     что и витрина (проданные скрыты), поэтому цифры сходятся с «показано N из M». */
  function paintCounts() {
    const base = allProducts().filter((p) => p.status !== 'sold' || showSold());
    document.querySelectorAll('.filter-count[data-count]').forEach((el) => {
      const k = el.dataset.count;
      el.textContent = (k === 'all' ? base.length : base.filter((p) => p.cat === k).length);
    });
  }

  function renderCatalog() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    const list = visible();
    const total = allProducts().filter((p) => p.status !== 'sold' || showSold()).length;
    grid.innerHTML = list.map((p, i) => cardHTML(p, i % 4)).join('') ||
      `<div class="catalog-empty">${esc(t('catalog.nothing', 'Ничего не найдено — измените фильтры'))}</div>`;

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('shop-count', `${t('catalog.shown', 'показано')} ${list.length} ${t('catalog.of', 'из')} ${total}`);
    const note = document.getElementById('cont-note');
    if (note) {
      note.innerHTML = state.cont
        ? `${esc(t('cnt.container', 'Контейнер'))}: <b>${esc(state.cont)}</b> <button type="button" class="link-btn" id="cont-reset">${esc(t('catalog.reset.link', 'сбросить'))}</button>`
        : '';
      const r = document.getElementById('cont-reset');
      if (r) r.addEventListener('click', () => { state.cont = ''; renderCatalog(); });
    }
    document.querySelectorAll('.filter-btn').forEach((b) => b.classList.toggle('active', !state.cont && b.dataset.filter === state.cat));
    paintCounts();
    animate();
    relang();
  }

  /* ---------- кастомный выпадающий список ----------
     Нативный select скрыт и работает источником значения; клики обрабатывает
     своя кнопка и своё меню — иначе список опций рисует ОС и он «не кастомный». */
  function enhanceSelects() {
    document.querySelectorAll('select.shop-select').forEach((sel) => {
      if (sel.dataset.custom) return;
      sel.dataset.custom = '1';
      sel.classList.add('select-native');

      const wrap = sel.closest('.select') || sel.parentElement;
      wrap.classList.add('select');

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'select-btn';
      btn.setAttribute('aria-haspopup', 'listbox');
      btn.setAttribute('aria-expanded', 'false');

      const menu = document.createElement('div');
      menu.className = 'select-menu';
      menu.setAttribute('role', 'listbox');

      const currentLabel = () => (sel.options[sel.selectedIndex] || {}).textContent || '';
      const syncLabel = () => {
        btn.innerHTML = `<span>${esc(currentLabel().trim())}</span>` + ico('chevron');
      };
      const buildMenu = () => {
        menu.innerHTML = [...sel.options].map((o) =>
          `<button type="button" class="select-option${o.selected ? ' is-selected' : ''}" role="option"` +
          ` aria-selected="${o.selected}" data-value="${esc(o.value)}">${esc(o.textContent.trim())}</button>`).join('');
      };
      const close = () => { wrap.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); };
      const open = () => { buildMenu(); wrap.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); };

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        wrap.classList.contains('is-open') ? close() : open();
      });
      menu.addEventListener('click', (e) => {
        const opt = e.target.closest('.select-option');
        if (!opt) return;
        sel.value = opt.dataset.value;
        sel.dispatchEvent(new Event('change', { bubbles: true }));   // логика фильтров слушает нативный select
        syncLabel();
        close();
        btn.focus();
      });
      sel.addEventListener('change', syncLabel);
      wrap.appendChild(btn);
      wrap.appendChild(menu);
      sel._syncLabel = syncLabel;          // пригодится при сбросе фильтров
      syncLabel();
    });
  }

  // закрыть открытые списки при клике мимо и по Esc
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.select.is-open').forEach((w) => {
      if (!w.contains(e.target)) w.classList.remove('is-open');
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.select.is-open').forEach((w) => {
      w.classList.remove('is-open');
      const b = w.querySelector('.select-btn'); if (b) b.focus();
    });
  });
  // как у нативного селекта: при прокрутке список закрывается
  window.addEventListener('scroll', () => {
    document.querySelectorAll('.select.is-open').forEach((w) => w.classList.remove('is-open'));
  }, { passive: true });

  /* ---------- контейнеры в пути ---------- */
  function renderContainers() {
    const box = document.getElementById('containers-strip');
    if (!box) return;
    const list = allProducts();
    const items = SHOP.containers
      .map((c) => Object.assign({}, c, { items: list.filter((p) => p.container === c.code) }))
      .filter((c) => c.items.length)
      .sort((a, b) => parse(a.arrival) - parse(b.arrival));

    box.innerHTML = items.map((c) => {
      const left = leftDays(c.arrival);
      const free = c.items.filter((p) => p.status !== 'reserved' && p.status !== 'sold').length;
      return `<a class="cont-card" href="${esc(catUrl('cont=' + encodeURIComponent(c.code)))}">
        <span class="cont-head">
          <span class="cont-code">${esc(c.code)}</span>
          <span class="cont-days${left < 0 ? ' is-late' : ''}">${left >= 0
            ? esc(daysLabel(left))
            : esc(t('cnt.late', 'Рейс задерживается'))}</span>
        </span>
        <span class="cont-info">${esc(t('cont.arrive', 'прибытие'))} ${fmt(c.arrival)} · <b>${free} ${esc(freeWord(free))}</b></span>
        <span class="cont-note">${esc(lang() === 'ro' ? c.note_ro : c.note_ru)}</span>
      </a>`;
    }).join('');
    relang();
  }

  /* ---------- бейджи и счётчики на карточках главной страницы ---------- */
  function enhanceFeatured() {
    document.querySelectorAll('a.featured-card[data-id]').forEach((card) => {
      // сервер уже нарисовал бейдж и счётчик; убираем их, иначе при смене
      // языка на карточке остался бы прежний текст
      card.querySelectorAll('.st-badge, .count-box').forEach((n) => n.remove());
      const id = +card.dataset.id;
      const p = allProducts().find((x) => x.id === id);
      if (!p) return;
      const badge = document.createElement('span');
      badge.className = 'st-badge st-badge-float ' + STATUS[p.status];
      badge.textContent = statusLabel(p.status);
      card.appendChild(badge);                        // .featured-card уже position:relative

      const holder = card.querySelector('.featured-card-content') || card;

      // заголовок и описание сервер отдаёт по-русски — переводим их тоже
      const nm = lang() === 'ro' ? p.name_ro : p.name_ru;
      const h3 = holder.querySelector('h3');
      if (h3 && nm) h3.textContent = nm;
      const img = card.querySelector('img');
      if (img && nm) img.alt = nm;
      const desc = holder.querySelector('p');
      const dtxt = lang() === 'ro' ? p.desc_ro : p.desc_ru;
      if (desc && dtxt) desc.textContent = trimWords(dtxt, 18);

      const cnt = countdownHTML(p, true);
      if (cnt) holder.insertAdjacentHTML('beforeend', cnt);
    });
    relang();
  }

  /* ---------- страница товара ---------- */
  function renderProduct() {
    const host = document.getElementById('product-detail');
    if (!host) return;
    const id = +(host.dataset.id || new URLSearchParams(location.search).get('id'));
    const list = allProducts();
    const p = list.find((x) => x.id === id);
    const rel = document.getElementById('related-grid');

    if (!p) {
      host.innerHTML = `<div class="catalog-empty">${esc(t('product.notfound', 'Позиция не найдена — возможно, она уже продана.'))}
        <p><a class="btn btn-primary btn-sm" href="${esc(CAT)}">${esc(t('product.back', 'В каталог'))}</a></p></div>`;
      if (rel) rel.innerHTML = list.slice(0, 4).map((x, i) => cardHTML(x, i)).join('');
      animate();
      relang();
      return;
    }

    const name = lang() === 'ro' ? p.name_ro : p.name_ru;
    document.title = `${name} — AgroNord`;
    const bc = document.getElementById('bc-product');
    if (bc) bc.textContent = name;
    const a = actionFor(p);
    const catName = t('filter.' + p.cat, p.cat);

    host.innerHTML = `
      <div class="product-detail-grid">
        <div class="product-gallery-col fade-up">
          <div class="product-gallery">
            <img class="product-gallery-main" id="g-main" src="${esc(p.images[0])}" alt="${esc(name)}" />
            <span class="st-badge st-badge-float ${STATUS[p.status]}">${esc(statusLabel(p.status))}</span>
          </div>
          ${p.images.length > 1 ? `<div class="product-gallery-thumbs">${p.images.map((src, i) => `<button type="button" class="product-gallery-thumb${i === 0 ? ' active' : ''}" data-src="${esc(src)}" aria-label="${esc(t('product.photo', 'Фото'))} ${i + 1}"><img src="${esc(src)}" alt="" loading="lazy" /></button>`).join('')}</div>` : ''}
        </div>
        <div class="product-info fade-up delay-1">
          <div class="product-category">${esc(catName)}</div>
          <h1>${esc(name)}</h1>
          <div class="product-meta">
            <span>${esc(t('p.serial', 'Серия'))}: <b>${esc(p.serial)}</b></span>
            ${p.container && p.container !== 'склад' ? `<span>${esc(t('cnt.container', 'Контейнер'))}: <b>${esc(p.container)}</b></span>` : ''}
          </div>
          <div class="product-price">${p.price ? p.price.toLocaleString('ru-RU') + ' €' : esc(t('product.price.request', 'Цена по запросу'))}</div>
          ${countdownHTML(p)}
          ${p.status === 'reserved' ? `<div class="res-note">${ico('lock')}<span>${esc(t('cnt.reserved.other', 'Забронирован другим клиентом. Оставьте заявку — сообщим, если позиция освободится.'))}</span></div>` : ''}
          <div class="product-description"><p>${esc(lang() === 'ro' ? p.desc_ro : p.desc_ru)}</p></div>
          <div class="product-specs">
            <h3>${esc(t('product.specs', 'Характеристики'))}</h3>
            <table>
              ${p.specs.map((s) => `<tr><td>${esc(lang() === 'ro' ? (s[1] || s[0]) : s[0])}</td><td>${esc(lang() === 'ro' && s[3] ? s[3] : s[2])}</td></tr>`).join('')}
              <tr><td>${esc(t('p.serial', 'Серия'))}</td><td>${esc(p.serial)}</td></tr>
              <tr><td>${esc(t('p.container', 'Контейнер / склад'))}</td><td>${esc(p.container === 'склад' ? t('p.warehouse', 'склад в Бельцах') : p.container)}</td></tr>
            </table>
          </div>
          ${p.status === 'sold' ? '' : `<div class="discounts">
            <div class="discount">${ico('percent')}<span>${esc(t('disc.1', 'Скидка 400 €, если берёте как из контейнера, без предпродажной подготовки'))}</span></div>
            <div class="discount">${ico('percent')}<span>${esc(t('disc.2', 'Скидка 200 € при предоплате от 40 % не позднее чем за две недели до прибытия'))}</span></div>
          </div>`}
          <div class="product-actions">
            ${a.act === 'similar'
              ? `<a class="btn btn-primary" href="${esc(CAT)}">${esc(t('btn.similar', 'Смотреть похожие'))}</a>`
              : `<button type="button" class="btn ${a.cls}" data-act="${a.act}" data-id="${p.id}"${a.disabled ? ' disabled' : ''}>${esc(ctaLabel(p))}</button>`}
            <a class="btn btn-secondary btn-call" href="tel:${esc(CFG.phoneRaw || '+37360123456')}">${ico('phone')} ${esc(t('p.call', 'Позвонить'))}</a>
            <a class="btn btn-icon btn-wa" target="_blank" rel="noopener"
               href="https://wa.me/${esc(CFG.whatsapp || '37360123456')}?text=${encodeURIComponent((lang() === 'ro' ? 'Bună ziua! Mă interesează ' : 'Здравствуйте! Интересует ') + name + ', ' + t('p.serial', 'серия') + ' ' + p.serial)}" title="WhatsApp" aria-label="WhatsApp">${waIcon()}</a>
            ${CFG.viber ? `<a class="btn btn-icon btn-viber" target="_blank" rel="noopener" title="Viber" aria-label="Viber" href="viber://chat?number=%2B${esc(String(CFG.viber).replace(/\D/g, ''))}">${viberIcon()}</a>` : ''}
          </div>
        </div>
      </div>`;

    if (rel) {
      rel.innerHTML = list.filter((x) => x.id !== p.id && x.status !== 'sold')
        .sort((x, y) => (y.brand === p.brand ? 1 : 0) - (x.brand === p.brand ? 1 : 0) || parse(x.arrival) - parse(y.arrival))
        .slice(0, 4).map((x, i) => cardHTML(x, i)).join('');
    }
    animate();
    relang();
  }

  /* ---------- модальное окно брони ---------- */
  function mountModal() {
    if (document.getElementById('book-overlay')) return;
    const div = document.createElement('div');
    div.className = 'book-overlay';
    div.id = 'book-overlay';
    div.innerHTML = `
      <div class="book-modal" role="dialog" aria-modal="true" aria-labelledby="book-title">
        <button type="button" class="book-close" id="book-close" aria-label="${esc(t('form.close', 'Закрыть'))}">${ico('x')}</button>
        <h3 id="book-title">${esc(t('btn.reserve', 'Забронировать'))}</h3>
        <p class="book-sub" id="book-sub"></p>
        <form id="book-form">
          <div class="book-row">
            <div class="form-group"><label for="book-first">${esc(t('form.name', 'Имя'))}</label><input class="form-input" id="book-first" name="firstName" autocomplete="given-name" required /></div>
            <div class="form-group"><label for="book-last">${esc(t('form.surname', 'Фамилия'))}</label><input class="form-input" id="book-last" name="lastName" autocomplete="family-name" required /></div>
          </div>
          <div class="form-group"><label for="book-phone">${esc(t('form.phone', 'Телефон'))}</label><input class="form-input" id="book-phone" name="phone" type="tel" autocomplete="tel" required placeholder="+373 ___ ___ ___" /></div>
          <div class="form-group"><label for="book-comment">${esc(t('form.comment', 'Комментарий'))}</label><textarea class="form-input" id="book-comment" name="comment" rows="2"></textarea></div>
          <label class="book-consent"><input type="checkbox" id="book-consent" name="consent" required /> <span>${esc(t('form.consent', 'Согласен на обработку персональных данных'))}</span></label>
          <button type="submit" class="btn btn-accent btn-lg btn-block">${esc(t('btn.reserve', 'Забронировать'))}</button>
          <p class="form-note">${esc(t('form.note', 'Менеджер позвонит, подтвердит наличие и расскажет про предоплату.'))}</p>
        </form>
        <div id="book-done" class="book-done" hidden>
          ${ico('checkCircle', 'ico')}
          <p><b>${esc(t('form.ok.title', 'Заявка принята!'))}</b><br>${esc(t('form.ok.text', 'Менеджер свяжется с вами в ближайшее время.'))}</p>
          <button type="button" class="btn btn-primary btn-sm" id="book-done-close">${esc(t('form.close', 'Закрыть'))}</button>
        </div>
      </div>`;
    document.body.appendChild(div);

    const close = () => {
      div.classList.remove('open');
      document.body.style.overflow = '';
    };
    div.addEventListener('click', (e) => { if (e.target === div) close(); });
    div.querySelector('#book-close').addEventListener('click', close);
    div.querySelector('#book-done-close').addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && div.classList.contains('open')) close();
    });
    div.querySelector('#book-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      const data = new FormData(f);
      const id = +f.dataset.id;
      const p = allProducts().find((x) => x.id === id);
      saveBooking({
        id: Date.now(),
        productId: id,
        product: p ? (lang() === 'ro' ? p.name_ro : p.name_ru) : '',
        name: `${data.get('firstName')} ${data.get('lastName')}`.trim(),
        phone: data.get('phone'),
        comment: data.get('comment') || '',
        date: new Date().toLocaleString(lang() === 'ro' ? 'ro-RO' : 'ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        status: 'new'
      });
      f.hidden = true;
      div.querySelector('#book-done').hidden = false;
      renderAdminQueue();
    });
  }

  function openBooking(id, fromStock) {
    mountModal();
    const div = document.getElementById('book-overlay');
    const p = allProducts().find((x) => x.id === +id);
    if (!p) return;
    const name = lang() === 'ro' ? p.name_ro : p.name_ru;
    div.querySelector('#book-title').textContent = fromStock ? t('btn.inquiry', 'Оставить заявку') : t('btn.reserve', 'Забронировать');
    div.querySelector('#book-sub').textContent = `${name} · ${t('p.serial', 'серия')} ${p.serial}` +
      (isInCountry(p) ? '' : ` · ${t('cnt.expected', 'поставка ожидается')} ${fmt(p.arrival)}`);
    const form = div.querySelector('#book-form');
    form.dataset.id = p.id;
    form.hidden = false;
    form.reset();
    div.querySelector('#book-done').hidden = true;
    div.classList.add('open');
    document.body.style.overflow = 'hidden';
    const first = form.querySelector('#book-first');
    if (first) first.focus();
  }

  /* ---------- демо-админка ---------- */
  function renderAdminRows() {
    const tbody = document.getElementById('admin-rows');
    if (!tbody) return;
    const statuses = Object.keys(STATUS);
    tbody.innerHTML = allProducts().map((p) => {
      const left = leftDays(p.arrival);
      const hint = isInCountry(p)
        ? t('admin.in.country', 'уже в Молдове')
        : (left < 0 ? t('cnt.late', 'Рейс задерживается') : t('admin.left', 'осталось') + ' ' + daysLabel(left));
      return `<tr data-id="${p.id}">
        <td><span class="admin-name">${esc(lang() === 'ro' ? p.name_ro : p.name_ru)}</span><span class="admin-sub">${esc(t('p.serial', 'Серия'))} ${esc(p.serial)} · ${esc(p.container)}</span></td>
        <td><span class="st-badge ${STATUS[p.status]}">${esc(statusLabel(p.status))}</span>
            <select class="admin-input admin-input-block" data-status="${p.id}" aria-label="${esc(t('admin.col.status', 'Статус'))}">
              ${statuses.map((k) => `<option value="${k}"${k === p.status ? ' selected' : ''}>${esc(statusLabel(k))}</option>`).join('')}
            </select></td>
        <td><input class="admin-input admin-input-num" type="number" min="0" value="${p.days || 0}" data-days="${p.id}" aria-label="${esc(t('admin.col.term', 'Срок поставки'))}">
            <span class="admin-sub">${esc(dayWord(p.days || 0))}</span></td>
        <td><input class="admin-input" type="date" value="${esc(p.arrival)}" data-arrival="${p.id}" aria-label="${esc(t('admin.col.arrival', 'Дата прибытия'))}">
            <span class="admin-sub">${esc(hint)}</span></td>
      </tr>`;
    }).join('');
    renderAdminQueue();
    relang();
  }

  function renderAdminQueue() {
    const box = document.getElementById('admin-queue');
    if (!box) return;
    const list = bookings();
    if (!list.length) {
      box.innerHTML = `<div class="admin-empty">${esc(t('admin.no.bookings', 'Заявок пока нет. Оформите бронь на сайте — она появится здесь.'))}</div>`;
      return;
    }
    box.innerHTML = list.map((b) => {
      const isNew = b.status === 'new';
      return `<div class="admin-queue-item${isNew ? ' is-new' : ''}">
        <div class="admin-who">${esc(b.name)} · <a href="tel:${esc(b.phone)}">${esc(b.phone)}</a></div>
        <div class="admin-sub">${esc(b.product || '')} · ${esc(b.date)}${b.comment ? ' · ' + esc(b.comment) : ''}</div>
        <div class="admin-acts">
          ${isNew
            ? `<button type="button" class="btn btn-primary btn-sm" data-confirm="${b.id}">${ico('check')} ${esc(t('admin.confirm', 'Подтвердить бронь'))}</button>
               <button type="button" class="btn btn-secondary btn-sm" data-reject="${b.id}">${esc(t('admin.reject', 'Отказ'))}</button>`
            : `<span class="admin-sub">${esc(b.status === 'confirmed' ? t('admin.confirmed', 'подтверждена, ждёт предоплату') : t('admin.rejected', 'отказ'))}</span>`}
          <button type="button" class="btn btn-secondary btn-sm" data-mail="${b.id}" title="${esc(t('admin.mail.hint', 'в WordPress письмо уходит менеджеру автоматически'))}">${ico('mail')} E-mail</button>
        </div>
      </div>`;
    }).join('');
  }

  /* ---------- события ---------- */
  function bind() {
    // фильтры категорий (кнопки уже есть в вёрстке каталога)
    document.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.cat = btn.dataset.filter || 'all';
        state.cont = '';
        renderCatalog();
      });
    });
    favPaint();
    renderFavPage();
    const q = document.getElementById('shop-search');
    if (q) q.addEventListener('input', () => { state.q = q.value; renderCatalog(); });
    const st = document.getElementById('shop-status');
    if (st) st.addEventListener('change', () => { state.status = st.value; renderCatalog(); });
    const sr = document.getElementById('shop-sort');
    if (sr) sr.addEventListener('change', () => { state.sort = sr.value; renderCatalog(); });
    const fr = document.getElementById('shop-free');
    if (fr) fr.addEventListener('change', () => { state.free = fr.checked; renderCatalog(); });
    const rs = document.getElementById('shop-reset');
    if (rs) rs.addEventListener('click', () => {
      state.q = ''; state.cat = 'all'; state.status = 'all'; state.free = false; state.sort = 'arrival'; state.cont = '';
      if (q) q.value = '';
      if (st) st.value = 'all';
      if (sr) sr.value = 'arrival';
      if (fr) fr.checked = false;
      document.querySelectorAll('select.shop-select').forEach((s2) => s2._syncLabel && s2._syncLabel());
      document.querySelectorAll('.filter-btn').forEach((b) => b.classList.toggle('active', b.dataset.filter === 'all'));
      renderCatalog();
    });

    // кнопки «Забронировать» в карточках и на странице товара
    document.addEventListener('click', (e) => {
      // сердечко: переключаем состояние, по ссылке не уходим
      const fav = e.target.closest('.product-card-fav');
      if (fav) {
        e.preventDefault();
        e.stopPropagation();
        const on = fav.classList.toggle('is-active');
        fav.setAttribute('aria-pressed', String(on));
        favToggle(fav.dataset.favId || (fav.closest('[data-id]') || {}).dataset.id);
        // на странице избранного снятая карточка должна исчезнуть сразу
        renderFavPage();
        return;
      }
      const btn = e.target.closest('[data-act="book"]');
      if (btn && !btn.disabled) {
        e.preventDefault();
        const p = allProducts().find((x) => x.id === +btn.dataset.id);
        openBooking(btn.dataset.id, p && p.status === 'stock');
        return;
      }
      const sim = e.target.closest('[data-act="similar"]');
      if (sim) { e.preventDefault(); location.href = CAT; return; }

      // админка: подтверждение и отказ
      const c = e.target.closest('[data-confirm]');
      const r = e.target.closest('[data-reject]');
      if (c || r) {
        const list = bookings();
        const id = +((c || r).dataset.confirm || (c || r).dataset.reject);
        const b = list.find((x) => x.id === id);
        if (!b) return;
        if (c) {
          b.status = 'confirmed';
          saveOverride(b.productId, { status: 'reserved' });   // стикер «Забронировано» на витрине
        } else {
          b.status = 'rejected';
          const ov = overrides();
          if (ov[b.productId] && ov[b.productId].status === 'reserved') delete ov[b.productId].status;
          localStorage.setItem(LS.overrides, JSON.stringify(ov));
        }
        localStorage.setItem(LS.bookings, JSON.stringify(list));
        renderAdminRows();
        return;
      }
      if (e.target.closest('[data-reset-demo]')) {
        localStorage.removeItem(LS.overrides);
        localStorage.removeItem(LS.bookings);
        renderAdminRows();
        return;
      }
    });

    // админка: смена статуса, срока поставки и даты прибытия
    document.addEventListener('change', (e) => {
      const el = e.target;
      if (el.dataset.status)   { saveOverride(+el.dataset.status, { status: el.value });  renderAdminRows(); }
      if (el.dataset.days)     { saveOverride(+el.dataset.days, { days: +el.value || 0 }); renderAdminRows(); }
      if (el.dataset.arrival)  { saveOverride(+el.dataset.arrival, { arrival: el.value, days: leftDays(el.value) }); renderAdminRows(); }
    });

    // после переключения языка перерисовываем динамический контент
    document.addEventListener('click', (e) => {
      if (e.target.closest('.lang-btn')) setTimeout(() => {
        renderCatalog(); renderContainers(); renderProduct(); enhanceFeatured(); renderAdminRows();
        document.querySelectorAll('select.shop-select').forEach((s2) => s2._syncLabel && s2._syncLabel());
      }, 0);
    });
  }

  /* ---------- карточки, пришедшие из PHP ----------
     Каталог (#products-grid) перерисовывается целиком, а превью на главной
     приходит готовой разметкой с сервера — на русском. Подменяем такие
     карточки той же разметкой, что строит cardHTML(), чтобы они тоже
     переключали язык. */
  function syncStaticCards() {
    document.querySelectorAll('.product-card[data-id]').forEach((card) => {
      if (card.closest('#products-grid')) return;     // каталог рисуется отдельно
      const p = allProducts().find((x) => x.id === +card.dataset.id);
      if (!p) return;
      const delay = (card.className.match(/delay-(\d+)/) || [])[1];
      const box = document.createElement('div');
      box.innerHTML = cardHTML(p, delay ? +delay : 0).trim();
      const fresh = box.firstElementChild;
      if (fresh) card.replaceWith(fresh);
    });
  }

  /* ---------- штамп «Каталог обновлён» ----------
     Дата берётся из настроек сайта, а не из часов посетителя: важно, когда
     пополняли каталог, а не когда открыли страницу. */
  function updateStamp() {
    if (!CFG.updated) return;                         // оставляем дату из PHP
    const d = new Date(String(CFG.updated).replace(' ', 'T'));
    if (isNaN(d.getTime())) return;
    const text = d.toLocaleDateString(lang() === 'ro' ? 'ro-RO' : 'ru-RU',
      { day: '2-digit', month: '2-digit', year: 'numeric' });
    document.querySelectorAll('[data-updated]').forEach((el) => { el.textContent = text; });
  }

  /* Модальное окно брони собирается один раз при старте, поэтому его подписи
     не меняли язык. Пересобираем его целиком — но только если оно закрыто,
     чтобы не сбросить уже введённые посетителем данные. */
  function remountModal() {
    const old = document.getElementById('book-overlay');
    if (!old || old.classList.contains('open')) return;
    old.remove();
    mountModal();
  }

  /* перерисовка всех динамических блоков: при старте и при смене языка */
  function renderAll() {
    renderCatalog();
    renderContainers();
    syncStaticCards();
    enhanceFeatured();
    renderProduct();
    updateStamp();
    // у кастомных выпадающих списков подпись — копия текста <option>,
    // после перевода её нужно обновить
    document.querySelectorAll('select.shop-select').forEach((sel) => {
      if (sel._syncLabel) sel._syncLabel();
    });
    animate();
  }

  /* ---------- старт ---------- */
  function init() {
    const params = new URLSearchParams(location.search);
    if (params.get('cont')) state.cont = params.get('cont');
    if (params.get('cat')) state.cat = params.get('cat');

    mountModal();
    enhanceSelects();
    bind();
    renderAll();
    renderAdminRows();
    relang();
  }

  document.addEventListener('DOMContentLoaded', init);

  // Язык переключают кнопкой, без перезагрузки страницы. applyLang() умеет
  // только элементы с data-i18n, а карточки и счётчики строит этот файл —
  // поэтому перерисовываем их заново на новом языке.
  document.addEventListener('agro:lang', () => { remountModal(); renderAll(); relang(); });
})();

/* Галерея товара: клик по миниатюре меняет главное фото. */
document.addEventListener('click', function (e) {
  var th = e.target.closest ? e.target.closest('.product-gallery-thumb') : null;
  if (!th) return;
  var main = document.getElementById('g-main');
  var src = th.getAttribute('data-src');
  if (!main || !src) return;
  main.src = src;
  var all = th.parentNode.querySelectorAll('.product-gallery-thumb');
  for (var i = 0; i < all.length; i++) all[i].classList.remove('active');
  th.classList.add('active');
});
