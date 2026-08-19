// Роутер і завантаження.

import { initTelegram, loadState, tg, getState, save } from './tg.js';
import { Session } from './session.js';
import { Home, Grammar, Drill, Interview, Vocab, Stats, Profile, PlanScreen } from './screens.js';

const root = document.getElementById('app');
let current = 'home';

function go(screen, arg) {
  current = screen;
  root.innerHTML = '';
  window.scrollTo(0, 0);
  updateBackButton(screen);

  switch (screen) {
    case 'home':      return Home(root, go);
    case 'learn':     return startSession();
    case 'grammar':   return Grammar(root, go, arg);
    case 'drill':     return Drill(root, go, arg);
    case 'interview': return Interview(root, go, arg);
    case 'vocab':     return Vocab(root, go);
    case 'stats':     return Stats(root, go);
    case 'profile':   return Profile(root, go);
    case 'plan':      return PlanScreen(root, go);
    default:          return Home(root, go);
  }
}

function startSession() {
  const s = new Session(root, () => go('home'));
  if (!s.queue.length) {
    root.innerHTML = `<div class="done">
      <div class="done-emoji">✅</div>
      <h2>На сьогодні все</h2>
      <p class="dim">Немає прострочених карток і вичерпано ліміт нових слів.</p>
      <p class="dim">Підніми ліміт у налаштуваннях або відпрацюй блок співбесіди.</p>
      <button class="btn primary" id="a">На головну</button></div>`;
    root.querySelector('#a').onclick = () => go('home');
    return;
  }
  s.start();
}

function updateBackButton(screen) {
  if (!tg?.BackButton) return;
  try {
    if (screen === 'home') tg.BackButton.hide();
    else tg.BackButton.show();
  } catch (e) { /* ignore */ }
}

async function boot() {
  initTelegram();

  // Сторожовий таймер: що б не сталося із завантаженням стану, застосунок
  // мусить намалюватися. Порожній екран «Завантаження…» — найгірший з можливих
  // результатів, бо не дає користувачеві ні даних, ні пояснення.
  let rendered = false;
  const watchdog = setTimeout(() => {
    if (!rendered) {
      console.warn('Завантаження стану затяглося — рендеримо головну примусово');
      rendered = true;
      go('home');
    }
  }, 6000);

  try {
    await loadState();
  } catch (e) {
    console.warn('loadState:', e);   // стан лишиться дефолтним — це робочий сценарій
  }
  clearTimeout(watchdog);

  // Обробники реєструємо завжди — навіть якщо сторож уже намалював головну.
  // Інакше застосунок працював би, але не зберігав прогрес.
  if (tg?.BackButton?.onClick) {
    try { tg.BackButton.onClick(() => go('home')); } catch (e) { /* ignore */ }
  }
  window.addEventListener('beforeunload', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });

  // Дебаг-доступ під час локальної розробки
  if (['localhost','127.0.0.1'].includes(location.hostname)) {
    window.__hu = { state: getState(), save, go };
  }

  // Перемальовуємо, навіть якщо сторож устиг раніше: стан міг доїхати з хмари
  // вже після примусового рендеру, і головна показувала б застарілі цифри.
  rendered = true;
  go('home');
}

boot().catch(err => {
  root.innerHTML = `<div class="done"><div class="done-emoji">⚠️</div>
    <h2>Помилка запуску</h2><p class="dim">${String(err)}</p></div>`;
  console.error(err);
});
