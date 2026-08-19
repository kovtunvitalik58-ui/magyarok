// 39-тижневий план. Керує тим, яка лексика і граматика розблоковані.

export const PLAN = [
  {w:1,  phase:1, title:'Вимова, гармонія, lenni', focus:'Алфавіт, гармонія голосних, займенники, вітання, числа 0–10', iq:'Mi a neve?'},
  {w:2,  phase:1, title:'Множина, ez/az, прикметники', focus:'Множина -k, вказівні, опис, числа 11–100', iq:'Hány éves?'},
  {w:3,  phase:1, title:'Теперішній час', focus:'Невизначена дієвідміна, дієслова на -ik, професії', iq:'Mi a foglalkozása?'},
  {w:4,  phase:1, title:'Де? Локативні відмінки', focus:'-ban/-ben, -on/-en/-ön, -nál/-nél, міста', iq:'Hol lakik?'},
  {w:5,  phase:1, title:'Куди / Звідки', focus:'Повна тріада з 9 суфіксів, рух', iq:'Honnan származik a családja?'},
  {w:6,  phase:1, title:'Знахідний -t', focus:'Прямий додаток, означений артикль', iq:'Mit tanul?'},
  {w:7,  phase:1, title:'РОДИНА: присвійні суфікси', focus:'apám, nagyapám, dédapám — ключова тема', iq:'Ki volt a magyar felmenője?'},
  {w:8,  phase:1, title:'Nekem van / nincs', focus:'Володіння, вік родичів', iq:'РОЛЬОВА ГРА №1'},

  {w:9,  phase:2, title:'Час, дати, роки', focus:'Місяці, дні, -kor, дати народження', iq:'Mikor született?'},
  {w:10, phase:2, title:'Означена дієвідміна', focus:'Головний поріг курсу', iq:'Szeretem a magyar kultúrát'},
  {w:11, phase:2, title:'Модальність + інфінітив', focus:'tudok, akarok, szeretnék, kell', iq:'Miért szeretne állampolgár lenni?'},
  {w:12, phase:2, title:'Минулий час (правильні)', focus:'-t/-tt + особові закінчення', iq:'Hol tanult?'},
  {w:13, phase:2, title:'Минулий час (неправильні)', focus:'voltam, mentem, jöttem + означений минулий', iq:'Volt már Magyarországon?'},
  {w:14, phase:2, title:'Майбутній час', focus:'fog + інфінітив, majd', iq:'Mit fog csinálni?'},
  {w:15, phase:2, title:'Ступені порівняння', focus:'-bb, leg-, опис людей', iq:'Milyen a családja?'},
  {w:16, phase:2, title:'Післяйменники + префікси', focus:'előtt, után, mellett; meg-, el-, be-, ki-', iq:'Зв\'язна розповідь'},
  {w:17, phase:2, title:'Консолідація A1', focus:'Повторення всього блоку', iq:'РОЛЬОВА ГРА №2'},

  {w:18, phase:3, title:'Умовний спосіб I', focus:'-na/-ne, szeretnék', iq:'Ввічливе мовлення'},
  {w:19, phase:3, title:'Умовний спосіб II', focus:'Означений умовний, ha-речення', iq:'Ha magyar állampolgár lennék…'},
  {w:20, phase:3, title:'Складнопідрядні', focus:'hogy, mert, ha, amikor', iq:'Пояснення причин'},
  {w:21, phase:3, title:'Відносні речення', focus:'aki, ami, ahol, amikor', iq:'Опис родичів'},
  {w:22, phase:3, title:'Присвійні ланцюжки', focus:'az apám testvére, -é', iq:'Генеалогія'},
  {w:23, phase:3, title:'Генеалогія I', focus:'Лінія роду, покоління', iq:'Mesélne a család történetéről?'},
  {w:24, phase:3, title:'Генеалогія II', focus:'Документи, підтвердження походження', iq:'Milyen dokumentumai vannak?'},
  {w:25, phase:3, title:'Дієприкметники', focus:'-ó/-ő, -t/-tt', iq:'Опис документів'},
  {w:26, phase:3, title:'Наказовий спосіб', focus:'Пасивне розуміння інструкцій', iq:'Розуміння консула'},
  {w:27, phase:3, title:'Числівники розширено', focus:'Порядкові, дати, роки словами', iq:'Точні дати'},
  {w:28, phase:3, title:'Ідіоматика A2 I', focus:'Природні звороти', iq:'Природність мовлення'},
  {w:29, phase:3, title:'Ідіоматика A2 II', focus:'Розмовні формули', iq:'Природність мовлення'},
  {w:30, phase:3, title:'Консолідація A2', focus:'Повторення', iq:'РОЛЬОВА ГРА №3'},

  {w:31, phase:4, title:'Блок «Родина і предки»', focus:'20+ варіацій одних питань', iq:'Автоматизм'},
  {w:32, phase:4, title:'Блок «Закарпаття»', focus:'Beregszász, Munkács, Ungvár, історія регіону', iq:'Mit tud Kárpátaljáról?'},
  {w:33, phase:4, title:'Блок «Мотивація»', focus:'Чому громадянство, зв\'язок з культурою', iq:'Miért…?'},
  {w:34, phase:4, title:'Угорські реалії', focus:'Himnusz, Szent István, 1848, 1956, ünnepek', iq:'Культурні питання'},
  {w:35, phase:4, title:'Блок «Я і мова»', focus:'Як вчив, скільки часу, чому', iq:'Hogyan tanult?'},
  {w:36, phase:4, title:'Мок-інтерв\'ю I', focus:'3 повні симуляції + розбір', iq:'Повна симуляція'},
  {w:37, phase:4, title:'Мок-інтерв\'ю II', focus:'Робота під тиском, перебивання', iq:'Повна симуляція'},
  {w:38, phase:4, title:'Мок-інтерв\'ю III', focus:'Несподівані питання', iq:'Повна симуляція'},
  {w:39, phase:4, title:'Фінальне шліфування', focus:'Швидкість, впевненість, паузи', iq:'Готовність'},
];

export const PHASES = {
  1:{name:'Фундамент A1', color:'#4A9D5F'},
  2:{name:'Завершення A1', color:'#3B82C4'},
  3:{name:'Рівень A2', color:'#8B5CF6'},
  4:{name:'Підготовка до співбесіди', color:'#D97706'},
};

export const weekInfo = (w) => PLAN.find(p => p.w === w) || PLAN[PLAN.length-1];
