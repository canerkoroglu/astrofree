import { getLocale, LOCALES } from '@shared/i18n'
import { allZones, fmtDate, fmtLocal, fmtOffset, isValidZone, jdToLocal, nowJd, offsetAt, systemZone } from '../lib/time'

const SAMPLE = { y: 2026, m: 1, d: 17 }
import { t } from '../lib/i18n'
import AiSetupGuide from './AiSetupGuide'
import { useEffect, useRef, useState } from 'react'
import Logo from './Logo'
import { AdvancedApiSettings, ApiKeyTest, LocalServerSettings } from './AiProviderSettings'
import { DEFAULT_ASPECTS, PROVIDERS, SYSTEM_PROMPT_EN, SYSTEM_PROMPT_TR } from '@shared/defaults'
import type { AppSettings, AspectKey, ProviderId } from '@shared/types'
import { ASPECTS, AYANAMSAS, HOUSE_SYSTEMS, OPTIONAL_POINTS, POINT, glyph } from '../lib/astro'
import PlaceSearch from './PlaceSearch'

type Tab = 'chart' | 'aspects' | 'ai' | 'general' | 'about'

/** The colour an aspect currently has from the theme, as #rrggbb for the colour picker. */
function themeColor(key: string): string {
  const el = document.createElement('span')
  el.style.color = `var(--asp-${key})`
  document.body.appendChild(el)
  const m = getComputedStyle(el).color.match(/\d+(\.\d+)?/g)
  el.remove()
  if (!m) return '#888888'
  return '#' + m.slice(0, 3).map((v) => Math.round(Number(v)).toString(16).padStart(2, '0')).join('')
}

const WEBSITE = 'https://astrofree.cklabs.tr'
const REPO = 'https://github.com/canerkoroglu/astrofree'

/** Name, version, owner, links and licence (the AGPL "Appropriate Legal Notices"). */
function About() {
  const [version, setVersion] = useState('')
  useEffect(() => {
    void window.astro.info().then((i) => setVersion(i.version))
  }, [])
  return (
    <div className="about">
      <div className="about-head">
        <Logo size={56} className="about-logo" />
        <div>
          <h3>AstroFree</h3>
          <div className="muted">
            {t('Sürüm')} {version} · {t('Ücretsiz ve açık kaynak masaüstü astroloji programı')}
          </div>
        </div>
      </div>
      <dl className="about-list">
        <dt>{t('Web sitesi')}</dt>
        <dd>
          <a href={WEBSITE} target="_blank" rel="noreferrer">
            astrofree.cklabs.tr
          </a>
        </dd>
        <dt>{t('Kaynak kod')}</dt>
        <dd>
          <a href={REPO} target="_blank" rel="noreferrer">
            github.com/canerkoroglu/astrofree
          </a>
        </dd>
        <dt>{t('İletişim')}</dt>
        <dd>
          <a href="mailto:astrofree@cklabs.tr">astrofree@cklabs.tr</a>
        </dd>
        <dt>{t('Lisans')}</dt>
        <dd>
          GNU AGPL-3.0-or-later ·{' '}
          <button className="link" onClick={() => void window.astro.openDoc('LICENSE')}>
            {t('Lisans metni')}
          </button>{' '}
          ·{' '}
          <button className="link" onClick={() => void window.astro.openDoc('NOTICE.md')}>
            {t('Telif ve ek koşullar')}
          </button>{' '}
          ·{' '}
          <button className="link" onClick={() => void window.astro.openDoc('THIRD_PARTY_LICENSES.txt')}>
            {t('Üçüncü taraf lisansları')}
          </button>
        </dd>
      </dl>
      <p className="muted small">
        © 2026 Caner Köroğlu · {WEBSITE}.{' '}
        {t('AstroFree özgür yazılımdır; GNU Affero Genel Kamu Lisansı 3. sürüm veya sonrası koşullarıyla dağıtabilir ve değiştirebilirsiniz. Hiçbir garanti verilmez. Değiştirilmiş sürümler bu bilgiyi korumalı, farklı bir ad ve logo kullanmalıdır.')}
      </p>
      <p className="muted small">
        {t('Astrolojik hesaplar, yorumlar ve yapay zekâ çıktıları kişisel keşif amaçlıdır; tıbbi, hukuki, finansal ya da başka bir profesyonel tavsiye değildir. Web sitesindeki kullanım koşulları resmi sürümler için geçerlidir.')}
      </p>
      <p className="muted small">Swiss Ephemeris © Astrodienst AG · GeoNames (CC BY 4.0) · Open-Meteo (CC BY 4.0) · Natural Earth</p>
    </div>
  )
}

