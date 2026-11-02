import { useEffect, useState } from 'react'
import { DEFAULT_ASPECTS, PROVIDERS, SYSTEM_PROMPT_EN, SYSTEM_PROMPT_TR } from '@shared/defaults'
import type { AppSettings, AspectKey, ProviderId } from '@shared/types'
import { ASPECTS, AYANAMSAS, HOUSE_SYSTEMS, OPTIONAL_POINTS, POINT, glyph } from '../lib/astro'
import PlaceSearch from './PlaceSearch'

type Tab = 'chart' | 'aspects' | 'ai' | 'general'

export default function SettingsDialog({
  settings,
  onSave,
  onClose
}: {
  settings: AppSettings
  onSave: (s: AppSettings) => void
  onClose: () => void
}) {
  const [s, setS] = useState<AppSettings>(settings)
  const [tab, setTab] = useState<Tab>('chart')
  const [keys, setKeys] = useState<Record<string, string>>({})
  const [hasKey, setHasKey] = useState<Record<string, boolean>>({})
  const [backupMsg, setBackupMsg] = useState('')

  useEffect(() => {
    void window.astro.secrets.status().then(setHasKey)
  }, [])

  const setAspect = (k: AspectKey, patch: Partial<AppSettings['aspects'][AspectKey]>) =>
    setS({ ...s, aspects: { ...s.aspects, [k]: { ...s.aspects[k], ...patch } } })
  const setProv = (id: ProviderId, patch: Partial<AppSettings['ai']['providers'][ProviderId]>) =>
    setS({ ...s, ai: { ...s.ai, providers: { ...s.ai.providers, [id]: { ...s.ai.providers[id], ...patch } } } })

  const save = async () => {
    for (const [p, k] of Object.entries(keys)) await window.astro.secrets.set(p as ProviderId, k.trim())
    onSave(s)
  }

  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal wide">
        <h2>Ayarlar</h2>
        <div className="tabs">
          {(
            [
              ['chart', 'Harita'],
              ['aspects', 'Açılar & orb'],
              ['ai', 'Yapay zekâ'],
              ['general', 'Genel']
            ] as [Tab, string][]
          ).map(([k, label]) => (
            <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'chart' && (
          <div className="form-grid">
            <label>
              Ev sistemi
              <select value={s.houseSystem} onChange={(e) => setS({ ...s, houseSystem: e.target.value })}>
                {HOUSE_SYSTEMS.map(([k, n]) => (
                  <option key={k} value={k}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Zodyak
              <select value={s.zodiac} onChange={(e) => setS({ ...s, zodiac: e.target.value as AppSettings['zodiac'] })}>
                <option value="tropical">Tropikal</option>
                <option value="sidereal">Sidereal (Vedik)</option>
              </select>
            </label>
            {s.zodiac === 'sidereal' && (
              <label>
                Ayanamsa
                <select value={s.sidMode} onChange={(e) => setS({ ...s, sidMode: Number(e.target.value) })}>
                  {AYANAMSAS.map(([k, n]) => (
                    <option key={k} value={k}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label>
              Ay düğümü
              <select value={s.nodeType} onChange={(e) => setS({ ...s, nodeType: e.target.value as 'mean' | 'true' })}>
                <option value="mean">Ortalama</option>
                <option value="true">Gerçek</option>
              </select>
            </label>
            <label>
              Lilith
              <select value={s.lilithType} onChange={(e) => setS({ ...s, lilithType: e.target.value as 'mean' | 'true' })}>
                <option value="mean">Ortalama</option>
                <option value="true">Oskülasyon (gerçek)</option>
              </select>
            </label>
            <label>
              Çark yönü
              <select value={s.orientation} onChange={(e) => setS({ ...s, orientation: e.target.value as 'asc' | 'aries' })}>
                <option value="asc">Yükselen solda</option>
                <option value="aries">0° Koç solda</option>
              </select>
            </label>
            <label>
              Progres açılar (ASC/MC)
              <select
                value={s.progressedAngles}
                onChange={(e) => setS({ ...s, progressedAngles: e.target.value as AppSettings['progressedAngles'] })}
              >
                <option value="naibod">Naibod (RA)</option>
                <option value="solarArc">Solar ark</option>
              </select>
            </label>
            <label>
              Dönüş haritası yeri
              <select value={s.returnPlace} onChange={(e) => setS({ ...s, returnPlace: e.target.value as AppSettings['returnPlace'] })}>
                <option value="natal">Doğum yeri</option>
                <option value="current">Varsayılan konum (bulunduğunuz yer)</option>
              </select>
            </label>
            <fieldset className="span2">
              <legend>Ek noktalar</legend>
              <div className="checks">
                {OPTIONAL_POINTS.map((k) => (
                  <label key={k} className="inline">
                    <input
                      type="checkbox"
                      checked={!!s.points[k]}
                      onChange={(e) => setS({ ...s, points: { ...s.points, [k]: e.target.checked } })}
                    />
                    <span className="glyph">{glyph(k)}</span> {POINT[k].name}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {tab === 'aspects' && (
          <>
            <table className="data">
              <thead>
                <tr>
                  <th>Açı</th>
                  <th>Açık</th>
                  <th>Natal orb (°)</th>
                  <th>Transit/progresyon orb (°)</th>
                </tr>
              </thead>
              <tbody>
                {ASPECTS.map((a) => (
                  <tr key={a.key}>
                    <td>
                      <span className="glyph">{a.glyph}</span> {a.name} ({a.angle}°)
                    </td>
                    <td>
                      <input type="checkbox" checked={s.aspects[a.key].enabled} onChange={(e) => setAspect(a.key, { enabled: e.target.checked })} />
                    </td>
                    <td>
                      <input type="number" step="0.5" min="0" max="15" value={s.aspects[a.key].orb} onChange={(e) => setAspect(a.key, { orb: Number(e.target.value) })} />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        max="10"
                        value={s.aspects[a.key].outerOrb}
                        onChange={(e) => setAspect(a.key, { outerOrb: Number(e.target.value) })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="row">
              <label className="inline">
                <input
                  type="checkbox"
                  checked={s.showNatalAspectsInBiwheel}
                  onChange={(e) => setS({ ...s, showNatalAspectsInBiwheel: e.target.checked })}
                />
                Çift çarkta natal açıları da çiz
              </label>
              <button onClick={() => setS({ ...s, aspects: structuredClone(DEFAULT_ASPECTS) })}>Varsayılan orb'lar</button>
            </div>
            <p className="muted small">Güneş/Ay için orb ×1.15, düğümler/Chiron ×0.6, asteroitler ×0.5 uygulanır.</p>
          </>
        )}

        {tab === 'ai' && (
          <div>
            <div className="form-grid">
              <label>
                Yanıt dili
                <select value={s.ai.language} onChange={(e) => setS({ ...s, ai: { ...s.ai, language: e.target.value as 'tr' | 'en' } })}>
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                </select>
              </label>
            </div>
            {PROVIDERS.map((p) => {
              const c = s.ai.providers[p.id]
              return (
                <fieldset key={p.id}>
                  <legend>{p.label}</legend>
                  <div className="muted small">{p.hint}</div>
                  <div className="row">
                    {p.kind === 'cli' ? (
                      <>
                        <label>
                          Komut / yol
                          <input value={c.command ?? ''} onChange={(e) => setProv(p.id, { command: e.target.value })} />
                        </label>
                        <label>
                          Ek argümanlar
                          <input value={c.extraArgs ?? ''} onChange={(e) => setProv(p.id, { extraArgs: e.target.value })} />
                        </label>
                      </>
                    ) : (
                      <>
                        <label>
                          API anahtarı {hasKey[p.id] ? '(kayıtlı)' : ''}
                          <input
                            type="password"
                            placeholder={hasKey[p.id] ? '•••••••• (değiştirmek için yazın)' : 'anahtar'}
                            value={keys[p.id] ?? ''}
                            onChange={(e) => setKeys({ ...keys, [p.id]: e.target.value })}
                          />
                        </label>
                        <label>
                          Base URL
                          <input value={c.baseUrl ?? ''} onChange={(e) => setProv(p.id, { baseUrl: e.target.value })} />
                        </label>
                      </>
                    )}
                    <label className="narrow">
                      Model
                      <input value={c.model} placeholder="varsayılan" onChange={(e) => setProv(p.id, { model: e.target.value })} />
                    </label>
                  </div>
                </fieldset>
              )
            })}
            <label>
              Sistem talimatı (boş bırakılırsa varsayılan kullanılır)
              <textarea
                rows={6}
                value={s.ai.systemPrompt}
                placeholder={s.ai.language === 'en' ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_TR}
                onChange={(e) => setS({ ...s, ai: { ...s.ai, systemPrompt: e.target.value } })}
              />
            </label>
            <p className="muted small">API anahtarları işletim sisteminin anahtar zinciriyle şifrelenip yerel olarak saklanır.</p>
          </div>
        )}

        {tab === 'general' && (
          <div>
            <label>
              Tema
              <select value={s.theme} onChange={(e) => setS({ ...s, theme: e.target.value as AppSettings['theme'] })}>
                <option value="system">Sistem</option>
                <option value="light">Açık</option>
                <option value="dark">Koyu</option>
              </select>
            </label>
            <fieldset>
              <legend>Otomatik yedek</legend>
              <div className="muted small">
                Haritalar ve kaydedilmiş yorumlar her değişiklikte seçilen klasöre günlük bir dosya olarak yazılır (son 30 gün tutulur).
                iCloud Drive, Dropbox veya bir USB bellek klasörü seçebilirsiniz.
              </div>
              <div className="row">
                <input readOnly value={s.backupDir || 'Kapalı'} style={{ flex: 1 }} />
                <button
                  onClick={async () => {
                    const d = await window.astro.backup.choose()
                    if (d) setS({ ...s, backupDir: d })
                  }}
                >
                  Klasör seç
                </button>
                {s.backupDir && <button onClick={() => setS({ ...s, backupDir: '' })}>Kapat</button>}
              </div>
              <div className="row">
                <button
                  disabled={!s.backupDir}
                  onClick={async () => {
                    const path = await window.astro.backup.run(s.backupDir)
                    if (path) {
                      setBackupMsg(`Yedek yazıldı: ${path}`)
                      void window.astro.backup.reveal(path)
                    }
                  }}
                >
                  Şimdi yedekle
                </button>
                <span className="muted small">{backupMsg || 'Geri yüklemek için: Dosya → İçe aktar ile yedek dosyasını seçin.'}</span>
              </div>
            </fieldset>
            <fieldset>
              <legend>Varsayılan konum (Bugün haritası ve transit yeri)</legend>
              <PlaceSearch
                value={s.defaultPlace}
                onChange={(p) => setS({ ...s, defaultPlace: p, defaultZone: p.zone ?? s.defaultZone })}
              />
            </fieldset>
          </div>
        )}

        <div className="actions">
          <button onClick={onClose}>Vazgeç</button>
          <button className="primary" onClick={() => void save()}>
            Kaydet
          </button>
        </div>
      </div>
    </div>
  )
}
