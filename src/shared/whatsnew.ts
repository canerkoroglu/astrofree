// "Yenilikler": shown once after an update. Newest version first; keep the
// list short (what a user would notice), one entry per interface language.
export interface WhatsNew {
  version: string
  items: Record<string, string[]>
}

// i18n-ignore-start (each entry carries its own translations)
export const WHATS_NEW: WhatsNew[] = [
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
