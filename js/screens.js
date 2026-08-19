// Екрани застосунку.

import { VOCAB, TOPICS, byId } from '../data/vocab.js';
import { GRAMMAR } from '../data/grammar.js';
import { QUESTIONS, IQ_BLOCKS, PROFILE_FIELDS, fill } from '../data/interview.js';
import { PLAN, PHASES, weekInfo } from '../data/plan.js';
import { getState, save, currentWeek, todayLog, todayISO, resetState, haptic, tg } from './tg.js';
import { dueCount, isLeech, humanIvl, STAGES } from './srs.js';

const md = (s) => s
  .replace(/&/g,'&amp;').replace(/</g,'&lt;')
  .replace(/\*\*(.+?)\*\*/g,'<b>$1</b>')
  .replace(/\*(.+?)\*/g,'<i>$1</i>')
  .replace(/`(.+?)`/g,'<code>$1</code>')
  .split('\n\n').map(p => {
    if (p.trim().startsWith('|')) return table(p);
    if (/^[-•]/m.test(p.trim())) return '<ul>' + p.split('\n').filter(Boolean).map(l=>`<li>${l.replace(/^[-•]\s*/,'')}</li>`).join('') + '</ul>';
    return `<p>${p.replace(/\n/g,'<br>')}</p>`;
  }).join('');

