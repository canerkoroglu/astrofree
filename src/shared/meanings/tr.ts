import type { MeaningSet } from './types'

/**
 * Türkçe yerleşik yorum metinleri.
 * Kural: kişi hakkında kesin cümle yok; "-abilir/-ebilir, olabilir" gibi olasılık dili kullanılır.
 * Gezegen/burç/ev tanımları ("simgeler", "ilişkilendirilir") geleneğin anlattığını aktarır.
 */
export const tr: MeaningSet = {
  planets: {
    sun: {
      keywords: 'kimlik, irade, yaşam enerjisi',
      what: 'Kimliğinizi, iradenizi ve yaşam enerjinizi',
      subject: 'Kimliğiniz ve yaşam enerjiniz',
      about: 'Güneş geleneksel olarak öz benliği, iradeyi, yaşam gücünü ve parlamak istenen alanı simgeler.'
    },
    moon: {
      keywords: 'duygular, güvenlik, alışkanlıklar',
      what: 'Duygularınızı, güvenlik ihtiyacınızı ve içgüdüsel tepkilerinizi',
      subject: 'Duygusal ihtiyaçlarınız ve güvenlik arayışınız',
      about: 'Ay duyguları, iç dünyayı, alışkanlıkları, anneyi ve güvende hissetme biçimini simgeler.'
    },
    mercury: {
      keywords: 'düşünce, iletişim, öğrenme',
      what: 'Düşünme, öğrenme ve iletişim kurma biçiminizi',
      subject: 'Zihniniz ve iletişim tarzınız',
      about: 'Merkür zihin, konuşma, yazma, öğrenme, ticaret ve yakın çevreyle ilişkilendirilir.'
    },
    venus: {
      keywords: 'sevgi, uyum, zevk, değerler',
      what: 'Sevme biçiminizi, zevklerinizi ve ilişki kurma tarzınızı',
      subject: 'Sevgi, uyum ve keyif arayışınız',
      about: 'Venüs sevgi, çekicilik, estetik, ilişkiler, para ve değer verilen şeylerle ilişkilendirilir.'
    },
    mars: {
      keywords: 'istek, cesaret, mücadele',
      what: 'İsteklerinizi, cesaretinizi ve mücadele gücünüzü',
      subject: 'Enerjiniz ve mücadele isteğiniz',
      about: 'Mars istek, harekete geçme gücü, rekabet, öfke ve cinsellikle ilişkilendirilir.'
    },
    jupiter: {
      keywords: 'büyüme, inanç, şans',
      what: 'Büyüme, inanç ve fırsat arayışınızı',
      subject: 'Şansınız ve büyüme potansiyeliniz',
      about: 'Jüpiter genişleme, iyimserlik, inanç, yüksek öğrenim, yolculuk ve bollukla ilişkilendirilir.'
    },
    saturn: {
      keywords: 'sorumluluk, sınır, olgunluk',
      what: 'Sorumluluk, sınır ve disiplin anlayışınızı',
      subject: 'Sorumluluklarınız ve olgunlaşma süreciniz',
      about: 'Satürn yapı, disiplin, zaman, sınavlar, korkular ve emekle kazanılan başarıyla ilişkilendirilir.'
    },
    uranus: {
      keywords: 'özgürlük, yenilik, değişim',
      what: 'Özgürlük ihtiyacınızı ve farklı olma isteğinizi',
      subject: 'Özgürlük arayışınız ve yenilikçi yanınız',
      about: 'Uranüs ani değişim, özgürlük, bireysellik, teknoloji ve kalıpları kırmakla ilişkilendirilir.'
    },
    neptune: {
      keywords: 'hayal, sezgi, aşkınlık',
      what: 'Hayallerinizi, sezgilerinizi ve ideallerinizi',
      subject: 'Hayal gücünüz ve ruhsal arayışınız',
      about: 'Neptün hayal gücü, sezgi, şefkat, sanat, ruhaniyet ve yanılsamalarla ilişkilendirilir.'
    },
    pluto: {
      keywords: 'dönüşüm, güç, derinlik',
      what: 'Dönüşüm gücünüzü ve derin tutkularınızı',
      subject: 'Dönüşüm gücünüz ve derin tutkularınız',
      about: 'Plüton kriz, yeniden doğuş, güç, kontrol ve bilinçaltının derinlikleriyle ilişkilendirilir.'
    },
    node: {
      keywords: 'gelişim yönü, hedef',
      what: 'Bu hayattaki gelişim yönünüzü',
      subject: 'Gelişim yönünüz ve hayat amacınız',
      about: 'Kuzey Ay Düğümü geliştirilmesi önerilen, büyütücü yönü simgeler; Güney Ay Düğümü ise alışılmış konfor alanını.'
    },
    snode: {
      keywords: 'alışkanlık, geçmiş, konfor alanı',
      what: 'Alışkın olduğunuz yetenekleri ve konfor alanınızı',
      subject: 'Doğuştan gelen yetenekleriniz ve alışkanlıklarınız',
      about: 'Güney Ay Düğümü kolayca başvurulan eski kalıpları ve hazır yetenekleri simgeler.'
    },
    chiron: {
      keywords: 'yara, iyileşme, bilgelik',
      what: 'Yaralarınızı ve iyileştirme gücünüzü',
      subject: 'Yaralarınız ve iyileştirme yeteneğiniz',
      about: 'Chiron derin bir hassasiyeti ve bu yarayla barışarak başkalarına da şifa olabilme potansiyelini simgeler.'
    },
    lilith: {
      keywords: 'bastırılmış istek, isyan',
      what: 'Bastırılmış isteklerinizi ve boyun eğmeyen yanınızı',
      subject: 'Bastırılmış istekleriniz ve isyankâr yanınız',
      about: 'Lilith (Kara Ay) bastırılan, dışlanan ama güçlü içgüdüleri ve sınır tanımayan yanı simgeler.'
    },
    fortune: {
      keywords: 'şans, bedensel ve maddi refah',
      what: 'Şansınızı ve kendinizi iyi hissetme yollarınızı',
      subject: 'Şansınız ve refah kaynaklarınız',
      about: 'Şans Noktası Güneş, Ay ve Yükselen\'den hesaplanır; maddi ve bedensel iyiliğin kolay akabileceği alanı simgeler.'
    },
    asc: {
      keywords: 'kişilik, beden, ilk izlenim',
      what: 'Dünyaya kendinizi sunuş biçiminizi',
      subject: 'Dış görünüşünüz ve ilk izleniminiz',
      about: 'Yükselen doğum anında doğu ufkundaki burçtur; kişilik, beden, hayata yaklaşım ve ilk izlenimle ilişkilendirilir.'
    },
    mc: {
      keywords: 'kariyer, toplumsal rol, hedef',
      what: 'Kariyer hedeflerinizi ve toplumdaki duruşunuzu',
      subject: 'Kariyeriniz ve toplumsal rolünüz',
      about: 'Tepe Noktası (MC) haritanın en yüksek noktasıdır; kariyer, itibar ve hayattaki hedeflerle ilişkilendirilir.'
    }
  },
  signs: [
    { keywords: 'cesur, girişken, sabırsız', how: 'cesur, doğrudan ve girişken bir tavırla ortaya koyabilirsiniz; ilk adımı atmak size kolay gelebilir', about: 'Koç ateş grubunun öncü burcudur: başlatma, cesaret ve rekabetle ilişkilendirilir.' },
    { keywords: 'sağlam, sabırlı, keyif sever', how: 'sakin, sabırlı ve kalıcı bir biçimde ortaya koyabilirsiniz; güven ve somut sonuçlar arayabilirsiniz', about: 'Boğa toprak grubunun sabit burcudur: istikrar, beş duyu ve kaynaklarla ilişkilendirilir.' },
    { keywords: 'meraklı, hareketli, iletişimci', how: 'meraklı, çevik ve konuşkan bir biçimde ortaya koyabilirsiniz; çeşitlilik ve fikir alışverişi sizi besleyebilir', about: 'İkizler hava grubunun değişken burcudur: merak, iletişim ve çok yönlülükle ilişkilendirilir.' },
    { keywords: 'duygusal, koruyucu, sezgisel', how: 'duygusal, koruyucu ve sezgisel bir biçimde ortaya koyabilirsiniz; aidiyet ve yakınlık sizin için önemli olabilir', about: 'Yengeç su grubunun öncü burcudur: yuva, aile, duygu ve korumayla ilişkilendirilir.' },
    { keywords: 'gururlu, yaratıcı, cömert', how: 'sıcak, yaratıcı ve gösterişli bir biçimde ortaya koyabilirsiniz; görülmek ve takdir edilmek isteyebilirsiniz', about: 'Aslan ateş grubunun sabit burcudur: yaratıcılık, kalp, oyun ve sahneyle ilişkilendirilir.' },
    { keywords: 'titiz, analitik, yardımsever', how: 'dikkatli, analitik ve özenli bir biçimde ortaya koyabilirsiniz; işe yararlık ve düzen sizi rahatlatabilir', about: 'Başak toprak grubunun değişken burcudur: analiz, hizmet, sağlık ve beceriyle ilişkilendirilir.' },
    { keywords: 'uyumlu, diplomatik, estetik', how: 'zarif, diplomatik ve dengeli bir biçimde ortaya koyabilirsiniz; adalet ve iş birliği arayabilirsiniz', about: 'Terazi hava grubunun öncü burcudur: ilişki, denge, estetik ve adaletle ilişkilendirilir.' },
    { keywords: 'yoğun, tutkulu, derin', how: 'yoğun, tutkulu ve derinlemesine bir biçimde ortaya koyabilirsiniz; yüzeysel olanla yetinmek istemeyebilirsiniz', about: 'Akrep su grubunun sabit burcudur: tutku, dönüşüm, sırlar ve ortak kaynaklarla ilişkilendirilir.' },
    { keywords: 'iyimser, özgür, felsefi', how: 'iyimser, coşkulu ve özgür bir biçimde ortaya koyabilirsiniz; anlam aramak ve ufkunuzu genişletmek isteyebilirsiniz', about: 'Yay ateş grubunun değişken burcudur: inanç, felsefe, yolculuk ve öğrenmeyle ilişkilendirilir.' },
    { keywords: 'disiplinli, hırslı, ciddi', how: 'ciddi, disiplinli ve hedef odaklı bir biçimde ortaya koyabilirsiniz; zamanla sağlam bir yapı kurabilirsiniz', about: 'Oğlak toprak grubunun öncü burcudur: hedef, sorumluluk, yapı ve statüyle ilişkilendirilir.' },
    { keywords: 'bağımsız, özgün, idealist', how: 'özgün, bağımsız ve yenilikçi bir biçimde ortaya koyabilirsiniz; topluluk ve gelecek fikirleri sizi heyecanlandırabilir', about: 'Kova hava grubunun sabit burcudur: özgürlük, topluluk, yenilik ve ideallerle ilişkilendirilir.' },
    { keywords: 'hassas, hayalperest, şefkatli', how: 'hassas, sezgisel ve şefkatli bir biçimde ortaya koyabilirsiniz; hayal gücünüz güçlü olabilir, sınırlar zaman zaman bulanıklaşabilir', about: 'Balık su grubunun değişken burcudur: sezgi, şefkat, hayal ve teslimiyetle ilişkilendirilir.' }
  ],
  houses: [
    { keywords: 'benlik, beden, başlangıçlar', where: 'en çok kişiliğiniz, bedeniniz ve hayata yaklaşımınızda kendini gösterebilir', about: '1. ev: benlik, dış görünüş, beden ve ilk izlenim.' },
    { keywords: 'para, sahip olunanlar, öz değer', where: 'en çok para, sahip olduklarınız ve öz değeriniz konularında kendini gösterebilir', about: '2. ev: kazanç, mülk, yetenekler ve öz değer.' },
    { keywords: 'iletişim, kardeşler, yakın çevre', where: 'en çok iletişim, öğrenme, kardeşler ve yakın çevreniz üzerinden kendini gösterebilir', about: '3. ev: iletişim, kardeşler, komşular, kısa yolculuklar ve temel eğitim.' },
    { keywords: 'yuva, aile, kökler', where: 'en çok ev, aile, kökleriniz ve iç dünyanızda kendini gösterebilir', about: '4. ev: ev, aile, kökler ve ebeveyn.' },
    { keywords: 'yaratıcılık, aşk, çocuklar', where: 'en çok yaratıcılık, aşk, eğlence ve çocuklar konusunda kendini gösterebilir', about: '5. ev: yaratıcılık, aşk ilişkileri, oyun, hobiler ve çocuklar.' },
    { keywords: 'iş, sağlık, günlük düzen', where: 'en çok günlük işleriniz, çalışma düzeniniz ve sağlık alışkanlıklarınızda kendini gösterebilir', about: '6. ev: günlük iş, hizmet, sağlık, rutinler ve evcil hayvanlar.' },
    { keywords: 'ortaklık, evlilik, açık rakipler', where: 'en çok evlilik, ortaklıklar ve birebir ilişkilerinizde kendini gösterebilir', about: '7. ev: evlilik, ortaklıklar, sözleşmeler ve açık rakipler.' },
    { keywords: 'dönüşüm, ortak kaynaklar, krizler', where: 'en çok dönüşüm süreçleri, yakınlık ve ortak kaynaklar konusunda kendini gösterebilir', about: '8. ev: ortak para, miras, borçlar, yakınlık, kriz ve dönüşüm.' },
    { keywords: 'inanç, yolculuk, yüksek öğrenim', where: 'en çok yüksek öğrenim, yolculuklar, inançlar ve hayat felsefenizde kendini gösterebilir', about: '9. ev: yüksek öğrenim, uzak yolculuklar, inanç, hukuk ve yayın.' },
    { keywords: 'kariyer, statü, hedefler', where: 'en çok kariyeriniz, toplumsal konumunuz ve hedeflerinizde kendini gösterebilir', about: '10. ev: kariyer, itibar, toplumsal rol ve otorite.' },
    { keywords: 'arkadaşlar, topluluk, umutlar', where: 'en çok arkadaşlıklar, gruplar ve gelecek umutlarınızda kendini gösterebilir', about: '11. ev: arkadaşlar, gruplar, sosyal ağlar, umutlar ve dilekler.' },
    { keywords: 'bilinçaltı, inziva, gizli olan', where: 'en çok iç dünyanızda, bilinçaltınızda ve perde arkasında kendini gösterebilir', about: '12. ev: bilinçaltı, inziva, gizli konular ve ruhsal arayış.' }
  ],
  aspects: {
    conjunction: 'İki ilke birleşip birlikte çalışabilir; etkisi güçlü olabilir ve gezegenlerin doğasına göre uyumlu ya da zorlayıcı hissedilebilir.',
    opposition: 'İki ilke karşı karşıya durabilir; aralarında denge kurma ihtiyacı doğabilir ve bu çoğu zaman ilişkiler üzerinden yaşanabilir.',
    trine: 'İki ilke kolayca ve doğal biçimde akabilir; doğuştan gelen bir yetenek ya da kolaylık olarak hissedilebilir.',
    square: 'İki ilke birbirini zorlayabilir; gerilim ve sürtünme yaratabilir ama aynı zamanda harekete geçirip gelişim sağlayabilir.',
    sextile: 'İki ilke birbirini destekleyebilir; çaba gösterildiğinde değerlendirilebilecek fırsatlar sunabilir.',
    quincunx: 'İki ilkenin ortak noktası az olabilir; sürekli ayar ve uyum çabası gerektirebilir.',
    semisextile: 'Hafif bir bağlantı; iki ilke arasında küçük ayarlamalar ve fark edilmeyi bekleyen fırsatlar olabilir.',
    semisquare: 'Hafif bir gerilim; içsel huzursuzluk ve küçük sürtüşmeler yaratabilir.',
    sesquiquadrate: 'Hafif ama ısrarlı bir gerilim; zaman zaman beklenmedik zorlanmalar getirebilir.',
    quintile: 'Yaratıcı bir bağlantı; kendine has bir yeteneğe işaret edebilir.',
    biquintile: 'Yaratıcı bir bağlantı; olgunlaştıkça ortaya çıkabilecek özgün bir yeteneğe işaret edebilir.'
  },
  sunSign: [
    'Koç Güneşi öncü ve cesur bir ruha işaret edebilir. Bir işi başlatmak, rekabet etmek ve kendi yolunu açmak size enerji verebilir; sabırsızlığı dengelemek bir gelişim alanı olabilir.',
    'Boğa Güneşi sakin, kararlı ve güvenilir bir yapıya işaret edebilir. Somut, kalıcı şeyler kurmak ve hayatın tadını çıkarmak isteyebilirsiniz; değişime direnç zorlayıcı bir yan olabilir.',
    'İkizler Güneşi meraklı ve çok yönlü bir yapıya işaret edebilir. Öğrenmek, konuşmak ve fikirleri birbirine bağlamak sizi canlı tutabilir; dağınıklık dikkat edilebilecek bir nokta olabilir.',
    'Yengeç Güneşi duygusal, koruyucu ve sadık bir yapıya işaret edebilir. Aile, yuva ve sevdiklerinizle bağınız kimliğinizin merkezinde olabilir; kırılganlık zaman zaman zorlayıcı olabilir.',
    'Aslan Güneşi sıcak, yaratıcı ve cömert bir yapıya işaret edebilir. Kalbinizden geleni ortaya koymak ve takdir görmek isteyebilirsiniz; onay ihtiyacını dengelemek önemli olabilir.',
    'Başak Güneşi titiz, çalışkan ve yardımsever bir yapıya işaret edebilir. Ayrıntıyı görmek ve faydalı olmak size anlam verebilir; aşırı eleştirellik ve kaygı bir gelişim alanı olabilir.',
    'Terazi Güneşi zarif, adil ve uyum arayan bir yapıya işaret edebilir. İlişkiler, iş birliği ve estetik hayatınızın merkezinde olabilir; karar vermekte zorlanmak dikkat isteyebilir.',
    'Akrep Güneşi yoğun, tutkulu ve derin bir yapıya işaret edebilir. Gerçeğin altını kazımak ve krizlerden güçlenerek çıkmak doğanıza yakın olabilir; kontrol ihtiyacı zorlayıcı olabilir.',
    'Yay Güneşi iyimser, özgür ruhlu ve maceraperest bir yapıya işaret edebilir. Anlam aramak, yolculuk etmek ve öğrenmek size hayat verebilir; abartıyı dengelemek önemli olabilir.',
    'Oğlak Güneşi ciddi, hırslı ve sorumluluk sahibi bir yapıya işaret edebilir. Uzun vadeli hedefler koyup adım adım ilerlemek bir güç olabilir; katılık ve aşırı iş yükü bir gelişim alanı olabilir.',
    'Kova Güneşi bağımsız, özgün ve ileri görüşlü bir yapıya işaret edebilir. Farklı olmak ve yeni fikirler üretmek sizi tanımlayabilir; duygusal mesafe dikkat isteyebilir.',
    'Balık Güneşi hassas, sezgisel ve şefkatli bir yapıya işaret edebilir. Hayal gücü, sanat ve yardım etmek sizi besleyebilir; sınır koymakta zorlanmak dikkat isteyebilir.'
  ],
  moonSign: [
    'Koç Ay\'ı duyguların hızlı ve doğrudan yaşanmasına işaret edebilir. Öfke çabuk parlayıp çabuk sönebilir; harekete geçmek size duygusal rahatlama sağlayabilir.',
    'Boğa Ay\'ı duygusal sakinlik ve dengeye işaret edebilir. Güvenlik, konfor ve dokunsal yakınlık sizi rahatlatabilir; ani değişiklikler tedirginlik yaratabilir.',
    'İkizler Ay\'ı duyguların konuşarak ve düşünerek işlenmesine işaret edebilir. Sohbet ve çeşitlilik size iyi gelebilir; duyguları analiz edip uzaklaşma eğilimi olabilir.',
    'Yengeç Ay\'ı (kendi evinde) derin bir duygusal hassasiyete işaret edebilir. Yuva ve şefkatli bakım temel bir ihtiyaç olabilir; ruh hâliniz kolay dalgalanabilir.',
    'Aslan Ay\'ı sevgi ve ilgi ihtiyacına işaret edebilir. Takdir edilmek ve yaratıcı ifade sizi mutlu edebilir; görmezden gelinmek incitici olabilir.',
    'Başak Ay\'ı duyguların düzen ve faydalı işler aracılığıyla dengelenmesine işaret edebilir. İşleri yoluna koymak sizi rahatlatabilir; kaygı ve kendini eleştirme eğilimi olabilir.',
    'Terazi Ay\'ı uyum ve huzur arayışına işaret edebilir. Dengeli ilişkiler ve nezaket size iyi gelebilir; çatışmadan kaçınmak için duygularınızı geri planda tutabilirsiniz.',
    'Akrep Ay\'ı duyguların yoğun ve derinden yaşanmasına işaret edebilir. Güven ve sadakat çok önemli olabilir; kırgınlıklar uzun süre içinizde kalabilir.',
    'Yay Ay\'ı duygusal iyimserlik ve özgürlük ihtiyacına işaret edebilir. Hareket ve macera sizi rahatlatabilir; kısıtlanmak bunaltıcı gelebilir.',
    'Oğlak Ay\'ı duyguların kontrollü ve ölçülü yaşanmasına işaret edebilir. Sorumluluk almak size güven verebilir; duyguları göstermek zor gelebilir.',
    'Kova Ay\'ı duygulara mesafeli ve akılcı bir yaklaşıma işaret edebilir. Arkadaşlık ve kendin olabilmek önemli olabilir; yoğun duygusal talepler sizi uzaklaştırabilir.',
    'Balık Ay\'ı güçlü bir empati ve sezgiye işaret edebilir. Başkalarının duygularını kolayca hissedebilirsiniz; yalnız kalmak, müzik ve sanat size iyi gelebilir.'
  ],
  ascSign: [
    'Koç Yükselen enerjik, doğrudan ve atılgan bir ilk izlenim bırakabilir. Hayata cesaretle ve hızla yaklaşabilirsiniz; insanlar sizi girişken bulabilir.',
    'Boğa Yükselen sakin ve güven veren bir ilk izlenim bırakabilir. Hayata temkinli ve istikrarlı yaklaşabilirsiniz; acele etmeyi sevmeyebilirsiniz.',
    'İkizler Yükselen canlı, konuşkan ve meraklı bir ilk izlenim bırakabilir. Hayata zihinsel ve esnek yaklaşabilir, yeni durumlara hızla uyum sağlayabilirsiniz.',
    'Yengeç Yükselen sıcak, korumacı ve duyarlı bir ilk izlenim bırakabilir. Hayata duygularınızla yaklaşabilir, güven duyduğunuzda daha çok açılabilirsiniz.',
    'Aslan Yükselen parlak, kendinden emin ve karizmatik bir ilk izlenim bırakabilir. Hayata yaratıcı bir tavırla yaklaşabilir, kolayca fark edilebilirsiniz.',
    'Başak Yükselen düzenli, ölçülü ve dikkatli bir ilk izlenim bırakabilir. Hayata analitik ve pratik yaklaşabilir, ayrıntılara özen gösterebilirsiniz.',
    'Terazi Yükselen zarif, nazik ve uyumlu bir ilk izlenim bırakabilir. Hayata ilişkiler ve denge üzerinden yaklaşabilirsiniz.',
    'Akrep Yükselen yoğun, gizemli ve etkileyici bir ilk izlenim bırakabilir. Hayata derinlik ve temkinle yaklaşabilir, kolay açılmayabilirsiniz.',
    'Yay Yükselen neşeli, açık sözlü ve maceraperest bir ilk izlenim bırakabilir. Hayata iyimserlik ve merakla yaklaşabilirsiniz.',
    'Oğlak Yükselen ciddi, olgun ve güvenilir bir ilk izlenim bırakabilir. Hayata sorumluluk ve hedeflerle yaklaşabilirsiniz; zamanla daha rahat görünebilirsiniz.',
    'Kova Yükselen özgün, arkadaş canlısı ama biraz mesafeli bir ilk izlenim bırakabilir. Hayata bağımsız ve yenilikçi yaklaşabilirsiniz.',
    'Balık Yükselen yumuşak, rüya gibi ve şefkatli bir ilk izlenim bırakabilir. Hayata sezgilerinizle yaklaşabilir, çevrenizin ruh hâlini kolayca alabilirsiniz.'
  ],
  elements: {
    fire: ['Ateş vurgusu coşkulu, hevesli ve harekete dönük bir yapıya işaret edebilir.', 'Ateş zayıf: motivasyonu ve özgüveni bilinçli olarak beslemek iyi gelebilir.'],
    earth: ['Toprak vurgusu pratik, sabırlı ve somut sonuç odaklı bir yapıya işaret edebilir.', 'Toprak zayıf: düzen, beden ve maddi konulara bilinçli zaman ayırmak iyi gelebilir.'],
    air: ['Hava vurgusu zihinsel, sosyal ve iletişimci bir yapıya işaret edebilir.', 'Hava zayıf: duyguları sözcüklere dökmek ve mesafe alıp düşünmek zor gelebilir.'],
    water: ['Su vurgusu duygusal, sezgisel ve empatik bir yapıya işaret edebilir.', 'Su zayıf: duyguları fark etmek ve ifade etmek için bilinçli zaman ayırmak iyi gelebilir.']
  },
  retro: 'Retro: bu gezegenin konuları daha içe dönük, düşünceli ve kendine özgü biçimde yaşanabilir.',
  glossary: [
    ['Gezegen', 'Haritadaki gezegenler "ne"yi anlatır: duygular, irade, sevgi, mücadele gibi temel ilkeler.'],
    ['Burç', 'Burç "nasıl"ı anlatır: bir gezegenin enerjisinin hangi tarzda ifade edilebileceğini.'],
    ['Ev', 'Ev "nerede"yi anlatır: o enerjinin hayatın hangi alanında (iş, aile, ilişki…) öne çıkabileceğini.'],
    ['Açı', 'İki gezegen arasındaki derece farkı; aralarındaki ilişkiyi (uyum, gerilim, birleşme) anlatır.'],
    ['Orb', 'Bir açının tam değerden ne kadar saptığı; orb küçüldükçe açının etkisi daha güçlü kabul edilir.'],
    ['Yükselen', 'Doğum anında doğu ufkunda yükselen burç. Doğru doğum saati gerektirir; saat belirsizse dikkatle okunmalıdır.'],
    ['Transit', 'Gökyüzündeki gezegenlerin şu anki (ya da seçilen tarihteki) konumlarının doğum haritasıyla ilişkisi.'],
    ['Retro', 'Bir gezegenin Dünya\'dan bakıldığında geri gidiyormuş gibi görünmesi; geleneksel olarak gözden geçirme dönemleri sayılır.']
  ],
  disclaimer:
    'Bu metinler astroloji geleneğindeki genel eğilimleri aktarır; kişisel keşif ve eğlence amaçlıdır, kesin bilgi ya da kehanet değildir. Tıbbi, hukuki, psikolojik veya finansal tavsiye yerine geçmez.'
}
