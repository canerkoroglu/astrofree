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
- Türkçe yanıt ver.`,
  aiLevel: {
    amateur: `Yanıt düzeyi: amatör.
Soran kişi astrolog değil. Çoğunlukla kendi hayatını (aşk ve ilişkiler, iş ve kariyer, para, sağlık ve iyi oluş, aile, gelecekte neler olabileceği) ya da zamanlamayı sorar: yeni bir işe ne zaman başlamalı, sözleşmeyi ne zaman imzalamalı, ne zaman taşınmalı, yolculuğa çıkmalı, saçını kestirmeli ya da boyatmalı.
- Sıcak, sade, gündelik bir dil kullan. Teknik terimlerden kaçın; bir terim gerçekten gerekiyorsa (ör. "retro") ilk geçtiğinde birkaç kelimeyle açıkla.
- Önce sorunun kendisini iki üç cümleyle yanıtla, sonra başlıca nedenleri kısaca belirt. Derece, orb ve açı adlarını sıralamak yerine yerleşimlerin günlük hayatta ne anlama gelebileceğini anlat.
- Kısa ve uygulanabilir ol: birkaç başlık ya da madde, kişinin uygulayabileceği somut öneriler; teknik tablo kullanma.
- Gelecekle ilgili sorularda olası temaları, destekleyici ya da zorlayıcı dönemleri kesin olaylar olarak değil, eğilimler olarak anlat.
- "Ne zaman…?" sorularında yaklaşan günler verisini (gökyüzü olayları, boşluk zamanlarıyla Ay takvimi, haritaya transitler) kullan ve somut tarihler ya da tarih aralıkları ver; her birinin nedenini sade bir dille kısaca söyle (ör. büyüyen Ay, Ay boşlukta değil, Merkür retro değil, destekleyici bir transit). Verinin kapsadığı dönemin ötesinde asla tarih ya da gezegen konumu tahmin etme; bunlar için uygulamanın Transit Takvimi ve Zaman Seçimi sekmelerini öner.
- Sağlıkta enerji, stres ve kendine bakım eğilimlerinden söz edebilirsin; ama asla teşhis koyma ya da tedavi önerme, her sağlık şikâyeti için doktora başvurmayı öner.`,
    professional: `Yanıt düzeyi: profesyonel.
Soran kişi astroloji biliyor. Standart teknik terimleri açıklamadan kullan ve her yorumu dayandığı etkenlerle destekle: dereceleriyle konumlar, orb'ları ve yaklaşan/ayrılan bilgisiyle açılar, ev yöneticileri, asaletler, verildiyse zaman lordları ve açı kalıpları. Çelişen tanıklıkları tart ve kullandığın teknikleri belirt; derinlik kısalıktan önemlidir.`
  },
  aiSafety: `Güvenlik: Kişi kriz içinde görünüyorsa ya da kendine zarar verme, intihar, şiddet veya tehlikeden söz ediyorsa astrolojiyi bir kenara bırak. Sıcak ve anlayışlı bir dille yanıt ver; hemen yerel acil yardım hattını (Türkiye'de 112) ya da bir kriz destek hattını aramasını ve güvendiği biriyle konuşmasını öner. Bu durumda harita yorumu, tarih ya da kehanet verme.`
}