export default function SettingsDialog({
  settings,
  onSave,
  onClose,
  focus
}: {
  settings: AppSettings
  onSave: (s: AppSettings) => void
  onClose: () => void
  /** Open straight at a section, e.g. the time zone settings. */
  focus?: 'zone' | 'about'
}) {
  const [s, setS] = useState<AppSettings>(settings)
  const [guide, setGuide] = useState(false)
  const [tab, setTab] = useState<Tab>(focus === 'zone' ? 'general' : focus === 'about' ? 'about' : 'chart')
  const zoneRef = useRef<HTMLFieldSetElement>(null)
  useEffect(() => {
    if (focus === 'zone') zoneRef.current?.scrollIntoView({ block: 'start' })
  }, [focus])
  const [keys, setKeys] = useState<Record<string, string>>({})
  const [hasKey, setHasKey] = useState<Record<string, boolean>>({})
  const [backupMsg, setBackupMsg] = useState('')
  const [zoneDraft, setZoneDraft] = useState(settings.defaultZone)

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
        <h2>{t('Ayarlar')}</h2>
        <div className="tabs">
          {(
            [
              ['chart', 'Harita'],
              ['aspects', 'Açılar ve orb'],
              ['ai', 'Yapay zekâ'],
              ['general', 'Genel'],
              ['about', 'Hakkında']
            ] as [Tab, string][]
          ).map(([k, label]) => (
            <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
              {t(label)}
            </button>
          ))}
        </div>

        {tab === 'chart' && (
          <div className="form-grid">
            <label>
              {t('Ev sistemi')}
              <select value={s.houseSystem} onChange={(e) => setS({ ...s, houseSystem: e.target.value })}>
                {HOUSE_SYSTEMS.map(([k, n]) => (
                  <option key={k} value={k}>
                    {t(n)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t('Zodyak')}
              <select value={s.zodiac} onChange={(e) => setS({ ...s, zodiac: e.target.value as AppSettings['zodiac'] })}>
                <option value="tropical">{t('Tropikal')}</option>
                <option value="sidereal">{t('Sidereal (Vedik)')}</option>
              </select>
            </label>
            {s.zodiac === 'sidereal' && (
              <label>
                {t('Ayanamsa')}
                <select value={s.sidMode} onChange={(e) => setS({ ...s, sidMode: Number(e.target.value) })}>
                  {AYANAMSAS.map(([k, n]) => (
                    <option key={k} value={k}>
                      {t(n)}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label>
              {t('Ay düğümü')}
              <select value={s.nodeType} onChange={(e) => setS({ ...s, nodeType: e.target.value as 'mean' | 'true' })}>
                <option value="mean">{t('Ortalama')}</option>
                <option value="true">{t('Gerçek')}</option>
              </select>
            </label>
            <label>
              {t('Lilith')}
              <select value={s.lilithType} onChange={(e) => setS({ ...s, lilithType: e.target.value as 'mean' | 'true' })}>
                <option value="mean">{t('Ortalama')}</option>
                <option value="true">{t('Oskülasyon (gerçek)')}</option>
              </select>
            </label>
            <label>
              {t('Çark yönü')}
              <select value={s.orientation} onChange={(e) => setS({ ...s, orientation: e.target.value as 'asc' | 'aries' })}>
                <option value="asc">{t('Yükselen solda')}</option>
                <option value="aries">{t('0° Koç solda')}</option>
              </select>
            </label>
            <label>
              {t('Progres açılar (ASC/MC)')}
              <select
                value={s.progressedAngles}
                onChange={(e) => setS({ ...s, progressedAngles: e.target.value as AppSettings['progressedAngles'] })}
              >
                <option value="naibod">{t('Naibod (RA)')}</option>
                <option value="solarArc">{t('Solar ark')}</option>
              </select>
            </label>
            <label>
              {t('Dönüş haritası yeri')}
              <select value={s.returnPlace} onChange={(e) => setS({ ...s, returnPlace: e.target.value as AppSettings['returnPlace'] })}>
                <option value="natal">{t('Doğum yeri')}</option>
                <option value="current">{t('Varsayılan konum (bulunduğunuz yer)')}</option>
              </select>
            </label>
            <fieldset className="span2">
              <legend>{t('Ek noktalar')}</legend>
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
                  <th>{t('Açı')}</th>
                  <th>{t('Açık')}</th>
                  <th>{t('Natal orb (°)')}</th>
                  <th>{t('Transit/progresyon orb (°)')}</th>
                  <th>{t('Renk')}</th>
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
                    <td>
                      <span className="asp-color">
                        <input
                          type="color"
                          aria-label={t('{aspect} rengi', { aspect: a.name })}
                          value={s.aspectColors[a.key] ?? themeColor(a.key)}
                          onChange={(e) => setS({ ...s, aspectColors: { ...s.aspectColors, [a.key]: e.target.value } })}
                        />
                        <span className={`glyph asp-preview`} style={{ color: s.aspectColors[a.key] ?? `var(--asp-${a.key})` }}>
                          {a.glyph}
                        </span>
                        {s.aspectColors[a.key] && (
                          <button
                            className="link small"
                            onClick={() => {
                              const rest = { ...s.aspectColors }
                              delete rest[a.key]
                              setS({ ...s, aspectColors: rest })
                            }}
                          >
                            {t('Varsayılan')}
                          </button>
                        )}
                      </span>
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
                {t('Çift çarkta natal açıları da çiz')}
              </label>
              <button onClick={() => setS({ ...s, aspects: structuredClone(DEFAULT_ASPECTS) })}>{t('Varsayılan orb\'lar')}</button>
              <button disabled={!Object.keys(s.aspectColors).length} onClick={() => setS({ ...s, aspectColors: {} })}>
                {t('Varsayılan renkler')}
              </button>
            </div>
            <p className="muted small">{t('Güneş/Ay için orb ×1.15, düğümler/Chiron ×0.6, asteroitler ×0.5 uygulanır.')}</p>
            <p className="muted small">
              {t('Renkler çarktaki açı çizgilerinde ve tablolardaki açı simgelerinde kullanılır. Değiştirmediğiniz açılar temaya göre ayarlanan varsayılan rengi kullanır; seçtiğiniz renk açık ve koyu temada aynı kalır.')}
            </p>
          </>
        )}

        {tab === 'ai' && (
          <div>
            <p className="ai-guide-link small">
              {t('Claude, ChatGPT, API anahtarı ya da yerel model: hangisini nasıl bağlayacağınızı adım adım görün.')}{' '}
              <button className="link" onClick={() => setGuide(true)}>
                {t('Bağlantı rehberi')}
              </button>
            </p>
            {guide && <AiSetupGuide onClose={() => setGuide(false)} />}
            <div className="form-grid">
              <label>
                {t('Yanıt dili')}
                <select value={s.ai.language} onChange={(e) => setS({ ...s, ai: { ...s.ai, language: e.target.value } })}>
                  {LOCALES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="inline">
              <input type="checkbox" checked={s.ai.useKnowledge} onChange={(e) => setS({ ...s, ai: { ...s.ai, useKnowledge: e.target.checked } })} />{' '}
              {t('Sohbette bilgi bankamı kullan (haritayla ve soruyla eşleşen kayıtlar gönderilir)')}
            </label>
            {PROVIDERS.map((p) => {
              const c = s.ai.providers[p.id]
              return (
                <fieldset key={p.id}>
                  <legend>{p.label}</legend>
                  <div className="muted small">{t(p.hint)}</div>
                  {p.id === 'local' ? (
                    <LocalServerSettings
                      cfg={c}
                      apiKey={keys.local ?? ''}
                      hasKey={!!hasKey.local}
                      onKey={(k) => setKeys({ ...keys, local: k })}
                      onChange={(patch) => setProv('local', patch)}
                    />
                  ) : (
                  <div className="row">
                    {p.kind === 'cli' ? (
                      <>
                        <label>
                          {t('Komut / yol')}
                          <input value={c.command ?? ''} onChange={(e) => setProv(p.id, { command: e.target.value })} />
                        </label>
                        <label>
                          {t('Ek argümanlar')}
                          <input value={c.extraArgs ?? ''} onChange={(e) => setProv(p.id, { extraArgs: e.target.value })} />
                        </label>
                      </>
                    ) : (
                      <>
                        <label>
                          {t('API anahtarı')} {hasKey[p.id] ? `(${t('kayıtlı')})` : ''}
                          <input
                            type="password"
                            placeholder={hasKey[p.id] ? `•••••••• (${t('değiştirmek için yazın')})` : t('anahtar')}
                            value={keys[p.id] ?? ''}
                            onChange={(e) => setKeys({ ...keys, [p.id]: e.target.value })}
                          />
                        </label>
                        <label>
                          {t('Base URL')}
                          <input value={c.baseUrl ?? ''} onChange={(e) => setProv(p.id, { baseUrl: e.target.value })} />
                        </label>
                      </>
                    )}
                    <label className="narrow">
                      {t('Model')}
                      <input value={c.model} placeholder={t('varsayılan')} onChange={(e) => setProv(p.id, { model: e.target.value })} />
                    </label>
                  </div>
                  )}
                  {p.kind === 'api' && p.id !== 'local' && (
                    <ApiKeyTest id={p.id} cfg={c} apiKey={keys[p.id] ?? ''} hasKey={!!hasKey[p.id]} onChange={(patch) => setProv(p.id, patch)} />
                  )}
                  {p.kind === 'api' && <AdvancedApiSettings id={p.id} cfg={c} onChange={(patch) => setProv(p.id, patch)} />}
                </fieldset>
              )
            })}
            <label>
              {t('Sistem talimatı (boş bırakılırsa varsayılan kullanılır)')}
              <textarea
                rows={6}
                value={s.ai.systemPrompt}
                placeholder={s.ai.language === 'en' ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_TR}
                onChange={(e) => setS({ ...s, ai: { ...s.ai, systemPrompt: e.target.value } })}
              />
            </label>
            <p className="muted small">{t('API anahtarları işletim sisteminin anahtar zinciriyle şifrelenip yerel olarak saklanır.')}</p>
          </div>
        )}

        {tab === 'about' && <About />}

        {tab === 'general' && (
          <div>
            <label>
              {t('Arayüz dili')}
              <select
                value={s.uiLanguage}
                onChange={(e) => {
                  const lang = e.target.value
                  setS({ ...s, uiLanguage: lang, ai: { ...s.ai, language: lang } })
                }}
              >
                {LOCALES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </label>
            <fieldset ref={zoneRef} className={focus === 'zone' ? 'focus-flash' : ''}>
              <legend>{t('Saat dilimi ve tarih biçimi')}</legend>
              <div className="muted small">
                {t('Bugün haritası, transitler, gökyüzü olayları ve gezegen saatleri bu saat dilimine göre gösterilir. Doğum haritaları kendi doğum yerinin saat dilimini kullanır.')}
              </div>
              <label className="inline">
                <input
                  type="radio"
                  name="tzmode"
                  checked={s.timezoneMode === 'system'}
                  onChange={async () => {
                    const zone = systemZone()
                    const place = await window.astro.geo.placeForZone(zone)
                    setS({ ...s, timezoneMode: 'system', defaultZone: zone, defaultPlace: place ?? { ...s.defaultPlace, zone } })
                  }}
                />
                {t('Bilgisayarın saat dilimini izle')} <span className="muted small">({systemZone()})</span>
              </label>
              <label className="inline">
                <input type="radio" name="tzmode" checked={s.timezoneMode === 'manual'} onChange={() => setS({ ...s, timezoneMode: 'manual' })} />
                {t('Elle seç')}
              </label>
              {s.timezoneMode === 'manual' && (
                <div className="row">
                  <input
                    list="tz-list"
                    value={zoneDraft}
                    placeholder="Europe/Istanbul"
                    className={isValidZone(zoneDraft) ? '' : 'invalid'}
                    onChange={async (e) => {
                      const z = e.target.value
                      setZoneDraft(z)
                      if (!isValidZone(z) || !allZones().includes(z)) return
                      const place = s.defaultPlace.zone === z ? null : await window.astro.geo.placeForZone(z)
                      setS({ ...s, defaultZone: z, defaultPlace: place ?? { ...s.defaultPlace, zone: z } })
                    }}
                  />
                  <datalist id="tz-list">
                    {allZones().map((z) => (
                      <option key={z} value={z} />
                    ))}
                  </datalist>
                </div>
              )}
              <div className="muted small tz-now">
                {s.defaultZone} · {fmtOffset(offsetAt({ kind: 'zone', zone: s.defaultZone }, nowJd(), 0))} · {t('şu an')}{' '}
                {fmtLocal(jdToLocal(nowJd(), { kind: 'zone', zone: s.defaultZone }, 0)).split(' ')[1]}
              </div>
              <label>
                {t('Tarih biçimi')}
                <select value={s.dateOrder} onChange={(e) => setS({ ...s, dateOrder: e.target.value as AppSettings['dateOrder'] })}>
                  <option value="auto">
                    {t('Dile göre')} ({fmtDate(SAMPLE, getLocale(s.uiLanguage).dateOrder)})
                  </option>
                  <option value="DMY">{fmtDate(SAMPLE, 'DMY')}</option>
                  <option value="MDY">{fmtDate(SAMPLE, 'MDY')}</option>
                  <option value="YMD">{fmtDate(SAMPLE, 'YMD')}</option>
                </select>
              </label>
            </fieldset>
            <label>
              {t('Tema')}
              <select value={s.theme} onChange={(e) => setS({ ...s, theme: e.target.value as AppSettings['theme'] })}>
                <option value="system">{t('Sistem')}</option>
                <option value="light">{t('Açık')}</option>
                <option value="dark">{t('Koyu')}</option>
              </select>
            </label>
            <fieldset>
              <legend>{t('Bildirimler')}</legend>
              <label className="inline">
                <input
                  type="checkbox"
                  checked={s.notifications.enabled}
                  onChange={(e) => setS({ ...s, notifications: { ...s.notifications, enabled: e.target.checked } })}
                />
                {t('Kayıtlı kişilere yaklaşan tam transitler için masaüstü bildirimi (Mars–Plüton, 3 gün önceden)')}
              </label>
              <div className="row">
                <select
                  value={s.notifications.scope}
                  onChange={(e) => setS({ ...s, notifications: { ...s.notifications, scope: e.target.value as 'all' | 'tagged' } })}
                >
                  <option value="all">{t('Tüm kişiler')}</option>
                  <option value="tagged">{t('Yalnızca etiketliler')}</option>
                </select>
                {s.notifications.scope === 'tagged' && (
                  <input
                    value={s.notifications.tag}
                    onChange={(e) => setS({ ...s, notifications: { ...s.notifications, tag: e.target.value.replace(/^#/, '') } })}
                    placeholder={t('takip')}
                    title={t('Bu etiketi taşıyan kişiler')}
                  />
                )}
              </div>
            </fieldset>
            <fieldset>
              <legend>{t('Otomatik yedek')}</legend>
              <div className="muted small">
                {t('Haritalar ve kaydedilmiş yorumlar her değişiklikte seçilen klasöre günlük bir dosya olarak yazılır (son 30 gün tutulur).')}{' '}
                {t('iCloud Drive, Dropbox veya bir USB bellek klasörü seçebilirsiniz.')}
              </div>
              <div className="row">
                <input readOnly value={s.backupDir || t('Kapalı')} style={{ flex: 1 }} />
                <button
                  onClick={async () => {
                    const d = await window.astro.backup.choose()
                    if (d) setS({ ...s, backupDir: d })
                  }}
                >
                  {t('Klasör seç')}
                </button>
                {s.backupDir && <button onClick={() => setS({ ...s, backupDir: '' })}>{t('Kapat')}</button>}
              </div>
              <div className="row">
                <button
                  disabled={!s.backupDir}
                  onClick={async () => {
                    const path = await window.astro.backup.run(s.backupDir)
                    if (path) {
                      setBackupMsg(t('Yedek yazıldı: {path}', { path }))
                      void window.astro.backup.reveal(path)
                    }
                  }}
                >
                  {t('Şimdi yedekle')}
                </button>
                <span className="muted small">{backupMsg || t('Geri yüklemek için: Dosya → İçe aktar ile yedek dosyasını seçin.')}</span>
              </div>
            </fieldset>
            <fieldset>
              <legend>{t('Varsayılan konum (Bugün haritası ve transit yeri)')}</legend>
              <PlaceSearch
                value={s.defaultPlace}
                onChange={(p) => setS({ ...s, defaultPlace: p, defaultZone: p.zone ?? s.defaultZone })}
              />
            </fieldset>
          </div>
        )}

        <div className="actions">
          <button onClick={onClose}>{t('Vazgeç')}</button>
          <button className="primary" onClick={() => void save()}>
            {t('Kaydet')}
          </button>
        </div>
      </div>
    </div>
  )
}
