import { LOCALES } from '@shared/i18n'
import { t } from '../lib/i18n'
import { useEffect, useState } from 'react'
import { PROVIDERS } from '@shared/defaults'
import type { AppSettings, ProviderId, ProviderStatus } from '@shared/types'
import { acceptTerms, termsAccepted, TermsCheckbox } from './TermsAck'

/** First-run guide: language and theme, the first chart, the AI interpreter. */
export default function Onboarding({
  hidden = false,
  settings,
  onSettings,
  onAddPerson,
  onDone
}: {
  hidden?: boolean
  settings: AppSettings
  onSettings: (s: AppSettings) => void
  onAddPerson: () => void
  onDone: () => void
}) {
  const [step, setStep] = useState(0)
  const [statuses, setStatuses] = useState<ProviderStatus[] | null>(null)
  useEffect(() => {
    if (step === 2 && !statuses) void window.astro.ai.detect().then(setStatuses)
  }, [step, statuses])

  const agreed = termsAccepted(settings)
  const setProvider = (id: ProviderId) => onSettings({ ...settings, ai: { ...settings.ai, provider: id } })
  const steps = [t('Hoş geldiniz'), t('İlk harita'), t('Yapay zekâ'), t('Hazır')]

  return (
    <div className="modal-back" style={hidden ? { display: 'none' } : undefined}>
      <div className="modal onboarding" role="dialog" aria-label={t('Hoş geldiniz')}>
        <div className="ob-steps">
          {steps.map((s, i) => (
            <span key={s} className={i === step ? 'on' : i < step ? 'done' : ''}>
              {s}
            </span>
          ))}
        </div>

        {step === 0 && (
          <section className="ob-body">
            <h2>{t('AstroFree’ye hoş geldiniz')}</h2>
            <p>{t('Doğum haritaları, transitler, progresyonlar ve gökyüzü olayları; Swiss Ephemeris doğruluğunda, internetsiz. Haritalarınızı Claude, Codex, Gemini veya DeepSeek ile yorumlatabilirsiniz.')}</p>
            <div className="ob-row">
              <label>
                {t('Arayüz dili')}
                <select
                  value={settings.uiLanguage}
                  onChange={(e) => {
                    const lang = e.target.value
                    try {
                      localStorage.setItem('astrofree:lang-picked', '1')
                    } catch {
                      /* storage unavailable */
                    }
                    onSettings({ ...settings, uiLanguage: lang, ai: { ...settings.ai, language: lang } })
                  }}
                >
                  {LOCALES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t('Tema')}
                <select value={settings.theme} onChange={(e) => onSettings({ ...settings, theme: e.target.value as AppSettings['theme'] })}>
                  <option value="system">{t('Sistem')}</option>
                  <option value="light">{t('Açık')}</option>
                  <option value="dark">{t('Koyu')}</option>
                </select>
              </label>
            </div>
            <TermsCheckbox
              checked={agreed}
              onChange={(v) => onSettings(v ? acceptTerms(settings) : { ...settings, termsAccepted: undefined, termsAcceptedAt: undefined })}
            />
          </section>
        )}

        {step === 1 && (
          <section className="ob-body">
            <h2>{t('İlk haritanızı ekleyin')}</h2>
            <p>{t('Kendi doğum bilgilerinizle başlayın: tarih, saat ve doğum yeri. Saatinizi bilmiyorsanız da ekleyebilirsiniz.')}</p>
            <p className="muted">{t('Başka bir programda haritalarınız varsa Dosya → İçe aktar ile AAF veya CSV dosyalarını alabilirsiniz.')}</p>
            <button
              className="primary"
              onClick={() => {
                onAddPerson()
                setStep(2)
              }}
            >
              {t('Kişi ekle')}
            </button>
          </section>
        )}

        {step === 2 && (
          <section className="ob-body">
            <h2>{t('Yorumlar için bir yapay zekâ seçin')}</h2>
            <p>{t('Bilgisayarınızda kurulu bir AI aracı varsa onu kullanabilirsiniz; ek bir anahtar gerekmez. Sonra Ayarlar’dan değiştirebilirsiniz.')}</p>
            {!statuses && <p className="muted">{t('Kontrol ediliyor…')}</p>}
            {statuses && (
              <div className="ob-providers">
                {PROVIDERS.map((p) => {
                  const st = statuses.find((x) => x.id === p.id)
                  return (
                    <button key={p.id} className={`ob-provider ${settings.ai.provider === p.id ? 'selected' : ''}`} onClick={() => setProvider(p.id)}>
                      <span className="ob-pname">{p.label}</span>
                      <span className={st?.available ? 'ob-ok small' : 'muted small'}>
                        {st?.available ? (p.kind === 'cli' ? t('Kurulu') : t('Anahtar kayıtlı')) : p.kind === 'cli' ? t('Bulunamadı') : t('Anahtar gerekli')}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {step === 3 && (
          <section className="ob-body">
            <h2>{t('Her şey hazır')}</h2>
            <ul className="ob-tips">
              <li>{t('Soldaki listeden bir kişiye tıklayın; Transit, Progresyon ve diğer katmanlar üst çubukta.')}</li>
              <li>{t('Zamanı ← → tuşlarıyla veya Alt + tekerlekle ilerletin; “Canlı” şu anı takip eder.')}</li>
              <li>{t('Çarktaki bir gezegene tıklayıp “Yorumla” deyin; sağdaki sohbet haritayı bilir.')}</li>
              <li>{t('Tüm kısayollar için ? tuşuna basın.')}</li>
            </ul>
          </section>
        )}

        <footer className="actions">
          <button className="link" disabled={!agreed} onClick={onDone} title={agreed ? undefined : t('Önce lisans bildirimini onaylayın')}>
            {t('Atla')}
          </button>
          <span className="grow" />
          {step > 0 && <button onClick={() => setStep(step - 1)}>{t('Geri')}</button>}
          {step < 3 ? (
            <button className="primary" disabled={!agreed} onClick={() => setStep(step + 1)} title={agreed ? undefined : t('Önce lisans bildirimini onaylayın')}>
              {t('Devam')}
            </button>
          ) : (
            <button className="primary" onClick={onDone}>
              {t('Başla')}
            </button>
          )}
        </footer>
      </div>
    </div>
  )
}
