// Граматичні модулі. Кожен = коротке пояснення через порівняння з українською
// + набір дрилів. Дрили короткі навмисне: мета — автоматизм, не розуміння.

export const GRAMMAR = [
{
  id:'g1', w:1, title:'Гармонія голосних',
  short:'Двигун усієї угорської морфології',
  explain:`Голосні діляться на дві групи:

**ЗАДНІ** (mély): a á o ó u ú
**ПЕРЕДНІ** (magas): e é i í ö ő ü ű
   ↳ з них **огублені**: ö ő ü ű

Суфікс підлаштовується під голосні кореня. Якщо в слові є хоч один задній голосний — суфікс задній.

| Слово | Суфікс |
|---|---|
| Ukrajna (u,a,a) | Ukrajná**ban** |
| Debrecen (e,e,e) | Debrecen**ben** |

**Порівняння з українською:** в українській теж є чергування (рук-**а** → руц-**і**), але воно фонетичне й обмежене. В угорській гармонія жива й обов'язкова для *кожного* суфікса — це не виняток, а правило.

Деякі суфікси тричленні: **-hoz / -hez / -höz**. Третя форма — для слів з ö ő ü ű: *könyv → könyvhöz*.

**Пастка:** i, í, e, é можуть бути «нейтральними». Є група слів, які пишуться передніми голосними, але беруть **задні** суфікси:

- híd (міст) → híd**ban**, híd**hoz**, híd**nak**
- cél (мета) → cél**ból**, cél**ra**
- Найчастіші такі слова: **híd, nyíl, sír, szív, cél, derék, héj, férfi**.

Таких слів мало. Вчи їх одразу разом із суфіксом, як один блок — не намагайся вивести правилом.`,
  drills:[
    {q:'Ukrajna + «в»', opts:['-ban','-ben'], a:0, why:'u, a, a — усі задні → -ban. Ukrajnában.'},
    {q:'Debrecen + «в»', opts:['-ban','-ben'], a:1, why:'e, e, e — усі передні → -ben. Debrecenben.'},
    {q:'Beregszász + «в»', opts:['-ban','-ben'], a:0, why:'e, a, á — є задні → -ban. Beregszászban.'},
    {q:'Budapest + «в» (місцевий -n)', opts:['-on','-en'], a:1, why:'Останній голосний e — передній → Budapesten.'},
    {q:'könyv + «до» (-hoz/-hez/-höz)', opts:['-hoz','-hez','-höz'], a:2, why:'ö — передній огублений → könyvhöz.'},
    {q:'ház + «до»', opts:['-hoz','-hez','-höz'], a:0, why:'á — задній → házhoz.'},
    {q:'gyerek + «до»', opts:['-hoz','-hez','-höz'], a:1, why:'e, e — передні неогублені → gyerekhez.'},
    {q:'Kárpátalja + «з» (-ból/-ből)', opts:['-ból','-ből'], a:0, why:'á, á, a — задні → Kárpátaljáról / Kárpátaljából.'},
    {q:'testvér + «-nak/-nek»', opts:['-nak','-nek'], a:1, why:'e, é — передні → testvérnek.'},
    {q:'nagyapa + «-nak/-nek»', opts:['-nak','-nek'], a:0, why:'a, a, a — задні → nagyapának.'},
  ]
},
{
  id:'g2', w:1, title:'Дієслово lenni та нульова зв\'язка',
  short:'Головна помилка слов\'ян',
  explain:`| Особа | Форма |
|---|---|
| én | **vagyok** |
| te | **vagy** |
| ő / Ön | **van** |
| mi | **vagyunk** |
| ti | **vagytok** |
| ők | **vannak** |

**Правило, яке ламає слов'ян:**

В українській зв'язка опускається завжди: *Я українець. Він українець.*

В угорській вона опускається **тільки в 3-й особі** і **тільки** коли присудок — іменник або прикметник:

✅ Én ukrán **vagyok**.
✅ Te ukrán **vagy**.
✅ Ő ukrán.  ← зв'язки НЕМАЄ
❌ Ő ukrán **van**.  ← ПОМИЛКА

Але якщо йдеться про **місце або існування** — van/vannak повертається:

✅ Ő Ukrajnában **van**.
✅ A dokumentum az asztalon **van**.`,
  drills:[
    {q:'Én ukrán ___ .', opts:['vagyok','van','—'], a:0, why:'1-ша особа → зв\'язка обов\'язкова: vagyok.'},
    {q:'Ő ukrán ___ .', opts:['van','vagyok','—'], a:2, why:'3-тя особа + іменник-присудок → зв\'язки немає.'},
    {q:'Ő Ukrajnában ___ .', opts:['—','van','vagyok'], a:1, why:'Місце → van повертається.'},
    {q:'Te magyar ___ ?', opts:['vagy','van','—'], a:0, why:'2-га особа → vagy.'},
    {q:'Mi ukránok ___ .', opts:['vagyunk','vannak','—'], a:0, why:'1-ша особа множини → vagyunk.'},
    {q:'A szüleim Kárpátalján ___ .', opts:['—','van','vannak'], a:2, why:'Множина + місце → vannak.'},
    {q:'Ők magyarok ___ .', opts:['vannak','—','van'], a:1, why:'3-тя особа мн. + іменник → зв\'язки немає.'},
    {q:'A dédapám magyar ___ (був).', opts:['volt','van','—'], a:0, why:'Минулий час зв\'язку НЕ опускає: volt.'},
  ]
},
{
  id:'g3', w:2, title:'Множина -k і чому після числа однина',
  short:'Дві прості речі, одна контрінтуїтивна',
  explain:`Множина: суфікс **-k**, з голосним-з'єднувачем за гармонією.

| Однина | Множина |
|---|---|
| ház | ház**ak** |
| gyerek | gyerek**ek** |
| könyv | könyv**ek** |
| kutya | kutyá**k** (a → á!) |
| apa | apá**k** |

Слово на **-a/-e** подовжує його перед суфіксом: *apa → apák*, *kutya → kutyák*. Це правило працює для ВСІХ суфіксів, запам'ятай зараз.

**Контрінтуїтивне правило:** після числівника чи слова «багато/мало» іменник стоїть в **ОДНИНІ**:

✅ két **gyerek** (двоє дітей)
✅ sok **rokon** (багато родичів)
❌ két gyerekek

В українській навпаки: *двоє дітей*, *багато родичів* — множина. Угорська логіка: число вже показує кількість, дублювати не треба.`,
  drills:[
    {q:'ház → множина', opts:['házak','házek','házok'], a:0, why:'á — задній → -ak. Házak.'},
    {q:'gyerek → множина', opts:['gyerekak','gyerekek','gyerekök'], a:1, why:'e, e — передні → -ek.'},
    {q:'apa → множина', opts:['apak','apák','apaak'], a:1, why:'Кінцеве -a подовжується в -á: apák.'},
    {q:'két ___ (двоє дітей)', opts:['gyerek','gyerekek'], a:0, why:'Після числівника — однина.'},
    {q:'sok ___ (багато родичів)', opts:['rokonok','rokon'], a:1, why:'Після sok — однина.'},
    {q:'A szüle___ Ukrajnában élnek.', opts:['-im','-eim'], a:0, why:'szüleim — «мої батьки», присвійна множина.'},
    {q:'könyv → множина', opts:['könyvök','könyvek','könyvak'], a:1, why:'ö — передній, але -k бере -ek (не -ök) після приголосних цього типу: könyvek.'},
  ]
},
{
  id:'g4', w:3, title:'Теперішній час: невизначена дієвідміна',
  short:'Основа всього мовлення',
  explain:`Угорські дієслова змінюються за особами — як українські. Але закінчення залежить ще й від гармонії.

**beszél** (розмовляти) — передній ряд:
| én | beszél**ek** |
| te | beszél**sz** |
| ő | beszél |
| mi | beszél**ünk** |
| ti | beszél**tek** |
| ők | beszél**nek** |

**tanul** (вчитися) — задній ряд:
| én | tanul**ok** |
| te | tanul**sz** |
| ő | tanul |
| mi | tanul**unk** |
| ti | tanul**tok** |
| ők | tanul**nak** |

**Ключове:** 3-тя особа однини = **гола основа**, без закінчення. В українській так не буває.

**Дієслова на -ik** (lakik, dolgozik, utazik) у 1-й особі беруть **-om/-em/-öm**, а не -ok/-ek:
*lakik → lak**om*** (не «lakok»), *dolgozik → dolgoz**om***.`,
  drills:[
    {q:'tanul + én', opts:['tanulok','tanulek','tanulom'], a:0, why:'Задній ряд → -ok. Tanulok.'},
    {q:'beszél + én', opts:['beszélok','beszélek','beszélöm'], a:1, why:'Передній ряд → -ek. Beszélek.'},
    {q:'lakik + én', opts:['lakok','lakom','lakik'], a:1, why:'Дієслово на -ik → 1-ша особа -om. Lakom.'},
    {q:'dolgozik + én', opts:['dolgozok','dolgozom'], a:1, why:'-ik дієслово → dolgozom.'},
    {q:'tanul + ő', opts:['tanul','tanulik','tanulja'], a:0, why:'3-тя особа = гола основа.'},
    {q:'beszél + mi', opts:['beszélunk','beszélünk'], a:1, why:'Передній ряд → -ünk.'},
    {q:'tanul + ők', opts:['tanulnek','tanulnak'], a:1, why:'Задній ряд → -nak.'},
    {q:'ért + te', opts:['értsz','értesz'], a:1, why:'Основа закінчується на -t після приголосного, тому потрібен голосний-з'єднувач: értesz. Форма «értsz» — помилка.'},
    {q:'Ön beszél magyarul? — Яка особа дієслова?', opts:['2-га','3-тя'], a:1, why:'Ön завжди вимагає 3-ї особи.'},
  ]
},
{
  id:'g5', w:4, title:'Де? Локативні відмінки',
  short:'-ban/-ben, -on/-en/-ön, -nál/-nél',
  explain:`Угорська має ~18 відмінків, але вони прозорі: кожен = один суфікс з одним значенням. Це простіше за українську, де закінчення багатозначне.

| Суфікс | Значення | Приклад |
|---|---|---|
| **-ban / -ben** | всередині | Ukrajná**ban** (в Україні) |
| **-on / -en / -ön** | на поверхні | az asztal**on** (на столі) |
| **-nál / -nél** | біля, при, у (людини) | az orvos**nál** (у лікаря) |

**Правило для міст:**
- Угорські міста зазвичай беруть **-on/-en/-ön**: Budapest**en**, Szeged**en**, Debrecen**ben** (виняток!)
- Іноземні міста беруть **-ban/-ben**: Kijev**ben**, Berlin**ben**

**Обов'язкові винятки для тебе:**
- **Magyarországon** (не Magyarországban!)
- **Kárpátalján**
- **Ukrajnában**

Ці три ти скажеш на співбесіді десятки разів. Вивчи як цілі блоки.`,
  drills:[
    {q:'Я живу в Україні: Ukrajná___ lakom.', opts:['-ban','-ben','-n'], a:0, why:'Ukrajnában — задній ряд, «всередині країни».'},
    {q:'В Угорщині: Magyarország___', opts:['-ban','-on','-en'], a:1, why:'Виняток: Magyarországon.'},
    {q:'На Закарпатті: Kárpátalj___', opts:['-ában','-án','-on'], a:1, why:'Kárpátalján. Кінцеве -a подовжується.'},
    {q:'У Києві: Kijev___', opts:['-en','-ben','-on'], a:1, why:'Іноземне місто → -ben. Kijevben.'},
    {q:'У Будапешті: Budapest___', opts:['-ben','-en','-on'], a:1, why:'Угорське місто → -en. Budapesten.'},
    {q:'У Береговому: Beregszász___', opts:['-ban','-on','-en'], a:0, why:'Beregszászban.'},
    {q:'В Ужгороді: Ungvár___', opts:['-ban','-on'], a:1, why:'Ungváron — історично угорське місто, бере -on.'},
    {q:'У лікаря: az orvos___', opts:['-ban','-nál','-on'], a:1, why:'При людині → -nál. Az orvosnál.'},
    {q:'На столі: az asztal___', opts:['-on','-ban','-nál'], a:0, why:'На поверхні → -on. Az asztalon.'},
  ]
},
{
  id:'g6', w:5, title:'Тріада ДЕ – КУДИ – ЗВІДКИ',
  short:'Дев\'ять суфіксів, одна логіка',
  explain:`Це найелегантніша частина угорської граматики. Три просторові відношення × три напрямки = 9 суфіксів, ідеально симетричних.

| | **HOL?** (де) | **HOVA?** (куди) | **HONNAN?** (звідки) |
|---|---|---|---|
| **всередині** | -ban/-ben | -ba/-be | -ból/-ből |
| **на поверхні** | -on/-en/-ön | -ra/-re | -ról/-ről |
| **біля / при** | -nál/-nél | -hoz/-hez/-höz | -tól/-től |

Приклади на одному слові:
- a ház**ban** (у домі) → a ház**ba** (у дім) → a ház**ból** (з дому)
- az asztal**on** → az asztal**ra** → az asztal**ról**
- az orvos**nál** → az orvos**hoz** → az orvos**tól**

**Порівняння з українською:** ми теж розрізняємо «в домі / в дім / з дому», але через прийменник + відмінок. Угорська робить це одним суфіксом, без прийменника взагалі. Прийменників в угорській немає — замість них суфікси й післяйменники.

**Для співбесіди критично:**
- Honnan származik a családja? → Kárpátaljá**ról** / Beregszász**ból**
- Hova utazik? → Magyarország**ra** (не -ba! бо Magyarország бере «поверхневу» серію)`,
  drills:[
    {q:'Звідки походить родина — з Берегового: Beregszász___', opts:['-ból','-ról','-tól'], a:0, why:'«Із середини» міста → -ból. Beregszászból.'},
    {q:'Із Закарпаття: Kárpátaljá___', opts:['-ból','-ról','-tól'], a:1, why:'Kárpátalja йде «поверхневою» серією (-n) → Kárpátaljáról.'},
    {q:'До Угорщини (їду): Magyarország___', opts:['-ba','-ra','-hoz'], a:1, why:'Magyarország — «поверхнева» серія → Magyarországra.'},
    {q:'В Угорщині (перебуваю): Magyarország___', opts:['-ban','-on'], a:1, why:'Magyarországon.'},
    {q:'З Угорщини: Magyarország___', opts:['-ból','-ról'], a:1, why:'Magyarországról.'},
    {q:'До України (їду): Ukrajná___', opts:['-ba','-ra'], a:0, why:'Ukrajna — «внутрішня» серія → Ukrajnába.'},
    {q:'До консульства: a konzulátus___', opts:['-ba','-ra','-hoz'], a:1, why:'Konzulátusra megyek — усталене, «поверхнева» серія для установ.'},
    {q:'До лікаря: az orvos___', opts:['-ba','-hoz','-ra'], a:1, why:'До людини → -hoz. Az orvoshoz.'},
    {q:'Від дідуся (отримав): a nagyapám___', opts:['-ból','-ról','-tól'], a:2, why:'Від людини → -tól. A nagyapámtól.'},
  ]
},
{
  id:'g7', w:6, title:'Знахідний відмінок -t',
  short:'Прямий додаток',
  explain:`Прямий додаток отримує суфікс **-t**. Це найпростіший угорський відмінок і найближчий до українського знахідного.

| Називний | Знахідний |
|---|---|
| ház | ház**at** |
| könyv | könyv**et** |
| kultúra | kultúrá**t** |
| apa | apá**t** |
| nyelv | nyelv**et** |

Після голосного — просто **-t**. Після приголосного — з голосним-з'єднувачем (-at/-et/-ot/-öt) за гармонією.

**Приклади:**
- Szeretem a magyar kultúrá**t**. (Я люблю угорську культуру.)
- A magyar nyelv**et** tanulom.
- Kérem a dokumentum**ot**.

**Важливо:** знахідний відмінок вмикає **означену дієвідміну** (тиждень 10), якщо додаток означений. Поки просто запам'ятовуй пари.`,
  drills:[
    {q:'kultúra + знахідний', opts:['kultúrat','kultúrát','kultúrot'], a:1, why:'Кінцеве -a подовжується → kultúrát.'},
    {q:'könyv + знахідний', opts:['könyvet','könyvat','könyvöt'], a:0, why:'Передній ряд → könyvet.'},
    {q:'ház + знахідний', opts:['házet','házat'], a:1, why:'Задній ряд → házat.'},
    {q:'nyelv + знахідний', opts:['nyelvet','nyelvat'], a:0, why:'Передній ряд → nyelvet.'},
    {q:'apa + знахідний', opts:['apat','apát'], a:1, why:'apát.'},
    {q:'dokumentum + знахідний', opts:['dokumentumot','dokumentumet'], a:0, why:'Задній ряд → dokumentumot.'},
    {q:'kérelem + знахідний', opts:['kérelemet','kérelmet'], a:1, why:'Випадає голосний основи: kérelem → kérelmet.'},
  ]
},
{
  id:'g8', w:7, title:'Присвійні суфікси — родина',
  short:'Найважливіша тема для співбесіди',
  explain:`В угорській немає слова «мій». Належність виражається **суфіксом на іменнику** — як у турецькій чи фінській.

**testvér** (брат/сестра):
| Чий | Форма |
|---|---|
| мій | testvér**em** |
| твій | testvér**ed** |
| його/її | testvér**e** |
| наш | testvér**ünk** |
| ваш | testvér**etek** |
| їхній | testvér**ük** |

**Ключова родинна лексика (вивчи як готові форми):**

| Слово | «мій/моя» |
|---|---|
| apa | ap**ám** |
| anya | any**ám** |
| nagyapa | nagyap**ám** |
| nagyanya | nagyany**ám** |
| dédapa | dédap**ám** |
| testvér | testvér**em** |
| gyerek | gyerek**em** |
| fiú (син) | **fiam** ← нерегулярне! |
| lány | lány**om** |
| feleség | feleség**em** |
| férj | férj**em** |

**Порівняння з українською:** ми кажемо «мій батько» — два слова. Угорська: «apám» — одне. І присвійний суфікс іде ПЕРЕД відмінковим: *apám**nak*** (моєму батькові), *nagyapám**tól*** (від мого дідуся).

**Порядок суфіксів завжди:** основа + присвійність + число + відмінок.
*nagyszül-e-im-nek* = моїм дідусеві й бабусі.`,
  drills:[
    {q:'мій батько', opts:['apám','apam','énapa'], a:0, why:'apa + -m → apám (a подовжується).'},
    {q:'мій дідусь', opts:['nagyapam','nagyapám','nagyapja'], a:1, why:'nagyapám.'},
    {q:'мій син', opts:['fiúm','fiam','fium'], a:1, why:'Нерегулярне: fiú → fiam.'},
    {q:'моя дочка', opts:['lányom','lányam','lányem'], a:0, why:'lány + -om → lányom.'},
    {q:'мій брат/сестра', opts:['testvérom','testvérem'], a:1, why:'Передній ряд → testvérem.'},
    {q:'мої батьки', opts:['szüleim','szülőim','szülőm'], a:0, why:'szülő → szüleim (множина + присвійність).'},
    {q:'моєму батькові', opts:['apámnak','apanakom','apámnek'], a:0, why:'Основа + присвійність + відмінок: apám + -nak.'},
    {q:'від мого дідуся', opts:['nagyapámtól','nagyapátólm'], a:0, why:'nagyapám + -tól.'},
    {q:'його/її батько', opts:['apja','apám','apád'], a:0, why:'apa → apja (3-тя особа).'},
    {q:'моя дружина', opts:['feleségem','feleségom'], a:0, why:'Передній ряд → feleségem.'},
  ]
},
{
  id:'g9', w:8, title:'«У мене є» — Nekem van',
  short:'Дієслова «мати» в угорській немає',
  explain:`Угорська не має дієслова «мати». Володіння виражається конструкцією:

**[кому] + [що-присвійне] + van/vannak**

| Українською | Угорською |
|---|---|
| У мене є брат | **Nekem van** testvér**em**. / Van testvér**em**. |
| У тебе є діти | **Neked van** gyerek**ed**. |
| У нього є родина | **Neki van** család**ja**. |
| У мене двоє дітей | **Két gyerekem van.** |
| У мене немає брата | **Nincs testvérem.** |

**Три речі, які треба зробити правильно одночасно:**
1. Особа в давальному: nekem / neked / neki / nekünk / nektek / nekik
2. Присвійний суфікс на предметі володіння
3. van (одн.) / vannak (мн.) / nincs / nincsenek

*Nekem* можна опустити, якщо особа зрозуміла з присвійного суфікса: «Van testvérem.» = «У мене є брат.»

**Порівняння з українською:** структура на диво схожа! Ми теж кажемо «У мене є...» замість «Я маю». Різниця лише в тому, що угорська ще й маркує предмет присвійним суфіксом.`,
  drills:[
    {q:'У мене є брат/сестра.', opts:['Van testvérem.','Van testvér.','Nekem testvér van.'], a:0, why:'Присвійний суфікс обов\'язковий: testvérem.'},
    {q:'У мене двоє дітей.', opts:['Két gyerekeim van.','Két gyerekem van.','Két gyerek vagyok.'], a:1, why:'Після числівника — однина + присвійність: két gyerekem van.'},
    {q:'У мене немає брата.', opts:['Nem van testvérem.','Nincs testvérem.'], a:1, why:'Заперечення van → nincs.'},
    {q:'У нього є родина.', opts:['Neki van családja.','Neki van család.'], a:0, why:'családja — присвійна форма 3-ї особи.'},
    {q:'У мене є родичі в Угорщині.', opts:['Vannak rokonaim Magyarországon.','Van rokonaim Magyarországon.'], a:0, why:'Множина → vannak.'},
    {q:'Форма давального для «мені»', opts:['nekem','nekim','énnek'], a:0, why:'nekem.'},
    {q:'У Вас є діти? (ввічливо)', opts:['Van gyereke?','Van gyereked?'], a:0, why:'Ön → 3-тя особа: gyereke.'},
  ]
},
{
  id:'g10', w:10, title:'Означена vs невизначена дієвідміна',
  short:'Вододіл між A1 і A2',
  explain:`Угорське дієслово має **дві повні дієвідміни**. Вибір залежить від того, чи додаток означений.

**НЕВИЗНАЧЕНА** — коли додатка немає, або він неозначений:
- Olvas**ok**. (Я читаю.)
- Olvas**ok** egy könyvet. (Я читаю [якусь] книжку.)
- Lát**ok** valamit. (Я щось бачу.)

**ОЗНАЧЕНА** — коли додаток означений (з артиклем *a/az*, власна назва, присвійна форма, займенник 3-ї особи):
- Olvas**om** a könyvet. (Я читаю [цю] книжку.)
- Szeret**em** a magyar kultúrát.
- Lát**om** őt.

**olvasni** (читати):
| | невизначена | означена |
|---|---|---|
| én | olvasok | olvas**om** |
| te | olvasol | olvas**od** |
| ő | olvas | olvas**sa** |
| mi | olvasunk | olvas**suk** |
| ti | olvastok | olvas**sátok** |
| ők | olvasnak | olvas**sák** |

**Порівняння з українською:** в українській означеність не граматикалізована взагалі — ми показуємо її порядком слів або контекстом. Тут доведеться будувати нову категорію з нуля. Це найдовший поріг курсу; закладай на нього 2–3 тижні.

**Практичне правило-милиця:** побачив у додатку **a / az** → бери означену форму.`,
  drills:[
    {q:'Я читаю книжку (конкретну): Olvas___ a könyvet.', opts:['-ok','-om'], a:1, why:'a könyvet — означений → olvasom.'},
    {q:'Я читаю [якусь] книжку: Olvas___ egy könyvet.', opts:['-ok','-om'], a:0, why:'egy könyvet — неозначений → olvasok.'},
    {q:'Я люблю угорську культуру: Szeret___ a magyar kultúrát.', opts:['-ek','-em'], a:1, why:'a kultúrát — означений → szeretem.'},
    {q:'Я вчу угорську мову: Tanul___ a magyar nyelvet.', opts:['-ok','-om'], a:1, why:'a nyelvet → tanulom.'},
    {q:'Я вчу угорську (без артикля): Tanul___ magyarul.', opts:['-ok','-om'], a:0, why:'Немає прямого додатка → tanulok.'},
    {q:'Я бачу його: Lát___ őt.', opts:['-ok','-om'], a:1, why:'Займенник 3-ї особи → означена: látom.'},
    {q:'Я бачу тебе: Lát___ téged.', opts:['-lak','-om'], a:0, why:'Особлива форма 1→2 особа: látlak.'},
    {q:'Ти знаєш відповідь: Tud___ a választ.', opts:['-sz','-od'], a:1, why:'a választ означений → tudod.'},
  ]
},
{
  id:'g11', w:12, title:'Минулий час',
  short:'Розповідь про себе і предків',
  explain:`Показник минулого часу — **-t-** / **-tt-**, потім особові закінчення.

**tanul** (невизначена, минулий):
| én | tanul**tam** |
| te | tanul**tál** |
| ő | tanul**t** |
| mi | tanul**tunk** |
| ti | tanul**tatok** |
| ők | tanul**tak** |

**beszél** (передній ряд):
beszél**tem**, beszél**tél**, beszél**t**, beszél**tünk**, beszél**tetek**, beszél**tek**

**Найважливіші неправильні:**
| Теперішній | Минулий (én) | Минулий (ő) |
|---|---|---|
| van | **voltam** | **volt** |
| megy | **mentem** | **ment** |
| jön | **jöttem** | **jött** |
| eszik | **ettem** | **evett** |
| tesz | **tettem** | **tett** |

**Порівняння з українською:** у нас минулий час змінюється за родом (був / була), але не за особою. В угорській — навпаки: за особою, але без роду. Один показник -t- на всі особи.

**Для співбесіди — обов'язкові блоки:**
- 1985-ben **születtem**. (Я народився 1985 року.)
- A dédapám Beregszászban **született**.
- Kétszer **voltam** Magyarországon.
- Egyetemre **jártam** Kijevben.`,
  drills:[
    {q:'tanul + én, минулий', opts:['tanultam','tanultem','tanultom'], a:0, why:'Задній ряд → tanultam.'},
    {q:'beszél + én, минулий', opts:['beszéltam','beszéltem'], a:1, why:'Передній ряд → beszéltem.'},
    {q:'van + én, минулий', opts:['vantam','voltam','vagytam'], a:1, why:'Нерегулярне: voltam.'},
    {q:'Мій прадід був угорцем: A dédapám magyar ___.', opts:['van','volt','—'], a:1, why:'У минулому часі зв\'язка НЕ опускається: volt.'},
    {q:'Я народився 1985 року: 1985-ben ___.', opts:['születtem','születem','születtél'], a:0, why:'születtem.'},
    {q:'megy + én, минулий', opts:['mentem','megytem'], a:0, why:'Нерегулярне: mentem.'},
    {q:'Я двічі був в Угорщині: Kétszer ___ Magyarországon.', opts:['voltam','vagyok','volt'], a:0, why:'voltam.'},
    {q:'tanul + ők, минулий', opts:['tanultak','tanultek'], a:0, why:'Задній ряд → tanultak.'},
  ]
},
];

export const grammarByWeek = (w) => GRAMMAR.filter(g => g.w <= w);
export const grammarById = Object.fromEntries(GRAMMAR.map(g => [g.id, g]));
