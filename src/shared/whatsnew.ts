// "Yenilikler": shown once after an update. Newest version first; keep the
// list short (what a user would notice), one entry per language.
export interface WhatsNew {
  version: string
  items: Record<string, string[]>
}

// i18n-ignore-start (each entry carries its own translations)
export const WHATS_NEW: WhatsNew[] = [
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
