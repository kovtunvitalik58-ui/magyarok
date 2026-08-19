// Перевірка перед деплоєм. Запуск: node check.mjs
//
// Причина існування: неекранований апостроф у data/grammar.js зламав парсинг
// модуля, застосунок завис на екрані завантаження, і це поїхало в продакшен.
// Браузер такі помилки показує лише в консолі — зовні це виглядає як «просто висить»,
// тому очима подібне не ловиться. Ганяти перед кожним `git push`.

import { readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { pathToFileURL } from 'url';

// Мінімальне браузерне оточення: нам потрібен лише парсинг і виконання
// верхнього рівня модулів, а не робочий UI.
const noop = () => {};
const el = () => ({
  innerHTML: '', textContent: '', value: '', style: {}, dataset: {},
  classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
  appendChild: noop, addEventListener: noop, removeEventListener: noop,
  querySelector: () => null, querySelectorAll: () => [],
  scrollIntoView: noop, focus: noop, setSelectionRange: noop, remove: noop,
});
globalThis.window = {
  Telegram: undefined, addEventListener: noop, scrollTo: noop,
  location: { hostname: 'localhost', href: 'http://localhost/' },
};
globalThis.document = {
  getElementById: () => el(), createElement: el, addEventListener: noop,
  querySelector: () => null, querySelectorAll: () => [], body: el(),
};
globalThis.localStorage = { getItem: () => null, setItem: noop, removeItem: noop, clear: noop };
globalThis.location = globalThis.window.location;
// navigator у Node вже є і доступний лише для читання — не чіпаємо
globalThis.confirm = () => false;
globalThis.alert = noop;

const ROOT = import.meta.dirname;
const SKIP = new Set(['check.mjs', 'server.js']);
let failed = 0;
const fail = (msg) => { console.error('  ЗБІЙ  ' + msg); failed++; };
const check = (cond, msg) => { if (!cond) fail(msg); };

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    if (e === 'node_modules' || e.startsWith('.')) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if ((e.endsWith('.js') || e.endsWith('.mjs')) && !SKIP.has(e)) out.push(p);
  }
  return out;
}

console.log('── Синтаксис і імпорти ──');
for (const file of walk(ROOT)) {
  const rel = relative(ROOT, file).replace(/\\/g, '/');
  try {
    await import(pathToFileURL(file).href);
    console.log(`  ok    ${rel}`);
  } catch (e) {
    fail(`${rel}\n        ${e.message}`);
  }
}

console.log('\n── Цілісність даних ──');
const { VOCAB, TOPICS } = await import('./data/vocab.js');
const { GRAMMAR } = await import('./data/grammar.js');
const { QUESTIONS, PROFILE_FIELDS, fill } = await import('./data/interview.js');
const { PLAN } = await import('./data/plan.js');

// id — ключ прогресу користувача; дублікат означає злиття двох слів в одну картку
const ids = VOCAB.map(v => v.id);
check(new Set(ids).size === ids.length, 'у vocab.js дублюються id');
VOCAB.forEach(v => {
  check(v.hu && v.ua && v.ex && v.exUa, `слово ${v.id}: порожнє поле`);
  check(TOPICS[v.t], `слово ${v.id}: невідома тема "${v.t}"`);
  check(v.w >= 1 && v.w <= 39, `слово ${v.id}: тиждень ${v.w} поза планом`);
});

// Індекс правильної відповіді має існувати, інакше дрил неможливо пройти
GRAMMAR.forEach(g => {
  check(g.w >= 1 && g.w <= 39, `${g.id}: тиждень ${g.w} поза планом`);
  g.drills.forEach((d, i) => {
    check(d.opts?.[d.a] !== undefined, `${g.id} дрил ${i}: a=${d.a} виходить за межі opts`);
    check(!!d.why, `${g.id} дрил ${i}: немає пояснення`);
  });
});

// Кожен плейсхолдер має відповідне поле профілю, інакше в зразку лишиться «{NÉV}»
const known = new Set(PROFILE_FIELDS.map(f => f.tok));
QUESTIONS.forEach(q => {
  check(q.hu && q.ua && q.model, `питання ${q.id}: порожнє поле`);
  for (const m of String(q.model).matchAll(/\{([A-ZÁÉÍÓÖŐÚÜŰ_]+)\}/g)) {
    check(known.has(m[1]), `питання ${q.id}: невідомий плейсхолдер {${m[1]}}`);
  }
  check(!fill(q.model, {}).includes('{'), `питання ${q.id}: плейсхолдер лишився після підстановки`);
});

check(PLAN.length === 39, `у плані ${PLAN.length} тижнів замість 39`);

// Персональні дані не мають потрапляти в публічний репозиторій
const PERSONAL = /kovtun|ковтун|1994/i;
[['vocab', VOCAB], ['questions', QUESTIONS], ['profile', PROFILE_FIELDS]].forEach(([name, arr]) =>
  arr.forEach(o => check(!PERSONAL.test(JSON.stringify(o)), `${name}: персональні дані в ${o.id || o.k}`)));
GRAMMAR.forEach(g => check(!PERSONAL.test(JSON.stringify(g)), `grammar: персональні дані в ${g.id}`));

console.log(failed ? `\n✗ помилок: ${failed}` : '\n✓ усе чисто');
process.exit(failed ? 1 : 0);
