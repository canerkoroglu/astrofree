// "Yenilikler": shown once after an update. Newest version first; keep the
// list short (what a user would notice), one entry per interface language.
export interface WhatsNew {
  version: string
  items: Record<string, string[]>
}

// i18n-ignore-start (each entry carries its own translations)
export const WHATS_NEW: WhatsNew[] = [
  {
    version: '0.6.0',
    items: {
      tr: [
        'Yeni düzen: solda ana menü (katmanlar, harita ayarları, kullanım modu), yanında açılıp kapanan Haritalar ve Gökyüzü paneli; zaman çubuğu en üstte.',
        'Bu gece gökyüzünde penceresi baştan tasarlandı: gece boyunca oynatılan gökyüzü haritası, ekliptik, yükseklik grafiği ve her gezegenin o andaki konumu.',
        'Haritalar paneli: Tümü / Kişiler / Olaylar sekmesi, Yeni ekle düğmesi ve her satırda simgeli seçenek menüsü; sinastri partneri listeden seçiliyor.',
        'Daha kolay tarih seçimi: yıl ve ay ızgarası, ▲▼ saat ve dakika; kişi ekleme penceresi sadeleştirildi.',
        'Haritada burç, ev ve köşe etiketlerinin üzerine gelince açıklama.',
        'Düzeltme: Bu gece penceresinin bazı bilgisayarlarda hesaplamaları bozan bellek hatası giderildi; Şimdi ve Canlı kayıtlı haritada transit zamanını şu ana getiriyor.',
        'Evler tablosunda her evin konusu; satıra tıklayınca evin açıklaması, yöneticisi ve içindeki gezegenlerin yorumu.'
      ],
      en: [
        'New layout: a main menu on the left (layers, chart settings, usage mode) with a Charts and Sky panel that opens and closes beside it; the time bar is at the top.',
        'In tonight’s sky, redesigned: a sky map that plays through the night, the ecliptic, an altitude chart and where each planet is at that moment.',
        'Charts panel: All / People / Events tabs, an Add new button and an options menu with icons on every row; the synastry partner is chosen from the list.',
        'Easier date picking: year and month grids, ▲▼ hours and minutes; a simpler window for adding a person.',
        'Hover over sign, house and angle labels on the wheel for an explanation.',
        'Fix: a memory error in In tonight’s sky that could break calculations on some computers; Now and Live bring the transit time to now on a saved chart.',
        'Houses table: each house’s topics, and a click on a row shows what the house is about, its ruler and the reading for each planet in it.'
      ],
      es: [
        'Nuevo diseño: un menú principal a la izquierda (capas, ajustes de la carta, modo de uso) con un panel de Cartas y Cielo que se abre y se cierra a su lado; la barra de tiempo está arriba.',
        'En el cielo esta noche, rediseñado: un mapa del cielo que avanza durante la noche, la eclíptica, un gráfico de altura y la posición de cada planeta en ese momento.',
        'Panel de cartas: pestañas Todos / Personas / Eventos, un botón Añadir y un menú de opciones con iconos en cada fila; la pareja de la sinastría se elige de la lista.',
        'Elegir fechas es más fácil: cuadrículas de años y meses, ▲▼ para horas y minutos; una ventana más sencilla para añadir una persona.',
        'Al pasar sobre los signos, las casas y los ángulos de la rueda aparece una explicación.',
        'Corrección: un error de memoria en En el cielo esta noche que podía romper los cálculos en algunos equipos; Ahora y En vivo llevan la hora del tránsito al momento actual en una carta guardada.',
        'Tabla de casas: los temas de cada casa; al hacer clic en una fila se ve qué trata la casa, su regente y la lectura de cada planeta en ella.'
      ],
      pt: [
        'Novo layout: um menu principal à esquerda (camadas, ajustes do mapa, modo de uso) com um painel de Mapas e Céu que abre e fecha ao lado; a barra de tempo fica no topo.',
        'No céu esta noite, redesenhado: um mapa do céu que avança pela noite, a eclíptica, um gráfico de altura e a posição de cada planeta naquele momento.',
        'Painel de mapas: abas Todos / Pessoas / Eventos, um botão Adicionar e um menu de opções com ícones em cada linha; o parceiro da sinastria é escolhido na lista.',
        'Escolher datas ficou mais fácil: grades de anos e meses, ▲▼ para horas e minutos; uma janela mais simples para adicionar uma pessoa.',
        'Passe o mouse sobre signos, casas e ângulos da roda para ver uma explicação.',
        'Correção: um erro de memória em No céu esta noite que podia quebrar os cálculos em alguns computadores; Agora e Ao vivo trazem a hora do trânsito para agora num mapa salvo.',
        'Tabela de casas: os temas de cada casa; um clique na linha mostra do que trata a casa, seu regente e a leitura de cada planeta nela.'
      ],
      de: [
        'Neues Layout: links ein Hauptmenü (Ebenen, Horoskop-Einstellungen, Nutzungsmodus), daneben ein auf- und zuklappbarer Bereich für Horoskope und Himmel; die Zeitleiste steht oben.',
        'Heute am Himmel, neu gestaltet: eine Himmelskarte, die durch die Nacht läuft, die Ekliptik, ein Höhendiagramm und die Position jedes Planeten zum jeweiligen Zeitpunkt.',
        'Horoskop-Bereich: Reiter Alle / Personen / Ereignisse, eine Schaltfläche Neu hinzufügen und in jeder Zeile ein Optionsmenü mit Symbolen; der Synastrie-Partner wird aus der Liste gewählt.',
        'Einfachere Datumswahl: Jahres- und Monatsraster, ▲▼ für Stunden und Minuten; ein schlichteres Fenster zum Hinzufügen einer Person.',
        'Zeichen, Häuser und Achsen im Rad zeigen beim Darüberfahren eine Erklärung.',
        'Korrektur: ein Speicherfehler in Heute am Himmel, der auf manchen Rechnern die Berechnungen stören konnte; Jetzt und Live setzen bei einem gespeicherten Horoskop die Transitzeit auf jetzt.',
        'Häusertabelle: die Themen jedes Hauses; ein Klick auf eine Zeile zeigt, worum es im Haus geht, seinen Herrscher und die Deutung jedes Planeten darin.'
      ],
      fr: [
        'Nouvelle disposition : un menu principal à gauche (couches, réglages du thème, mode d’utilisation) avec à côté un panneau Thèmes et Ciel qui s’ouvre et se ferme ; la barre de temps est en haut.',
        'Dans le ciel ce soir, repensé : une carte du ciel qui défile au fil de la nuit, l’écliptique, un graphique de hauteur et la position de chaque planète à cet instant.',
        'Panneau des thèmes : onglets Tous / Personnes / Événements, un bouton Ajouter et sur chaque ligne un menu d’options avec icônes ; le partenaire de synastrie se choisit dans la liste.',
        'Choix des dates plus simple : grilles des années et des mois, ▲▼ pour les heures et les minutes ; une fenêtre plus simple pour ajouter une personne.',
        'Survolez les signes, les maisons et les angles de la roue pour voir une explication.',
        'Correction : une erreur de mémoire dans Dans le ciel ce soir qui pouvait fausser les calculs sur certains ordinateurs ; Maintenant et En direct ramènent l’heure du transit à maintenant sur un thème enregistré.',
        'Tableau des maisons : les thèmes de chaque maison ; un clic sur une ligne montre ce dont parle la maison, son maître et la lecture de chaque planète qui s’y trouve.'
      ],
      ru: [
        'Новый интерфейс: слева главное меню (слои, настройки карты, режим), рядом раскрывающаяся панель «Карты» и «Небо»; панель времени вверху.',
        '«На небе сегодня ночью» переработано: карта неба, которая проигрывается в течение ночи, эклиптика, график высоты и положение каждой планеты в выбранный момент.',
        'Панель карт: вкладки «Все / Люди / События», кнопка «Добавить» и меню с иконками в каждой строке; партнёр для синастрии выбирается из списка.',
        'Выбирать даты проще: сетки лет и месяцев, ▲▼ для часов и минут; окно добавления человека стало проще.',
        'При наведении на знаки, дома и углы карты появляется пояснение.',
        'Исправление: ошибка памяти в окне «На небе сегодня ночью», которая на некоторых компьютерах могла нарушать расчёты; «Сейчас» и «В реальном времени» переводят время транзита на текущий момент в сохранённой карте.',
        'Таблица домов: темы каждого дома; по щелчку на строке — описание дома, его управитель и толкование каждой планеты в нём.'
      ],
      hi: [
        'नया रूप: बाईं ओर मुख्य मेनू (परतें, कुंडली सेटिंग, उपयोग मोड) और उसके बगल में खुलने-बंद होने वाला कुंडलियाँ और आकाश पैनल; समय पट्टी सबसे ऊपर।',
        'आज रात आकाश में — नए रूप में: रात भर चलने वाला आकाश मानचित्र, क्रांतिवृत्त, ऊँचाई का ग्राफ़ और उस क्षण हर ग्रह की स्थिति।',
        'कुंडलियाँ पैनल: सभी / लोग / घटनाएँ टैब, नया जोड़ें बटन और हर पंक्ति में आइकन वाला विकल्प मेनू; सिनास्ट्री साथी सूची से चुना जाता है।',
        'तिथि चुनना आसान: वर्ष और महीने की ग्रिड, घंटे और मिनट के लिए ▲▼; व्यक्ति जोड़ने की विंडो सरल हुई।',
        'चक्र पर राशि, भाव और कोण लेबल पर माउस ले जाने से विवरण दिखता है।',
        'सुधार: आज रात आकाश में एक मेमोरी त्रुटि जो कुछ कंप्यूटरों पर गणना बिगाड़ सकती थी; सहेजी गई कुंडली में अभी और लाइव ट्रांज़िट समय को अभी पर ले आते हैं।',
        'भाव तालिका: हर भाव के विषय; पंक्ति पर क्लिक करने से भाव का अर्थ, उसका स्वामी और उसमें हर ग्रह की व्याख्या दिखती है।'
      ]
    }
  },
  {
    version: '0.5.0',
    items: {
      tr: [
        'Ay Takvimi: her günün Ay evresi, burcu, burç geçiş ve boşluk saatleri, tutulmalar ve geleneksel bahçe günleri; PDF ve takvime (.ics) aktarım.',
        'Bu gece gökyüzünde: hangi gezegenin hangi saatte, hangi yönde görülebileceği, yakın görünen gezegenler, meteor yağmurları ve görülecek tutulmalar.',
        'Doğum saatini bul: Olaylarım’daki tarihlerden en olası doğum saatlerini gerekçeleriyle sıralar; yaklaşık bir sonuç verir.',
        'Kişiler ve olaylar penceresi: notlar ve olaylar dahil her şeyde arama, sıralama, sabitleme, toplu düzenleme ve kopyaları birleştirme. Profesyonel modda danışan kartı ve seans notları.',
        'İçe aktarım düzeltildi: astro.com AAF dosyalarındaki tarihler artık atlanmıyor; önizleme, kopya denetimi, yapıştırarak içe aktarma ve AAF / CSV olarak dışa aktarma.'
      ],
      en: [
        'Moon Calendar: each day’s Moon phase, sign, ingress and void-of-course times, eclipses and traditional garden days; export to PDF or your calendar (.ics).',
        'Tonight’s sky: which planets may be seen, when and in which direction, close pairs, meteor showers and upcoming visible eclipses.',
        'Find my birth time: ranks the most likely birth times from the dates in My events, with the reasons; the result is approximate.',
        'People and events window: search everything including notes and events, sort, pin, edit in bulk and merge duplicates. In Professional mode, a client card with session notes.',
        'Import fixed: dates in astro.com AAF files are no longer skipped; preview, duplicate check, import by pasting, and export as AAF / CSV.'
      ],
      es: [
        'Calendario lunar: la fase, el signo, las horas de ingreso y de Luna vacía de cada día, los eclipses y los días tradicionales de jardín; exportable a PDF o a su calendario (.ics).',
        'El cielo de esta noche: qué planetas podrían verse, a qué hora y en qué dirección, parejas cercanas, lluvias de meteoros y próximos eclipses visibles.',
        'Encontrar mi hora de nacimiento: ordena las horas más probables a partir de las fechas de Mis acontecimientos, con sus motivos; el resultado es aproximado.',
        'Ventana de personas y acontecimientos: búsqueda en todo, notas y acontecimientos incluidos, orden, fijar, edición en bloque y fusión de duplicados. En modo Profesional, ficha de cliente con notas de sesión.',
        'Importación corregida: las fechas de los archivos AAF de astro.com ya no se omiten; vista previa, control de duplicados, importar pegando texto y exportar como AAF / CSV.'
      ],
      pt: [
        'Calendário lunar: a fase, o signo, os horários de ingresso e de Lua fora de curso de cada dia, os eclipses e os dias tradicionais de jardim; exportável em PDF ou para sua agenda (.ics).',
        'O céu desta noite: quais planetas podem ser vistos, a que horas e em que direção, pares próximos, chuvas de meteoros e próximos eclipses visíveis.',
        'Encontrar minha hora de nascimento: ordena as horas mais prováveis a partir das datas em Meus acontecimentos, com os motivos; o resultado é aproximado.',
        'Janela de pessoas e acontecimentos: busca em tudo, inclusive notas e acontecimentos, ordenação, fixar, edição em lote e mesclagem de duplicados. No modo Profissional, ficha de cliente com notas de sessão.',
        'Importação corrigida: datas em arquivos AAF do astro.com não são mais ignoradas; pré-visualização, verificação de duplicados, importar colando texto e exportar como AAF / CSV.'
      ],
      de: [
        'Mondkalender: Mondphase, Zeichen, Zeichenwechsel und Leerlauf des Mondes für jeden Tag, Finsternisse und die traditionellen Gartentage; Export als PDF oder in den Kalender (.ics).',
        'Der Himmel heute Nacht: welche Planeten wann und in welcher Richtung zu sehen sein könnten, nahe Paare, Meteorströme und kommende sichtbare Finsternisse.',
        'Geburtszeit finden: ordnet die wahrscheinlichsten Geburtszeiten anhand der Daten in Meine Ereignisse, mit Begründung; das Ergebnis ist eine Näherung.',
        'Fenster Personen und Ereignisse: Suche in allem einschließlich Notizen und Ereignissen, Sortieren, Anheften, Sammelbearbeitung und Zusammenführen von Doppelten. Im Profi-Modus eine Klientenkarte mit Sitzungsnotizen.',
        'Import korrigiert: Daten in AAF-Dateien von astro.com werden nicht mehr übersprungen; Vorschau, Doppelprüfung, Import durch Einfügen und Export als AAF / CSV.'
      ],
      fr: [
        'Calendrier lunaire : la phase, le signe, les heures d’entrée et de Lune vide de chaque jour, les éclipses et les jours traditionnels de jardinage ; export en PDF ou vers votre agenda (.ics).',
        'Le ciel de cette nuit : quelles planètes pourraient être vues, à quelle heure et dans quelle direction, rapprochements, pluies d’étoiles filantes et prochaines éclipses visibles.',
        'Trouver mon heure de naissance : classe les heures les plus probables à partir des dates de Mes événements, avec leurs raisons ; le résultat est approximatif.',
        'Fenêtre Personnes et événements : recherche partout, notes et événements compris, tri, épinglage, modification groupée et fusion des doublons. En mode Professionnel, une fiche client avec notes de séance.',
        'Import corrigé : les dates des fichiers AAF d’astro.com ne sont plus ignorées ; aperçu, contrôle des doublons, import par collage et export en AAF / CSV.'
      ],
      ru: [
        'Лунный календарь: фаза, знак, время перехода в знак и Луны без курса на каждый день, затмения и традиционные садовые дни; экспорт в PDF или в календарь (.ics).',
        'Небо этой ночью: какие планеты можно увидеть, когда и в какой стороне, близкие пары, метеорные потоки и ближайшие видимые затмения.',
        'Найти время рождения: по датам из раздела «Мои события» показывает наиболее вероятные времена рождения с пояснениями; результат приблизительный.',
        'Окно «Люди и события»: поиск по всему, включая заметки и события, сортировка, закрепление, массовое редактирование и объединение дубликатов. В профессиональном режиме — карточка клиента с заметками о сессиях.',
        'Импорт исправлен: даты в файлах AAF с astro.com больше не пропускаются; предпросмотр, проверка дубликатов, импорт вставкой текста и экспорт в AAF / CSV.'
      ],
      hi: [
        'चंद्र कैलेंडर: हर दिन की चंद्र कला, राशि, राशि-प्रवेश और शून्य-गति का समय, ग्रहण और पारंपरिक बागवानी दिन; PDF या कैलेंडर (.ics) में निर्यात।',
        'आज रात का आकाश: कौन-से ग्रह कब और किस दिशा में दिख सकते हैं, पास-पास दिखने वाले ग्रह, उल्का वर्षा और आने वाले दृश्य ग्रहण।',
        'जन्म समय खोजें: मेरी घटनाएँ की तिथियों से सबसे संभावित जन्म समय कारणों सहित क्रम में दिखाता है; परिणाम अनुमानित है।',
        'लोग और घटनाएँ विंडो: नोट्स और घटनाओं सहित हर चीज़ में खोज, क्रम, पिन, एक साथ संपादन और दोहराव मिलाना। पेशेवर मोड में सत्र नोट्स के साथ क्लाइंट कार्ड।',
        'आयात ठीक किया गया: astro.com की AAF फ़ाइलों की तिथियाँ अब छूटती नहीं; पूर्वावलोकन, दोहराव जाँच, चिपकाकर आयात और AAF / CSV में निर्यात।'
      ]
    }
  },
  {
    version: '0.4.0',
    items: {
      tr: [
        'İki kullanım modu: Amatör sade ekranlar ve gündelik dil; Profesyonel tüm teknik araçlar. Üst çubuktan tek tıkla değiştirilebilir.',
        'Uygun Günler: nikâh, diyet, saç, alışveriş, sözleşme, yolculuk ya da taşınma için uygun olabilecek günler takvimde, nedenleriyle; yapay zekâ gerekmez. Takvime .ics olarak aktarılabilir.',
        'Olaylarım: hayatınızdaki önemli olayları kaydedin, o günün gökyüzünü haritanızla birlikte görün.',
        'Doğum günü raporu: bir doğum gününden ötekine yılın sade bir özeti; PDF olarak kaydedilebilir.',
        'Haftalık özet bildirimi: haftanın gökyüzü olayları ve sizi en çok ilgilendirebilecek transit.',
        'AstroHermes: hazır yapay zekâ sağlayıcısı; yalnızca anahtarınızı yapıştırmanız yeterli.',
        'Doğum saatini bilmeyenler için rehber; Amatör yanıtlar uzun ya da yönlendirici çıkarsa tek tıkla kısaltma.'
      ],
      en: [
        'Two modes: Amateur keeps screens simple with everyday language; Professional shows every technical tool. Switch with one click in the top bar.',
        'Good Days: days that may suit a wedding, diet, haircut, shopping, a contract, a trip or a move, on a calendar with the reasons; no AI needed. Export to your calendar as .ics.',
        'My events: record important events in your life and see that day’s sky alongside your chart.',
        'Birthday report: a plain summary of the year from one birthday to the next; can be saved as PDF.',
        'Weekly summary notification: the week’s sky events and the transit that may concern you most.',
        'AstroHermes: a ready-made AI provider; just paste your key.',
        'A guide for those who don’t know their birth time; one-click shortening when an Amateur answer comes out long or directive.'
      ],
      es: [
        'Dos modos: Aficionado mantiene pantallas sencillas y lenguaje cotidiano; Profesional muestra todas las herramientas técnicas. Se cambia con un clic en la barra superior.',
        'Días favorables: los días que podrían convenir para una boda, una dieta, el pelo, compras, un contrato, un viaje o una mudanza, en un calendario con sus motivos; sin IA. Exportables a su calendario como .ics.',
        'Mis acontecimientos: registre los acontecimientos importantes de su vida y vea el cielo de ese día junto a su carta.',
        'Informe de cumpleaños: un resumen sencillo del año de un cumpleaños al siguiente; se puede guardar en PDF.',
        'Notificación semanal: los eventos del cielo de la semana y el tránsito que más podría afectarle.',
        'AstroHermes: un proveedor de IA listo para usar; basta con pegar su clave.',
        'Una guía para quien no conoce su hora de nacimiento; acortar con un clic cuando una respuesta del nivel Aficionado sale larga o directiva.'
      ],
      pt: [
        'Dois modos: Amador mantém telas simples e linguagem do dia a dia; Profissional mostra todas as ferramentas técnicas. Troque com um clique na barra superior.',
        'Dias favoráveis: dias que podem favorecer casamento, dieta, cabelo, compras, contrato, viagem ou mudança, num calendário com os motivos; sem IA. Exportáveis para sua agenda como .ics.',
        'Meus acontecimentos: registre acontecimentos importantes da sua vida e veja o céu daquele dia junto ao seu mapa.',
        'Relatório de aniversário: um resumo simples do ano de um aniversário ao seguinte; pode ser salvo em PDF.',
        'Notificação semanal: os eventos do céu da semana e o trânsito que mais pode lhe dizer respeito.',
        'AstroHermes: um provedor de IA pronto; basta colar sua chave.',
        'Um guia para quem não sabe a hora de nascimento; encurtar com um clique quando uma resposta do nível Amador sai longa ou diretiva.'
      ],
      de: [
        'Zwei Modi: Einsteiger mit schlichten Ansichten und Alltagssprache; Profi mit allen technischen Werkzeugen. Umschalten mit einem Klick in der oberen Leiste.',
        'Günstige Tage: Tage, die sich für Hochzeit, Diät, Friseur, Einkauf, Vertrag, Reise oder Umzug eignen könnten, im Kalender mit Begründung; ohne KI. Export in den Kalender als .ics.',
        'Meine Ereignisse: wichtige Ereignisse Ihres Lebens festhalten und den Himmel jenes Tages mit Ihrem Horoskop sehen.',
        'Geburtstagsbericht: eine schlichte Übersicht über das Jahr von einem Geburtstag zum nächsten; als PDF speicherbar.',
        'Wöchentliche Übersicht: die Himmelsereignisse der Woche und der Transit, der Sie am meisten betreffen könnte.',
        'AstroHermes: ein fertig eingerichteter KI-Anbieter; nur den Schlüssel einfügen.',
        'Eine Hilfe für alle, die ihre Geburtszeit nicht kennen; Kürzen mit einem Klick, wenn eine Einsteiger-Antwort zu lang oder zu direktiv ausfällt.'
      ],
      fr: [
        'Deux modes : Amateur garde des écrans simples et un langage courant ; Professionnel affiche tous les outils techniques. Changement en un clic dans la barre du haut.',
        'Jours favorables : les jours qui pourraient convenir à un mariage, un régime, les cheveux, un achat, un contrat, un voyage ou un déménagement, sur un calendrier avec leurs raisons ; sans IA. Export vers votre agenda en .ics.',
        'Mes événements : notez les événements importants de votre vie et voyez le ciel de ce jour-là avec votre thème.',
        'Rapport d’anniversaire : un résumé simple de l’année d’un anniversaire au suivant ; enregistrable en PDF.',
        'Résumé hebdomadaire : les événements célestes de la semaine et le transit qui pourrait vous concerner le plus.',
        'AstroHermes : un fournisseur d’IA prêt à l’emploi ; il suffit de coller votre clé.',
        'Un guide pour qui ne connaît pas son heure de naissance ; raccourcir en un clic une réponse Amateur trop longue ou trop directive.'
      ],
      ru: [
        'Два режима: «Любитель» — простые экраны и обычный язык; «Профессионал» — все технические инструменты. Переключение одним щелчком на верхней панели.',
        'Удачные дни: дни, которые могут подойти для свадьбы, диеты, стрижки, покупок, договора, поездки или переезда, — в календаре с причинами; без ИИ. Экспорт в календарь в формате .ics.',
        'Мои события: записывайте важные события жизни и смотрите небо того дня вместе со своей картой.',
        'Отчёт ко дню рождения: простой обзор года от одного дня рождения до следующего; можно сохранить в PDF.',
        'Еженедельная сводка: небесные события недели и транзит, который может касаться вас больше всего.',
        'AstroHermes: готовый поставщик ИИ — достаточно вставить ключ.',
        'Подсказка для тех, кто не знает времени рождения; сокращение одним щелчком, если ответ уровня «Любитель» получился длинным или директивным.'
      ],
      hi: [
        'दो मोड: शौक़िया — सरल स्क्रीन और रोज़मर्रा की भाषा; पेशेवर — सभी तकनीकी उपकरण। ऊपरी पट्टी में एक क्लिक से बदलें।',
        'शुभ दिन: विवाह, डाइट, बाल, ख़रीदारी, अनुबंध, यात्रा या घर बदलने के लिए उपयुक्त हो सकने वाले दिन, कारणों सहित कैलेंडर में; AI की ज़रूरत नहीं। .ics के रूप में कैलेंडर में निर्यात करें।',
        'मेरी घटनाएँ: जीवन की महत्वपूर्ण घटनाएँ दर्ज करें और उस दिन का आकाश अपनी कुंडली के साथ देखें।',
        'जन्मदिन रिपोर्ट: एक जन्मदिन से अगले तक वर्ष का सरल सार; PDF के रूप में सहेजा जा सकता है।',
        'साप्ताहिक सारांश सूचना: सप्ताह की आकाशीय घटनाएँ और वह गोचर जो आपसे सबसे अधिक जुड़ा हो सकता है।',
        'AstroHermes: तैयार AI प्रदाता; बस अपनी कुंजी चिपकाएँ।',
        'जन्म समय न जानने वालों के लिए मार्गदर्शिका; शौक़िया उत्तर लंबा या निर्देशात्मक हो तो एक क्लिक में छोटा करें।'
      ]
    }
  },
  {
    version: '0.3.0',
    items: {
      tr: [
        'Yeni diller: Portekizce, Almanca, Fransızca, Rusça ve Hintçe. Yapay zekâ varsayılan olarak arayüz dilinde yanıt verir.',
        'Yanıt düzeyi: Amatör kısa, sade ve teknik terimsiz yanıtlar verir; Profesyonel dereceler, orb’lar ve tekniklerle ayrıntılı yanıtlar. Amatör yanıtların altında “Biraz daha ayrıntılı” düğmesi.',
        '“Ne zaman?” soruları: nikâh, diyet, saç, telefon alma, sözleşme, yolculuk ya da taşınma için sorduğunuz döneme (en çok 18 ay) göre uygun olabilecek günler geleneksel ölçütlerle hesaplanır.',
        'Haritaları gruplama: kişi ve olayları Aile, Arkadaşlar, Danışanlar, Ünlüler, İş ya da kendi grubunuza ayırın.',
        'Paylaşım kartları: X, LinkedIn ve Pinterest boyutları; yaklaşan gökyüzü olayları için yeni kart.',
        'Gelişmiş Vedik araçlar (Ayarlar → Genel, varsayılan kapalı): Kuzey/Güney Hint çarkı, doğum Panchangı, Ashtakoota eşleştirme.',
        'Düzeltme: İspanyolca, Portekizce ve Fransızca arayüzde “O” (batı) harfli boylamlar doğu okunuyordu.'
      ],
      en: [
        'New languages: Portuguese, German, French, Russian and Hindi. The AI answers in the interface language by default.',
        'Answer level: Amateur gives short, plain answers without jargon; Professional gives detailed answers with degrees, orbs and techniques. A “A little more detail” button under Amateur answers.',
        '“When?” questions: days that may suit a wedding, diet, haircut, buying a phone, signing a contract, a trip or a move are worked out by traditional criteria for the period you ask about (up to 18 months).',
        'Chart groups: sort people and events into Family, Friends, Clients, Famous, Work or your own group.',
        'Share cards: X, LinkedIn and Pinterest sizes; a new card for upcoming sky events.',
        'Advanced Vedic tools (Settings → General, off by default): North/South Indian chart, birth Panchang, Ashtakoota matching.',
        'Fix: in the Spanish, Portuguese and French interface, longitudes marked “O” (west) were read as east.'
      ],
      es: [
        'Nuevos idiomas: portugués, alemán, francés, ruso e hindi. La IA responde por defecto en el idioma de la interfaz.',
        'Nivel de respuesta: Aficionado da respuestas breves, sencillas y sin tecnicismos; Profesional, respuestas detalladas con grados, orbes y técnicas. Botón “Un poco más de detalle” bajo las respuestas del nivel Aficionado.',
        'Preguntas de “¿cuándo?”: se calculan con criterios tradicionales los días que podrían convenir para una boda, una dieta, el pelo, comprar un móvil, firmar un contrato, un viaje o una mudanza en el periodo que pregunte (hasta 18 meses).',
        'Grupos de cartas: ordene personas y eventos en Familia, Amigos, Clientes, Famosos, Trabajo o su propio grupo.',
        'Tarjetas para compartir: tamaños para X, LinkedIn y Pinterest; nueva tarjeta para próximos eventos del cielo.',
        'Herramientas védicas avanzadas (Ajustes → General, desactivadas por defecto): carta del norte/sur de la India, Panchang natal, emparejamiento Ashtakoota.',
        'Corrección: en la interfaz en español, portugués y francés, las longitudes con “O” (oeste) se leían como este.'
      ],
      pt: [
        'Novos idiomas: português, alemão, francês, russo e hindi. A IA responde por padrão no idioma da interface.',
        'Nível de resposta: Amador dá respostas curtas, simples e sem jargão; Profissional, respostas detalhadas com graus, orbes e técnicas. Botão “Um pouco mais de detalhe” sob as respostas do nível Amador.',
        'Perguntas de “quando?”: os dias que podem favorecer casamento, dieta, cabelo, comprar um celular, assinar contrato, viagem ou mudança são calculados por critérios tradicionais para o período perguntado (até 18 meses).',
        'Grupos de mapas: organize pessoas e eventos em Família, Amigos, Clientes, Famosos, Trabalho ou seu próprio grupo.',
        'Cartões para compartilhar: tamanhos para X, LinkedIn e Pinterest; novo cartão para próximos eventos do céu.',
        'Ferramentas védicas avançadas (Configurações → Geral, desligadas por padrão): mapa do norte/sul da Índia, Panchang natal, compatibilidade Ashtakoota.',
        'Correção: na interface em espanhol, português e francês, longitudes com “O” (oeste) eram lidas como leste.'
      ],
      de: [
        'Neue Sprachen: Portugiesisch, Deutsch, Französisch, Russisch und Hindi. Die KI antwortet standardmäßig in der Sprache der Oberfläche.',
        'Antwortstufe: Einsteiger erhält kurze, einfache Antworten ohne Fachbegriffe; Profi ausführliche Antworten mit Graden, Orben und Techniken. Unter Einsteiger-Antworten die Schaltfläche „Etwas ausführlicher“.',
        '„Wann?“-Fragen: Tage, die sich für Hochzeit, Diät, Friseur, Handykauf, Vertrag, Reise oder Umzug eignen könnten, werden nach traditionellen Kriterien für den gefragten Zeitraum (bis 18 Monate) berechnet.',
        'Horoskop-Gruppen: Personen und Ereignisse in Familie, Freunde, Klienten, Prominente, Arbeit oder eine eigene Gruppe einordnen.',
        'Teilen-Karten: Formate für X, LinkedIn und Pinterest; neue Karte für kommende Himmelsereignisse.',
        'Erweiterte vedische Werkzeuge (Einstellungen → Allgemein, standardmäßig aus): nord-/südindisches Horoskop, Geburts-Panchang, Ashtakoota-Abgleich.',
        'Korrektur: In der spanischen, portugiesischen und französischen Oberfläche wurden Längen mit „O“ (West) als Ost gelesen.'
      ],
      fr: [
        'Nouvelles langues : portugais, allemand, français, russe et hindi. L’IA répond par défaut dans la langue de l’interface.',
        'Niveau de réponse : Amateur donne des réponses courtes, simples et sans jargon ; Professionnel, des réponses détaillées avec degrés, orbes et techniques. Bouton « Un peu plus de détails » sous les réponses Amateur.',
        'Questions « quand ? » : les jours qui pourraient convenir à un mariage, un régime, les cheveux, l’achat d’un téléphone, un contrat, un voyage ou un déménagement sont calculés selon des critères traditionnels pour la période demandée (jusqu’à 18 mois).',
        'Groupes de thèmes : classez personnes et événements en Famille, Amis, Clients, Célébrités, Travail ou votre propre groupe.',
        'Cartes de partage : formats X, LinkedIn et Pinterest ; nouvelle carte pour les prochains événements du ciel.',
        'Outils védiques avancés (Réglages → Général, désactivés par défaut) : thème d’Inde du Nord/du Sud, Panchang de naissance, compatibilité Ashtakoota.',
        'Correction : dans l’interface espagnole, portugaise et française, les longitudes marquées « O » (ouest) étaient lues comme est.'
      ],
      ru: [
        'Новые языки: португальский, немецкий, французский, русский и хинди. ИИ по умолчанию отвечает на языке интерфейса.',
        'Уровень ответа: «Любитель» — короткие простые ответы без терминов; «Профессионал» — подробные ответы с градусами, орбисами и техниками. Под ответами уровня «Любитель» — кнопка «Чуть подробнее».',
        'Вопросы «когда?»: дни, которые могут подойти для свадьбы, диеты, стрижки, покупки телефона, договора, поездки или переезда, рассчитываются по традиционным критериям для указанного периода (до 18 месяцев).',
        'Группы карт: распределяйте людей и события по группам «Семья», «Друзья», «Клиенты», «Знаменитости», «Работа» или своей.',
        'Карточки для соцсетей: размеры для X, LinkedIn и Pinterest; новая карточка для ближайших небесных событий.',
        'Расширенные ведические инструменты (Настройки → Общие, по умолчанию выключены): североиндийская/южноиндийская карта, натальный Панчанг, совместимость Аштакута.',
        'Исправление: в испанском, португальском и французском интерфейсе долготы с буквой «O» (запад) читались как восточные.'
      ],
      hi: [
        'नई भाषाएँ: पुर्तगाली, जर्मन, फ़्रेंच, रूसी और हिंदी। AI डिफ़ॉल्ट रूप से इंटरफ़ेस की भाषा में उत्तर देता है।',
        'उत्तर का स्तर: शौक़िया को छोटे, सरल, बिना तकनीकी शब्दों के उत्तर; पेशेवर को अंश, ओर्ब और तकनीकों के साथ विस्तृत उत्तर। शौक़िया उत्तरों के नीचे “थोड़ा और विस्तार से” बटन।',
        '“कब?” वाले सवाल: शादी, डाइट, बाल, फ़ोन ख़रीदने, अनुबंध, यात्रा या घर बदलने के लिए अनुकूल हो सकने वाले दिन पूछी गई अवधि (18 महीने तक) के लिए पारंपरिक मानदंडों से निकाले जाते हैं।',
        'कुंडली समूह: लोगों और घटनाओं को परिवार, दोस्त, क्लाइंट, प्रसिद्ध व्यक्ति, काम या अपने समूह में बाँटें।',
        'शेयर कार्ड: X, LinkedIn और Pinterest के आकार; आने वाली आकाशीय घटनाओं के लिए नया कार्ड।',
        'उन्नत वैदिक उपकरण (सेटिंग्स → सामान्य, डिफ़ॉल्ट रूप से बंद): उत्तर/दक्षिण भारतीय कुंडली, जन्म पंचांग, अष्टकूट मिलान।',
        'सुधार: स्पेनिश, पुर्तगाली और फ़्रेंच इंटरफ़ेस में “O” (पश्चिम) वाले देशांतर पूर्व पढ़े जा रहे थे।'
      ]
    }
  },
  {
    version: '0.2.1',
    items: {
      tr: [
        'Sohbet oturumları: her harita için birden çok sohbet; yeni sohbet açın, eskilere dönün, adlandırın ya da silin. Sohbetler yedeğe de dahil.',
        'Daha hızlı ve daha az token: harita verisi yalnızca değişince gönderilir, uzun sohbetlerde eski mesajlar kısaltılır ve sağlayıcının önbelleği kullanılır.',
        'Her yanıtın altında gerçek token kullanımı ve önbellekten okunan oran; beklerken geçen süre görünür.',
        'Claude Code için varsayılan model Sonnet (daha hızlı); Codex daha kısa düşünerek yanıt verir.'
      ],
      en: [
        'Chat sessions: several chats per chart; start a new one, go back to older ones, rename or delete them. Chats are included in backups.',
        'Faster and fewer tokens: chart data is sent only when it changes, older messages are shortened in long chats, and the provider’s cache is used.',
        'Real token usage and the share read from the cache under every answer; the waiting time is shown.',
        'Sonnet is the default model for Claude Code (faster); Codex thinks more briefly before answering.'
      ],
      es: [
        'Sesiones de chat: varios chats por carta; empiece uno nuevo, vuelva a los anteriores, cámbieles el nombre o elimínelos. Los chats se incluyen en las copias de seguridad.',
        'Más rápido y con menos tokens: los datos de la carta solo se envían cuando cambian, los mensajes antiguos se acortan en chats largos y se usa la caché del proveedor.',
        'Uso real de tokens y la parte leída de la caché bajo cada respuesta; se muestra el tiempo de espera.',
        'Sonnet es el modelo predeterminado de Claude Code (más rápido); Codex piensa menos antes de responder.'
      ],
      de: [
        'Chat-Sitzungen: mehrere Chats pro Horoskop; neue beginnen, zu älteren zurückkehren, umbenennen oder löschen. Chats sind in den Sicherungen enthalten.',
        'Schneller und weniger Tokens: Horoskopdaten werden nur bei Änderungen gesendet, ältere Nachrichten in langen Chats gekürzt und der Cache des Anbieters genutzt.',
        'Unter jeder Antwort die tatsächliche Token-Nutzung und der Anteil aus dem Cache; die Wartezeit wird angezeigt.',
        'Sonnet ist das Standardmodell für Claude Code (schneller); Codex denkt vor der Antwort kürzer nach.'
      ],
      fr: [
        'Sessions de discussion : plusieurs discussions par thème ; ouvrez-en une nouvelle, revenez aux anciennes, renommez-les ou supprimez-les. Les discussions sont incluses dans les sauvegardes.',
        'Plus rapide, moins de jetons : les données du thème ne sont envoyées que lorsqu’elles changent, les anciens messages sont raccourcis dans les longues discussions et le cache du fournisseur est utilisé.',
        'Sous chaque réponse, l’usage réel de jetons et la part lue depuis le cache ; le temps d’attente est affiché.',
        'Sonnet est le modèle par défaut de Claude Code (plus rapide) ; Codex réfléchit moins longtemps avant de répondre.'
      ],
      pt: [
        'Sessões de conversa: várias conversas por mapa; comece uma nova, volte às anteriores, renomeie ou exclua. As conversas entram nos backups.',
        'Mais rápido e com menos tokens: os dados do mapa só são enviados quando mudam, mensagens antigas são encurtadas em conversas longas e o cache do provedor é usado.',
        'Uso real de tokens e a parte lida do cache sob cada resposta; o tempo de espera é mostrado.',
        'Sonnet é o modelo padrão do Claude Code (mais rápido); o Codex pensa menos antes de responder.'
      ],
      ru: [
        'Сеансы чата: несколько чатов для каждой карты; начните новый, вернитесь к прежним, переименуйте или удалите их. Чаты входят в резервные копии.',
        'Быстрее и меньше токенов: данные карты отправляются только при изменении, старые сообщения в длинных чатах сокращаются, используется кэш провайдера.',
        'Под каждым ответом — реальный расход токенов и доля из кэша; показывается время ожидания.',
        'Sonnet — модель по умолчанию для Claude Code (быстрее); Codex думает перед ответом меньше.'
      ],
      hi: [
        'चैट सत्र: हर कुंडली के लिए कई चैट; नई शुरू करें, पुरानी पर लौटें, नाम बदलें या हटाएँ। चैट बैकअप में भी शामिल हैं।',
        'तेज़ और कम टोकन: कुंडली डेटा केवल बदलने पर भेजा जाता है, लंबी चैट में पुराने संदेश छोटे करके भेजे जाते हैं और प्रदाता का कैश इस्तेमाल होता है।',
        'हर उत्तर के नीचे असली टोकन उपयोग और कैश से पढ़ा गया हिस्सा; प्रतीक्षा का समय दिखता है।',
        'Claude Code के लिए डिफ़ॉल्ट मॉडल Sonnet है (तेज़); Codex उत्तर देने से पहले कम सोचता है।'
      ]
    }
  },
  {
    version: '0.2.0',
    items: {
      tr: [
        'Temel Yorum: yapay zekâ olmadan, çevrimdışı çalışan doğum haritası yorumu; sinastri açıkken ilişki özeti de burada.',
        'Bugün: günün gökyüzü, bugün etkili transitler ve önümüzdeki 30 günün önemli tarihleri.',
        'Paylaşım kartı: haritanızı Instagram/WhatsApp için gönderi, hikâye ya da kare görsel olarak kaydedin.',
        'Vedik bölüm: nakshatra, navamsa (D9) ve Vimshottari dasha (Natal Bilgiler).',
        'Astroloji sözlüğü: 90’dan fazla terimin açıklaması (Bilgi Bankası).',
        'İspanyolca arayüz.',
        'Kenar çubuğu yenilendi: kişiler ve gökyüzü ayrı bölmelerde; gökyüzü tam ekran açılabilir.',
        'Verileriniz daha güvende: her kayıtta yedek, sürüm yükseltmesinden önce otomatik kopya.',
        'Yardım → Sorun bildir: hata bilgisini görerek GitHub’a ya da e-postayla iletin.'
      ],
      en: [
        'Basic Reading: an offline birth-chart reading that needs no AI; with synastry on, a relationship summary too.',
        'Today: today’s sky, the transits in effect today and key dates for the next 30 days.',
        'Share card: save your chart as a post, story or square image for Instagram/WhatsApp.',
        'Vedic section: nakshatras, navamsa (D9) and Vimshottari dasha (Natal Info).',
        'Astrology glossary: explanations of more than 90 terms (Knowledge Base).',
        'Spanish interface.',
        'Redesigned sidebar: people and sky in separate panes; the sky can open full size.',
        'Safer data: a backup on every save and an automatic copy before each upgrade.',
        'Help → Report a problem: review the error details and send them via GitHub or email.'
      ],
      es: [
        'Lectura básica: una lectura de la carta natal sin conexión que no necesita IA; con la sinastría activa, también un resumen de la relación.',
        'Hoy: el cielo de hoy, los tránsitos vigentes y las fechas clave de los próximos 30 días.',
        'Tarjeta para compartir: guarde su carta como publicación, historia o imagen cuadrada para Instagram/WhatsApp.',
        'Sección védica: nakshatras, navamsa (D9) y Vimshottari dasha (Datos natales).',
        'Glosario de astrología: explicaciones de más de 90 términos (Base de conocimiento).',
        'Interfaz en español.',
        'Barra lateral renovada: personas y cielo en paneles separados; el cielo puede abrirse a tamaño completo.',
        'Datos más seguros: una copia en cada guardado y una copia automática antes de cada actualización.',
        'Ayuda → Informar de un problema: revise los detalles del error y envíelos por GitHub o correo.'
      ],
      de: [
        'Grunddeutung: eine Offline-Deutung des Geburtshoroskops ohne KI; bei aktiver Synastrie auch eine Beziehungsübersicht.',
        'Heute: der heutige Himmel, die heute wirksamen Transite und wichtige Daten der nächsten 30 Tage.',
        'Teilen-Karte: Speichern Sie Ihr Horoskop als Beitrag, Story oder quadratisches Bild für Instagram/WhatsApp.',
        'Vedischer Bereich: Nakshatras, Navamsa (D9) und Vimshottari-Dasha (Radix-Infos).',
        'Astrologie-Glossar: Erklärungen zu mehr als 90 Begriffen (Wissensbasis).',
        'Spanische Oberfläche.',
        'Neue Seitenleiste: Personen und Himmel in getrennten Bereichen; der Himmel lässt sich in voller Größe öffnen.',
        'Sicherere Daten: eine Sicherung bei jedem Speichern und eine automatische Kopie vor jedem Update.',
        'Hilfe → Problem melden: Fehlerdetails prüfen und per GitHub oder E-Mail senden.'
      ],
      fr: [
        'Lecture de base : une lecture du thème natal hors ligne, sans IA ; avec la synastrie activée, aussi un résumé de la relation.',
        'Aujourd’hui : le ciel du jour, les transits actifs aujourd’hui et les dates clés des 30 prochains jours.',
        'Carte à partager : enregistrez votre thème en publication, story ou image carrée pour Instagram/WhatsApp.',
        'Section védique : nakshatras, navamsa (D9) et Vimshottari dasha (Infos natales).',
        'Glossaire d’astrologie : explications de plus de 90 termes (Base de connaissances).',
        'Interface en espagnol.',
        'Barre latérale repensée : personnes et ciel dans des volets séparés ; le ciel peut s’ouvrir en grand.',
        'Données plus sûres : une sauvegarde à chaque enregistrement et une copie automatique avant chaque mise à jour.',
        'Aide → Signaler un problème : consultez les détails de l’erreur et envoyez-les via GitHub ou par e-mail.'
      ],
      pt: [
        'Leitura básica: uma leitura do mapa natal offline, sem IA; com a sinastria ativa, também um resumo do relacionamento.',
        'Hoje: o céu de hoje, os trânsitos em vigor hoje e as datas importantes dos próximos 30 dias.',
        'Cartão para compartilhar: salve seu mapa como post, story ou imagem quadrada para Instagram/WhatsApp.',
        'Seção védica: nakshatras, navamsa (D9) e Vimshottari dasha (Dados natais).',
        'Glossário de astrologia: explicações de mais de 90 termos (Base de conhecimento).',
        'Interface em espanhol.',
        'Barra lateral renovada: pessoas e céu em painéis separados; o céu pode abrir em tamanho cheio.',
        'Dados mais seguros: um backup a cada salvamento e uma cópia automática antes de cada atualização.',
        'Ajuda → Relatar um problema: veja os detalhes do erro e envie pelo GitHub ou por e-mail.'
      ],
      ru: [
        'Базовое толкование: офлайн-толкование натальной карты без ИИ; при включённой синастрии — также обзор отношений.',
        'Сегодня: небо дня, транзиты, действующие сегодня, и важные даты на ближайшие 30 дней.',
        'Карточка для соцсетей: сохраните карту как пост, сторис или квадратное изображение для Instagram/WhatsApp.',
        'Ведический раздел: накшатры, навамша (D9) и вимшоттари-даша (Натальные сведения).',
        'Астрологический словарь: пояснения к более чем 90 терминам (База знаний).',
        'Испанский интерфейс.',
        'Обновлённая боковая панель: люди и небо в отдельных панелях; небо можно открыть во весь экран.',
        'Данные надёжнее: резервная копия при каждом сохранении и автоматическая копия перед каждым обновлением.',
        'Справка → Сообщить о проблеме: просмотрите сведения об ошибке и отправьте их через GitHub или по почте.'
      ],
      hi: [
        'मूल फलादेश: बिना AI के, ऑफ़लाइन जन्म कुंडली का फलादेश; सिनैस्ट्री चालू होने पर रिश्ते का सार भी।',
        'आज: आज का आकाश, आज असर डालने वाले गोचर और अगले 30 दिनों की मुख्य तारीख़ें।',
        'शेयर कार्ड: अपनी कुंडली को Instagram/WhatsApp के लिए पोस्ट, स्टोरी या चौकोर तस्वीर के रूप में सहेजें।',
        'वैदिक भाग: नक्षत्र, नवांश (D9) और विंशोत्तरी दशा (जन्म जानकारी)।',
        'ज्योतिष शब्दकोश: 90 से अधिक शब्दों की व्याख्या (ज्ञान आधार)।',
        'स्पेनिश इंटरफ़ेस।',
        'नया साइडबार: लोग और आकाश अलग-अलग पैनल में; आकाश पूरे आकार में खुल सकता है।',
        'डेटा अधिक सुरक्षित: हर सहेजने पर बैकअप और हर अपडेट से पहले अपने-आप एक प्रति।',
        'सहायता → समस्या बताएँ: त्रुटि का विवरण देखें और GitHub या ईमेल से भेजें।'
      ]
    }
  }
]
// i18n-ignore-end

const cmp = (a: string, b: string) => {
  const x = a.split('.').map(Number)
  const y = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) - (y[i] ?? 0)
  return 0
}

/** Notes for versions newer than `seen` up to `current`, newest first. */
export function whatsNewSince(seen: string | undefined, current: string): WhatsNew[] {
  return WHATS_NEW.filter((w) => cmp(w.version, current) <= 0 && (!seen || cmp(w.version, seen) > 0))
}
