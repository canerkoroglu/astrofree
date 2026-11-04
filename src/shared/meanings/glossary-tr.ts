import type { GlossaryGroup } from './glossary'

/** Uygulamada geçen astroloji terimleri. Tanımlar geleneği aktarır; kişi hakkında kesin hüküm içermez. */
export const glossaryTr: GlossaryGroup[] = [
  {
    title: 'Temel kavramlar',
    terms: [
      ['Doğum haritası (natal harita)', 'Doğum anında, doğum yerinden bakıldığında gökyüzünün iki boyutlu çizimi: gezegenlerin burç ve evlerdeki konumları ve aralarındaki açılar.'],
      ['Gezegen', 'Haritada temel ilkeleri temsil eden gök cisimleri; astrolojide Güneş ve Ay da "gezegen" olarak anılır. Gezegen "ne"yi anlatır.'],
      ['Burç', 'Ekliptiğin (Güneş’in yıllık yolu) 30°’lik on iki bölümünden biri. Burç, bir gezegenin enerjisinin "nasıl" ifade edilebileceğini anlatır.'],
      ['Ev', 'Haritanın, dünyanın günlük dönüşüne göre on iki bölüme ayrılmış hâli. Her ev hayatın bir alanıyla (iş, aile, ilişki…) ilişkilendirilir; "nerede"yi anlatır.'],
      ['Açı', 'İki gezegen ya da nokta arasındaki derece farkı (ör. 90° kare, 120° üçgen). Açılar iki ilkenin birbiriyle nasıl çalışabileceğini anlatır.'],
      ['Orb', 'Bir açının tam değerinden ne kadar saptığı. Örneğin 87° fark, 3° orb’lu bir karedir. Orb küçüldükçe açı daha güçlü kabul edilir.'],
      ['Yaklaşan / ayrılan açı', 'Hızlı gezegen tam açıya doğru ilerliyorsa açı yaklaşan, tam açıyı geçmişse ayrılan sayılır. Yaklaşan açılar geleneksel olarak daha etkili kabul edilir.'],
      ['Retro (geri hareket)', 'Bir gezegenin Dünya’dan bakıldığında geriye gidiyormuş gibi görünmesi. Gerçekte bir görüş açısı etkisidir; geleneksel olarak gözden geçirme dönemi sayılır.'],
      ['Durak (istasyon)', 'Gezegenin retroya başladığı ya da düz harekete döndüğü an; gezegen o sırada neredeyse duruyormuş gibi görünür.'],
      ['Ekliptik', 'Güneş’in yıl boyunca gökyüzünde izlediği yol. Burçlar ve gezegen boylamları ekliptik üzerinde ölçülür.'],
      ['Deklinasyon', 'Bir gök cisminin gök ekvatorunun kuzeyinde ya da güneyinde kaç derece olduğu. Aynı deklinasyondaki gezegenler "paralel" sayılır.'],
      ['Element', 'Burçların dört gruba ayrılışı: Ateş (Koç, Aslan, Yay), Toprak (Boğa, Başak, Oğlak), Hava (İkizler, Terazi, Kova), Su (Yengeç, Akrep, Balık).'],
      ['Nitelik (öncü, sabit, değişken)', 'Burçların üç gruba ayrılışı: öncü burçlar başlatmayla, sabit burçlar sürdürmeyle, değişken burçlar uyum ve dönüşümle ilişkilendirilir.'],
      ['Harita yöneticisi', 'Yükselen burcun yönetici gezegeni. Geleneksel olarak haritanın genel temasını taşıyan gezegen sayılır.']
    ]
  },
  {
    title: 'Köşeler ve evler',
    terms: [
      ['Yükselen (ASC)', 'Doğum anında doğu ufkunda yükselen derece; 1. evin başlangıcı. Kişilik, beden ve ilk izlenimle ilişkilendirilir. Doğru doğum saati gerektirir.'],
      ['Alçalan (DSC)', 'Yükselen’in tam karşısı, batı ufku; 7. evin başlangıcı. Birebir ilişkiler ve ortaklıklarla ilişkilendirilir.'],
      ['Tepe Noktası (MC)', 'Ekliptiğin meridyeni kestiği en yüksek nokta; çoğu ev sisteminde 10. evin başlangıcı. Kariyer ve toplumsal rolle ilişkilendirilir.'],
      ['Dip Noktası (IC)', 'MC’nin tam karşısı; çoğu ev sisteminde 4. evin başlangıcı. Kökler, aile ve yuva ile ilişkilendirilir.'],
      ['Köşe, ardıl ve düşen evler', 'Köşe evler (1, 4, 7, 10) en güçlü, ardıl evler (2, 5, 8, 11) orta, düşen evler (3, 6, 9, 12) daha zayıf kabul edilir.'],
      ['Ev sistemi', 'Evlerin nasıl bölüneceğini belirleyen yöntem. Placidus, Koch, Alcabitius, Regiomontanus, Campanus zamana ya da uzaya göre böler; Eşit ve Tam Burç sistemleri 30°’lik eşit bölümler kullanır.'],
      ['Tam burç evleri', 'Yükselen’in bulunduğu burcun tamamı 1. ev, sonraki burç 2. ev sayılır. Helenistik astrolojinin temel ev sistemidir.'],
      ['Kutup dairesi sorunu', 'Çok yüksek enlemlerde Placidus ve Koch gibi sistemler matematiksel olarak tanımsızdır; AstroFree bu durumda Porphyry evlerini kullanır ve bunu belirtir.']
    ]
  },
  {
    title: 'Açılar',
    terms: [
      ['Kavuşum (0°)', 'İki gezegenin aynı derecede ya da çok yakın olması. İki ilke birleşir; etkisi gezegenlere göre uyumlu ya da zorlayıcı olabilir.'],
      ['Karşıt (180°)', 'İki gezegenin tam karşı karşıya olması. Denge ve farkındalık ihtiyacıyla, çoğu zaman ilişkiler üzerinden yaşanan gerilimle ilişkilendirilir.'],
      ['Üçgen (120°)', 'Aynı elementteki iki burç arasındaki uyumlu açı; akış ve kolaylıkla ilişkilendirilir.'],
      ['Kare (90°)', 'Zorlayıcı ama harekete geçirici açı; gerilim, çaba ve gelişimle ilişkilendirilir.'],
      ['Sekstil (60°)', 'Destekleyici, fırsat sunan uyumlu açı; çaba gösterildiğinde değerlendirilebilecek olanaklarla ilişkilendirilir.'],
      ['Quincunx (150°)', 'Ortak noktası az iki burç arasındaki açı; ayar ve uyum gerektiren durumlarla ilişkilendirilir.'],
      ['Minör açılar', 'Yarım sekstil (30°), yarım kare (45°), seskikare (135°), kuintil (72°), bikuintil (144°). Daha hafif etkili sayılır; çarkta kesikli çizilir.'],
      ['Ana / minör açı', 'Kavuşum, karşıt, üçgen, kare ve sekstil ana (Batlamyus) açılardır; diğerleri minör açılardır.']
    ]
  },
  {
    title: 'Noktalar ve küçük cisimler',
    terms: [
      ['Ay düğümleri (Kuzey / Güney)', 'Ay’ın yörüngesinin ekliptiği kestiği iki nokta. Tutulmalar bu noktalara yakın olur. Kuzey düğüm gelişim yönü, güney düğüm alışılmış kalıplarla ilişkilendirilir.'],
      ['Ortalama / gerçek düğüm', 'Ortalama düğüm düzgün hareket eden hesaplanmış noktadır; gerçek düğüm Ay’ın anlık yörüngesine göre salınır. Ayarlardan seçilebilir.'],
      ['Chiron', 'Satürn ile Uranüs arasında dolanan küçük cisim; yara ve iyileşme temasıyla ilişkilendirilir.'],
      ['Lilith (Kara Ay)', 'Ay yörüngesinin Dünya’ya en uzak noktası (apoje). Bastırılmış içgüdüler ve boyun eğmeyen yanla ilişkilendirilir; ortalama ve oskülasyonlu hesapları vardır.'],
      ['Şans Noktası', 'Yükselen + Ay − Güneş (gece haritasında Yükselen + Güneş − Ay) ile hesaplanan nokta; bedensel ve maddi refahla ilişkilendirilir.'],
      ['Vertex', 'Batı ufku yakınında, ilk dikey ile ekliptiğin kesiştiği nokta; "kader" karşılaşmalarıyla ilişkilendirilir.'],
      ['Asteroitler (Ceres, Pallas, Juno, Vesta)', 'Ana asteroit kuşağının büyük cisimleri; sırasıyla besleme, bilgelik, bağlılık ve adanmışlık temalarıyla ilişkilendirilir.'],
      ['Sabit yıldızlar', 'Gezegenlere göre neredeyse hareketsiz görünen parlak yıldızlar (Regulus, Algol, Spica…). Bir gezegen ya da köşeyle 1° içinde kavuşumları değerlendirilir.']
    ]
  },
  {
    title: 'Öngörü ve karşılaştırma teknikleri',
    terms: [
      ['Transit', 'Gökyüzündeki gezegenlerin şu anki (ya da seçilen tarihteki) konumlarının doğum haritasındaki noktalarla yaptığı açılar.'],
      ['İkincil progresyon', 'Doğumdan sonraki her günün hayatın bir yılına karşılık geldiği yöntem ("bir gün = bir yıl"). AstroFree MC için Naibod yöntemini kullanır.'],
      ['Solar ark', 'Haritadaki bütün noktaların, ilerletilmiş Güneş’in katettiği yay kadar ileri taşınması; yaklaşık yılda 1°.'],
      ['Sinastri', 'İki kişinin doğum haritalarının üst üste konup aralarındaki açılara bakılması; ilişki temalarını incelemek için kullanılır.'],
      ['Kompozit harita', 'İki haritanın gezegen orta noktalarından oluşturulan tek harita; ilişkinin kendisini temsil ettiği kabul edilir.'],
      ['Davison haritası', 'İki doğum anının ve yerinin orta noktası için çizilen gerçek bir harita; bir başka ilişki haritası türü.'],
      ['Güneş dönüşü (Solar return)', 'Güneş’in her yıl doğumdaki derecesine döndüğü an için çizilen harita; o yılın temaları için kullanılır.'],
      ['Ay dönüşü (Lunar return)', 'Ay’ın her ay doğumdaki derecesine döndüğü an için çizilen harita; o ayın temaları için kullanılır.'],
      ['Harmonik harita', 'Bütün konumların bir sayıyla (H2–H16) çarpılmasıyla elde edilen harita; belirli açı ailelerini öne çıkarır.'],
      ['Orta nokta', 'İki gezegenin tam ortasındaki derece. Ebertin geleneğinde bir noktanın orta noktaya değmesi (C = A/B) iki ilkeyi birleştiren bir tema olarak okunur.'],
      ['Astrokartografi', 'Doğum anında her gezegenin dünya üzerinde yükseldiği, battığı, tepe ve dip noktasında olduğu yerleri gösteren harita çizgileri.'],
      ['Taşınmış harita (relocation)', 'Aynı doğum anının başka bir şehir için çizilmesi; gezegenler aynı kalır, evler ve köşeler değişir.'],
      ['Grafik efemeris', 'Transit gezegenlerin zaman içindeki hareketini doğum noktalarıyla birlikte gösteren grafik.'],
      ['Elektif (zaman seçimi)', 'Bir iş için uygun koşulları (Ay’ın durumu, retrolar, açılar) taşıyan zaman aralıklarını arama yöntemi.']
    ]
  },
  {
    title: 'Ay ve zaman',
    terms: [
      ['Ay fazları', 'Güneş ile Ay arasındaki açıya göre sekiz evre: Yeni Ay, Hilal, İlk Dördün, Şişkin Ay, Dolunay, Yayılan Ay, Son Dördün, Balzamik Ay.'],
      ['Boşluktaki Ay (void of course)', 'Ay’ın bulunduğu burçta son ana açısını yaptıktan sonra burçtan çıkana kadar geçen süre; geleneksel olarak yeni işlere başlamak için uygun sayılmaz.'],
      ['Ay durakları (menâzil)', 'Ay’ın yaklaşık 28 günlük turunun 28 bölüme ayrılması; Arap ve ortaçağ astrolojisinde zaman seçimi için kullanılır.'],
      ['Tutulma', 'Güneş tutulması bir Yeni Ay’da, Ay tutulması bir Dolunay’da, Ay düğümlere yakınken olur.'],
      ['Gezegen günü ve saati', 'Haftanın her günü ve gün doğumundan itibaren her "saat" Kalde sırasına göre bir gezegene atanır; gündüz ve gece saatleri eşit olmayan uzunluktadır.'],
      ['Rektifikasyon', 'Bilinen olaylardan yola çıkarak belirsiz doğum saatini düzeltme çalışması.'],
      ['Rodden derecelendirmesi', 'Doğum verisinin güvenilirlik notu: AA (kayıttan), A (hatıradan), B (biyografiden), C (belirsiz), DD (çelişkili), X (saat bilinmiyor).'],
      ['Yerel Ortalama Zaman (LMT)', 'Standart saat dilimleri öncesinde, yerin boylamına göre hesaplanan güneş zamanı.'],
      ['Jülyen takvimi', '1582 öncesinde kullanılan takvim; AstroFree bu tarihlerde Jülyen takvimine geçer.']
    ]
  },
  {
    title: 'Geleneksel astroloji',
    terms: [
      ['Esas asalet', 'Bir gezegenin bulunduğu burçtaki gücü: yönetim (evinde), yücelim, üçlü, sınır ve yüz güç; zarar ve düşüş zayıflık sayılır.'],
      ['Yönetici (domicile)', 'Bir burcun "sahibi" olan gezegen (ör. Koç’un yöneticisi Mars). Modern sistemde Uranüs, Neptün ve Plüton da yönetici olarak kullanılır.'],
      ['Yücelim ve düşüş', 'Bir gezegenin özellikle güçlü (yücelim) ya da zayıf (düşüş) kabul edildiği burçlar; düşüş yücelimin karşı burcudur.'],
      ['Zarar (detriment)', 'Bir gezegenin yönettiği burcun karşı burcunda bulunması; geleneksel olarak zorlanma sayılır.'],
      ['Üçlüler (triplicity)', 'Her element için gündüz, gece ve ortak yönetici gezegenler (Dorotheus sistemi).'],
      ['Sınırlar (terms)', 'Her burcun eşit olmayan beş bölüme ayrılması ve her bölümün bir gezegene verilmesi (Mısır sınırları).'],
      ['Yüzler (dekanlar)', 'Her burcun 10°’lik üç bölümü; Kalde sırasına göre gezegenlere atanır.'],
      ['Almuten', 'Bir derece üzerinde en çok esas asalet puanına sahip gezegen; Lilly puanlamasıyla hesaplanır.'],
      ['Sekt', 'Haritanın gündüz (Güneş ufkun üstünde) ya da gece haritası olması; gezegenlerin "takımını" belirler.'],
      ['Profeksiyon', 'Yükselen’in her yıl bir burç ilerletildiği yöntem; o yılın burcunun yöneticisi "yılın lordu" olur.'],
      ['Firdaria', 'Hayatın gezegenlere atanmış dönemlere bölündüğü Pers kökenli zamanlama yöntemi.'],
      ['Hermetik noktalar', 'Şans, Ruh, Eros, Zorunluluk, Cesaret, Zafer ve Nemesis noktaları; Güneş, Ay ve gezegenlerden hesaplanır.'],
      ['Kalde sırası', 'Gezegenlerin görünen hızlarına göre sıralanışı: Satürn, Jüpiter, Mars, Güneş, Venüs, Merkür, Ay.']
    ]
  },
  {
    title: 'Açı kalıpları',
    terms: [
      ['Stelyum', 'Aynı burçta ya da evde üç veya daha fazla gezegen; o alanın ön plana çıkabileceğine işaret edebilir.'],
      ['Büyük Üçgen', 'Üç gezegenin birbirine üçgen açıyla bağlandığı kalıp; genellikle aynı elementte olur.'],
      ['T-Kare', 'İki gezegen karşıt, üçüncüsü ikisine de kare; gerilim ve motivasyon kalıbı.'],
      ['Büyük Haç', 'Dört gezegenin iki karşıt ve dört kareyle bağlandığı kalıp.'],
      ['Yod', 'İki gezegen sekstil, üçüncüsü ikisine de quincunx; "Tanrı’nın parmağı" olarak da bilinir.'],
      ['Uçurtma', 'Büyük Üçgen’e, köşelerinden birine karşıt bir dördüncü gezegenin eklendiği kalıp.'],
      ['Mistik Dikdörtgen', 'İki karşıtın sekstil ve üçgenlerle birbirine bağlandığı dört gezegenli kalıp.']
    ]
  },
  {
    title: 'Zodyak ve Vedik astroloji',
    terms: [
      ['Tropikal zodyak', 'Koç 0°’nin ilkbahar ekinoksuna sabitlendiği zodyak; Batı astrolojisinde yaygındır.'],
      ['Sidereal zodyak', 'Burçların yıldız kümelerine göre sabitlendiği zodyak; Vedik astrolojide kullanılır.'],
      ['Ayanamsa', 'Tropikal ile sidereal zodyak arasındaki fark (bugün yaklaşık 24°). Lahiri, Fagan-Bradley, Raman gibi farklı hesapları vardır.'],
      ['Rāśi (D1)', 'Vedik astrolojide sidereal burç ve temel doğum haritası.'],
      ['Nakshatra', 'Zodyağın 13°20′’lik 27 Ay konağından biri; her birinin bir yönetici gezegeni vardır.'],
      ['Pada', 'Her nakshatranın 3°20′’lik dört çeyreğinden biri.'],
      ['Navamsa (D9)', 'Her burcun dokuz parçaya bölünmesiyle elde edilen bölüm haritası; geleneksel olarak evlilik ve gezegenlerin iç gücü için incelenir.'],
      ['Vargottama', 'Bir gezegenin D1 ve D9’da aynı burçta olması; geleneksel olarak güçlü sayılır.'],
      ['Vimshottari dasha', 'Ay’ın doğumdaki nakshatrasından başlayan, toplam 120 yıllık gezegen dönemleri sistemi; her ana dönem (mahadasha) alt dönemlere (antardasha) ayrılır.'],
      ['Rahu ve Ketu', 'Vedik astrolojide Kuzey ve Güney Ay Düğümleri.']
    ]
  }
]