function table(block) {
  const rows = block.trim().split('\n').filter(r => r.includes('|'));
  const cells = rows.map(r => r.split('|').slice(1,-1).map(c => c.trim()));
  const body = cells.filter(r => !r.every(c => /^-+$/.test(c) || c === ''));
  if (!body.length) return '';
  const [head, ...rest] = body;
  return `<table><thead><tr>${head.map(c=>`<th>${c}</th>`).join('')}</tr></thead>
    <tbody>${rest.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

// ── Головна ──────────────────────────────────────────────────────────────
export function Home(root, go) {
  const st = getState();
  const w = currentWeek();
  const info = weekInfo(w);
  const ph = PHASES[info.phase];
  const log = todayLog();
  const due = dueCount(st.cards);
  const unlocked = VOCAB.filter(v => v.w <= w + 1);
  const known = unlocked.filter(v => st.cards[v.id] && st.cards[v.id].state === 'review').length;
  const newLeft = Math.max(0, st.settings.newPerDay - log.new);
  const leeches = Object.values(st.cards).filter(isLeech).length;
  const prev = w > 1 ? weekInfo(w-1) : null;
  const profileFilled = PROFILE_FIELDS.filter(f => (st.profile[f.k] || '').trim()).length;

  root.innerHTML = `
    <div class="hero">
      <div class="hero-top">
        <span class="badge" style="--c:${ph.color}">${ph.name}</span>
        <span class="streak">🔥 ${st.streak}</span>
      </div>
      <h1>Тиждень ${w} / 39</h1>
      <div class="hero-sub">${info.title}</div>
      <div class="hero-focus">${info.focus}</div>
      ${prev ? `<div class="prev">Минулого тижня: ${prev.title}</div>` : ''}
    </div>

    <div class="tiles-3">
      <div class="tile-stat"><b>${due}</b><span>на повторення</span></div>
      <div class="tile-stat"><b>${newLeft}</b><span>нових сьогодні</span></div>
      <div class="tile-stat"><b>${known}</b><span>засвоєно</span></div>
    </div>

    <button class="btn primary xl" id="start">
      ${log.done ? '↻ Ще одне заняття' : '▶ Почати заняття дня'}
      <span>${due + Math.min(newLeft, 12)} карток · ~15 хв</span>
    </button>

    ${leeches ? `<div class="alert">⚠ ${leeches} проблемних слів. Вони йдуть першими в кожній сесії.</div>` : ''}
    ${profileFilled < 5 ? `<button class="alert alert-btn" id="pnudge">⚠ Профіль заповнено на ${profileFilled} з ${PROFILE_FIELDS.length}. Поки що зразки відповідей описують вигадану людину — заповни свої дані, інакше вивчиш чужу біографію.</button>` : ''}

    <div class="row-2">
      <button class="btn card-btn" id="gram"><b>Граматика</b><span>${GRAMMAR.filter(g=>g.w<=w+1).length} модулів</span></button>
      <button class="btn card-btn" id="iq"><b>Консул</b><span>симуляція</span></button>
    </div>
    <div class="row-2">
      <button class="btn card-btn" id="voc"><b>Словник</b><span>${unlocked.length} слів</span></button>
      <button class="btn card-btn" id="stats"><b>Прогрес</b><span>і помилки</span></button>
    </div>
    <div class="row-2">
      <button class="btn card-btn" id="prof"><b>Мій профіль</b><span>${profileFilled} / ${PROFILE_FIELDS.length} полів</span></button>
      <button class="btn card-btn" id="plan"><b>План</b><span>39 тижнів</span></button>
    </div>

    <div class="today-line">
      Сьогодні: ${log.ok + log.bad} відповідей · ${log.ok + log.bad ? Math.round(log.ok/(log.ok+log.bad)*100) : 0}% точність · ${log.min} хв
    </div>`;

  root.querySelector('#start').onclick = () => go('learn');
  root.querySelector('#gram').onclick  = () => go('grammar');
  root.querySelector('#iq').onclick    = () => go('interview');
  root.querySelector('#voc').onclick   = () => go('vocab');
  root.querySelector('#stats').onclick = () => go('stats');
  root.querySelector('#prof').onclick  = () => go('profile');
  root.querySelector('#plan').onclick  = () => go('plan');
  root.querySelector('#pnudge')?.addEventListener('click', () => go('profile'));
}

// ── План на 39 тижнів ────────────────────────────────────────────────────
export function PlanScreen(root, go) {
  const w = currentWeek();
  root.innerHTML = `
    <button class="back" id="b">← Головна</button>
    <h2>План на 39 тижнів</h2>
    <p class="dim">Тиждень визначається датою старту курсу — її можна змінити в «Прогрес».</p>
    ${Object.entries(PHASES).map(([n, ph]) => `
      <h3 class="dim-h" style="color:${ph.color}">${ph.name}</h3>
      <div class="list">
        ${PLAN.filter(p => p.phase === +n).map(p => `
          <div class="li ${p.w === w ? 'now' : p.w < w ? 'past' : 'locked'}">
            <div class="li-l"><b>${p.w}. ${p.title}</b><span>${p.focus}</span></div>
            <div class="li-r">${p.w === w ? '← зараз' : ''}</div>
          </div>`).join('')}
      </div>`).join('')}`;
  root.querySelector('#b').onclick = () => go('home');
}

// ── Граматика ────────────────────────────────────────────────────────────
export function Grammar(root, go, arg) {
  const w = currentWeek();
  if (arg) {
    const g = GRAMMAR.find(x => x.id === arg);
    if (g) {
      root.innerHTML = `
        <button class="back" id="b">← Граматика</button>
        <div class="gram-head">
          <div class="tag gram">Тиждень ${g.w}</div>
          <h2>${g.title}</h2>
          <div class="dim">${g.short}</div>
        </div>
        <div class="prose">${md(g.explain)}</div>
        <button class="btn primary" id="drill">Дрил (${g.drills.length} питань)</button>`;
      root.querySelector('#b').onclick = () => go('grammar');
      root.querySelector('#drill').onclick = () => go('drill', g.id);
      return;
    }
  }

  const avail = GRAMMAR.filter(g => g.w <= w + 1);
  const later = GRAMMAR.filter(g => g.w > w + 1);
  root.innerHTML = `
    <button class="back" id="b">← Головна</button>
    <h2>Граматика</h2>
    <div class="list">
      ${avail.map(g => `<button class="li" data-id="${g.id}">
        <div class="li-l"><b>${g.title}</b><span>${g.short}</span></div>
        <div class="li-r">т.${g.w}</div></button>`).join('')}
    </div>
    ${later.length ? `<h3 class="dim-h">Попереду</h3>
      <div class="list dim-list">
        ${later.map(g=>`<div class="li locked"><div class="li-l"><b>${g.title}</b><span>${g.short}</span></div><div class="li-r">т.${g.w}</div></div>`).join('')}
      </div>` : ''}`;
  root.querySelector('#b').onclick = () => go('home');
  root.querySelectorAll('.li[data-id]').forEach(b => b.onclick = () => go('grammar', b.dataset.id));
}

// ── Дрил окремого модуля ─────────────────────────────────────────────────
export function Drill(root, go, gid) {
  const g = GRAMMAR.find(x => x.id === gid);
  if (!g) return go('grammar');
  let i = 0, ok = 0;

  const render = () => {
    if (i >= g.drills.length) {
      root.innerHTML = `<div class="done">
        <div class="done-emoji">${ok === g.drills.length ? '🎯' : '📘'}</div>
        <h2>${ok} / ${g.drills.length}</h2>
        <p class="dim">${g.title}</p>
        <button class="btn primary" id="again">Ще раз</button>
        <button class="btn ghost" id="back">До граматики</button></div>`;
      root.querySelector('#again').onclick = () => { i=0; ok=0; render(); };
      root.querySelector('#back').onclick = () => go('grammar', g.id);
      return;
    }
    const d = g.drills[i];
    root.innerHTML = `
      <div class="pbar"><i style="width:${Math.round(i/g.drills.length*100)}%"></i></div>
      <div class="pmeta">${i+1} / ${g.drills.length} · ${g.title}</div>
      <div class="card grammar"><div class="q big-q">${d.q}</div></div>
      <div class="opts">${d.opts.map((o,j)=>`<button class="opt mono" data-i="${j}">${o}</button>`).join('')}</div>`;
    root.querySelectorAll('.opt').forEach(btn => btn.onclick = () => {
      const j = +btn.dataset.i, good = j === d.a;
      if (good) ok++;
      haptic(good ? 'success' : 'error');
      root.querySelectorAll('.opt').forEach((b,k)=>{ b.disabled=true;
        if (k===d.a) b.classList.add('right'); else if (k===j) b.classList.add('wrong'); });
      const bar = document.createElement('div');
      bar.className = 'fb ' + (good?'good':'bad');
      bar.innerHTML = `<div class="fb-head">${good?'✓':'✗'}</div>
        <div class="fb-body"><div class="fb-note">${d.why}</div></div>
        <div class="grades"><button class="g g2">Далі →</button></div>`;
      root.appendChild(bar);
      bar.scrollIntoView({behavior:'smooth',block:'end'});
      bar.querySelector('.g').onclick = () => { i++; render(); };
    });
  };
  render();
}

// ── Симуляція консула ────────────────────────────────────────────────────
export function Interview(root, go, arg) {
  const st = getState();
  const w = currentWeek();
  const lvl = w <= 8 ? 1 : w <= 20 ? 2 : 3;

  if (!arg) {
    const blocks = Object.entries(IQ_BLOCKS).map(([k,name]) => {
      const qs = QUESTIONS.filter(q => q.b === k && q.lvl <= lvl);
      const done = qs.filter(q => st.iq[q.id]?.ok).length;
      return { k, name, total: qs.length, done };
    }).filter(b => b.total > 0);

    root.innerHTML = `
      <button class="back" id="b">← Головна</button>
      <h2>Консульська симуляція</h2>
      <p class="dim">Доступний рівень ${lvl} з 3 (за тижнем плану). Відповідай <b>вголос</b> — не подумки.</p>
      <button class="btn primary xl" id="full">▶ Повна співбесіда<span>10 питань поспіль, без підказок</span></button>
      <h3 class="dim-h">За блоками</h3>
      <div class="list">
        ${blocks.map(b=>`<button class="li" data-b="${b.k}">
          <div class="li-l"><b>${b.name}</b><span>${b.done} / ${b.total} відпрацьовано</span></div>
          <div class="li-r">→</div></button>`).join('')}
      </div>`;
    root.querySelector('#b').onclick = () => go('home');
    root.querySelector('#full').onclick = () => go('interview', 'full');
    root.querySelectorAll('.li[data-b]').forEach(b => b.onclick = () => go('interview', b.dataset.b));
    return;
  }

  const pool = arg === 'full'
    ? shuffleArr(QUESTIONS.filter(q => q.lvl <= lvl)).slice(0, 10)
    : QUESTIONS.filter(q => q.b === arg && q.lvl <= lvl);

  if (!pool.length) return go('interview');
  let i = 0, scores = [];

  const render = () => {
    if (i >= pool.length) {
      const avg = scores.reduce((a,b)=>a+b,0) / Math.max(1,scores.length);
      const verdict = avg >= 2.5 ? 'Готовність висока.' : avg >= 1.5 ? 'Є база, але паузи довгі. Ще одне коло.' : 'Слабко. Повернись до зразків відповідей і вивчи їх напам\'ять.';
      root.innerHTML = `<div class="done">
        <div class="done-emoji">${avg>=2.5?'🎯':avg>=1.5?'⚙️':'🔁'}</div>
        <h2>Співбесіда завершена</h2>
        <p class="dim">Середня впевненість: ${avg.toFixed(1)} / 3</p>
        <p class="warn">${verdict}</p>
        <button class="btn primary" id="again">Ще раз</button>
        <button class="btn ghost" id="back">Назад</button></div>`;
      root.querySelector('#again').onclick = () => { i=0; scores=[]; render(); };
      root.querySelector('#back').onclick = () => go('interview');
      return;
    }
    const q = pool[i];
    root.innerHTML = `
      <div class="pbar"><i style="width:${Math.round(i/pool.length*100)}%"></i></div>
      <div class="pmeta">Питання ${i+1} / ${pool.length}</div>
      <div class="card konzul">
        <div class="tag konzul-tag">👤 KONZUL</div>
        <div class="hu big-q">${q.hu}</div>
        <div class="row-btns">
          <button class="btn ghost sm" id="tr">🇺🇦 переклад</button>
        </div>
        <div class="ua hidden" id="ua">${q.ua}</div>
      </div>
      <div class="note">Відповідай вголос. Не поспішай, але й не мовчи більше 5 секунд — на реальній співбесіді пауза читається як незнання.</div>
      <button class="btn primary" id="show">Показати зразок</button>`;
    root.querySelector('#tr').onclick = () => root.querySelector('#ua').classList.toggle('hidden');
    root.querySelector('#show').onclick = () => {
      const bar = document.createElement('div');
      bar.className = 'fb good';
      bar.innerHTML = `<div class="fb-head">Зразок</div>
        <div class="fb-body">
          <div class="fb-word">${fill(q.model, st.profile)}</div>
          <div class="fb-note">Мають прозвучати: ${q.keys.map(k=>`<code>${k}</code>`).join(' ')}</div>
        </div>
        <div class="grades">
          <button class="g g0" data-s="0">Не зміг</button>
          <button class="g g1" data-s="2">З паузами</button>
          <button class="g g3" data-s="3">Впевнено</button>
        </div>`;
      root.appendChild(bar);
      bar.scrollIntoView({behavior:'smooth',block:'end'});
      bar.querySelectorAll('.g').forEach(b => b.onclick = () => {
        const s = +b.dataset.s;
        scores.push(s);
        st.iq[q.id] = { seen:(st.iq[q.id]?.seen||0)+1, ok:s>=2, due:Date.now()+(s>=2?7:1)*86400000 };
        save(); i++; render();
      });
    };
  };
  render();
}

// ── Мій профіль ──────────────────────────────────────────────────────────
// Дані живуть лише на пристрої. У вихідному коді їх немає й ніколи не буде.
export function Profile(root, go) {
  const st = getState();
  const filled = PROFILE_FIELDS.filter(f => (st.profile[f.k] || '').trim()).length;

  root.innerHTML = `
    <button class="back" id="b">← Головна</button>
    <h2>Мій профіль</h2>
    <p class="dim">Ці дані підставляються у зразки відповідей на екрані «Консул».
    Поки поле порожнє, використовується нейтральна заглушка — тобто ти вчиш чужу
    біографію. Заповни все: на співбесіді питатимуть саме про твоє.</p>
    <p class="dim"><b>Дані зберігаються лише на цьому пристрої</b> та в твоєму
    Telegram-хмарному сховищі. Вони не потрапляють ні в код, ні на сервер.</p>

    <div class="tiles-3" style="grid-template-columns:1fr">
      <div class="tile-stat"><b>${filled} / ${PROFILE_FIELDS.length}</b><span>полів заповнено</span></div>
    </div>

    <div class="pform">
      ${PROFILE_FIELDS.map(f => `
        <div class="pf">
          <label for="pf-${f.k}">${f.ua}</label>
          ${f.hint ? `<div class="pf-hint">${f.hint}</div>` : ''}
          <input id="pf-${f.k}" data-k="${f.k}" autocomplete="off" autocapitalize="off"
            spellcheck="false" placeholder="${f.def}"
            value="${(st.profile[f.k] || '').replace(/"/g,'&quot;')}">
        </div>`).join('')}
    </div>

    <div class="dia-row">${['á','é','í','ó','ö','ő','ú','ü','ű'].map(c=>`<button class="dia" data-c="${c}">${c}</button>`).join('')}</div>
    <p class="dim">Кнопки з літерами вставляють символ у поле, яке зараз в фокусі.</p>
    <button class="btn primary" id="save">Зберегти</button>
    <button class="btn ghost sm" id="prev">Переглянути зразки з моїми даними</button>`;

  root.querySelector('#b').onclick = () => go('home');

  let lastInput = null;
  root.querySelectorAll('.pf input').forEach(i => {
    i.onfocus = () => { lastInput = i; };
    i.oninput = () => { st.profile[i.dataset.k] = i.value; };
  });
  root.querySelectorAll('.dia').forEach(b => b.onclick = () => {
    const i = lastInput; if (!i) return;
    const p = i.selectionStart ?? i.value.length;
    i.value = i.value.slice(0,p) + b.dataset.c + i.value.slice(p);
    st.profile[i.dataset.k] = i.value;
    i.focus(); i.setSelectionRange(p+1, p+1);
  });
  root.querySelector('#save').onclick = () => { save(); haptic('success'); go('profile'); };
  root.querySelector('#prev').onclick = () => {
    save();
    const sample = QUESTIONS.filter(q => /\{/.test(q.model))
      .map(q => `${q.hu}\n→ ${fill(q.model, st.profile)}`).join('\n\n');
    showBlob(sample);
  };
}

// ── Словник ──────────────────────────────────────────────────────────────
export function Vocab(root, go) {
  const st = getState();
  const w = currentWeek();
  const unlocked = VOCAB.filter(v => v.w <= w + 1);
  let filter = 'all';
  let query = '';

  const render = () => {
    let list = unlocked;
    if (filter !== 'all') list = list.filter(v => v.t === filter);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(v => v.hu.toLowerCase().includes(q) || v.ua.toLowerCase().includes(q));
    }
    const topics = [...new Set(unlocked.map(v => v.t))];

    root.innerHTML = `
      <button class="back" id="b">← Головна</button>
      <h2>Словник <span class="dim">${unlocked.length}</span></h2>
      <input class="search" id="q" placeholder="пошук…" value="${query}">
      <div class="chips">
        <button class="chip ${filter==='all'?'on':''}" data-t="all">усі</button>
        ${topics.map(t=>`<button class="chip ${filter===t?'on':''}" data-t="${t}">${TOPICS[t]||t}</button>`).join('')}
      </div>
      <button class="btn ghost sm" id="anki">⬇ Експорт для Anki (${list.length})</button>
      <div class="vlist">
        ${list.map(v => {
          const c = st.cards[v.id];
          const badge = !c ? '<i class="dot new"></i>'
            : c.state === 'review' ? `<i class="dot ok" title="${humanIvl(c.ivl)}"></i>`
            : '<i class="dot learn"></i>';
          const stg = c ? `<span class="stage">${STAGES[c.stage]?.label || ''}</span>` : '';
          return `<div class="v" data-hu="${encodeURIComponent(v.hu)}">
            ${badge}
            <div class="v-body">
              <div class="v-hu">${v.hu} ${stg}</div>
              <div class="v-ua">${v.ua}</div>
              <div class="v-ex">${v.ex}</div>
            </div></div>`;
        }).join('')}
      </div>`;

    root.querySelector('#b').onclick = () => go('home');
    const qi = root.querySelector('#q');
    qi.oninput = () => { query = qi.value; const p = qi.selectionStart; render(); const n = root.querySelector('#q'); n.focus(); n.setSelectionRange(p,p); };
    root.querySelectorAll('.chip').forEach(c => c.onclick = () => { filter = c.dataset.t; render(); });

    root.querySelector('#anki').onclick = () => exportAnki(list);
  };
  render();
}

function exportAnki(list) {
  const txt = list.map(v => `${v.hu};${v.ua};${v.ex}`).join('\n');
  copyOrShow(txt, `Формат для Anki: угорська;українська;приклад\nІмпорт: роздільник — крапка з комою, тип Basic.\n\n${list.length} карток скопійовано.`);
}

function copyOrShow(text, note) {
  const done = () => { alertMsg(note); };
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => showBlob(text));
  } else showBlob(text);
}

function showBlob(text) {
  const d = document.createElement('div');
  d.className = 'modal';
  d.innerHTML = `<div class="modal-in"><p class="dim">Скопіюй вручну:</p>
    <textarea readonly>${text.replace(/</g,'&lt;')}</textarea>
    <button class="btn primary">Закрити</button></div>`;
  document.body.appendChild(d);
  d.querySelector('textarea').select();
  d.querySelector('button').onclick = () => d.remove();
}

function alertMsg(m) {
  if (tg?.showPopup) { try { tg.showPopup({ message: m }); return; } catch(e){} }
  const d = document.createElement('div');
  d.className = 'toast'; d.textContent = m;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 3500);
}

// ── Прогрес і помилки ────────────────────────────────────────────────────
export function Stats(root, go) {
  const st = getState();
  const w = currentWeek();
  const cards = Object.values(st.cards);
  const rev = cards.filter(c => c.state === 'review');
  const learn = cards.filter(c => c.state === 'learning' || c.state === 'relearning');
  const leeches = cards.filter(isLeech);
  const days = Object.entries(st.daily).sort((a,b)=>a[0]<b[0]?1:-1).slice(0,14);
  const totalMin = Object.values(st.daily).reduce((a,d)=>a+(d.min||0),0);
  const mature = rev.filter(c => c.ivl >= 21).length;

  const errGroups = {};
  st.errors.slice(0,120).forEach(e => { errGroups[e.kind] = (errGroups[e.kind]||0)+1; });

  root.innerHTML = `
    <button class="back" id="b">← Головна</button>
    <h2>Прогрес</h2>

    <div class="tiles-3">
      <div class="tile-stat"><b>${rev.length}</b><span>у повторенні</span></div>
      <div class="tile-stat"><b>${mature}</b><span>міцно (21+ дн.)</span></div>
      <div class="tile-stat"><b>${Math.round(totalMin/60)}</b><span>годин усього</span></div>
    </div>

    <h3 class="dim-h">Останні 14 днів</h3>
    <div class="chart">
      ${days.reverse().map(([d,v]) => {
        const n = (v.ok||0)+(v.bad||0);
        const h = Math.min(100, n * 2);
        const acc = n ? v.ok/n : 0;
        const col = acc >= .85 ? 'var(--good)' : acc >= .65 ? 'var(--mid)' : 'var(--bad)';
        return `<div class="bar" title="${d}: ${n} відповідей"><i style="height:${h}%;background:${col}"></i><span>${d.slice(8)}</span></div>`;
      }).join('') || '<p class="dim">Ще немає даних.</p>'}
    </div>

    ${leeches.length ? `<h3 class="dim-h">Проблемні слова (${leeches.length})</h3>
      <div class="vlist">${leeches.slice(0,20).map(c => {
        const v = byId[c.id]; if (!v) return '';
        return `<div class="v"><i class="dot bad"></i><div class="v-body">
          <div class="v-hu">${v.hu}</div><div class="v-ua">${v.ua}</div>
          <div class="v-ex dim">провалено ${c.lapses} разів</div></div></div>`;
      }).join('')}</div>` : ''}

    <h3 class="dim-h">Журнал помилок</h3>
    <div class="err-sum">
      ${Object.entries(errGroups).map(([k,n])=>`<span class="chip on">${({vocab:'лексика',grammar:'граматика',harmony:'гармонія',order:'порядок слів',iq:'співбесіда'})[k]||k}: ${n}</span>`).join('') || '<span class="dim">Порожньо.</span>'}
    </div>
    <button class="btn ghost sm" id="exp">📋 Скопіювати помилки для викладача</button>

    <h3 class="dim-h">Налаштування</h3>
    <label class="set">Нових слів на день
      <input type="number" id="npd" min="4" max="30" value="${st.settings.newPerDay}"></label>
    <label class="set">Дата старту курсу
      <input type="date" id="sd" value="${st.startDate}"></label>
    <p class="dim">Зараз тиждень ${w} з 39.</p>
    <button class="btn danger sm" id="reset">Скинути весь прогрес</button>`;

  root.querySelector('#b').onclick = () => go('home');
  root.querySelector('#npd').onchange = (e) => { st.settings.newPerDay = Math.max(4, Math.min(30, +e.target.value||12)); save(); };
  root.querySelector('#sd').onchange = (e) => { if (e.target.value) { st.startDate = e.target.value; save(); go('stats'); } };
  root.querySelector('#exp').onclick = () => {
    const lines = st.errors.slice(0,150).map(e => {
      const d = new Date(e.at).toISOString().slice(0,10);
      if (e.kind === 'vocab')   return `${d} ЛЕКСИКА: ${e.hu} — ${e.ua}`;
      if (e.kind === 'grammar') return `${d} ГРАМАТИКА [${e.topic}]: ${e.q} → ${e.why}`;
      if (e.kind === 'harmony') return `${d} ГАРМОНІЯ: ${e.word} + ${e.suffix}`;
      if (e.kind === 'order')   return `${d} ПОРЯДОК СЛІВ: очікувалось «${e.ex}», було «${e.got}»`;
      if (e.kind === 'iq')      return `${d} СПІВБЕСІДА: ${e.q}`;
      return `${d} ${JSON.stringify(e)}`;
    }).join('\n');
    copyOrShow(`Мої помилки, тиждень ${w}:\n\n${lines}`, 'Помилки скопійовано. Встав їх у чат із викладачем.');
  };
  root.querySelector('#reset').onclick = () => {
    if (confirm('Стерти весь прогрес? Це незворотно.')) { resetState(); go('home'); }
  };
}

function shuffleArr(a){const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x;}
