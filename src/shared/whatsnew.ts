// "Yenilikler": shown once after an update. Newest version first; keep the
// list short (what a user would notice), one entry per interface language.
export interface WhatsNew {
  version: string
  items: Record<string, string[]>
}

// i18n-ignore-start (each entry carries its own translations)
export const WHATS_NEW: WhatsNew[] = [
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
