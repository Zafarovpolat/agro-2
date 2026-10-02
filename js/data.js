/* ============================================================
   AgroNord — данные каталога и статусы поставок
   Добавлено по запросу клиента: статус товара, срок поставки,
   дата прибытия, контейнер, серия.
   В WordPress эти данные придут из админки (структура полей 1:1).
   Даты считаются от сегодняшнего дня, чтобы демонстрация всегда
   была «живой»: сроки — как их задаёт менеджер в админке.
   ============================================================ */
(function () {
  const DAY = 86400000;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const plus = (n) => new Date(today.getTime() + n * DAY).toISOString().slice(0, 10);

  /* ---- Контейнеры (партии поставки) ---- */
  const containers = [
    { code: 'MSKU-4471', arrival: plus(12),  note_ru: 'разгрузка в Бельцах, техника проходит сервис', note_ro: 'descărcare la Bălți, utilajele trec prin service' },
    { code: 'AGRU-2210', arrival: plus(55),  note_ru: 'в пути из порта Гамбург',                        note_ro: 'pe drum din portul Hamburg' },
    { code: 'TCLU-8890', arrival: plus(73),  note_ru: 'формируется, открыт добор позиций',              note_ro: 'se formează, completare poziții deschisă' },
    { code: 'HLCU-3320', arrival: plus(-5),  note_ru: 'задержка на таможне, дату уточняет менеджер',    note_ro: 'întârziere la vamă, data o confirmă managerul' }
  ];

  /* ---- Товары ----
     status: stock — в наличии | transit — в дороге
             reserved — забронировано | sold — продан
     days  — срок поставки, который указывает менеджер (дней)
     start — дата постановки в поставку (дата добавления товара)
     arrival — расчётная дата прибытия в Молдову
     arrived — фактическая дата прибытия (для техники в наличии)          */
  const products = [
    {
      id: 1, cat: 'tractors', brand: 'John Deere', name_ru: 'Трактор John Deere 8R', name_ro: 'Tractor John Deere 8R',
      serial: '1RW8R4100PP118472', container: 'AGRU-2210',
      price: 0, status: 'transit', days: 60, start: plus(-5), arrival: plus(55),
      specs: [['Мощность двигателя', 'Putere motor', '245–410 л.с.'], ['Трансмиссия', 'Transmisie', 'e23 PowerShift / IVT'], ['Масса', 'Masă', '11 500 – 15 600 кг']],
      images: ['img/tractor-john-deere-8r.jpg'],
      desc_ru: 'Трактор John Deere серии 8R для крупных хозяйств: максимальная мощность, точное земледелие и автопилот. Машина уже в контейнере, прибытие в Молдову — в течение двух месяцев. До прибытия позицию можно забронировать.',
      desc_ro: 'Tractor John Deere seria 8R pentru gospodării mari: putere maximă, agricultură de precizie și autopilot. Utilajul este deja în container, sosirea în Moldova — în circa două luni. Poziția poate fi rezervată până la sosire.'
    },
    {
      id: 2, cat: 'combines', brand: 'CLAAS', name_ru: 'Комбайн CLAAS LEXION', name_ro: 'Combină CLAAS LEXION',
      serial: 'C4800231', container: 'MSKU-4471',
      price: 0, status: 'reserved', days: 60, start: plus(-48), arrival: plus(12),
      specs: [['Мощность', 'Putere', 'до 626 л.с.'], ['Бункер', 'Buncăr', '12 800 л'], ['Ширина жатки', 'Lățime heder', 'до 12 м']],
      images: ['img/combine-claas-lexion.jpg'],
      desc_ru: 'CLAAS LEXION — флагманский комбайн с системой обмолота APS HYBRID. Позиция забронирована клиентом: внесена предоплата, ожидаем выдачу после прибытия контейнера.',
      desc_ro: 'CLAAS LEXION — combină de top cu sistem de treierare APS HYBRID. Poziția este rezervată de un client: avansul achitat, așteptăm predarea după sosirea containerului.'
    },
    {
      id: 3, cat: 'seeders', brand: 'HORSCH', name_ru: 'Сеялка HORSCH Maestro', name_ro: 'Semănătoare HORSCH Maestro',
      serial: 'HM1245-08', container: 'TCLU-8890',
      price: 0, status: 'transit', days: 75, start: plus(-2), arrival: plus(73),
      specs: [['Ширина захвата', 'Lățime de lucru', '12 м'], ['Число секций', 'Număr secții', '24'], ['Рабочая скорость', 'Viteză de lucru', 'до 10 км/ч']],
      images: ['img/seeder-horsch.jpg'],
      desc_ru: 'Сеялка точного высева HORSCH Maestro пропускной способностью до 12 м. Только что поставлена в контейнер TCLU-8890 — к позиции открыт добор, бронь возможна заранее.',
      desc_ro: 'Semănătoare de precizie HORSCH Maestro cu lățime de până la 12 m. Tocmai a fost încărcată în containerul TCLU-8890 — poziția poate fi rezervată din timp.'
    },
    {
      id: 4, cat: 'plows', brand: 'Lemken', name_ru: 'Плуг оборотный 5-корпусный', name_ro: 'Plug reversibil cu 5 corpuri',
      serial: 'LK-5-33841', container: 'склад',
      price: 0, status: 'stock', days: 0, start: plus(-70), arrival: plus(-18), arrived: plus(-18),
      specs: [['Число корпусов', 'Număr corpuri', '5'], ['Ширина захвата', 'Lățime de lucru', '2,25 м'], ['Глубина обработки', 'Adâncime', 'до 35 см']],
      images: ['img/plow.jpg'],
      desc_ru: 'Оборотный плуг Lemken в наличии на складе. Можно приехать, посмотреть и забрать в день оплаты — техника прошла проверку в нашем сервисе.',
      desc_ro: 'Plug reversibil Lemken disponibil în depozit. Puteți veni, vedea și ridica în ziua plății — utilajul a fost verificat în service-ul nostru.'
    },
    {
      id: 5, cat: 'plows', brand: 'Case IH', name_ru: 'Культиватор стерневой', name_ro: 'Cultivator de miriște',
      serial: 'CI-TC770-117', container: 'склад',
      price: 0, status: 'stock', days: 0, start: plus(-64), arrival: plus(-15), arrived: plus(-15),
      specs: [['Ширина захвата', 'Lățime de lucru', '7 м'], ['Число лап', 'Număr colți', '33'], ['Рабочая глубина', 'Adâncime de lucru', 'до 12 см']],
      images: ['img/cultivator.jpg'],
      desc_ru: 'Стерневой культиватор для быстрой обработки поля после уборки. В наличии, готов к отгрузке со склада в Бельцах.',
      desc_ro: 'Cultivator pentru prelucrarea rapidă a miriștei după recoltare. Disponibil în depozitul din Bălți, gata de livrare.'
    },
    {
      id: 6, cat: 'seeders', brand: 'Amazone', name_ru: 'Опрыскиватель прицепной', name_ro: 'Stropitoare tractată',
      serial: 'AZ-UX5201', container: 'склад',
      price: 0, status: 'stock', days: 0, start: plus(-58), arrival: plus(-12), arrived: plus(-12),
      specs: [['Объём бака', 'Volum rezervor', '5 200 л'], ['Штанга', 'Bară', '27 м'], ['Насос', 'Pompă', '260 л/мин']],
      images: ['img/sprayer.jpg'],
      desc_ru: 'Прицепной опрыскиватель Amazone с электронным управлением секциями и стабилизацией штанги. В наличии, можно осмотреть на складе.',
      desc_ro: 'Stropitoare tractată Amazone cu comandă electronică a secțiilor și stabilizarea barei. Disponibilă, poate fi inspectată la depozit.'
    },
    {
      id: 7, cat: 'trailers', brand: 'Kuhn', name_ru: 'Разбрасыватель удобрений', name_ro: 'Distribuitor de îngrășăminte',
      serial: 'KH-AXIS-5021', container: 'склад',
      price: 0, status: 'stock', days: 0, start: plus(-52), arrival: plus(-20), arrived: plus(-20),
      specs: [['Объём бункера', 'Volum buncăr', '4 200 л'], ['Ширина разброса', 'Lățime împrăștiere', 'до 36 м'], ['Грузоподъёмность', 'Capacitate', '3 300 кг']],
      images: ['img/spreader.jpg'],
      desc_ru: 'Разбрасыватель минеральных удобрений Kuhn AXIS с взвешиванием на ходу. В наличии на складе, гарантия и сервис.',
      desc_ro: 'Distribuitor de îngrășăminte minerale Kuhn AXIS cu cântărire în mers. Disponibil în depozit, garanție și service.'
    },
    {
      id: 8, cat: 'plows', brand: 'Krone', name_ru: 'Косилка дисковая', name_ro: 'Cositoare cu disc',
      serial: 'KR-EC320-0774', container: 'MSKU-4471',
      price: 0, status: 'transit', days: 40, start: plus(-12), arrival: plus(28),
      specs: [['Ширина захвата', 'Lățime de lucru', '3,2 м'], ['Число дисков', 'Număr discuri', '8'], ['Кондиционер', 'Condiționer', 'есть']],
      images: ['img/mower.jpg'],
      desc_ru: 'Дисковая косилка Krone с кондиционером для заготовки кормов. Едет в контейнере MSKU-4471, прибытие примерно через месяц.',
      desc_ro: 'Cositoare cu disc Krone cu condiționer pentru furaje. Sosește în containerul MSKU-4471, în circa o lună.'
    },
    {
      id: 9, cat: 'trailers', brand: 'Vermeer', name_ru: 'Пресс-подборщик', name_ro: 'Presă de balotat',
      serial: 'VM-605N-3391', container: 'склад',
      price: 0, status: 'stock', days: 0, start: plus(-45), arrival: plus(-14), arrived: plus(-14),
      specs: [['Камера', 'Cameră', 'переменная'], ['Диаметр рулона', 'Diametru balot', 'до 1,8 м'], ['Плотность', 'Densitate', 'регулируемая']],
      images: ['img/baler.jpg'],
      desc_ru: 'Пресс-подборщик с переменной камерой и регулируемой плотностью рулона. В наличии, готова к работе в поле.',
      desc_ro: 'Presă de balotat cu cameră variabilă și densitate reglabilă. Disponibilă, gata de lucru pe câmp.'
    },
    {
      id: 10, cat: 'plows', brand: 'Horsch', name_ru: 'Борона дисковая', name_ro: 'Grapă cu discuri',
      serial: 'HRS-JOKER-8812', container: 'HLCU-3320',
      price: 0, status: 'transit', days: 60, start: plus(-65), arrival: plus(-5),
      specs: [['Ширина захвата', 'Lățime de lucru', '8 м'], ['Диски', 'Discuri', '460 мм'], ['Бункер', 'Buncăr', 'опция']],
      images: ['img/disc-harrow.jpg'],
      desc_ru: 'Дисковая борона Horsch Joker для обработки стерни на высокой скорости. По контейнеру HLCU-3320 возникла задержка на таможне — точную дату подтверждает менеджер.',
      desc_ro: 'Grapă cu discuri Horsch Joker pentru prelucrarea miriștei la viteză mare. Containerul HLCU-3320 a întârziat la vamă — data exactă o confirmă managerul.'
    },
    {
      id: 11, cat: 'combines', brand: 'Geringhoff', name_ru: 'Жатка для кукурузы', name_ro: 'Heder pentru porumb',
      serial: 'GH-MAIS-6011', container: 'MSKU-4471',
      price: 0, status: 'transit', days: 45, start: plus(-27), arrival: plus(10),
      specs: [['Число рядов', 'Număr rânduri', '8'], ['Ширина захвата', 'Lățime de lucru', '6,0 м'], ['Совместимость', 'Compatibilitate', 'CLAAS, JD']],
      images: ['img/corn-header.jpg'],
      desc_ru: 'Кукурузная жатка Geringhoff на 8 рядов, совместима с комбайнами CLAAS и John Deere. Прибытие вместе с контейнером MSKU-4471.',
      desc_ro: 'Heder pentru porumb Geringhoff cu 8 rânduri, compatibil cu combine CLAAS și John Deere. Sosește cu containerul MSKU-4471.'
    },
    {
      id: 12, cat: 'tractors', brand: 'Case IH', name_ru: 'Трактор Case IH Magnum', name_ro: 'Tractor Case IH Magnum',
      serial: 'ZFRX37001P51034', container: 'склад',
      price: 0, status: 'stock', days: 0, start: plus(-49), arrival: plus(-11), arrived: plus(-11),
      specs: [['Мощность', 'Putere', '340 л.с.'], ['Трансмиссия', 'Transmisie', 'PowerDrive 18/4'], ['Грузоподъёмность', 'Capacitate ridicare', '8 400 кг']],
      images: ['img/tractor-case-ih-magnum.jpg'],
      desc_ru: 'Case IH Magnum — трактор для тяжелых полевых работ. Уже в Молдове, на нашем складе: можно приехать на осмотр и тестовый запуск.',
      desc_ro: 'Case IH Magnum — tractor pentru lucrări grele. Deja în Moldova, în depozitul nostru: puteți veni pentru inspectare și pornire de probă.'
    },
    {
      id: 13, cat: 'tractors', brand: 'New Holland', name_ru: 'Трактор New Holland T7', name_ro: 'Tractor New Holland T7',
      serial: 'HFT7-2300-77341', container: 'AGRU-2210',
      price: 0, status: 'transit', days: 45, start: plus(-3), arrival: plus(42),
      specs: [['Мощность', 'Putere', '220–260 л.с.'], ['Трансмиссия', 'Transmisie', 'Auto Command'], ['Кабина', 'Cabină', 'пневмоподвеска']],
      images: ['img/tractor-new-holland-t7.jpg'],
      desc_ru: 'New Holland T7 с бесступенчатой трансмиссией Auto Command и комфортной кабиной. В контейнере AGRU-2210, прибытие примерно через полтора месяца.',
      desc_ro: 'New Holland T7 cu transmisie continuă Auto Command și cabină confortabilă. În containerul AGRU-2210, sosirea în circa o lună și jumătate.'
    },
    {
      id: 14, cat: 'combines', brand: 'John Deere', name_ru: 'Комбайн John Deere S780', name_ro: 'Combină John Deere S780',
      serial: '1H0S780XCV095512', container: 'MSKU-4471',
      price: 0, status: 'transit', days: 30, start: plus(-28), arrival: plus(2),
      specs: [['Мощность', 'Putere', 'до 543 л.с.'], ['Бункер', 'Buncăr', '14 100 л'], ['Жатка', 'Heder', 'до 12,2 м']],
      images: ['img/combine-john-deere.jpg'],
      desc_ru: 'Комбайн John Deere S780 с системой обмолота и телематикой JDLink. Контейнер уже разгружается — ожидается со дня на день, успейте забронировать.',
      desc_ro: 'Combină John Deere S780 cu sistem de treierare și telematică JDLink. Containerul se descarcă deja — se așteaptă în orice zi, rezervați la timp.'
    },
    {
      id: 15, cat: 'trailers', brand: 'Fliegl', name_ru: 'Прицеп тракторный бортовой', name_ro: 'Remorcă tractată cu laturi',
      serial: 'FL-DK-180-2207', container: 'склад',
      price: 0, status: 'sold', days: 0, start: plus(-95), arrival: plus(-45), arrived: plus(-45),
      specs: [['Грузоподъёмность', 'Capacitate', '18 т'], ['Объём', 'Volum', '24 м³'], ['Разгрузка', 'Descărcare', '3 стороны']],
      images: ['img/trailer.jpg'],
      desc_ru: 'Прицеп Fliegl 18 т — продан и передан клиенту. Оставьте заявку, сообщим о похожих позициях в следующих контейнерах.',
      desc_ro: 'Remorcă Fliegl 18 t — vândută și predată clientului. Lăsați o cerere și vă anunțăm despre poziții similare în următoarele containere.'
    },
    {
      id: 16, cat: 'parts', brand: '—', name_ru: 'Фильтры масляные и воздушные', name_ro: 'Filtre de ulei și aer',
      serial: 'FLT-SET-2026', container: 'склад',
      price: 0, status: 'stock', days: 0, start: plus(-40), arrival: plus(-10), arrived: plus(-10),
      specs: [['Назначение', 'Destinație', 'John Deere, CLAAS, CNH'], ['Тип', 'Tip', 'оригинал'], ['Наличие', 'Disponibilitate', 'со склада']],
      images: ['img/spare-parts.jpg'],
      desc_ru: 'Оригинальные фильтры для техники John Deere, CLAAS и CNH: масляные, воздушные, гидравлические. На складе, отправка в день заказа.',
      desc_ro: 'Filtre originale pentru tehnică John Deere, CLAAS și CNH: ulei, aer, hidraulice. În depozit, expediere în ziua comenzii.'
    }
  ];

  window.AGRO_SHOP = { today, plus, containers, products };
})();
