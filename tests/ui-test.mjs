/* Автотесты доработки: статусы, счётчик поставки, фильтры, бронь, админка, RU/RO.
   Запуск:
     python3 -m http.server 8091   # из корня проекта
     cd /tmp && npm install jsdom
     node <путь>/tests/ui-test.mjs
*/
/* Автотест доработки agro-2: статусы, счётчик, фильтры, бронь, админка, RU/RO */
import { JSDOM } from 'jsdom';

const BASE = 'http://127.0.0.1:8091';
let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  console.log((cond ? '  ✅ ' : '  ❌ ') + name + (extra ? ' → ' + extra : ''));
  cond ? pass++ : fail++;
};

async function open(path, storage = {}, waitMs = 900) {
  const dom = await JSDOM.fromURL(BASE + path, {
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    beforeParse(win) {
      win.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
      win.HTMLElement.prototype.scrollIntoView = function () {};
      Object.entries(storage).forEach(([k, v]) => win.localStorage.setItem(k, v));
      win.__errors = [];
      win.addEventListener('error', (e) => win.__errors.push(String(e.message)));
    }
  });
  await new Promise((res) => {
    if (dom.window.document.readyState === 'complete') return res();
    dom.window.addEventListener('load', res);
    setTimeout(res, waitMs);
  });
  await new Promise((r) => setTimeout(r, 120)); // дать DOMContentLoaded-обработчикам выполниться
  return dom;
}
const snap = (win) => Object.fromEntries(Object.keys(win.localStorage).map((k) => [k, win.localStorage.getItem(k)]));
const click = (win, el) => el.dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true }));
const fire = (win, el, type) => el.dispatchEvent(new win.Event(type, { bubbles: true }));

