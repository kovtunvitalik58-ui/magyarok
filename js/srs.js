// Інтервальне повторення (SM-2 з градуйованим початком).
// Плюс власна надбудова: «сходи витягування» — кожне слово проходить
// 5 щаблів від упізнавання до продукування. Щабель росте разом з інтервалом.

export const STAGES = [
  { id:0, kind:'mc_hu_ua', label:'упізнати' },     // HU → UA, вибір
  { id:1, kind:'mc_ua_hu', label:'зворотно' },     // UA → HU, вибір
  { id:2, kind:'type',     label:'написати' },     // UA → HU, набір
  { id:3, kind:'produce',  label:'у реченні' },    // клоуз у прикладі
];
const MAX_STAGE = STAGES.length - 1;

const DAY = 86400000;
const MIN = 60000;

export function newCard(id) {
  return { id, due: 0, ivl: 0, ease: 2.5, reps: 0, lapses: 0, stage: 0, state: 'new' };
}

// grade: 0 = знову, 1 = важко, 2 = добре, 3 = легко
export function schedule(card, grade, now = Date.now()) {
  const c = { ...card };
  c.reps++;

  if (grade === 0) {
    c.lapses++;
    c.ease = Math.max(1.3, c.ease - 0.2);
    c.stage = Math.max(0, c.stage - 1);
    c.state = c.state === 'new' ? 'learning' : 'relearning';
    c.ivl = 0;
    c.due = now + 8 * MIN;
    return c;
  }

  if (c.state === 'new' || c.state === 'learning' || c.state === 'relearning') {
    // Градуйований вхід: 10 хв → 1 день
    if (c.state === 'new') {
      c.state = 'learning';
      c.due = now + (grade === 3 ? DAY : 10 * MIN);
      c.ivl = grade === 3 ? 1 : 0;
      if (grade >= 2) c.stage = Math.min(MAX_STAGE, c.stage + 1);
      return c;
    }
    c.state = 'review';
    c.ivl = grade === 3 ? 3 : 1;
    c.due = now + c.ivl * DAY;
    if (grade >= 2) c.stage = Math.min(MAX_STAGE, c.stage + 1);
    return c;
  }

  // Огляд
  if (grade === 1) {
    c.ease = Math.max(1.3, c.ease - 0.15);
    c.ivl = Math.max(1, Math.round(c.ivl * 1.2));
  } else if (grade === 2) {
    c.ivl = Math.max(1, Math.round(c.ivl * c.ease));
    c.stage = Math.min(MAX_STAGE, c.stage + 1);
  } else {
    c.ease = Math.min(3.0, c.ease + 0.15);
    c.ivl = Math.max(1, Math.round(c.ivl * c.ease * 1.3));
    c.stage = Math.min(MAX_STAGE, c.stage + 1);
  }
  c.ivl = Math.min(c.ivl, 365);
  c.due = now + c.ivl * DAY;
  c.state = 'review';
  return c;
}

export function isDue(card, now = Date.now()) {
  return card.due <= now;
}

// Слово-«п'явка»: провалене 4+ рази. Такі йдуть в окремий блок і на розбір.
export function isLeech(card) {
  return card.lapses >= 4;
}

export function dueCount(cards, now = Date.now()) {
  return Object.values(cards).filter(c => c.state !== 'new' && c.due <= now).length;
}

export function humanIvl(ivl) {
  if (!ivl) return 'зараз';
  if (ivl < 30) return `${ivl} дн.`;
  if (ivl < 365) return `${Math.round(ivl/30)} міс.`;
  return `${(ivl/365).toFixed(1)} р.`;
}

// Прогноз інтервалу для підпису на кнопках оцінки
export function previewIvl(card, grade, now = Date.now()) {
  const c = schedule(card, grade, now);
  // На короткому кроці ivl ще 0 — беремо реальний час до показу, а не константу,
  // інакше підпис на кнопці розходиться з тим, що насправді зробить планувальник.
  if (c.ivl === 0) return `${Math.max(1, Math.round((c.due - now) / 60000))} хв`;
  return humanIvl(c.ivl);
}
