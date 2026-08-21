// Розділ «Анкі» — колоди з CSV-файлів користувача.
// Окремий від основного словника: свої картки, свій прогрес, свій формат показу.
// Тут класичний флеш-карт цикл (сторона А → відкрив → оцінив), а не сходи
// витягування зі словника: матеріал уже структурований самим користувачем.

import { DECKS, deckById, cardFront, cardBack } from '../data/anki.js';
import { newCard, schedule, isDue, previewIvl, humanIvl, isLeech } from './srs.js';
import { getState, save, haptic, todayLog, bumpStreak } from './tg.js';

// Скільки нових карток давати за один підхід. 54 нових поспіль — це не навчання,
// а перегортання: до кінця колоди перші вже забуваються. Решта прийде завтра.
const NEW_PER_SESSION = 20;

const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const shuffle = (a) => { const x=[...a]; for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];} return x; };

function stats(deck) {
  const st = getState();
  const now = Date.now();
  let fresh = 0, due = 0, learned = 0;
  for (const c of deck.cards) {
    const s = st.anki[c.id];
    if (!s || s.state === 'new') fresh++;
    else if (isDue(s, now)) due++;
    else if (s.state === 'review') learned++;
  }
  return { fresh, due, learned, total: deck.cards.length };
}

// ── Список колод ─────────────────────────────────────────────────────────
export function Anki(root, go, arg) {
  if (arg) {
    const [deckId, mode] = String(arg).split(':');
    const deck = deckById[deckId];
    if (!deck) return go('anki');
    if (mode === 'study') return Study(root, go, deck);
    if (mode === 'browse') return Browse(root, go, deck);
    return Deck(root, go, deck);
  }

  const totals = DECKS.reduce((a, d) => {
    const s = stats(d);
    return { fresh:a.fresh+s.fresh, due:a.due+s.due, total:a.total+s.total };
  }, { fresh:0, due:0, total:0 });

  root.innerHTML = `
    <button class="back" id="b">← Головна</button>
    <h2>Анкі</h2>
    <p class="dim">Колоди з твоїх CSV-файлів. Кожна картка має власний інтервал
    повторення — так само, як у словнику, але матеріал і порядок задаєш ти.</p>

    <div class="tiles-3">
      <div class="tile-stat"><b>${totals.total}</b><span>карток</span></div>
      <div class="tile-stat"><b>${totals.due}</b><span>на повторення</span></div>
      <div class="tile-stat"><b>${totals.fresh}</b><span>нових</span></div>
    </div>

    <div class="list">
      ${DECKS.map(d => {
        const s = stats(d);
        const badge = s.due ? `<span class="pill due">${s.due}</span>` : '';
        const nb = s.fresh ? `<span class="pill fresh">${s.fresh}</span>` : '';
        return `<button class="li" data-d="${d.id}">
          <div class="li-l"><b>${esc(d.title)}</b><span>${esc(d.sub)} · ${s.total} карток</span></div>
          <div class="li-r">${badge}${nb}</div></button>`;
      }).join('')}
    </div>

    <p class="dim">Щоб додати колоду — надішли мені CSV у форматі
    <code>угорська,[транскрипція] — переклад</code>.</p>`;

  root.querySelector('#b').onclick = () => go('home');
  root.querySelectorAll('.li[data-d]').forEach(b => b.onclick = () => go('anki', b.dataset.d));
}

// ── Одна колода ──────────────────────────────────────────────────────────
function Deck(root, go, deck) {
  const s = stats(deck);
  const st = getState();
  const leeches = deck.cards.filter(c => st.anki[c.id] && isLeech(st.anki[c.id])).length;
  const freshNow = Math.min(s.fresh, NEW_PER_SESSION);
  const queue = s.due + freshNow;

  root.innerHTML = `
    <button class="back" id="b">← Анкі</button>
    <h2>${esc(deck.title)}</h2>
    <div class="dim">${esc(deck.sub)}</div>

    <div class="tiles-3" style="margin-top:12px">
      <div class="tile-stat"><b>${s.fresh}</b><span>нових</span></div>
      <div class="tile-stat"><b>${s.due}</b><span>на повторення</span></div>
      <div class="tile-stat"><b>${s.learned}</b><span>відкладено</span></div>
    </div>

    <button class="btn primary xl" id="study" ${queue ? '' : 'disabled'}>
      ${queue ? '▶ Вчити' : '✓ На сьогодні все'}
      <span>${queue
        ? [s.due ? s.due + ' на повторення' : '', freshNow ? freshNow + ' нових' : ''].filter(Boolean).join(' + ')
          + (s.fresh > freshNow ? ` · ще ${s.fresh - freshNow} нових завтра` : '')
        : 'наступні картки — за розкладом повторень'}</span>
    </button>
    ${leeches ? `<div class="alert">⚠ ${leeches} карток провалено 4+ рази. Вони йдуть першими.</div>` : ''}
    <button class="btn card-btn" id="browse" style="margin-top:8px">
      <b>Переглянути всі</b><span>${s.total} карток зі станом повторення</span></button>`;

  root.querySelector('#b').onclick = () => go('anki');
  root.querySelector('#browse').onclick = () => go('anki', deck.id + ':browse');
  const sb = root.querySelector('#study');
  if (queue) sb.onclick = () => go('anki', deck.id + ':study');
}

