// Банк питань консульської співбесіди (egyszerűsített honosítás).
//
// ВАЖЛИВО: зразки відповідей НЕ містять реальних персональних даних.
// Замість них — плейсхолдери {NÉV}, {ŐS}, {VÁROS} тощо, які підставляються
// з профілю користувача. Профіль зберігається лише на пристрої
// (localStorage + Telegram CloudStorage) і ніколи не потрапляє у вихідний код.
//
// lvl = 1 базове (тижні 1-8), 2 середнє (9-20), 3 складне (21+)

export const IQ_BLOCKS = {
  bemutatkozas: 'Знайомство і формальності',
  szemelyes:    'Особисті дані',
  csalad:       'Родина',
  felmenok:     'Предки і походження',
  motivacio:    'Мотивація',
  nyelv:        'Мова і навчання',
  magyarorszag: 'Угорщина: культура й реалії',
};

// Поля профілю. `def` — нейтральна заглушка, щоб застосунок був робочим
// одразу після встановлення. Свої дані вписуються на екрані «Мій профіль».
export const PROFILE_FIELDS = [
  { k:'nev',      tok:'NÉV',        ua:'Ім’я і прізвище',            hint:'Угорським порядком: спершу прізвище. Kovtun Vitalij, а не Vitalij Kovtun.', def:'Kiss Péter' },
  { k:'eletkor',  tok:'ÉLETKOR',    ua:'Вік словами',                hint:'Угорською: harminckét, negyvenöt…', def:'harminc' },
  { k:'szulEv',   tok:'SZÜL_ÉV',    ua:'Рік народження + суфікс',    hint:'Одразу з -ban/-ben: 1994-ben, 1988-ban.', def:'1990-ben' },
  { k:'szulNap',  tok:'SZÜL_NAP',   ua:'День і місяць народження',   hint:'Угорською, у формі «коли»: május harmadikán.', def:'január elsején' },
  { k:'szulHely', tok:'SZÜL_HELY',  ua:'Місце народження + суфікс',  hint:'З відмінковим суфіксом: Kijevben, Beregszászban, Ungváron.', def:'Kijevben' },
  { k:'varos',    tok:'VÁROS',      ua:'Де живеш зараз + суфікс',    hint:'Kijevben, Lvivben, Ungváron.', def:'Kijevben' },
  { k:'foglalkozas', tok:'FOGLALKOZÁS', ua:'Професія',               hint:'programozó, mérnök, tanár, vállalkozó…', def:'mérnök' },
  { k:'munkahely', tok:'MUNKAHELY', ua:'Де працюєш',                 hint:'Формула: egy … cégnél. Наприклад: egy informatikai cégnél.', def:'egy építőipari cégnél' },
  { k:'apa',      tok:'APA',        ua:'Ім’я батька',                hint:'Так, як записано в документах.', def:'Ivan' },
  { k:'anya',     tok:'ANYA',       ua:'Ім’я матері',                hint:'', def:'Mária' },
  { k:'os',       tok:'ŐS',         ua:'Ім’я угорського предка',     hint:'Угорським порядком: Kovács József.', def:'Kovács József' },
  { k:'osRokon',  tok:'ŐS_ROKON',   ua:'Ким він тобі доводиться',    hint:'dédapám (прадід), nagyapám (дідусь), dédanyám (прабабуся).', def:'dédapám' },
  { k:'osHely',   tok:'ŐS_HELY',    ua:'Місто предка + суфікс',      hint:'Beregszászban, Munkácson, Ungváron.', def:'Beregszászban' },
  { k:'osEv',     tok:'ŐS_ÉV',      ua:'Рік народження предка + суфікс', hint:'1918-ban, 1925-ben.', def:'1918-ban' },
  { k:'ag',       tok:'ÁG',         ua:'Лінія походження',           hint:'anyai ágon (по материнській) або apai ágon (по батьківській).', def:'anyai ágon' },
];

