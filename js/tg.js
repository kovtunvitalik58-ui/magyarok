// Інтеграція з Telegram WebApp + сховище стану.
// Працює і без Telegram (звичайний браузер) — усе через feature detection.

export const tg = window.Telegram?.WebApp || null;
export const inTelegram = !!tg;

const KEY = 'hu_state_v3';

const DEFAULT_STATE = {
  startDate: null,          // ISO date коли почався курс
  cards: {},                // id -> {due, ivl, ease, reps, lapses, stage, state}
  iq: {},                   // id питання -> {seen, ok, due}
  drills: {},               // 'gid:idx' -> {due, ivl, ease, reps}
  anki: {},                 // id картки Anki -> {due, ivl, ease, reps, lapses, state}
  settings: { newPerDay: 12, maxReviews: 60 },
  daily: {},                // 'YYYY-MM-DD' -> {new:0, rev:0, min:0, done:false}
  streak: 0,
  lastStudy: null,
  errors: [],               // журнал помилок для розбору з викладачем
  profile: {},               // персональні дані для зразків відповідей — лише локально
};

let state = structuredClone(DEFAULT_STATE);
let saveTimer = null;

// CloudStorage з'явився у Bot API 6.9 — у старіших клієнтах виклик кидає помилку
function cloudOK() {
  if (!tg?.CloudStorage?.getItem) return false;
  try { return tg.isVersionAtLeast ? tg.isVersionAtLeast('6.9') : false; }
  catch (e) { return false; }
}

export function initTelegram() {
  if (!tg) return;
  try {
    tg.ready();
    tg.expand();
    if (tg.setHeaderColor) tg.setHeaderColor('secondary_bg_color');
    if (tg.enableClosingConfirmation) tg.enableClosingConfirmation();
    if (tg.disableVerticalSwipes) tg.disableVerticalSwipes();
  } catch (e) { console.warn('TG init:', e); }
}

export function haptic(type = 'light') {
  if (!tg?.HapticFeedback) return;
  try {
    if (type === 'success' || type === 'error' || type === 'warning')
      tg.HapticFeedback.notificationOccurred(type);
    else
      tg.HapticFeedback.impactOccurred(type);
  } catch (e) { /* ignore */ }
}

export async function loadState() {
  // 1) локальне сховище — швидке
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = mergeDefaults(JSON.parse(raw));
  } catch (e) { console.warn('local load:', e); }

  // 2) CloudStorage — синхронізація між пристроями (переможе, якщо новіше).
  // ОБОВ'ЯЗКОВО з таймаутом: частина клієнтів Telegram (насамперед Desktop)
  // не викликає колбек узагалі, і без запобіжника застосунок вічно висить
  // на екрані завантаження. Локальні дані вже підвантажені, тож пропуск
  // хмари — це втрата синхронізації, а не втрата прогресу.
  if (cloudOK()) {
    await new Promise((res) => {
      let done = false;
      const finish = () => { if (!done) { done = true; clearTimeout(timer); res(); } };
      const timer = setTimeout(() => {
        console.warn('CloudStorage не відповів за 2.5 с — працюємо на локальних даних');
        finish();
      }, 2500);
      try {
        tg.CloudStorage.getItem(KEY, (err, val) => {
          if (!err && val) {
            try {
              const cloud = mergeDefaults(JSON.parse(val));
              if ((cloud._ts || 0) > (state._ts || 0)) state = cloud;
            } catch (e) { /* пошкоджений JSON у хмарі — лишаємо локальний стан */ }
          }
          finish();
        });
      } catch (e) { finish(); }
    });
  }

  if (!state.startDate) state.startDate = todayISO();
  return state;
}

function mergeDefaults(s) {
  const out = structuredClone(DEFAULT_STATE);
  Object.assign(out, s);
  out.settings = { ...DEFAULT_STATE.settings, ...(s.settings || {}) };
  out.profile  = { ...DEFAULT_STATE.profile,  ...(s.profile  || {}) };
  return out;
}

export function getState() { return state; }

export function save() {
  state._ts = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* quota */ }
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (cloudOK()) {
      try { tg.CloudStorage.setItem(KEY, JSON.stringify(state), () => {}); } catch (e) { /* ignore */ }
    }
  }, 3000);
}

export function resetState() {
  state = structuredClone(DEFAULT_STATE);
  state.startDate = todayISO();
  save();
}

// ── Дати й тижні ─────────────────────────────────────────────────────────
export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export function currentWeek() {
  if (!state.startDate) return 1;
  const start = new Date(state.startDate + 'T00:00:00');
  const days = Math.floor((Date.now() - start.getTime()) / 86400000);
  return Math.max(1, Math.min(39, Math.floor(days / 7) + 1));
}

export function todayLog() {
  const k = todayISO();
  if (!state.daily[k]) state.daily[k] = { new:0, rev:0, min:0, ok:0, bad:0, done:false };
  return state.daily[k];
}

export function bumpStreak() {
  const t = todayISO();
  if (state.lastStudy === t) return;
  const y = new Date(Date.now() - 86400000);
  const yISO = `${y.getFullYear()}-${String(y.getMonth()+1).padStart(2,'0')}-${String(y.getDate()).padStart(2,'0')}`;
  state.streak = (state.lastStudy === yISO) ? state.streak + 1 : 1;
  state.lastStudy = t;
  save();
}

export function logError(entry) {
  state.errors.unshift({ ...entry, at: Date.now() });
  if (state.errors.length > 300) state.errors.length = 300;
  save();
}