// ── Перегляд усіх карток ─────────────────────────────────────────────────
function Browse(root, go, deck) {
  const st = getState();
  const now = Date.now();
  root.innerHTML = `
    <button class="back" id="b">← ${esc(deck.title)}</button>
    <h2>Усі картки <span class="dim">${deck.cards.length}</span></h2>
    <div class="vlist">
      ${deck.cards.map(c => {
        const s = st.anki[c.id];
        const dot = !s || s.state === 'new' ? 'new'
                  : isDue(s, now) ? 'learn'
                  : s.state === 'review' ? 'ok' : 'learn';
        const when = s && s.state === 'review' && !isDue(s, now) ? humanIvl(s.ivl) : '';
        if (c.kind === 'rule') {
          return `<div class="v"><i class="dot ${dot}"></i><div class="v-body">
            <div class="v-hu rule-front">${esc(c.front)}</div>
            <div class="v-ua">${esc(c.back)}</div>
            ${when ? `<div class="v-ex dim">через ${when}</div>` : ''}</div></div>`;
        }
        return `<div class="v"><i class="dot ${dot}"></i><div class="v-body">
          <div class="v-hu">${esc(c.hu)}</div>
          <div class="v-tr">[${esc(c.tr)}]</div>
          <div class="v-ua">${esc(c.ua)}</div>
          ${when ? `<div class="v-ex dim">через ${when}</div>` : ''}</div></div>`;
      }).join('')}
    </div>`;
  root.querySelector('#b').onclick = () => go('anki', deck.id);
}

// ── Режим навчання ───────────────────────────────────────────────────────
function Study(root, go, deck) {
  const st = getState();
  const now = Date.now();

  const dueCards  = deck.cards.filter(c => { const s = st.anki[c.id]; return s && s.state !== 'new' && isDue(s, now); });
  const freshCards = deck.cards.filter(c => !st.anki[c.id] || st.anki[c.id].state === 'new');
  // П'явки першими: провалене слово має зустрітися раніше, поки увага свіжа
  const leeches = dueCards.filter(c => isLeech(st.anki[c.id]));
  const rest    = dueCards.filter(c => !isLeech(st.anki[c.id]));

  let queue = [...leeches, ...shuffle(rest), ...freshCards.slice(0, NEW_PER_SESSION)];
  if (!queue.length) return go('anki', deck.id);

  let i = 0, answered = 0, correct = 0;
  const startedAt = Date.now();
  const retries = new Map();

  const requeue = (c) => {
    const n = (retries.get(c.id) || 0) + 1;
    retries.set(c.id, n);
    if (n <= 2) queue.push(c);
  };

  const finish = () => {
    const log = todayLog();
    log.min += Math.round((Date.now() - startedAt) / 60000);
    bumpStreak();
    save();
    const acc = answered ? Math.round(correct / answered * 100) : 0;
    root.innerHTML = `<div class="done">
      <div class="done-emoji">${acc >= 85 ? '🎯' : acc >= 65 ? '👍' : '🔁'}</div>
      <h2>Колоду пройдено</h2>
      <div class="done-stats">
        <div><b>${answered}</b><span>відповідей</span></div>
        <div><b>${acc}%</b><span>точність</span></div>
      </div>
      <button class="btn primary" id="again">Ще раз</button>
      <button class="btn ghost" id="back">До колоди</button></div>`;
    root.querySelector('#again').onclick = () => go('anki', deck.id + ':study');
    root.querySelector('#back').onclick  = () => go('anki', deck.id);
  };

  const render = () => {
    if (i >= queue.length) return finish();
    const c = queue[i];
    const card = st.anki[c.id] || newCard(c.id);
    const isRule = c.kind === 'rule';

    root.innerHTML = `
      <div class="pbar"><i style="width:${Math.round(i / queue.length * 100)}%"></i></div>
      <div class="pmeta">${i + 1} / ${queue.length} · ${esc(deck.title)}</div>
      <div class="card ${isRule ? 'grammar' : ''}">
        <div class="tag ${isRule ? 'gram' : ''}">${isRule ? 'правило вимови' : card.state === 'new' ? 'нова картка' : 'повторення'}</div>
        <div class="${isRule ? 'big-q' : 'hu big'}">${esc(cardFront(c))}</div>
      </div>
      <button class="btn primary" id="flip">Показати відповідь</button>`;

    root.querySelector('#flip').onclick = () => {
      root.querySelector('#flip').remove();
      const bar = document.createElement('div');
      bar.className = 'fb good';
      bar.innerHTML = `
        <div class="fb-head">Відповідь</div>
        <div class="fb-body">
          ${isRule ? '' : `<div class="tr-line">[${esc(c.tr)}]</div>`}
          <div class="fb-word answer">${esc(cardBack(c))}</div>
        </div>
        <div class="grades">
          <button class="g g0" data-g="0">Знову<span>8 хв</span></button>
          <button class="g g2" data-g="2">Добре<span>${previewIvl(card, 2)}</span></button>
          <button class="g g3" data-g="3">Легко<span>${previewIvl(card, 3)}</span></button>
        </div>`;
      root.appendChild(bar);
      bar.scrollIntoView({ behavior: 'smooth', block: 'end' });

      bar.querySelectorAll('.g').forEach(b => b.onclick = () => {
        const g = +b.dataset.g;
        answered++;
        if (g > 0) correct++;
        haptic(g > 0 ? 'success' : 'error');
        const log = todayLog();
        g > 0 ? log.ok++ : log.bad++;
        if (card.state === 'new') log.new++; else log.rev++;
        st.anki[c.id] = schedule(card, g);
        save();
        if (g === 0) requeue(c);
        i++;
        render();
      });
    };
    root.scrollTop = 0;
  };

  render();
}
