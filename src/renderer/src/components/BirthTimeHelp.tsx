// Shown in the chart editor when the birth time is unknown: what that changes, whether the
// Moon changed sign that day, and where an approximate time might be found.
import { useEffect, useState } from 'react'
import type { ChartRecord } from '@shared/types'
import { SIGNS, splitDeg } from '../lib/astro'
import { t } from '../lib/i18n'
import { localToJd } from '../lib/time'

export default function BirthTimeHelp({ rec, sidMode }: { rec: ChartRecord; sidMode: number | null }) {
  const [moon, setMoon] = useState<[number, number] | null>(null)
  const { y, m, d } = rec.local

  // The Moon at the start and the end of that local day.
  useEffect(() => {
    let alive = true
    const jd = (h: number, mi: number) => localToJd({ y, m, d, h, mi, s: 0 }, rec.tz, rec.place.lon)
    window.astro
      .compute([0, 1].map((i) => ({ jdUT: i ? jd(23, 59) : jd(0, 0), lat: rec.place.lat, lon: rec.place.lon, houseSystem: 'W', sidMode, bodies: [1] })))
      .then((r) => alive && setMoon([splitDeg(r[0].bodies[0].lon).sign, splitDeg(r[1].bodies[0].lon).sign]))
      .catch(() => alive && setMoon(null))
    return () => {
      alive = false
    }
  }, [y, m, d, rec.place.lat, rec.place.lon, JSON.stringify(rec.tz), sidMode]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <details className="note small birth-help">
      <summary>{t('Doğum saatinizi bilmiyor musunuz? Ne değişir, nasıl bulunur?')}</summary>
      <ul>
        <li>{t('Güneş burcunuz ve çoğu gezegen yine doğru hesaplanır.')}</li>
        <li>
          {moon && moon[0] !== moon[1]
            ? t('Ay o gün {a} burcundan {b} burcuna geçiyor; Ay burcunuz ikisinden biri olabilir.', { a: SIGNS[moon[0]].name, b: SIGNS[moon[1]].name })
            : moon
              ? t('Ay o gün boyunca {a} burcunda; Ay burcunuz büyük olasılıkla doğru.', { a: SIGNS[moon[0]].name })
              : t('Ay gün içinde yaklaşık 13° ilerler; burç değiştirmiş olabilir.')}
        </li>
        <li>{t('Yükselen burç ve evler (hayat alanları) saate bağlıdır; gün içinde 12 burcun hepsinden geçer, bu yüzden gösterilmez.')}</li>
      </ul>
      <p>{t('Saati bulmak için şunlara bakılabilir:')}</p>
      <ul>
        <li>{t('Doğum belgesi, hastane ya da doğum kaydı (bazı ülkelerde saati içerir)')}</li>
        <li>{t('Anne, baba ya da yakınların hatırladığı yaklaşık zaman (ör. "sabaha karşı", "öğleden sonra")')}</li>
        <li>{t('Bebeklik albümü, doğum duyurusu, eski mektuplar ya da günlükler')}</li>
      </ul>
      <p>{t('Saat hiç bilinmiyorsa: haritayı kaydedip Olaylarım sekmesine hayatınızdaki önemli olayları (evlilik, taşınma, iş değişikliği, bir yakının kaybı…) tarihleriyle ekleyin; “Doğum saatini bul” aracı bu olaylara en çok uyan saatleri gösterir.')}</p>
      <p>{t('Yaklaşık bir saat bulursanız "Doğum saati bilinmiyor"u kapatıp o saati girin ve Saat kaynağı olarak "C — Kaynağı belirsiz, yaklaşık" seçin.')}</p>
    </details>
  )
}
