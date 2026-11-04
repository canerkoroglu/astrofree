import type { Locale } from './types'

/** Türkçe — the source language: `strings` stays empty. */
export const tr: Locale = {
  code: 'tr',
  name: 'Türkçe',
  intl: 'tr-TR',
  dateOrder: 'DMY',
  strings: {},
  points: {
    sun: ['Güneş', 'Gün'],
    moon: ['Ay', 'Ay'],
    mercury: ['Merkür', 'Mer'],
    venus: ['Venüs', 'Ven'],
    mars: ['Mars', 'Mar'],
    jupiter: ['Jüpiter', 'Jüp'],
    saturn: ['Satürn', 'Sat'],
    uranus: ['Uranüs', 'Ura'],
    neptune: ['Neptün', 'Nep'],
    pluto: ['Plüton', 'Plü'],
    node: ['Kuzey Ay Düğümü', 'KAD'],
    snode: ['Güney Ay Düğümü', 'GAD'],
    chiron: ['Chiron', 'Chi'],
    lilith: ['Lilith (Kara Ay)', 'Lil'],
    ceres: ['Ceres', 'Cer'],
    pallas: ['Pallas', 'Pal'],
    juno: ['Juno', 'Jun'],
    vesta: ['Vesta', 'Ves'],
    fortune: ['Şans Noktası', 'Fort'],
    vertex: ['Vertex', 'Vx'],
    asc: ['Yükselen (ASC)', 'ASC'],
    mc: ['Tepe Noktası (MC)', 'MC']
  },
  signs: ['Koç', 'Boğa', 'İkizler', 'Yengeç', 'Aslan', 'Başak', 'Terazi', 'Akrep', 'Yay', 'Oğlak', 'Kova', 'Balık'],
  aspects: {
    conjunction: 'Kavuşum',
    opposition: 'Karşıt',
    trine: 'Üçgen',
    square: 'Kare',
    sextile: 'Sekstil',
    quincunx: 'Quincunx',
    semisextile: 'Yarım sekstil',
    semisquare: 'Yarım kare',
    sesquiquadrate: 'Seskikare',
    quintile: 'Kuintil',
    biquintile: 'Bikuintil'
  },
  phases: ['Yeni Ay', 'Hilal', 'İlk Dördün', 'Şişkin Ay', 'Dolunay', 'Yayılan Ay', 'Son Dördün', 'Balzamik Ay'],
  monthsLong: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
  monthsShort: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  weekdays: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
  weekdaysMin: ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'],
  elements: { fire: 'Ateş', earth: 'Toprak', air: 'Hava', water: 'Su', cardinal: 'Öncü', fixed: 'Sabit', mutable: 'Değişken' },
  compass: { n: 'K', s: 'G', e: 'D', w: 'B' },
  systemPrompt: `Sen deneyimli, psikolojik ve geleneksel tekniklere hâkim bir astrologsun.
Kullanıcıya verilen harita verilerini (gezegen konumları, evler, açılar, transitler, progresyonlar) temel alarak yorum yaparsın.
Kurallar:
- Yalnızca sağlanan verilere dayan; veride olmayan konum veya açı uydurma. Hesaplama gerekiyorsa verilen sayıları kullan.
- Önce en güçlü temaları (sıkı orb'lu açılar, köşe evlerdeki gezegenler, yöneticiler) öne çıkar, sonra ayrıntıya in.
- Transitlerde yaklaşan/ayrılan bilgisini ve orb'u dikkate alarak zamanlama hakkında konuş.
- Hiçbir şeyi kesin olarak söyleme: her yorumu "olabilir, -abilir/-ebilir, eğilimi olabilir" gibi olasılıklı cümlelerle kur; kehanet değil eğilim ve potansiyel dilini kullan.
- Sağlık, hukuk, psikoloji ve finans konularında profesyonel desteğe yönlendir.
- Uzun yorumların sonuna astrolojinin kişisel keşif amaçlı olduğunu, profesyonel tavsiye yerine geçmediğini tek cümleyle hatırlat.
- Başlıklar ve maddelerle düzenli, okunaklı Markdown kullan.
- Türkçe yanıt ver.`
}
