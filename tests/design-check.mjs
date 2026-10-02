/* ============================================================
   AgroNord — страж дизайн-системы (проверка стиля правок)
   Запуск:  node tests/design-check.mjs
   Падает (exit 1), если:
     1) в интерфейсных файлах появились эмодзи;
     2) в блоке доработок CSS есть цвет вне переменных дизайн-системы;
     3) var(--x) ссылается на переменную, которой нет;
     4) data-i18n-ключ или t('ключ') отсутствует в словаре RU/RO;
     5) в HTML нарушена парность контейнерных тегов;
     6) в вёрстке есть инлайновые style="" кроме оговорённых мест.
   ============================================================ */
import { readFileSync, readdirSync } from 'node:fs';

const HEAD_LEFT_RE = /style="display:flex;align-items:center;gap:40px;"/;
const UI = ['index.html', 'catalog.html', 'product.html', 'about.html', 'service.html', 'contacts.html', 'admin.html',
  'js/i18n.js', 'js/main.js', 'js/shop.js', 'js/data.js', 'css/style.css', 'tests/ui-test.mjs', 'README.md'];

let fail = 0;
const ok = (n) => console.log('  OK   ' + n);
const bad = (n, d = '') => { fail++; console.log('  FAIL ' + n + (d ? '\n        ' + d : '')); };
const read = (f) => readFileSync(f, 'utf8');

/* ---------- 1. эмодзи ---------- */
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{2705}\u{274C}\u{2728}\u{2B50}\u{2139}]/gu;
console.log('\n1) Эмодзи в интерфейсе и документации');
for (const f of UI) {
  const hits = [...read(f).matchAll(EMOJI)];
  hits.length ? bad(f + ': найдено эмодзи ' + hits.map((h) => h[0]).join(' ')) : ok(f + ': эмодзи нет');
}

/* ---------- 2. цвета вне токенов (блок доработок в css) ---------- */
console.log('\n2) Цвета в блоке доработок CSS');
const css = read('css/style.css');
const devBlock = css.slice(css.indexOf('ДОРАБОТКА ПО ЗАПРОСУ КЛИЕНТА'));
const noComments = devBlock.replace(/\/\*[\s\S]*?\*\//g, '');
const hexes = [...noComments.matchAll(/#[0-9A-Fa-f]{3,8}\b/g)].map((m) => m[0]);
hexes.length ? bad('в правилах доработки есть цвета вне переменных: ' + [...new Set(hexes)].join(', '))
             : ok('все цвета блока доработки взяты из var(--…)');

const rgb = [...noComments.matchAll(/rgba?\([^)]*\)/g)].map((m) => m[0]);
ok('полупрозрачные подложки поверх фото: ' + (rgb.length ? [...new Set(rgb)].join(', ') : 'нет'));

/* ---------- 3. var(--…) без объявления ---------- */
console.log('\n3) Переменные CSS');
const defined = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
const used = new Set([...css.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]));
const missing = [...used].filter((v) => !defined.has(v));
missing.length ? bad('используются необъявленные переменные: ' + missing.join(', '))
               : ok('все var(--…) объявлены (' + used.size + ' шт.)');

/* ---------- 4. ключи i18n ---------- */
console.log('\n4) Словарь RU/RO');
const i18n = read('js/i18n.js');
const dict = new Map();
for (const m of i18n.matchAll(/^\s*"([\w.]+)":\s*\{\s*ru:\s*"/gm)) dict.set(m[1], false);
for (const m of i18n.matchAll(/^\s*"([\w.]+)":\s*\{\s*ru:\s*"[^"]*",\s*ro:\s*"/gm)) dict.set(m[1], true);
const usedKeys = new Set();
for (const f of UI.filter((f) => f.endsWith('.html') || f.endsWith('.js'))) {
  const src = read(f);
  for (const m of src.matchAll(/data-i18n="([\w.]+)"/g)) usedKeys.add(m[1]);
  for (const m of src.matchAll(/\bt\(\s*'([\w.]+)'/g)) usedKeys.add(m[1]);
}
// ключи вида t('status.' + s) собираются динамически — префиксы с точкой на конце пропускаем
const noKey = [...usedKeys].filter((k) => !k.endsWith('.') && !dict.has(k));
const noRo = [...usedKeys].filter((k) => dict.has(k) && !dict.get(k));
noKey.length ? bad('ключи без записи в словаре: ' + noKey.join(', ')) : ok('все ключи есть в словаре (' + usedKeys.size + ' шт.)');
noRo.length ? bad('ключи без перевода RO: ' + noRo.join(', ')) : ok('у всех ключей есть перевод RO');
const unusedNote = [...dict.keys()].filter((k) => !usedKeys.has(k));
console.log('  INFO  ключей в словаре: ' + dict.size + ', не используются в разметке: ' + unusedNote.length);

/* ---------- 5. парность тегов ---------- */
console.log('\n5) Разметка страниц');
const TAGS = ['div', 'section', 'main', 'article', 'footer', 'header', 'ul', 'table', 'form', 'a', 'button', 'span', 'nav'];
for (const f of UI.filter((f) => f.endsWith('.html'))) {
  const src = read(f).replace(/<!--[\s\S]*?-->/g, '');
  const broken = TAGS.filter((tag) => {
    const open = (src.match(new RegExp('<' + tag + '\\b', 'g')) || []).length;
    const close = (src.match(new RegExp('</' + tag + '>', 'g')) || []).length;
    return open !== close;
  });
  broken.length ? bad(f + ': не сходится парность тегов: ' + broken.join(', ')) : ok(f + ': теги парные');
}

/* ---------- 6. инлайновые стили в новых файлах ---------- */
console.log('\n6) Инлайновые style=""');
for (const f of UI.filter((f) => f.endsWith('.html'))) {
  const inline = [...read(f).matchAll(/style="([^"]*)"/g)].map((m) => m[1]);
  inline.length ? bad(f + ': инлайновые стили: ' + inline.join(' | ')) : ok(f + ': инлайновых стилей нет');
}

console.log('\n7) Классы-утилиты системы');
const utilClasses = ['.section--white', '.section--soft', '.header-left', '.menu-toggle.is-open', '.mobile-menu-phone',
  '.lang-switch-mobile', '.section-header.is-center', '.section-more', '.actions-center', '.btn-block', '.form-note',
  '.breadcrumbs.is-offset', '.footer-backlink'];
const notInCss = utilClasses.filter((c) => !css.includes(c.split('.')[1].split(':')[0]) || !css.includes(c));
notInCss.length ? bad('в CSS нет классов: ' + notInCss.join(', ')) : ok('все классы-утилиты объявлены (' + utilClasses.length + ' шт.)');
const pages = UI.filter((f) => f.endsWith('.html'));
const oldInline = [HEAD_LEFT_RE, /style="display:none"/, /style="background:var\(--(bg|white)\)/, /style="color:var\(--primary\)"/];
const legacy = [];
for (const f of pages) for (const re of oldInline) if (re.test(read(f))) legacy.push(f + ' → ' + re);
legacy.length ? bad('остались инлайновые приёмы: ' + legacy.join(', ')) : ok('фон секций, скрытые иконки и активная ссылка — классами');

console.log('\n' + (fail ? 'ИТОГ: проверка дизайн-системы НЕ пройдена (' + fail + ' замечаний)' : 'ИТОГ: проверка дизайн-системы пройдена'));
process.exit(fail ? 1 : 0);
