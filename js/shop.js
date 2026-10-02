/* ============================================================
   AgroNord — доработка по запросу клиента
   • статус товара: в наличии / в дороге / забронировано / продан
   • счётчик поставки: сколько дней осталось до прибытия
   • кнопка «Забронировать» + форма (Имя, Фамилия, Телефон)
   • стикер «Забронировано» после подтверждения менеджером
   • фильтры: поиск по серии, «только свободные», сортировка
   Логика использует существующий движок i18n (js/i18n.js),
   поэтому все подписи автоматически работают на RU и RO.
   ============================================================ */
(function () {
  const DAY = 86400000;
  const SHOP = window.AGRO_SHOP;
  if (!SHOP) return;

  const LS = { bookings: 'agronord-bookings', overrides: 'agronord-overrides' };

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

  /* ---------- правки, которые делает менеджер в админке (демо) ---------- */
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
    // В WordPress-версии тут будет отправка письма менеджеру (план — docs/ТЗ-и-план-WordPress.md)
  }

  /* ---------- статусы ---------- */
  const STATUS = {
    stock:    { cls: 'st-stock',    color: '#16A34A' },
    transit:  { cls: 'st-transit',  color: '#F59E0B' },
    reserved: { cls: 'st-reserved', color: '#B45309' },
    sold:     { cls: 'st-sold',     color: '#6B7280' }
  };
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
     Считается в браузере от даты прибытия, поэтому не «застывает».     */
  function countdownHTML(p, compact) {
    if (p.status === 'sold') return '';
    if (isInCountry(p)) {
      const here = p.arrived || (leftDays(p.arrival) <= 0 ? p.arrival : null);
      const label = here ? `${t('cnt.arrived', 'В Молдове с')} ${fmt(here)}` : t('cnt.instock', 'В наличии на складе');
      return `<div class="count-box is-done${compact ? ' is-compact' : ''}"><span class="count-main">✅ ${label}</span></div>`;
    }
    const left = leftDays(p.arrival);
    const total = Math.max(1, Math.round((parse(p.arrival) - parse(p.start)) / DAY));
    const passed = Math.min(100, Math.max(3, Math.round(((total - left) / total) * 100)));
    const bar = `<span class="count-bar"><i style="width:${passed}%"></i></span>`;

    if (left < 0) {
      return `<div class="count-box is-late${compact ? ' is-compact' : ''}">
        <span class="count-main">⚠ ${t('cnt.late', 'Рейс задерживается')}</span>
        <span class="count-sub">${t('cnt.late.sub', 'точную дату подтверждает менеджер')} · ${t('cnt.calc', 'расчётная дата')} ${fmt(p.arrival)}</span></div>`;
    }
    if (left <= 7) {
      return `<div class="count-box is-soon${compact ? ' is-compact' : ''}">
        <span class="count-main">📦 ${t('cnt.soon', 'Ожидается со дня на день')}</span>
        <span class="count-sub">${t('cnt.expected', 'поставка ожидается')} ${fmt(p.arrival)}${p.container !== 'склад' ? ' · ' + p.container : ''}</span>${bar}</div>`;
    }
    const head = p.status === 'reserved'
      ? `🔒 ${t('cnt.resdays', 'Забронировано, до прибытия')} ${left} ${dayWord(left)}`
      : `🚚 ${t('cnt.left', 'До прибытия')} ${left} ${dayWord(left)}`;
    return `<div class="count-box${compact ? ' is-compact' : ''}">
      <span class="count-main">${head}</span>
      <span class="count-sub">${t('cnt.expected', 'поставка ожидается')} ${fmt(p.arrival)}${p.container !== 'склад' ? ' · ' + t('cnt.container', 'Контейнер') + ' ' + p.container : ''}</span>${bar}</div>`;
  }

  /* ---------- карточка товара (разметка совпадает с прежней вёрсткой) ---------- */
  function cardHTML(p, delay) {
    const st = STATUS[p.status];
    const a = actionFor(p);
    const img = (p.images && p.images[0]) || '';
    return `<a href="product.html?id=${p.id}" class="product-card fade-up${delay ? ' delay-' + delay : ''}" data-category="${p.cat}" data-id="${p.id}">
      <div class="product-card-image">
        <img src="${img}" alt="${p.name_ru}" />
        <span class="st-badge ${st.cls}">${statusLabel(p.status)}</span>
        ${p.container && p.container !== 'склад' ? `<span class="cont-tag">${t('cnt.container', 'Контейнер')} ${p.container}</span>` : ''}
        <button class="product-card-fav" onclick="event.preventDefault();" aria-label="В избранное">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        </button>
        <div class="product-card-overlay"><span class="btn btn-sm" style="background:var(--white);color:var(--dark);">${t('btn.details', 'Подробнее')}</span></div>
      </div>
      <h3>${lang() === 'ro' ? p.name_ro : p.name_ru}</h3>
      <div class="product-card-price">${p.price ? p.price.toLocaleString('ru-RU') + ' €' : t('prod.price.request', 'По запросу')}</div>
      ${countdownHTML(p, true)}
      ${p.status === 'reserved' ? `<div class="res-note">🔒 ${t('cnt.reserved.note', 'Забронирован: внесена предоплата.')}</div>` : ''}
      ${a.act === 'similar' ? '' : `<button class="btn ${a.cls} btn-sm product-card-book" data-act="${a.act}" data-id="${p.id}" ${a.disabled ? 'disabled' : ''}>${ctaLabel(p)}</button>`}
    </a>`;
  }

  /* ---------- каталог: фильтры ---------- */
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
    if (state.sort === 'name') list.sort((a, b) => (lang() === 'ro' ? a.name_ro : a.name_ru).localeCompare(lang() === 'ro' ? b.name_ro : b.name_ru));
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
    set('shop-count', `${t('catalog.shown', 'показано')} ${list.length} ${t('catalog.of', 'из')} ${total}`);
    const note = document.getElementById('cont-note');
    if (note) {
      note.innerHTML = state.cont
        ? `${t('cnt.container', 'Контейнер')}: <b>${state.cont}</b> <button type="button" class="link-btn" id="cont-reset">${t('catalog.reset', 'сбросить')}</button>`
        : '';
      const r = document.getElementById('cont-reset');
      if (r) r.addEventListener('click', () => { state.cont = ''; renderCatalog(); });
    }
    document.querySelectorAll('.filter-btn').forEach((b) => b.classList.toggle('active', !state.cont && b.dataset.filter === state.cat));
    relang();
  }

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
      return `<a class="cont-card" href="catalog.html?cont=${encodeURIComponent(c.code)}">
        <span class="cont-code">${c.code}</span>
        <span class="cont-units">${c.items.length} ${t('cont.units', 'позиций')}</span>
        <span class="cont-date">${left >= 0
          ? `${t('cont.arrive', 'прибытие')} ${fmt(c.arrival)} · ${left} ${dayWord(left)}`
          : `${t('cnt.late', 'Рейс задерживается')} · ${fmt(c.arrival)}`}</span>
        <span class="cont-free">${free} ${t('cont.free', 'свободны для брони')}</span>
        <span class="cont-note">${lang() === 'ro' ? c.note_ro : c.note_ru}</span>
      </a>`;
    }).join('');
    relang();
  }

  /* ---------- бейджи на карточках главной страницы ---------- */
  function enhanceFeatured() {
    document.querySelectorAll('a.featured-card[href*="product.html?id="]').forEach((card) => {
      if (card.querySelector('.st-badge')) return;
      const id = +card.getAttribute('href').split('=')[1];
      const p = allProducts().find((x) => x.id === id);
      if (!p) return;
      const holder = card.querySelector('.featured-card-content') || card;
      const badge = document.createElement('span');
      badge.className = 'st-badge st-badge-float ' + STATUS[p.status].cls;
      badge.textContent = statusLabel(p.status);
      const host = card.querySelector('img') ? card : holder;
      host.style.position = host.style.position || 'relative';
      host.appendChild(badge);
      const cnt = countdownHTML(p, true);
      if (cnt) holder.insertAdjacentHTML('beforeend', cnt);
    });
    relang();
  }

  /* ---------- страница товара ---------- */
  function renderProduct() {
    const host = document.getElementById('product-detail');
    if (!host) return;
    const id = +new URLSearchParams(location.search).get('id');
    const list = allProducts();
    const p = list.find((x) => x.id === id);
    const rel = document.getElementById('related-grid');

    if (!p) {
      host.innerHTML = `<div class="catalog-empty">${t('product.notfound', 'Позиция не найдена — возможно, она уже продана.')}
        <a class="btn btn-primary btn-sm" href="catalog.html">${t('product.back', 'В каталог')}</a></div>`;
      if (rel) rel.innerHTML = list.slice(0, 4).map((x, i) => cardHTML(x, i)).join('');
      relang();
      return;
    }

    document.title = `${lang() === 'ro' ? p.name_ro : p.name_ru} — AgroNord`;
    const bc = document.getElementById('bc-product');
    if (bc) bc.textContent = lang() === 'ro' ? p.name_ro : p.name_ru;
    const a = actionFor(p);
    const catName = t('filter.' + p.cat, p.cat);

    host.innerHTML = `
      <div class="product-detail-grid">
        <div class="product-gallery">
          <img class="product-gallery-main" id="g-main" src="${p.images[0]}" alt="${p.name_ru}" />
          <span class="st-badge st-badge-float ${STATUS[p.status].cls}">${statusLabel(p.status)}</span>
        </div>
        <div class="product-info fade-up delay-1">
          <div class="product-category">${catName}</div>
          <h1>${lang() === 'ro' ? p.name_ro : p.name_ru}</h1>
          <div class="product-meta">
            <span>${t('p.serial', 'Серия')}: <b>${p.serial}</b></span>
            ${p.container && p.container !== 'склад' ? `<span>${t('cnt.container', 'Контейнер')}: <b>${p.container}</b></span>` : ''}
          </div>
          <div class="product-price">${p.price ? p.price.toLocaleString('ru-RU') + ' €' : t('product.price.request', 'Цена по запросу')}</div>
          ${countdownHTML(p)}
          ${p.status === 'reserved' ? `<div class="res-note">🔒 ${t('cnt.reserved.other', 'Забронирован другим клиентом. Оставьте заявку — сообщим, если позиция освободится.')}</div>` : ''}
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
            <div class="discount">💡 ${t('disc.1', 'Скидка 400 €, если берёте как из контейнера, без предпродажной подготовки')}</div>
            <div class="discount">💡 ${t('disc.2', 'Скидка 200 € при предоплате от 40 % не позднее чем за две недели до прибытия')}</div>
          </div>`}
          <div class="product-actions">
            ${a.act === 'similar'
              ? `<a class="btn btn-primary" href="catalog.html">${t('btn.similar', 'Смотреть похожие')}</a>`
              : `<button class="btn ${a.cls}" data-act="${a.act}" data-id="${p.id}" ${a.disabled ? 'disabled' : ''}>${ctaLabel(p)}</button>`}
            <a class="btn btn-secondary" href="tel:+37360123456">📞 ${t('p.call', 'Позвонить')}</a>
            <a class="btn btn-secondary" target="_blank" rel="noopener"
               href="https://wa.me/37360123456?text=${encodeURIComponent((lang() === 'ro' ? 'Bună ziua! Mă interesează ' : 'Здравствуйте! Интересует ') + (lang() === 'ro' ? p.name_ro : p.name_ru) + ', ' + t('p.serial', 'серия') + ' ' + p.serial)}">💬 WhatsApp</a>
          </div>
        </div>
      </div>`;

    if (rel) {
      rel.innerHTML = list.filter((x) => x.id !== p.id && x.status !== 'sold')
        .sort((x, y) => (y.brand === p.brand ? 1 : 0) - (x.brand === p.brand ? 1 : 0) || parse(x.arrival) - parse(y.arrival))
        .slice(0, 4).map((x, i) => cardHTML(x, i)).join('');
    }
    relang();
  }

  /* ---------- модальное окно брони ---------- */
  function mountModal() {
    if (document.getElementById('book-overlay')) return;
    const div = document.createElement('div');
    div.className = 'book-overlay';
    div.id = 'book-overlay';
    div.innerHTML = `
      <div class="book-modal" role="dialog" aria-modal="true">
        <button class="book-close" id="book-close" aria-label="Закрыть">✕</button>
        <h3 id="book-title">${t('btn.reserve', 'Забронировать')}</h3>
        <p class="book-sub" id="book-sub"></p>
        <form id="book-form">
          <div class="book-row">
            <div class="form-group"><label class="book-lbl">${t('form.name', 'Имя')}</label><input class="form-input" required /></div>
            <div class="form-group"><label class="book-lbl">${t('form.surname', 'Фамилия')}</label><input class="form-input" required /></div>
          </div>
          <div class="form-group"><label class="book-lbl">${t('form.phone', 'Телефон')}</label><input class="form-input" type="tel" required placeholder="+373 ___ ___ ___" /></div>
          <div class="form-group"><label class="book-lbl">${t('form.comment', 'Комментарий')}</label><textarea class="form-input" rows="2"></textarea></div>
          <label class="book-consent"><input type="checkbox" required checked /> <span>${t('form.consent', 'Согласен на обработку персональных данных')}</span></label>
          <button type="submit" class="btn btn-accent btn-lg" style="width:100%">${t('btn.reserve', 'Забронировать')}</button>
          <p class="book-note">${t('form.note', 'Менеджер позвонит, подтвердит наличие и расскажет про предоплату.')}</p>
        </form>
        <div id="book-done" class="book-done" hidden>
          <b>${t('form.ok.title', 'Заявка принята!')}</b><br>${t('form.ok.text', 'Менеджер свяжется с вами в ближайшее время.')}
          <button class="btn btn-primary btn-sm" id="book-done-close" style="margin-top:12px">${t('form.close', 'Закрыть')}</button>
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
      const inputs = f.querySelectorAll('input');
      const id = +f.dataset.id;
      const p = allProducts().find((x) => x.id === id);
      saveBooking({
        id: Date.now(), productId: id,
        product: p ? (lang() === 'ro' ? p.name_ro : p.name_ru) : '',
        name: `${inputs[0].value} ${inputs[1].value}`.trim(),
        phone: inputs[2].value,
        comment: f.querySelector('textarea').value,
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
    div.querySelector('#book-sub').textContent = `${lang() === 'ro' ? p.name_ro : p.name_ru} · ${t('p.serial', 'серия')} ${p.serial}` +
      (isInCountry(p) ? '' : ` · ${t('cnt.expected', 'поставка ожидается')} ${fmt(p.arrival)}`);
    const form = div.querySelector('#book-form');
    form.dataset.id = p.id;
    form.hidden = false;
    form.reset();
    div.querySelector('#book-done').hidden = true;
    div.classList.add('open');
  }

  /* ---------- демо-админка ---------- */
  function renderAdminRows() {
    const tbody = document.getElementById('admin-rows');
    if (!tbody) return;
    tbody.innerHTML = allProducts().map((p) => {
      const left = leftDays(p.arrival);
      const hint = isInCountry(p)
        ? t('admin.in.country', 'уже в Молдове')
        : (left < 0 ? t('cnt.late', 'Рейс задерживается') : (lang() === 'ro' ? 'au rămas ' + left + ' zile' : 'осталось ' + left + ' дн.'));
      return `<tr data-id="${p.id}">
        <td><b>${p.name_ru}</b><span class="admin-sub">${t('p.serial', 'Серия')} ${p.serial} · ${p.container}</span></td>
        <td><span class="st-badge ${STATUS[p.status].cls}">${statusLabel(p.status)}</span><br>
            <select class="admin-input" data-status="${p.id}">
              ${Object.keys(STATUS).map((k) => `<option value="${k}" ${k === p.status ? 'selected' : ''}>${statusLabel(k)}</option>`).join('')}
            </select></td>
        <td><input class="admin-input" type="number" min="0" value="${p.days || 0}" data-days="${p.id}" style="width:78px"> <span class="admin-sub">${dayWord(p.days || 0)}</span></td>
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
        <div class="admin-who">${b.name} · <a href="tel:${b.phone}">${b.phone}</a></div>
        <div class="admin-sub">${b.product || ''} · ${b.date}${b.comment ? ' · ' + b.comment : ''}</div>
        <div class="admin-acts">
          ${isNew
            ? `<button class="btn btn-primary btn-sm" data-confirm="${b.id}">✔ ${t('admin.confirm', 'Подтвердить бронь')}</button>
               <button class="btn btn-secondary btn-sm" data-reject="${b.id}">${t('admin.reject', 'Отказ')}</button>`
            : `<span class="admin-sub">${b.status === 'confirmed' ? t('admin.confirmed', 'подтверждена, ждёт предоплату') : t('admin.rejected', 'отказ')}</span>`}
          <button class="btn btn-secondary btn-sm" data-mail="${b.id}" title="${t('admin.mail.hint', 'в WordPress письмо уходит менеджеру автоматически')}">✉ E-mail</button>
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

    // кнопки «Забронировать» в карточках и на странице товара
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-act="book"]');
      if (btn && !btn.disabled) {
        e.preventDefault();
        e.stopPropagation();
        const p = allProducts().find((x) => x.id === +btn.dataset.id);
        openBooking(btn.dataset.id, p && p.status === 'stock');
        return;
      }
      const sim = e.target.closest('[data-act="similar"]');
      if (sim) { e.preventDefault(); e.stopPropagation(); location.href = 'catalog.html'; return; }

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
      }, 0);
    });
  }

  /* ---------- старт ---------- */
  function init() {
    const params = new URLSearchParams(location.search);
    if (params.get('cont')) state.cont = params.get('cont');
    if (params.get('cat')) state.cat = params.get('cat');

    mountModal();
    bind();
    renderCatalog();
    renderContainers();
    enhanceFeatured();
    renderProduct();
    renderAdminRows();

    // дата обновления каталога (как на сайте-образце)
    document.querySelectorAll('[data-updated]').forEach((el) => {
      el.textContent = new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    });
    relang();
  }
  document.addEventListener('DOMContentLoaded', init);
})();
