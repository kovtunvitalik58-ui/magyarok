// Рушій заняття: збирає змішану сесію і рендерить вправи.
// Методика: retrieval practice + spacing + interleaving + сходи витягування.

import { VOCAB, byId } from '../data/vocab.js';
import { GRAMMAR } from '../data/grammar.js';
import { QUESTIONS, fill } from '../data/interview.js';
import { DRILL_WORDS, WORD_UA, SUFFIXES, correctIndex, explainHarmony, harmonyClass } from './harmony.js';
import { newCard, schedule, isDue, STAGES, previewIvl, isLeech } from './srs.js';
import { getState, save, todayLog, bumpStreak, haptic, logError, currentWeek } from './tg.js';

const rnd = (n) => Math.floor(Math.random() * n);
const shuffle = (a) => { const x = [...a]; for (let i = x.length-1; i>0; i--) { const j = rnd(i+1); [x[i],x[j]]=[x[j],x[i]]; } return x; };
const sample = (a, n) => shuffle(a).slice(0, n);

// ── Нормалізація введеного тексту ────────────────────────────────────────
const DIA = { 'á':'a','é':'e','í':'i','ó':'o','ö':'o','ő':'o','ú':'u','ü':'u','ű':'u' };

export function norm(s) {
  return (s||'').toLowerCase().trim()
    .replace(/[.,!?;:„"«»()]/g,'')
    .replace(/\s+/g,' ');
}
export function stripDia(s) {
  return norm(s).split('').map(c => DIA[c] || c).join('');
}
export function checkTyped(input, target) {
  const i = norm(input), t = norm(target);
  if (i === t) return 'exact';
  // приберемо артикль на початку — не помилка
  const t2 = t.replace(/^(a|az) /,''), i2 = i.replace(/^(a|az) /,'');
  if (i2 === t2) return 'exact';
  if (stripDia(i2) === stripDia(t2)) return 'diacritic';
  return 'wrong';
}

// ── Побудова сесії ───────────────────────────────────────────────────────
export function buildSession(opts = {}) {
  const st = getState();
  const week = currentWeek();
  const now = Date.now();
  const log = todayLog();

  const unlocked = VOCAB.filter(v => v.w <= week + 1); // трохи попереду плану
  const items = [];

  // 1. Прострочені повторення
  const due = unlocked
    .map(v => st.cards[v.id])
    .filter(c => c && c.state !== 'new' && isDue(c, now))
    .sort((a,b) => a.due - b.due)
    .slice(0, st.settings.maxReviews - log.rev);

  // 2. П'явки — окремо, з підвищеним пріоритетом
  const leeches = due.filter(isLeech);
  const normal  = due.filter(c => !isLeech(c));

  // 3. Нові слова
  const newBudget = Math.max(0, st.settings.newPerDay - log.new);
  const fresh = unlocked.filter(v => !st.cards[v.id]).slice(0, newBudget);

  for (const c of [...leeches, ...normal]) items.push({ type:'vocab', wordId:c.id });
  for (const v of fresh)                    items.push({ type:'vocab', wordId:v.id, isNew:true });

  let mixed = shuffle(items);

  // 4. Вплітаємо граматичні дрили — кожен 6-й елемент
  const gPool = GRAMMAR.filter(g => g.w <= week + 1);
  const withGrammar = [];
  mixed.forEach((it, i) => {
    withGrammar.push(it);
    if (i > 0 && i % 6 === 0 && gPool.length) {
      const g = gPool[rnd(gPool.length)];
      withGrammar.push({ type:'drill', gid:g.id, idx:rnd(g.drills.length) });
    }
    if (i > 0 && i % 11 === 0) {
      withGrammar.push(makeHarmonyItem(week));
    }
    if (i > 0 && i % 17 === 0) {
      const pool = unlocked.filter(v => v.ex && v.ex.split(' ').length >= 4 && v.ex.split(' ').length <= 8);
      if (pool.length) withGrammar.push({ type:'order', wordId: pool[rnd(pool.length)].id });
    }
  });

  // 5. Хвіст — питання співбесіди
  const lvl = week <= 8 ? 1 : week <= 20 ? 2 : 3;
  const qPool = QUESTIONS.filter(q => q.lvl <= lvl);
  const qs = sample(qPool, Math.min(3, qPool.length)).map(q => ({ type:'iq', qid:q.id }));

  const final = [...withGrammar, ...qs];
  return final.length ? final : [makeHarmonyItem(week), makeHarmonyItem(week), makeHarmonyItem(week)];
}

function makeHarmonyItem(week) {
  const keys = week <= 4
    ? ['inessive','dative','plural']
    : week <= 6
      ? ['inessive','superess','adessive','dative','allative','plural']
      : Object.keys(SUFFIXES);
  const word = DRILL_WORDS[rnd(DRILL_WORDS.length)];
  const key  = keys[rnd(keys.length)];
  return { type:'harmony', word, key };
}

// ── Рендер ───────────────────────────────────────────────────────────────
export class Session {
  constructor(root, onDone) {
    this.root = root;
    this.onDone = onDone;
    this.queue = buildSession();
    this.i = 0;
    this.answered = 0;
    this.correct = 0;
    this.startedAt = Date.now();
    this.again = [];       // елементи, які треба показати ще раз у цій сесії
    this.retries = new Map(); // ключ елемента -> скільки разів повернувся
  }

  // Повертаємо елемент у чергу, але не більше двох разів за сесію:
  // далі ним керує SRS, а нескінченне коло лише виснажує.
  requeue(it) {
    const k = JSON.stringify(it);
    const n = (this.retries.get(k) || 0) + 1;
    this.retries.set(k, n);
    if (n <= 2) this.again.push(it);
  }

  get total() { return this.queue.length + this.again.length; }

  start() { this.render(); }

  next() {
    this.i++;
    if (this.i >= this.queue.length && this.again.length) {
      this.queue = this.again;
      this.again = [];
      this.i = 0;
    }
    if (this.i >= this.queue.length) return this.finish();
    this.render();
  }

  finish() {
    const st = getState();
    const log = todayLog();
    log.min += Math.round((Date.now() - this.startedAt) / 60000);
    log.done = true;
    bumpStreak();
    save();
    const acc = this.answered ? Math.round(this.correct / this.answered * 100) : 0;
    this.root.innerHTML = `
      <div class="done">
        <div class="done-emoji">${acc >= 85 ? '🎯' : acc >= 65 ? '👍' : '🔁'}</div>
        <h2>Kész! Заняття завершено</h2>
        <div class="done-stats">
          <div><b>${this.answered}</b><span>відповідей</span></div>
          <div><b>${acc}%</b><span>точність</span></div>
          <div><b>${st.streak}</b><span>днів поспіль</span></div>
        </div>
        ${acc < 65 ? '<p class="warn">Точність нижче 65%. Завтра сесія почнеться з тих самих слів — це нормально, так і має працювати.</p>' : ''}
        <button class="btn primary" id="doneBtn">На головну</button>
      </div>`;
    this.root.querySelector('#doneBtn').onclick = () => this.onDone?.();
  }

  progress() {
    const pct = Math.round(this.i / Math.max(1, this.queue.length) * 100);
    return `<div class="pbar"><i style="width:${pct}%"></i></div>
            <div class="pmeta">${this.i+1} / ${this.queue.length}</div>`;
  }

  render() {
    const it = this.queue[this.i];
    if (!it) return this.finish();
    const map = {
      vocab: () => this.renderVocab(it),
      drill: () => this.renderDrill(it),
      harmony: () => this.renderHarmony(it),
      order: () => this.renderOrder(it),
      iq: () => this.renderIQ(it),
    };
    (map[it.type] || (() => this.next()))();
    this.root.scrollTop = 0;
  }

  // ── Лексика ────────────────────────────────────────────────────────────
  renderVocab(it) {
    const st = getState();
    const w = byId[it.wordId];
    if (!w) return this.next();
    let card = st.cards[w.id] || newCard(w.id);
    const stage = STAGES[card.stage] || STAGES[0];

    if (it.isNew && card.state === 'new' && card.reps === 0) return this.renderIntro(w, card, it);

    switch (stage.kind) {
      case 'mc_hu_ua': return this.renderMC(w, card, it, 'hu');
      case 'mc_ua_hu': return this.renderMC(w, card, it, 'ua');
      case 'type':     return this.renderType(w, card, it);
      case 'produce':  return this.renderProduce(w, card, it);
      default:         return this.renderMC(w, card, it, 'hu');
    }
  }

  // Перше знайомство зі словом — без оцінювання
  renderIntro(w, card, it) {
    this.root.innerHTML = `
      ${this.progress()}
      <div class="card intro">
        <div class="tag">нове слово</div>
        <div class="hu big">${w.hu}</div>
        <div class="ua">${w.ua}</div>
        <div class="ex"><span class="hu-ex">${w.ex}</span><span class="ua-ex">${w.exUa}</span></div>
        <div class="hint">${harmonyHint(w.hu)}</div>
      </div>
      <button class="btn primary" id="ok">Зрозумів →</button>`;
    this.root.querySelector('#ok').onclick = () => {
      const st = getState();
      st.cards[w.id] = { ...card, state:'learning', due: Date.now() + 60000, stage: 0 };
      todayLog().new++;
      save();
      this.again.push({ type:'vocab', wordId:w.id });
      this.next();
    };
  }

  distractors(w, field, n = 3) {
    const pool = VOCAB.filter(v => v.id !== w.id && v.t === w.t);
    const wide = VOCAB.filter(v => v.id !== w.id);
    const pick = sample(pool.length >= n ? pool : wide, n);
    return pick.map(v => v[field]);
  }

  renderMC(w, card, it, dir) {
    const qField = dir === 'hu' ? 'hu' : 'ua';
    const aField = dir === 'hu' ? 'ua' : 'hu';
    const opts = shuffle([w[aField], ...this.distractors(w, aField)]);
    const label = dir === 'hu' ? 'Що це означає?' : 'Як це буде угорською?';

    this.root.innerHTML = `
      ${this.progress()}
      <div class="card">
        <div class="tag">${dir === 'hu' ? 'упізнавання' : 'зворотне упізнавання'}</div>
        <div class="q">${label}</div>
        <div class="${dir === 'hu' ? 'hu big' : 'ua big'}">${w[qField]}</div>
      </div>
      <div class="opts">${opts.map((o,i) => `<button class="opt" data-i="${i}">${o}</button>`).join('')}</div>`;

    this.root.querySelectorAll('.opt').forEach(btn => {
      btn.onclick = () => {
        const ok = btn.textContent === w[aField];
        this.root.querySelectorAll('.opt').forEach(b => {
          b.disabled = true;
          if (b.textContent === w[aField]) b.classList.add('right');
          else if (b === btn) b.classList.add('wrong');
        });
        this.feedbackVocab(w, card, ok, it);
      };
    });
  }

  renderType(w, card, it) {
    this.root.innerHTML = `
      ${this.progress()}
      <div class="card">
        <div class="tag">продукування</div>
        <div class="q">Напиши угорською</div>
        <div class="ua big">${w.ua}</div>
      </div>
      <input class="typed" id="inp" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="…">
      <div class="dia-row">${['á','é','í','ó','ö','ő','ú','ü','ű'].map(c=>`<button class="dia" data-c="${c}">${c}</button>`).join('')}</div>
      <button class="btn primary" id="chk">Перевірити</button>`;

    const inp = this.root.querySelector('#inp');
    inp.focus();
    this.root.querySelectorAll('.dia').forEach(b => b.onclick = () => {
      const p = inp.selectionStart ?? inp.value.length;
      inp.value = inp.value.slice(0,p) + b.dataset.c + inp.value.slice(p);
      inp.focus(); inp.setSelectionRange(p+1, p+1);
    });

    const submit = () => {
      const res = checkTyped(inp.value, w.hu);
      const ok = res !== 'wrong';
      let note = `Правильно: <b>${w.hu}</b>`;
      if (res === 'diacritic') note = `Літери вірні, але <b>довгота голосних</b> хибна.<br>Ти: <s>${inp.value}</s> → Правильно: <b>${w.hu}</b><br><i>В угорській довгота розрізняє значення (ver «б'є» / vér «кров»). Це твоя головна зона ризику.</i>`;
      this.feedbackVocab(w, card, ok, it, note, res === 'diacritic' ? 1 : null);
    };
    this.root.querySelector('#chk').onclick = submit;
    inp.onkeydown = (e) => { if (e.key === 'Enter') submit(); };
  }

  renderProduce(w, card, it) {
    const words = w.ex.split(' ');
    const target = words.find(x => norm(x).includes(norm(w.hu).split(' ')[0])) || words[rnd(words.length)];
    const blanked = w.ex.replace(target, '<span class="blank">_____</span>');
    this.root.innerHTML = `
      ${this.progress()}
      <div class="card">
        <div class="tag">у реченні</div>
        <div class="q">Встав пропущене слово</div>
        <div class="hu ex-big">${blanked}</div>
        <div class="ua-ex">${w.exUa}</div>
      </div>
      <input class="typed" id="inp" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="…">
      <div class="dia-row">${['á','é','í','ó','ö','ő','ú','ü','ű'].map(c=>`<button class="dia" data-c="${c}">${c}</button>`).join('')}</div>
      <button class="btn primary" id="chk">Перевірити</button>`;

    const inp = this.root.querySelector('#inp');
    inp.focus();
    this.root.querySelectorAll('.dia').forEach(b => b.onclick = () => {
      const p = inp.selectionStart ?? inp.value.length;
      inp.value = inp.value.slice(0,p) + b.dataset.c + inp.value.slice(p);
      inp.focus(); inp.setSelectionRange(p+1, p+1);
    });
    const submit = () => {
      const res = checkTyped(inp.value, target);
      this.feedbackVocab(w, card, res !== 'wrong', it,
        `Речення: <b>${w.ex}</b><br>${w.exUa}`);
    };
    this.root.querySelector('#chk').onclick = submit;
    inp.onkeydown = (e) => { if (e.key === 'Enter') submit(); };
  }

  feedbackVocab(w, card, ok, it, note = '', forceGrade = null) {
    this.answered++;
    if (ok) this.correct++;
    haptic(ok ? 'success' : 'error');
    const log = todayLog();
    ok ? log.ok++ : log.bad++;
    if (!ok) logError({ kind:'vocab', hu:w.hu, ua:w.ua, stage:card.stage });

    const bar = document.createElement('div');
    bar.className = 'fb ' + (ok ? 'good' : 'bad');
    bar.innerHTML = `
      <div class="fb-head">${ok ? '✓ Правильно' : '✗ Помилка'}</div>
      <div class="fb-body">
        <div class="fb-word"><b>${w.hu}</b> — ${w.ua}</div>
        ${note ? `<div class="fb-note">${note}</div>` : ''}
        <div class="fb-ex">${w.ex}<br><span class="ua-ex">${w.exUa}</span></div>
        <div class="fb-hint">${harmonyHint(w.hu)}</div>
      </div>
      <div class="grades">
        ${ok ? `
          <button class="g g1" data-g="1">Важко<span>${previewIvl(card,1)}</span></button>
          <button class="g g2" data-g="2">Добре<span>${previewIvl(card,2)}</span></button>
          <button class="g g3" data-g="3">Легко<span>${previewIvl(card,3)}</span></button>
        ` : `
          <button class="g g0" data-g="0">Ще раз<span>8 хв</span></button>
        `}
      </div>`;
    this.root.appendChild(bar);
    bar.scrollIntoView({ behavior:'smooth', block:'end' });

    bar.querySelectorAll('.g').forEach(b => b.onclick = () => {
      const g = forceGrade !== null ? forceGrade : +b.dataset.g;
      const st = getState();
      st.cards[w.id] = schedule(card, g);
      if (card.state !== 'new') todayLog().rev++;
      save();
      if (g === 0) this.requeue({ type:'vocab', wordId:w.id });
      this.next();
    });
  }

  // ── Граматичний дрил ───────────────────────────────────────────────────
  renderDrill(it) {
    const g = GRAMMAR.find(x => x.id === it.gid);
    if (!g) return this.next();
    const d = g.drills[it.idx];
    if (!d) return this.next();

    this.root.innerHTML = `
      ${this.progress()}
      <div class="card grammar">
        <div class="tag gram">граматика · ${g.title}</div>
        <div class="q big-q">${d.q}</div>
      </div>
      <div class="opts">${d.opts.map((o,i)=>`<button class="opt mono" data-i="${i}">${o}</button>`).join('')}</div>`;

    this.root.querySelectorAll('.opt').forEach(btn => btn.onclick = () => {
      const i = +btn.dataset.i;
      const ok = i === d.a;
      this.answered++; if (ok) this.correct++;
      haptic(ok ? 'success' : 'error');
      if (!ok) logError({ kind:'grammar', topic:g.title, q:d.q, why:d.why });
      this.root.querySelectorAll('.opt').forEach((b,j) => {
        b.disabled = true;
        if (j === d.a) b.classList.add('right');
        else if (j === i) b.classList.add('wrong');
      });
      const bar = document.createElement('div');
      bar.className = 'fb ' + (ok ? 'good':'bad');
      bar.innerHTML = `<div class="fb-head">${ok?'✓ Правильно':'✗ Помилка'}</div>
        <div class="fb-body"><div class="fb-note">${d.why}</div></div>
        <div class="grades"><button class="g g2" data-g="2">Далі →</button></div>`;
      this.root.appendChild(bar);
      bar.scrollIntoView({behavior:'smooth', block:'end'});
      bar.querySelector('.g').onclick = () => { if(!ok) this.requeue(it); this.next(); };
    });
  }

  // ── Авто-дрил на гармонію голосних ─────────────────────────────────────
  renderHarmony(it) {
    const set = SUFFIXES[it.key];
    const ci = correctIndex(it.word, it.key);
    const ua = WORD_UA[it.word] ? ` <span class="dim">(${WORD_UA[it.word]})</span>` : '';

    this.root.innerHTML = `
      ${this.progress()}
      <div class="card grammar">
        <div class="tag gram">гармонія голосних</div>
        <div class="q">${set.name}</div>
        <div class="hu big">${it.word}${ua} + ?</div>
      </div>
      <div class="opts">${set.forms.map((f,i)=>`<button class="opt mono" data-i="${i}">${f}</button>`).join('')}</div>`;

    this.root.querySelectorAll('.opt').forEach(btn => btn.onclick = () => {
      const i = +btn.dataset.i;
      const ok = i === ci;
      this.answered++; if (ok) this.correct++;
      haptic(ok ? 'success':'error');
      if (!ok) logError({ kind:'harmony', word:it.word, suffix:it.key });
      this.root.querySelectorAll('.opt').forEach((b,j)=>{
        b.disabled = true;
        if (j === ci) b.classList.add('right');
        else if (j === i) b.classList.add('wrong');
      });
      const full = it.word + set.forms[ci].slice(1);
      const bar = document.createElement('div');
      bar.className = 'fb ' + (ok?'good':'bad');
      bar.innerHTML = `<div class="fb-head">${ok?'✓ Правильно':'✗ Помилка'}</div>
        <div class="fb-body">
          <div class="fb-word"><b>${full}</b></div>
          <div class="fb-note">${explainHarmony(it.word, it.key)}</div>
        </div>
        <div class="grades"><button class="g g2">Далі →</button></div>`;
      this.root.appendChild(bar);
      bar.scrollIntoView({behavior:'smooth', block:'end'});
      bar.querySelector('.g').onclick = () => { if(!ok) this.requeue(it); this.next(); };
    });
  }

  // ── Збірка речення з плиток ────────────────────────────────────────────
  renderOrder(it) {
    const w = byId[it.wordId];
    if (!w) return this.next();
    const tokens = w.ex.replace(/[.!?]$/,'').split(' ');
    const tail = w.ex.slice(-1).match(/[.!?]/) ? w.ex.slice(-1) : '';
    const pool = shuffle(tokens);

    this.root.innerHTML = `
      ${this.progress()}
      <div class="card">
        <div class="tag">порядок слів</div>
        <div class="q">Збери речення</div>
        <div class="ua">${w.exUa}</div>
      </div>
      <div class="build" id="build"></div>
      <div class="tiles" id="tiles">${pool.map((t,i)=>`<button class="tile" data-t="${i}">${t}</button>`).join('')}</div>
      <button class="btn primary" id="chk">Перевірити</button>
      <button class="btn ghost sm" id="undo">← прибрати</button>`;

    const build = this.root.querySelector('#build');
    const chosen = [];
    const redraw = () => { build.textContent = chosen.join(' '); };

    this.root.querySelectorAll('.tile').forEach(t => t.onclick = () => {
      if (t.disabled) return;
      t.disabled = true; t.classList.add('used');
      chosen.push(t.textContent); redraw();
    });
    this.root.querySelector('#undo').onclick = () => {
      const last = chosen.pop(); redraw();
      if (last === undefined) return;
      const t = [...this.root.querySelectorAll('.tile')].reverse().find(x => x.disabled && x.textContent === last);
      if (t) { t.disabled = false; t.classList.remove('used'); }
    };
    this.root.querySelector('#chk').onclick = () => {
      const ok = norm(chosen.join(' ')) === norm(tokens.join(' '));
      this.answered++; if (ok) this.correct++;
      haptic(ok?'success':'error');
      if (!ok) logError({ kind:'order', ex:w.ex, got:chosen.join(' ') });
      const bar = document.createElement('div');
      bar.className = 'fb ' + (ok?'good':'bad');
      bar.innerHTML = `<div class="fb-head">${ok?'✓ Правильно':'✗ Помилка'}</div>
        <div class="fb-body">
          <div class="fb-ex"><b>${w.ex}</b><br><span class="ua-ex">${w.exUa}</span></div>
          ${ok?'':`<div class="fb-note">Ти зібрав: <s>${chosen.join(' ')}${tail}</s><br><i>Угорський порядок слів визначає ФОКУС: те, що найважливіше, стоїть безпосередньо перед дієсловом.</i></div>`}
        </div>
        <div class="grades"><button class="g g2">Далі →</button></div>`;
      this.root.appendChild(bar);
      bar.scrollIntoView({behavior:'smooth', block:'end'});
      bar.querySelector('.g').onclick = () => { if(!ok) this.requeue(it); this.next(); };
    };
  }

  // ── Питання співбесіди ─────────────────────────────────────────────────
  renderIQ(it) {
    const q = QUESTIONS.find(x => x.id === it.qid);
    if (!q) return this.next();
    this.root.innerHTML = `
      ${this.progress()}
      <div class="card konzul">
        <div class="tag konzul-tag">👤 KONZUL</div>
        <div class="hu big-q">${q.hu}</div>
        <button class="btn ghost sm" id="tr">🇺🇦 переклад</button>
        <div class="ua hidden" id="ua">${q.ua}</div>
      </div>
      <div class="note">Скажи відповідь <b>вголос</b>. Потім відкрий зразок і порівняй.</div>
      <button class="btn primary" id="show">Показати зразок</button>`;

    this.root.querySelector('#tr').onclick = () => this.root.querySelector('#ua').classList.toggle('hidden');
    this.root.querySelector('#show').onclick = () => {
      const st = getState();
      const bar = document.createElement('div');
      bar.className = 'fb good';
      bar.innerHTML = `
        <div class="fb-head">Зразок відповіді</div>
        <div class="fb-body">
          <div class="fb-word">${fill(q.model, getState().profile)}</div>
          <div class="fb-note">Ключові слова: ${q.keys.map(k=>`<code>${k}</code>`).join(' ')}</div>
        </div>
        <div class="grades">
          <button class="g g0" data-g="0">Не зміг<span>завтра</span></button>
          <button class="g g1" data-g="1">З паузами<span>3 дні</span></button>
          <button class="g g3" data-g="3">Впевнено<span>тиждень</span></button>
        </div>`;
      this.root.appendChild(bar);
      bar.scrollIntoView({behavior:'smooth', block:'end'});
      bar.querySelectorAll('.g').forEach(b => b.onclick = () => {
        const g = +b.dataset.g;
        const days = g === 0 ? 1 : g === 1 ? 3 : 7;
        st.iq[q.id] = { seen:(st.iq[q.id]?.seen||0)+1, ok:g>=1, due: Date.now()+days*86400000 };
        this.answered++; if (g>=1) this.correct++;
        if (g === 0) logError({ kind:'iq', q:q.hu, model:q.model });
        save();
        this.next();
      });
    };
  }
}

function harmonyHint(hu) {
  const first = hu.split(' ').find(x => /[a-záéíóöőúüű]/i.test(x)) || hu;
  const cls = harmonyClass(first);
  const label = { back:'задній ряд → -ban, -nak, -hoz', front:'передній ряд → -ben, -nek, -hez', rounded:'передній огублений → -ben, -nek, -höz' }[cls];
  return `гармонія: ${label}`;
}