export const PROFILE_DEFAULTS = Object.fromEntries(PROFILE_FIELDS.map(f => [f.k, f.def]));
const TOKEN_TO_KEY = Object.fromEntries(PROFILE_FIELDS.map(f => [f.tok, f.k]));

// Підставляє значення профілю у текст зразка.
export function fill(text, profile = {}) {
  return String(text).replace(/\{([A-ZÁÉÍÓÖŐÚÜŰ_]+)\}/g, (m, tok) => {
    const k = TOKEN_TO_KEY[tok];
    if (!k) return m;
    const v = (profile[k] ?? '').trim();
    return v || PROFILE_DEFAULTS[k] || m;
  });
}

export const QUESTIONS = [
// ── Знайомство ───────────────────────────────────────────────────────────
{id:1, b:'bemutatkozas', lvl:1, hu:'Jó napot kívánok! Hogy van?', ua:'Доброго дня! Як справи?',
 model:'Jó napot kívánok! Köszönöm, jól vagyok. És Ön?', keys:['jó napot','köszönöm','jól']},
{id:2, b:'bemutatkozas', lvl:1, hu:'Mi a neve?', ua:'Як Вас звати?',
 model:'A nevem {NÉV}.', keys:['nevem']},
{id:3, b:'bemutatkozas', lvl:1, hu:'Hogy hívják?', ua:'Як Вас звати? (букв. «як Вас звуть»)',
 model:'{NÉV} vagyok.', keys:['vagyok']},
{id:4, b:'bemutatkozas', lvl:1, hu:'Kérem, mutatkozzon be röviden.', ua:'Прошу, коротко представтеся.',
 model:'{NÉV} vagyok, {ÉLETKOR} éves. {VÁROS} lakom, Ukrajnában. {FOGLALKOZÁS}ként dolgozom. Magyar származású vagyok {ÁG}.',
 keys:['vagyok','éves','lakom','dolgozom','származású']},

// ── Особисті дані ────────────────────────────────────────────────────────
{id:5, b:'szemelyes', lvl:1, hu:'Hány éves?', ua:'Скільки Вам років?',
 model:'{ÉLETKOR} éves vagyok.', keys:['éves','vagyok']},
{id:6, b:'szemelyes', lvl:2, hu:'Mikor született?', ua:'Коли Ви народились?',
 model:'{SZÜL_ÉV}, {SZÜL_NAP} születtem.', keys:['születtem']},
{id:7, b:'szemelyes', lvl:2, hu:'Hol született?', ua:'Де Ви народились?',
 model:'{SZÜL_HELY} születtem, Ukrajnában.', keys:['születtem']},
{id:8, b:'szemelyes', lvl:1, hu:'Hol lakik most?', ua:'Де Ви зараз живете?',
 model:'Most {VÁROS} lakom, Ukrajnában.', keys:['lakom']},
{id:9, b:'szemelyes', lvl:1, hu:'Mi a foglalkozása?', ua:'Яка Ваша професія?',
 model:'{FOGLALKOZÁS} vagyok. {MUNKAHELY} dolgozom.', keys:['vagyok','dolgozom']},
{id:10, b:'szemelyes', lvl:2, hu:'Hol dolgozik? Mit csinál pontosan?', ua:'Де Ви працюєте? Що саме робите?',
 model:'{MUNKAHELY} dolgozom, {VÁROS}. Nyolc órát dolgozom minden nap.', keys:['dolgozom']},
{id:11, b:'szemelyes', lvl:2, hu:'Hol tanult? Milyen végzettsége van?', ua:'Де Ви вчилися? Яка у Вас освіта?',
 model:'Egyetemre jártam {VÁROS}. Felsőfokú végzettségem van.', keys:['egyetem','jártam','végzettségem']},
{id:12, b:'szemelyes', lvl:1, hu:'Nős? Van családja?', ua:'Ви одружений? У Вас є сім’я?',
 model:'Igen, nős vagyok. Van feleségem és két gyerekem.', keys:['nős','feleségem','gyerekem']},

// ── Родина ───────────────────────────────────────────────────────────────
{id:13, b:'csalad', lvl:1, hu:'Hány gyereke van?', ua:'Скільки у Вас дітей?',
 model:'Két gyerekem van: egy fiam és egy lányom.', keys:['gyerekem','fiam','lányom']},
{id:14, b:'csalad', lvl:2, hu:'Hogy hívják a gyerekeit? Hány évesek?', ua:'Як звати Ваших дітей? Скільки їм років?',
 model:'A fiam nyolcéves, a lányom ötéves.', keys:['fiam','lányom','éves']},
{id:15, b:'csalad', lvl:1, hu:'Hogy hívják az édesapját?', ua:'Як звати Вашого батька?',
 model:'Az édesapám neve {APA}.', keys:['édesapám','neve']},
{id:16, b:'csalad', lvl:1, hu:'Hogy hívják az édesanyját?', ua:'Як звати Вашу матір?',
 model:'Az édesanyám neve {ANYA}.', keys:['édesanyám','neve']},
{id:17, b:'csalad', lvl:2, hu:'Mit csinálnak a szülei?', ua:'Чим займаються Ваші батьки?',
 model:'Az édesapám mérnök, az édesanyám tanár. Már mindketten nyugdíjasok.', keys:['édesapám','édesanyám']},
{id:18, b:'csalad', lvl:1, hu:'Van testvére?', ua:'У Вас є брати чи сестри?',
 model:'Igen, van egy bátyám és egy húgom.', keys:['van','bátyám','húgom']},
{id:19, b:'csalad', lvl:2, hu:'Hol élnek a rokonai?', ua:'Де живуть Ваші родичі?',
 model:'A szüleim Kárpátalján élnek. A testvérem Magyarországon dolgozik.', keys:['élnek','Kárpátalján']},
{id:20, b:'csalad', lvl:2, hu:'A felesége is magyar származású?', ua:'Ваша дружина теж угорського походження?',
 model:'Nem, a feleségem ukrán. De ő is tanul magyarul.', keys:['feleségem','ukrán']},
{id:21, b:'csalad', lvl:3, hu:'Beszélnek otthon magyarul?', ua:'Ви розмовляєте вдома угорською?',
 model:'Otthon ukránul beszélünk, de a gyerekekkel néha magyarul is gyakorolok. A nagyszüleim még magyarul beszéltek egymás között.',
 keys:['beszélünk','magyarul']},

// ── Предки і походження (ключовий блок) ──────────────────────────────────
{id:22, b:'felmenok', lvl:1, hu:'Ki volt a magyar felmenője?', ua:'Хто був Вашим угорським предком?',
 model:'Magyar származású vagyok {ÁG}: a {ŐS_ROKON} volt magyar.', keys:['származású','magyar']},
{id:23, b:'felmenok', lvl:2, hu:'Hogy hívták a felmenőjét?', ua:'Як звали Вашого предка?',
 model:'A {ŐS_ROKON} neve {ŐS} volt.', keys:['neve','volt']},
{id:24, b:'felmenok', lvl:2, hu:'Mikor és hol született a felmenője?', ua:'Коли й де народився Ваш предок?',
 model:'{ŐS_ÉV} született, {ŐS_HELY}, Kárpátalján.', keys:['született','Kárpátalján']},
{id:25, b:'felmenok', lvl:2, hu:'Honnan származik a családja?', ua:'Звідки походить Ваша родина?',
 model:'A családom Kárpátaljáról származik, {ŐS_HELY} éltek a felmenőim.', keys:['családom','származik','Kárpátaljáról']},
{id:26, b:'felmenok', lvl:3, hu:'Milyen dokumentumokkal tudja igazolni a magyar származását?', ua:'Якими документами Ви можете підтвердити угорське походження?',
 model:'Megvan a {ŐS_ROKON} születési anyakönyvi kivonata és egy régi magyar nyelvű iskolai bizonyítványa.',
 keys:['anyakönyvi','kivonat']},
{id:27, b:'felmenok', lvl:3, hu:'Beszéltek a nagyszülei magyarul?', ua:'Ваші дідусь і бабуся розмовляли угорською?',
 model:'Igen, a nagyszüleim otthon magyarul beszéltek. A nagyanyám magyar iskolába járt Kárpátalján.',
 keys:['nagyszüleim','beszéltek','magyarul']},
{id:28, b:'felmenok', lvl:3, hu:'Miért nem tanult meg gyerekkorában magyarul?', ua:'Чому Ви не вивчили угорську в дитинстві?',
 model:'A szüleim már ukrán iskolába jártak, és otthon ukránul beszéltünk. A magyar nyelv egy generációval korábban megszakadt. Ezért kezdtem el felnőttként tanulni.',
 keys:['iskolába','ukránul','tanulni']},
{id:29, b:'felmenok', lvl:3, hu:'Mesélne a család történetéről?', ua:'Розкажіть про історію Вашої родини.',
 model:'A felmenőim {ŐS_HELY} éltek. A második világháború után a család Kárpátalján maradt. A nagyanyám még magyar iskolába járt, de a szüleim már ukránul tanultak.',
 keys:['éltek','maradt','járt']},

// ── Мотивація ────────────────────────────────────────────────────────────
{id:30, b:'motivacio', lvl:2, hu:'Miért szeretne magyar állampolgár lenni?', ua:'Чому Ви хочете стати громадянином Угорщини?',
 model:'Azért, mert magyar származású vagyok, és fontos nekem a családom öröksége. Szeretném, ha a gyerekeim is ismernék a magyar kultúrát és nyelvet.',
 keys:['mert','származású','fontos','szeretném']},
{id:31, b:'motivacio', lvl:2, hu:'Mit jelent Önnek a magyar állampolgárság?', ua:'Що для Вас означає угорське громадянство?',
 model:'Számomra ez a gyökereim elismerése. Nem csak papír: a családom története köt Magyarországhoz.',
 keys:['gyökereim','család']},
{id:32, b:'motivacio', lvl:3, hu:'Magyarországra szeretne költözni?', ua:'Ви хочете переїхати до Угорщини?',
 model:'Egyelőre Ukrajnában élek és dolgozom. De szeretnék gyakran Magyarországra utazni, és a jövőben talán ott is élni.',
 keys:['élek','szeretnék','utazni']},
{id:33, b:'motivacio', lvl:3, hu:'Mit tud tenni Magyarországért mint állampolgár?', ua:'Що Ви можете зробити для Угорщини як громадянин?',
 model:'Tisztelem a magyar törvényeket és hagyományokat. Tovább tanulom a nyelvet, és átadom a gyerekeimnek a magyar kultúrát.',
 keys:['tisztelem','tanulom','átadom']},

// ── Мова і навчання ──────────────────────────────────────────────────────
{id:34, b:'nyelv', lvl:1, hu:'Beszél magyarul?', ua:'Ви розмовляєте угорською?',
 model:'Igen, egy kicsit beszélek magyarul. Még tanulok.', keys:['beszélek','tanulok']},
{id:35, b:'nyelv', lvl:2, hu:'Mennyi ideje tanul magyarul?', ua:'Скільки часу Ви вчите угорську?',
 model:'Körülbelül egy éve tanulok magyarul, minden nap.', keys:['éve','tanulok']},
{id:36, b:'nyelv', lvl:2, hu:'Hol és hogyan tanult magyarul?', ua:'Де і як Ви вчили угорську?',
 model:'Otthon tanulok, tankönyvből és online. Minden nap másfél órát gyakorolok.', keys:['tanulok','gyakorolok']},
{id:37, b:'nyelv', lvl:2, hu:'Milyen nyelveken beszél még?', ua:'Якими ще мовами Ви володієте?',
 model:'Az anyanyelvem ukrán. Beszélek még angolul és oroszul.', keys:['anyanyelvem','beszélek']},
{id:38, b:'nyelv', lvl:2, hu:'Nehéz a magyar nyelv?', ua:'Угорська мова складна?',
 model:'Igen, nehéz, főleg a ragok és az igeragozás. De nagyon érdekes nyelv.', keys:['nehéz','érdekes']},

// ── Угорщина: культура й реалії ──────────────────────────────────────────
{id:39, b:'magyarorszag', lvl:1, hu:'Volt már Magyarországon?', ua:'Ви вже були в Угорщині?',
 model:'Igen, kétszer voltam Budapesten. Nagyon tetszett a város.', keys:['voltam','tetszett']},
{id:40, b:'magyarorszag', lvl:2, hu:'Mi Magyarország fővárosa?', ua:'Яка столиця Угорщини?',
 model:'Magyarország fővárosa Budapest.', keys:['fővárosa','Budapest']},
{id:41, b:'magyarorszag', lvl:2, hu:'Ki a magyar köztársasági elnök? Ki a miniszterelnök?', ua:'Хто президент Угорщини? Хто прем’єр-міністр?',
 model:'⚠ Перевір актуальні прізвища перед співбесідою — вони змінюються. Формула відповіді: «A köztársasági elnök … , a miniszterelnök … .»',
 keys:['elnök','miniszterelnök']},
{id:42, b:'magyarorszag', lvl:2, hu:'Mikor van a magyar nemzeti ünnep?', ua:'Коли угорське національне свято?',
 model:'Három nemzeti ünnep van: március tizenötödike, augusztus huszadika és október huszonharmadika.',
 keys:['március','augusztus','október']},
{id:43, b:'magyarorszag', lvl:3, hu:'Mit ünnepelnek augusztus huszadikán?', ua:'Що святкують 20 серпня?',
 model:'Szent István királyt és az államalapítást ünnepeljük.', keys:['Szent István','államalapítás']},
{id:44, b:'magyarorszag', lvl:3, hu:'Ki írta a magyar himnuszt?', ua:'Хто написав угорський гімн?',
 model:'A himnusz szövegét Kölcsey Ferenc írta, a zenéjét Erkel Ferenc szerezte.', keys:['Kölcsey','Erkel']},
{id:45, b:'magyarorszag', lvl:3, hu:'Mi a magyar pénznem?', ua:'Яка валюта в Угорщині?',
 model:'A magyar pénznem a forint.', keys:['forint']},
{id:46, b:'magyarorszag', lvl:3, hu:'Mit tud Kárpátaljáról?', ua:'Що Ви знаєте про Закарпаття?',
 model:'Kárpátalja Ukrajna nyugati része. Sok magyar él ott, főleg Beregszász környékén. Régen a Magyar Királysághoz tartozott.',
 keys:['Ukrajna','magyar','Beregszász']},
{id:47, b:'magyarorszag', lvl:3, hu:'Melyek Magyarország szomszédos országai?', ua:'Які країни межують з Угорщиною?',
 model:'Szlovákia, Ukrajna, Románia, Szerbia, Horvátország, Szlovénia és Ausztria.', keys:['Szlovákia','Ukrajna','Románia','Ausztria']},
{id:48, b:'magyarorszag', lvl:3, hu:'Mi a legnagyobb magyar tó? És a legnagyobb folyó?', ua:'Яке найбільше озеро Угорщини? А найбільша річка?',
 model:'A legnagyobb tó a Balaton. A legnagyobb folyó a Duna.', keys:['Balaton','Duna']},
];

export const qByBlock = (b) => QUESTIONS.filter(q => q.b === b);
export const qByLevel = (l) => QUESTIONS.filter(q => q.lvl <= l);
