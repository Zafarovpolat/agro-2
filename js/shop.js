/* ============================================================
   AgroNord — доработка по запросу клиента
   Статусы техники, счётчик поставки, бронирование, фильтры,
   блок контейнеров и демо-админка.

   Оформление — строго на дизайн-системе сайта:
   те же токены (--primary / --accent / --dark / --text-light /
   --border / --radius / --shadow / --transition), те же классы
   (.btn, .form-input, .form-group, .product-card, .count-box)
   и те же иконки: SVG 24×24, stroke currentColor, скруглённые.
   Работает на существующем движке i18n (js/i18n.js) → RU / RO.
   ============================================================ */
(function () {
  const DAY = 86400000;
  const SHOP = window.AGRO_SHOP;
  if (!SHOP) return;

  const LS = { bookings: 'agronord-bookings', overrides: 'agronord-overrides' };

  /* ================= иконки (24×24, как на сайте) ================= */
  const PATHS = {
    truck: '<path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    check: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m22 4-10 10-3-3"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
    box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    tag: '<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z"/><circle cx="7.5" cy="7.5" r="1"/>',
    card: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
    key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.8 9.8 0 0 1 6.7 2.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.8 9.8 0 0 1-6.7-2.7L3 16"/><path d="M8 16H3v5"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 0 0 5 5l-9.4 9.4a2.1 2.1 0 0 1-3-3z"/><path d="M14.7 6.3 18 3l3 3-3.3 3.3"/>',
    arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/>',
    clipboard: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/>'
  };
  const icon = (name, cls) =>
    `<svg class="${cls || ''}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[name] || ''}</svg>`;

  /* ================= словарь сайта ================= */
  const T = (typeof translations !== 'undefined') ? translations : {};
  const lang = () => (typeof getLang === 'function' ? getLang() : (localStorage.getItem('agronord-lang') || 'ru'));
  const t = (key, fallback) => {
    const rec = T[key];
    if (!rec) return fallback || key;
    const l = lang();
    return rec[l] || rec.ru || fallback || key;
  };
  /* applyLang() без аргумента сбросил бы язык на русский, поэтому передаём текущий */
  const relang = () => {
    if (typeof applyLang === 'function') applyLang(typeof getLang === 'function' ? getLang() : 'ru');
  };

  /* ================= даты ================= */
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
  const dayWord = (n) => (lang() === 'ro' ? (n === 1 ? 'zi' : 'zile') : plural(n, 'день', 'дня', 'дней'));
  // «1 позиция / 2 позиции / 5 позиций», «1 poziție / 2 poziții / 20 de poziții»
  const unitsWord = (n) => (lang() === 'ro'
    ? (n === 1 ? 'poziție' : (Math.abs(n) % 100 >= 20 ? 'de poziții' : 'poziții'))
    : plural(n, 'позиция', 'позиции', 'позиций'));
  const nameOf = (p) => (lang() === 'ro' ? p.name_ro : p.name_ru);

  /* ================= данные и правки менеджера ================= */
  function overrides() {
    try { return JSON.parse(localStorage.getItem(LS.overrides) || '{}'); } catch (e) { return {}; }
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
    const list = bookings();
    list.unshift(b);
    localStorage.setItem(LS.bookings, JSON.stringify(list));
    // Этап 2 (WordPress): здесь заявка уйдёт письмом менеджеру — план в docs/ТЗ-и-план-WordPress.md
  }

  /* ================= статусы ================= */
  const STATUS = {
    stock:    { cls: 'st-stock',    ic: 'check' },
    transit:  { cls: 'st-transit',  ic: 'truck' },
    reserved: { cls: 'st-reserved', ic: 'lock' },
    sold:     { cls: 'st-sold',     ic: 'ban' }
  };
  const statusLabel = (s) => t('status.' + s, s);
  const isInCountry = (p) => p.container === 'склад' || !!p.arrived || p.status === 'stock';

  function actionFor(p) {
    if (p.status === 'sold')     return { key: 'btn.similar', act: 'similar', cls: 'btn-secondary' };
    if (p.status === 'reserved') return { key: 'status.reserved', act: 'none', cls: 'btn-secondary', disabled: true };
    if (p.status === 'stock')    return { key: 'btn.inquiry', act: 'book', cls: 'btn-secondary' };
    return { key: 'btn.reserve', act: 'book', cls: 'btn-primary' };
  }
  const ctaLabel = (p) => t(actionFor(p).key);
  const badge = (p, extra) =>
    `<span class="st-badge ${STATUS[p.status].cls}${extra ? ' ' + extra : ''}">${icon(STATUS[p.status].ic)}${statusLabel(p.status)}</span>`;

  /* ================= счётчик поставки =================
     1) в пути      → «До прибытия N дней» + полоса прогресса
     2) ≤ 7 дней    → «Ожидается со дня на день»
     3) срок истёк  → «Рейс задерживается», дату подтверждает менеджер (без минусов)
     4) прибыло     → «В Молдове с <дата>», счётчик убирается
     Считается в браузере от даты прибытия — цифры не «застывают» в кеше. */
  function countdownHTML(p, compact) {
    if (p.status === 'sold') return '';
    const cls = compact ? ' is-compact' : '';

    if (isInCountry(p)) {
      const here = p.arrived || (leftDays(p.arrival) <= 0 ? p.arrival : null);
      const value = here
        ? `${t('cnt.arrived', 'В Молдове с')} ${fmt(here)}`
        : t('cnt.instock', 'В наличии на складе');
      return `<div class="count-box is-done${cls}">
        <span class="count-label">${icon('check')}${t('cnt.status.here', 'статус')}</span>
        <span class="count-value">${value}</span>
      </div>`;
    }

    const left = leftDays(p.arrival);
    const total = Math.max(1, Math.round((parse(p.arrival) - parse(p.start)) / DAY));
    const passed = Math.min(100, Math.max(3, Math.round(((total - left) / total) * 100)));
    const bar = `<span class="count-bar"><i style="width:${passed}%"></i></span>`;
    const meta = `${t('cnt.expected', 'поставка ожидается')} ${fmt(p.arrival)}${p.container !== 'склад' ? ' · ' + t('cnt.container', 'контейнер') + ' ' + p.container : ''}`;

    if (left < 0) {
      return `<div class="count-box is-late${cls}">
        <span class="count-label">${icon('clock')}${t('cnt.late', 'Рейс задерживается')}</span>
        <span class="count-value">${t('cnt.late.short', 'Дата уточняется')}</span>
        <span class="count-meta">${t('cnt.late.sub', 'точную дату подтверждает менеджер')} · ${t('cnt.calc', 'расчётная дата')} ${fmt(p.arrival)}</span>
      </div>`;
    }
    if (left <= 7) {
      return `<div class="count-box is-soon${cls}">
        <span class="count-label">${icon('box')}${t('cnt.soon', 'Ожидается со дня на день')}</span>
        <span class="count-value">${left} ${dayWord(left)}</span>
        <span class="count-meta">${meta}</span>${bar}
      </div>`;
    }
    const label = p.status === 'reserved'
      ? `${t('cnt.resdays', 'Забронировано, до прибытия')}`
      : t('cnt.left', 'До прибытия');
    return `<div class="count-box${cls}">
      <span class="count-label">${icon('truck')}${label}</span>
      <span class="count-value">${left} ${dayWord(left)}</span>
      <span class="count-meta">${meta}</span>${bar}
    </div>`;
  }

  /* ================= карточка товара ================= */
  function cardHTML(p, delay) {
    const a = actionFor(p);
    return `<a href="product.html?id=${p.id}" class="product-card fade-up${delay ? ' delay-' + delay : ''}${p.status === 'sold' ? ' is-sold' : ''}" data-category="${p.cat}" data-id="${p.id}">
      <div class="product-card-image">
        <img src="${p.images[0]}" alt="${nameOf(p)}" />
        ${badge(p, 'st-badge-float')}
        ${p.container && p.container !== 'склад' ? `<span class="cont-tag">${icon('box')}${p.container}</span>` : ''}
        <button class="product-card-fav" onclick="event.preventDefault();" aria-label="${t('btn.fav', 'В избранное')}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        </button>
        <div class="product-card-overlay"><span class="btn btn-sm" style="background:var(--white);color:var(--dark);">${t('btn.details', 'Подробнее')}</span></div>
      </div>
      <h3>${nameOf(p)}</h3>
      <div class="product-card-meta">${t('p.serial.short', 'серия')} ${p.serial}</div>
      <div class="product-card-price">${p.price ? p.price.toLocaleString('ru-RU') + ' €' : t('prod.price.request', 'По запросу')}</div>
      ${countdownHTML(p, true)}
      ${p.status === 'reserved' ? `<div class="res-note">${icon('lock')}<span>${t('cnt.reserved.note', 'Забронирован: внесена предоплата.')}</span></div>` : ''}
      ${a.act === 'similar'
        ? `<span class="product-card-link">${t('btn.similar', 'Смотреть похожие')}${icon('arrow')}</span>`
        : `<button class="btn ${a.cls} btn-sm product-card-book" data-act="${a.act}" data-id="${p.id}" ${a.disabled ? 'disabled' : ''}>${ctaLabel(p)}</button>`}
    </a>`;
  }

  /* ================= каталог ================= */
  const state = { q: '', cat: 'all', status: 'all', free: false, sort: 'arrival', cont: '' };

  function visible() {
    let list = allProducts().filter((p) => {
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
    if (state.sort === 'name') list.sort((a, b) => nameOf(a).localeCompare(nameOf(b)));
    return list;
  }

  function renderCatalog() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    const list = visible();
    const total = allProducts().length;
    grid.innerHTML = list.map((p, i) => cardHTML(p, i % 4)).join('') ||
      `<div class="catalog-empty">${t('catalog.nothing', 'Ничего не найдено — измените фильтры')}</div>`;

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('shop-shown', list.length);
    set('shop-total', total);
    const note = document.getElementById('cont-note');
    if (note) {
      note.innerHTML = state.cont
        ? `${t('cnt.container', 'контейнер')}: <b>${state.cont}</b>
           <button type="button" class="link-btn" id="cont-reset">${t('catalog.reset', 'сбросить')}</button>`
        : '';
      const r = document.getElementById('cont-reset');
      if (r) r.addEventListener('click', () => { state.cont = ''; renderCatalog(); });
    }
    document.querySelectorAll('.filter-btn').forEach((b) => b.classList.toggle('active', !state.cont && b.dataset.filter === state.cat));
    observeFade();
    relang();
  }

  /* ================= контейнеры в пути ================= */
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
      const start = Math.min.apply(null, c.items.map((p) => parse(p.start).getTime()));
      const total = Math.max(1, Math.round((parse(c.arrival) - start) / DAY));
      const passed = Math.min(100, Math.max(3, Math.round(((total - left) / total) * 100)));
      return `<a class="cont-card fade-up${left < 0 ? ' is-late' : ''}" href="catalog.html?cont=${encodeURIComponent(c.code)}">
        <div class="cont-icon">${icon('box')}</div>
        <span class="cont-code">${c.code}</span>
        <span class="cont-units">${c.items.length} <span>${unitsWord(c.items.length)}</span></span>
        <span class="count-bar"><i style="width:${passed}%"></i></span>
        <span class="cont-date">${left >= 0
          ? `${t('cont.arrive', 'прибытие')} ${fmt(c.arrival)} · ${left} ${dayWord(left)}`
          : `${t('cnt.late', 'Рейс задерживается')} · ${fmt(c.arrival)}`}</span>
        <span class="cont-free">${t('cont.free', 'Свободно для брони')}: ${free}</span>
        <span class="cont-note">${lang() === 'ro' ? c.note_ro : c.note_ru}</span>
      </a>`;
    }).join('');
    observeFade();
    relang();
  }

  /* ================= карточки на главной (избранное) ================= */
  function enhanceFeatured() {
    document.querySelectorAll('a.featured-card[href*="product.html?id="]').forEach((card) => {
      if (card.dataset.enhanced) return;
      const id = +card.getAttribute('href').split('=')[1];
      const p = allProducts().find((x) => x.id === id);
      if (!p) return;
      card.dataset.enhanced = '1';
      card.insertAdjacentHTML('afterbegin', badge(p, 'st-badge-float'));

      const holder = card.querySelector('.featured-card-content');
      if (holder && !isInCountry(p) && p.status !== 'sold') {
        const left = leftDays(p.arrival);
        const text = left < 0
          ? t('cnt.late', 'Рейс задерживается')
          : `${t('cnt.left', 'До прибытия')} ${left} ${dayWord(left)}`;
        holder.insertAdjacentHTML('beforeend', `<span class="featured-count">${text} · ${fmt(p.arrival)}</span>`);
      }
    });
  }

  /* ================= страница товара ================= */
  function renderProduct() {
    const host = document.getElementById('product-detail');
    if (!host) return;
    const id = +new URLSearchParams(location.search).get('id');
    const list = allProducts();
    const p = list.find((x) => x.id === id);
    const rel = document.getElementById('related-grid');

    if (!p) {
      host.innerHTML = `<div class="catalog-empty">${t('product.notfound', 'Позиция не найдена — возможно, она уже продана.')}
        <p style="margin-top:16px"><a class="btn btn-primary btn-sm" href="catalog.html">${t('product.back', 'В каталог')}</a></p></div>`;
      if (rel) rel.innerHTML = list.slice(0, 4).map((x, i) => cardHTML(x, i)).join('');
      relang(); observeFade();
      return;
    }

    document.title = `${nameOf(p)} — AgroNord`;
    const bc = document.getElementById('bc-product');
    if (bc) bc.textContent = nameOf(p);
    const a = actionFor(p);

    host.innerHTML = `
      <div class="product-detail-grid">
        <div class="product-gallery">
          <img class="product-gallery-main" id="g-main" src="${p.images[0]}" alt="${nameOf(p)}" />
          ${badge(p, 'st-badge-float')}
        </div>
        <div class="product-info fade-up delay-1">
          <div class="product-category">${t('filter.' + p.cat, p.cat)}</div>
          <h1>${nameOf(p)}</h1>
          <div class="product-meta">
            <span class="product-meta-item">${icon('clipboard')}${t('p.serial', 'Серия')}: <b>${p.serial}</b></span>
            ${p.container && p.container !== 'склад' ? `<span class="product-meta-item">${icon('box')}${t('cnt.container', 'Контейнер')}: <b>${p.container}</b></span>` : `<span class="product-meta-item">${icon('box')}${t('p.warehouse', 'склад в Бельцах')}</span>`}
          </div>
          <div class="product-price">${p.price ? p.price.toLocaleString('ru-RU') + ' €' : t('product.price.request', 'Цена по запросу')}</div>
          ${countdownHTML(p)}
          ${p.status === 'reserved' ? `<div class="res-note">${icon('lock')}<span>${t('cnt.reserved.other', 'Забронирован другим клиентом. Оставьте заявку — сообщим, если позиция освободится.')}</span></div>` : ''}
          <div class="product-description"><p>${lang() === 'ro' ? p.desc_ro : p.desc_ru}</p></div>
          <div class="product-specs">
            <h3>${t('product.specs', 'Характеристики')}</h3>
            <table>
              ${p.specs.map((s) => `<tr><td>${lang() === 'ro' ? s[1] : s[0]}</td><td>${s[2]}</td></tr>`).join('')}
              <tr><td>${t('p.serial', 'Серия')}</td><td>${p.serial}</td></tr>
              <tr><td>${t('p.container', 'Контейнер / склад')}</td><td>${p.container === 'склад' ? t('p.warehouse', 'склад в Бельцах') : p.container}</td></tr>
            </table>
          </div>
          ${p.status === 'sold' ? '' : `<div class="discounts">
            <div class="discount">${icon('tag')}<span>${t('disc.1', 'Скидка 400 €, если берёте технику как из контейнера, без предпродажной подготовки.')}</span></div>
            <div class="discount">${icon('card')}<span>${t('disc.2', 'Скидка 200 € при предоплате от 40 % не позднее чем за две недели до прибытия.')}</span></div>
          </div>`}
          <div class="product-actions">
            ${a.act === 'similar'
              ? `<a class="btn btn-primary" href="catalog.html">${t('btn.similar', 'Смотреть похожие')}</a>`
              : `<button class="btn ${a.cls} ${a.cls === 'btn-primary' ? '' : 'btn-lg'} " data-act="${a.act}" data-id="${p.id}" ${a.disabled ? 'disabled' : ''}>${ctaLabel(p)}</button>`}
            <a class="btn btn-secondary" href="tel:+37360123456">${icon('phone')}${t('p.call', 'Позвонить')}</a>
            <a class="btn btn-secondary" target="_blank" rel="noopener"
               href="https://wa.me/37360123456?text=${encodeURIComponent((lang() === 'ro' ? 'Bună ziua! Mă interesează ' : 'Здравствуйте! Интересует ') + nameOf(p) + ', ' + t('p.serial', 'серия') + ' ' + p.serial)}">${icon('chat')}WhatsApp</a>
          </div>
        </div>
      </div>`;

    if (rel) {
      rel.innerHTML = list.filter((x) => x.id !== p.id && x.status !== 'sold')
        .sort((x, y) => (y.brand === p.brand ? 1 : 0) - (x.brand === p.brand ? 1 : 0) || parse(x.arrival) - parse(y.arrival))
        .slice(0, 4).map((x, i) => cardHTML(x, i)).join('');
    }
    relang();
    observeFade();
  }

  /* ================= модальное окно брони ================= */
  function mountModal() {
    if (document.getElementById('book-overlay')) return;
    const div = document.createElement('div');
    div.className = 'book-overlay';
    div.id = 'book-overlay';
    div.innerHTML = `
      <div class="book-modal" role="dialog" aria-modal="true">
        <button class="book-close" id="book-close" aria-label="${t('form.close', 'Закрыть')}">${icon('close')}</button>
        <h3 id="book-title">${t('btn.reserve', 'Забронировать')}</h3>
        <p class="book-sub" id="book-sub"></p>
        <form id="book-form">
          <div class="book-row">
            <div class="form-group"><label for="bm-name">${t('form.name', 'Имя')}</label><input class="form-input" id="bm-name" required /></div>
            <div class="form-group"><label for="bm-surname">${t('form.surname', 'Фамилия')}</label><input class="form-input" id="bm-surname" required /></div>
          </div>
          <div class="form-group"><label for="bm-phone">${t('form.phone', 'Телефон')}</label><input class="form-input" id="bm-phone" type="tel" required placeholder="+373 ___ ___ ___" /></div>
          <div class="form-group"><label for="bm-comment">${t('form.comment', 'Комментарий')}</label><textarea class="form-input" id="bm-comment" rows="2"></textarea></div>
          <label class="book-consent"><input type="checkbox" required checked /> <span>${t('form.consent', 'Согласен на обработку персональных данных для связи по заявке.')}</span></label>
          <button type="submit" class="btn btn-primary btn-lg" style="width:100%">${t('btn.reserve', 'Забронировать')}</button>
          <p class="book-note">${t('form.note', 'Менеджер позвонит, подтвердит наличие и расскажет про предоплату.')}</p>
        </form>
        <div id="book-done" class="book-done" hidden>
          <b>${t('form.ok.title', 'Заявка принята!')}</b>
          ${t('form.ok.text', 'Менеджер свяжется с вами в ближайшее время.')}
          <p style="margin-top:16px"><button class="btn btn-secondary btn-sm" id="book-done-close">${t('form.close', 'Закрыть')}</button></p>
        </div>
      </div>`;
    document.body.appendChild(div);

    const close = () => div.classList.remove('open');
    div.addEventListener('click', (e) => { if (e.target === div) close(); });
    div.querySelector('#book-close').addEventListener('click', close);
    div.querySelector('#book-done-close').addEventListener('click', close);
    div.querySelector('#book-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      const id = +f.dataset.id;
      const p = allProducts().find((x) => x.id === id);
      saveBooking({
        id: Date.now(),
        productId: id,
        product: p ? nameOf(p) : '',
        name: `${f.querySelector('#bm-name').value} ${f.querySelector('#bm-surname').value}`.trim(),
        phone: f.querySelector('#bm-phone').value,
        comment: f.querySelector('#bm-comment').value,
        date: new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
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
    div.querySelector('#book-title').textContent = fromStock ? t('btn.inquiry', 'Оставить заявку') : t('btn.reserve', 'Забронировать');
    div.querySelector('#book-sub').textContent = `${nameOf(p)} · ${t('p.serial.short', 'серия')} ${p.serial}` +
      (isInCountry(p) ? '' : ` · ${t('cnt.expected', 'поставка ожидается')} ${fmt(p.arrival)}`);
    const form = div.querySelector('#book-form');
    form.dataset.id = p.id;
    form.hidden = false;
    form.reset();
    div.querySelector('#book-done').hidden = true;
    div.classList.add('open');
  }

  /* ================= демо-админка ================= */
  function renderAdminRows() {
    const tbody = document.getElementById('admin-rows');
    if (!tbody) return;
    tbody.innerHTML = allProducts().map((p) => {
      const left = leftDays(p.arrival);
      const hint = isInCountry(p)
        ? t('admin.in.country', 'уже в Молдове')
        : (left < 0 ? t('cnt.late', 'Рейс задерживается') : (lang() === 'ro' ? `${left} zile rămase` : `осталось ${left} дн.`));
      return `<tr data-id="${p.id}">
        <td><b>${p.name_ru}</b><span class="admin-sub">${t('p.serial.short', 'серия')} ${p.serial} · ${p.container}</span></td>
        <td>${badge(p)}<br>
            <select class="admin-input" data-status="${p.id}" style="margin-top:10px">
              ${Object.keys(STATUS).map((k) => `<option value="${k}" ${k === p.status ? 'selected' : ''}>${statusLabel(k)}</option>`).join('')}
            </select></td>
        <td><input class="admin-input" type="number" min="0" value="${p.days || 0}" data-days="${p.id}" style="width:76px">
            <span class="admin-sub">${dayWord(p.days || 0)}</span></td>
        <td><input class="admin-input" type="date" value="${p.arrival}" data-arrival="${p.id}">
            <span class="admin-sub">${hint}</span></td>
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
      box.innerHTML = `<div class="admin-empty">${t('admin.no.bookings', 'Заявок пока нет. Оформите бронь на сайте — она появится здесь.')}</div>`;
      return;
    }
    box.innerHTML = list.map((b) => {
      const isNew = b.status === 'new';
      return `<div class="admin-queue-item${isNew ? ' is-new' : ''}">
        <div class="admin-who">${b.name} · <a href="tel:${b.phone}" style="color:var(--primary)">${b.phone}</a></div>
        <span class="admin-sub">${b.product || ''} · ${b.date}${b.comment ? ' · ' + b.comment : ''}</span>
        <div class="admin-acts">
          ${isNew
            ? `<button class="btn btn-primary btn-sm" data-confirm="${b.id}">${t('admin.confirm', 'Подтвердить бронь')}</button>
               <button class="btn btn-secondary btn-sm" data-reject="${b.id}">${t('admin.reject', 'Отказ')}</button>`
            : `<span class="admin-sub">${b.status === 'confirmed' ? t('admin.confirmed', 'подтверждена, ждёт предоплату') : t('admin.rejected', 'отказ')}</span>`}
          <button class="btn btn-secondary btn-sm" data-mail="${b.id}" title="${t('admin.mail.hint', 'в WordPress письмо уходит менеджеру автоматически')}">${icon('mail')}E-mail</button>
        </div>
      </div>`;
    }).join('');
  }

  /* ================= анимация появления ================= */
  let io = null;
  function observeFade() {
    const els = document.querySelectorAll('.fade-up:not(.visible)');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('visible')); return; }
    if (!io) {
      io = new IntersectionObserver((entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
      }), { threshold: .08, rootMargin: '0px 0px -40px 0px' });
    }
    els.forEach((e) => io.observe(e));
  }

  /* ================= события ================= */
  function bind() {
    document.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.cat = btn.dataset.filter || 'all';
        state.cont = '';
        renderCatalog();
      });
    });
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
      document.querySelectorAll('.filter-btn').forEach((b) => b.classList.toggle('active', b.dataset.filter === 'all'));
      renderCatalog();
    });

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-act="book"]');
      if (btn && !btn.disabled) {
        e.preventDefault(); e.stopPropagation();
        const p = allProducts().find((x) => x.id === +btn.dataset.id);
        openBooking(btn.dataset.id, p && p.status === 'stock');
        return;
      }
      const sim = e.target.closest('[data-act="similar"]');
      if (sim) { e.preventDefault(); e.stopPropagation(); location.href = 'catalog.html'; return; }

      const c = e.target.closest('[data-confirm]');
      const r = e.target.closest('[data-reject]');
      if (c || r) {
        const list = bookings();
        const id = +((c || r).dataset.confirm || (c || r).dataset.reject);
        const b = list.find((x) => x.id === id);
        if (!b) return;
        if (c) {
          b.status = 'confirmed';
          saveOverride(b.productId, { status: 'reserved' });   // на витрине появится «Забронировано»
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
      }
    });

    document.addEventListener('change', (e) => {
      const el = e.target;
      if (el.dataset.status)  { saveOverride(+el.dataset.status, { status: el.value }); renderAdminRows(); }
      if (el.dataset.days)    { saveOverride(+el.dataset.days, { days: +el.value || 0 }); renderAdminRows(); }
      if (el.dataset.arrival) { saveOverride(+el.dataset.arrival, { arrival: el.value, days: leftDays(el.value) }); renderAdminRows(); }
    });

    document.addEventListener('click', (e) => {
      if (e.target.closest('.lang-btn')) setTimeout(() => {
        renderCatalog(); renderContainers(); renderProduct(); enhanceFeatured(); renderAdminRows();
      }, 0);
    });
  }

  /* ================= старт ================= */
  function init() {
    const params = new URLSearchParams(location.search);
    if (params.get('cont')) state.cont = params.get('cont');
    if (params.get('cat')) state.cat = params.get('cat');

    mountModal();
    bind();
    renderContainers();
    enhanceFeatured();
    renderCatalog();
    renderProduct();
    renderAdminRows();
    observeFade();

    document.querySelectorAll('[data-updated]').forEach((el) => {
      el.textContent = new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    });
    relang();
  }
  document.addEventListener('DOMContentLoaded', init);
})();