try {
  /* ---------- 1. Главная ---------- */
  console.log('\n1) Главная страница');
  let dom = await open('/index.html');
  let d = dom.window.document, w = dom.window;
  check('ошибок JS нет', w.__errors.length === 0, w.__errors.join('; '));
  const featuredBadges = [...d.querySelectorAll('.featured-card .st-badge')].map((b) => b.textContent.trim());
  check('на избранных карточках появились стикеры статуса', featuredBadges.length === 3, featuredBadges.join(' | '));
  check('блок «Контейнеры в пути» отрисован', d.querySelectorAll('#containers-strip .cont-card').length >= 4,
    d.querySelectorAll('#containers-strip .cont-card').length + ' шт.');
  check('блок «Как купить» на месте', d.querySelectorAll('.how-step').length === 4);
  check('подпись «каталог обновлён» заполнена', /\d{2}\.\d{2}\.\d{4}/.test(d.querySelector('[data-updated]').textContent),
    d.querySelector('[data-updated]').textContent);
  const rawKeys = [...d.querySelectorAll('[data-i18n]')].filter((el) => /^(cnt|status|how|cont|admin|catalog)\./.test(el.textContent.trim()));
  check('нет непереведённых служебных ключей', rawKeys.length === 0, rawKeys.map((e) => e.textContent.trim()).slice(0, 3).join(','));

  /* переключение языка */
  click(w, d.querySelector('.lang-btn[data-lang="ro"]'));
  await new Promise((r) => setTimeout(r, 150));
  check('заголовок блока контейнеров переведён на RO', /Containere pe drum/.test(d.querySelector('#containers-strip')?.closest('section')?.textContent || ''),
    d.querySelector('#containers-strip')?.closest('section')?.querySelector('h2')?.textContent);
  click(w, d.querySelector('.lang-btn[data-lang="ru"]'));
  await new Promise((r) => setTimeout(r, 150));
  check('возврат на RU работает', /Контейнеры в пути/.test(d.querySelector('#containers-strip').closest('section').querySelector('h2').textContent));
  const storageAfterIndex = snap(w);
  w.close();

  /* ---------- 2. Каталог: рендер, статусы, счётчик ---------- */
  console.log('\n2) Каталог');
  dom = await open('/catalog.html');
  d = dom.window.document; w = dom.window;
  check('ошибок JS нет', w.__errors.length === 0, w.__errors.join('; '));
  const cards = [...d.querySelectorAll('#products-grid .product-card')];
  check('карточек отрисовано 16', cards.length === 16, cards.length + ' шт.');
  const badges = cards.map((c) => c.querySelector('.st-badge')?.textContent.trim());
  const uniq = [...new Set(badges)];
  check('встречаются все 4 статуса', uniq.length === 4, uniq.join(' | '));
  const counts = cards.map((c) => c.querySelector('.count-box')?.textContent.replace(/\s+/g, ' ').trim() || '');
  check('счётчик «До прибытия N дн.» есть', counts.some((t) => /До прибытия \d+ (дн|день|дня)/.test(t)));
  check('счётчик «Ожидается со дня на день» есть', counts.some((t) => /Ожидается со дня на день/.test(t)));
  check('счётчик «Рейс задерживается» есть (без минусов)', counts.some((t) => /Рейс задерживается/.test(t)) && !counts.some((t) => /-\d+\s*(дн|день|дня)/.test(t)));
  check('у техники в наличии — «В Молдове с <дата>»', counts.some((t) => /В Молдове с \d{2}\.\d{2}\.\d{4}/.test(t)));
  check('прогресс-бары отрисованы', d.querySelectorAll('.count-bar i').length >= 5, d.querySelectorAll('.count-bar i').length + ' шт.');
  const btns = cards.map((c) => c.querySelector('.product-card-book')?.textContent.trim()).filter(Boolean);
  check('кнопка «Забронировать» на позициях в пути', btns.includes('Забронировать'), btns.filter(Boolean).slice(0, 3).join(' | '));
  check('у наличия — «Оставить заявку»', btns.includes('Оставить заявку'));
  check('у забронированного кнопка disabled', cards.some((c) => c.querySelector('[disabled]')));

  /* фильтры */
  click(w, d.querySelector('.filter-btn[data-filter="tractors"]'));
  check('фильтр по категории «Тракторы»', d.querySelectorAll('#products-grid .product-card').length === 3,
    d.querySelectorAll('#products-grid .product-card').length + ' шт.');
  click(w, d.querySelector('.filter-btn[data-filter="all"]'));
  const q = d.getElementById('shop-search');
  q.value = '1RW8R4100PP118472'; fire(w, q, 'input');
  check('поиск по серийному номеру', d.querySelectorAll('#products-grid .product-card').length === 1,
    d.querySelector('#products-grid h3')?.textContent);
  q.value = 'CLAAS'; fire(w, q, 'input');
  check('поиск по марке', d.querySelectorAll('#products-grid .product-card').length === 1);
  q.value = ''; fire(w, q, 'input');
  const free = d.getElementById('shop-free');
  free.checked = true; fire(w, free, 'change');
  check('«Только свободные» убирает бронь и проданное', d.querySelectorAll('#products-grid .product-card').length === 14,
    d.querySelectorAll('#products-grid .product-card').length + ' шт.');
  free.checked = false; fire(w, free, 'change');
  const sort = d.getElementById('shop-sort');
  sort.value = 'new'; fire(w, sort, 'change');
  check('сортировка «сначала новые поступления» работает', d.querySelectorAll('#products-grid .product-card').length === 16);
  sort.value = 'arrival'; fire(w, sort, 'change');
  check('счётчик «показано N из N» заполнен', /показано 16 из 16/.test(d.getElementById('shop-count').textContent),
    d.getElementById('shop-count').textContent.trim());

  /* ---------- 3. Бронь из каталога ---------- */
  console.log('\n3) Бронь');
  const bookBtn = [...d.querySelectorAll('#products-grid .product-card-book')].find((b) => b.textContent.trim() === 'Забронировать');
  const cardTitle = bookBtn.closest('.product-card').querySelector('h3').textContent.trim();
  click(w, bookBtn);
  const overlay = d.getElementById('book-overlay');
  check('модалка открылась', overlay.classList.contains('open'));
  check('в модалке указан товар', overlay.querySelector('#book-sub').textContent.includes(cardTitle), overlay.querySelector('#book-sub').textContent);
  const form = overlay.querySelector('#book-form');
  const inp = form.querySelectorAll('input');
  inp[0].value = 'Иван'; inp[1].value = 'Петров'; inp[2].value = '+373 69 000 111';
  fire(w, form, 'submit');
  const bookings = JSON.parse(w.localStorage.getItem('agronord-bookings') || '[]');
  check('заявка сохранена', bookings.length === 1 && bookings[0].name === 'Иван Петров', JSON.stringify(bookings[0] || {}).slice(0, 90));
  check('клиенту показано подтверждение', form.hidden && !overlay.querySelector('#book-done').hidden);
  const st = snap(w);
  w.close();

  /* ---------- 4. Страница товара ---------- */
  console.log('\n4) Страница товара');
  dom = await open('/product.html?id=1', st);
  d = dom.window.document; w = dom.window;
  check('ошибок JS нет', w.__errors.length === 0, w.__errors.join('; '));
  check('заголовок — реальный товар, а не хардкод', /John Deere 8R/.test(d.querySelector('.product-info h1').textContent),
    d.querySelector('.product-info h1').textContent);
  check('статус «В дороге» в бейдже', d.querySelector('.st-badge').textContent.trim() === 'В дороге');
  check('серийный номер показан', /1RW8R4100PP118472/.test(d.querySelector('.product-meta').textContent));
  check('счётчик поставки на странице', /До прибытия \d+/.test(d.querySelector('.count-box').textContent));
  check('кнопка «Забронировать»', d.querySelector('[data-act="book"]')?.textContent.trim() === 'Забронировать');
  check('характеристики подставлены', d.querySelectorAll('.product-specs tr').length === 5);
  check('похожие товары отрисованы', d.querySelectorAll('#related-grid .product-card').length === 4);
  check('заголовок вкладки обновился', /John Deere 8R — AgroNord/.test(d.title), d.title);
  w.close();

  dom = await open('/product.html?id=2', st);
  d = dom.window.document; w = dom.window;
  check('забронированный товар: кнопка выключена', !!d.querySelector('[disabled]') && /Забронировано/.test(d.querySelector('[disabled]').textContent));
  check('плашка «забронирован другим клиентом»', /Забронирован другим клиентом/.test(d.querySelector('.res-note')?.textContent || ''));
  w.close();

  dom = await open('/product.html?id=999', st);
  d = dom.window.document; w = dom.window;
  check('несуществующий товар — понятное сообщение', /не найдена/.test(d.getElementById('product-detail').textContent));
  w.close();

  /* ---------- 5. Админка ---------- */
  console.log('\n5) Демо-админка');
  dom = await open('/admin.html', st);
  d = dom.window.document; w = dom.window;
  check('ошибок JS нет', w.__errors.length === 0, w.__errors.join('; '));
  check('таблица техники: 16 строк', d.querySelectorAll('#admin-rows tr').length === 16);
  check('заявка клиента видна менеджеру', /Петров/.test(d.getElementById('admin-queue').textContent));
  click(w, d.querySelector('[data-confirm]'));
  await new Promise((r) => setTimeout(r, 60));
  const ov = JSON.parse(w.localStorage.getItem('agronord-overrides') || '{}');
  check('после «Подтвердить бронь» товар → reserved', Object.values(ov).some((o) => o.status === 'reserved'),
    JSON.stringify(ov));
  check('в очереди — «подтверждена, ждёт предоплату»', /подтверждена/.test(d.getElementById('admin-queue').textContent));
  const daysInput = d.querySelector('[data-days="3"]');
  daysInput.value = '10'; fire(w, daysInput, 'change');
  await new Promise((r) => setTimeout(r, 60));
  const ov2 = JSON.parse(w.localStorage.getItem('agronord-overrides'));
  const plus10 = new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10);
  check('смена срока поставки пересчитала дату прибытия', ov2['3']?.days === 10 &&
    d.querySelector('[data-arrival="3"]').value === plus10,
    'поле даты: ' + d.querySelector('[data-arrival="3"]').value + ' (ожидалось ' + plus10 + ')');
  const arrivalInput = d.querySelector('[data-arrival="4"]');
  arrivalInput.value = '2026-12-01'; fire(w, arrivalInput, 'change');
  await new Promise((r) => setTimeout(r, 60));
  const ov3 = JSON.parse(w.localStorage.getItem('agronord-overrides'));
  check('правка даты прибытия сохранилась', ov3['4']?.arrival === '2026-12-01');
  const st2 = snap(w);
  w.close();

  /* ---------- 6. Витрина после правок менеджера ---------- */
  console.log('\n6) Витрина после правок из админки');
  dom = await open('/catalog.html?cont=AGRU-2210', st2);
  d = dom.window.document; w = dom.window;
  check('фильтр по контейнеру из ссылки работает', d.querySelectorAll('#products-grid .product-card').length > 0 &&
    /AGRU-2210/.test(d.getElementById('cont-note').textContent), d.querySelectorAll('#products-grid .product-card').length + ' позиций');
  const cont = d.getElementById('cont-note').querySelector('#cont-reset');
  click(w, cont);
  check('сброс фильтра контейнера', d.querySelectorAll('#products-grid .product-card').length === 16);
  const badgesNow = [...d.querySelectorAll('#products-grid .st-badge')].map((b) => b.textContent.trim());
  check('стикер «Забронировано» появился после подтверждения', badgesNow.filter((b) => b === 'Забронировано').length >= 2,
    badgesNow.join(' | '));
  const updatedCard = [...d.querySelectorAll('#products-grid .product-card')].find((c) => c.dataset.id === '3');
  check('срок 10 дней из админки виден на витрине', /До прибытия 10 (дн|день|дня)/.test(updatedCard.querySelector('.count-box').textContent),
    updatedCard.querySelector('.count-box').textContent.replace(/\s+/g, ' ').trim().slice(0, 60));
  w.close();

  /* ---------- 7. Сброс демо-данных ---------- */
  console.log('\n7) Сброс демо-данных');
  dom = await open('/admin.html', st2);
  d = dom.window.document; w = dom.window;
  click(w, d.querySelector('[data-reset-demo]'));
  await new Promise((r) => setTimeout(r, 60));
  check('демо-данные очищены', !w.localStorage.getItem('agronord-overrides') && !w.localStorage.getItem('agronord-bookings'));
  w.close();

  console.log(`\nИТОГ: ${pass} пройдено, ${fail} провалено`);
  process.exit(fail ? 1 : 0);
} catch (e) {
  console.error('\nТЕСТ УПАЛ С ОШИБКОЙ:', e.message);
  process.exit(1);
}
