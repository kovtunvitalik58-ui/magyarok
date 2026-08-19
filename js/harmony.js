// Гармонія голосних — обчислюється з самого слова.
// Дозволяє генерувати нескінченні дрили на суфікси без ручного контенту.

const BACK   = 'aáoóuú';
const FRONT_U = 'eéií';      // передні неогублені
const FRONT_R = 'öőüű';      // передні огублені

// Слова, що пишуться передніми, але беруть задні суфікси
const EXCEPTIONS = new Set(['híd','nyíl','sír','szív','cél','derék','héj','férfi','hír','ír','víz']);

export function vowelsOf(word) {
  return [...word.toLowerCase()].filter(ch => BACK.includes(ch) || FRONT_U.includes(ch) || FRONT_R.includes(ch));
}

// → 'back' | 'front' | 'rounded'
export function harmonyClass(word) {
  const clean = word.toLowerCase().replace(/[^a-záéíóöőúüű]/g, '');
  if (EXCEPTIONS.has(clean)) return 'back';

  const vs = vowelsOf(clean);
  if (!vs.length) return 'back';

  const hasBack = vs.some(v => BACK.includes(v));
  if (hasBack) return 'back';

  // тільки передні: дивимось на ОСТАННІЙ огублений
  const lastRounded = [...vs].reverse().find(v => FRONT_R.includes(v));
  return lastRounded ? 'rounded' : 'front';
}

// Набори суфіксів: [задній, передній, огублений(опційно)]
export const SUFFIXES = {
  inessive:   { name:'HOL: у/в (всередині)',   forms:['-ban','-ben'] },
  superess:   { name:'HOL: на',                forms:['-on','-en','-ön'] },
  adessive:   { name:'HOL: біля/при',          forms:['-nál','-nél'] },
  illative:   { name:'HOVA: у/в',              forms:['-ba','-be'] },
  sublative:  { name:'HOVA: на',               forms:['-ra','-re'] },
  allative:   { name:'HOVA: до',               forms:['-hoz','-hez','-höz'] },
  elative:    { name:'HONNAN: з (зсередини)',  forms:['-ból','-ből'] },
  delative:   { name:'HONNAN: з (з поверхні)', forms:['-ról','-ről'] },
  ablative:   { name:'HONNAN: від',            forms:['-tól','-től'] },
  dative:     { name:'кому/чому',              forms:['-nak','-nek'] },
  instr:      { name:'з ким/чим',              forms:['-val','-vel'] },
  plural:     { name:'множина',                forms:['-ok','-ek','-ök'] },
  accusative: { name:'знахідний',              forms:['-ot','-et','-öt'] },
};

export function pickForm(word, sufKey) {
  const set = SUFFIXES[sufKey];
  if (!set) return null;
  const cls = harmonyClass(word);
  const [back, front, rounded] = set.forms;
  if (cls === 'back') return back;
  if (cls === 'rounded') return rounded || front;
  return front;
}

export function correctIndex(word, sufKey) {
  const set = SUFFIXES[sufKey];
  const form = pickForm(word, sufKey);
  return set.forms.indexOf(form);
}

// Слова, безпечні для авто-дрилів (правило працює без винятків)
export const DRILL_WORDS = [
  'ház','könyv','gyerek','asztal','ablak','város','falu','iskola','egyetem',
  'testvér','nagyapa','anya','apa','család','munka','ország','nyelv','név',
  'konzulátus','dokumentum','kérelem','ünnep','kultúra','történelem','föld',
  'kert','szoba','utca','tér','hegy','folyó','tó','erdő','templom','bolt',
];

export const WORD_UA = {
  'ház':'дім','könyv':'книжка','gyerek':'дитина','asztal':'стіл','ablak':'вікно',
  'város':'місто','falu':'село','iskola':'школа','egyetem':'університет',
  'testvér':'брат/сестра','nagyapa':'дідусь','anya':'мати','apa':'батько',
  'család':'родина','munka':'робота','ország':'країна','nyelv':'мова','név':'ім\'я',
  'konzulátus':'консульство','dokumentum':'документ','kérelem':'заява','ünnep':'свято',
  'kultúra':'культура','történelem':'історія','föld':'земля','kert':'сад','szoba':'кімната',
  'utca':'вулиця','tér':'площа','hegy':'гора','folyó':'річка','tó':'озеро','erdő':'ліс',
  'templom':'храм','bolt':'магазин',
};

export function harmonyLabel(cls) {
  return { back:'задній ряд', front:'передній ряд', rounded:'передній огублений' }[cls];
}

export function explainHarmony(word, sufKey) {
  const cls = harmonyClass(word);
  const vs = vowelsOf(word).join(', ');
  return `${word}: голосні [${vs}] → ${harmonyLabel(cls)} → ${pickForm(word, sufKey)}`;
}
