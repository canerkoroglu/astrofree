// "Sorun bildir": the user describes the problem, sees exactly what will be
// shared (version, system, recent errors) and opens a GitHub issue or copies it.
// Nothing is sent automatically; no chart or birth data is included.
import { useEffect, useState } from 'react'
import { t } from '../lib/i18n'

export default function ReportDialog({ onClose }: { onClose: () => void }) {
  const [what, setWhat] = useState('')
  const [info, setInfo] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    void window.astro.report.info().then((r) =>
      setInfo(`${r.system}\n\n${t('Son hatalar')}:\n${r.errors || t('(kayıtlı hata yok)')}`)
    )
  }, [])

  const body = () => `${what.trim() || '…'}\n\n---\n\`\`\`\n${info}\n\`\`\``
  const title = () => (what.trim().split('\n')[0] || t('Sorun bildirimi')).slice(0, 90)

  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="modal report-dialog" role="dialog" aria-label={t('Sorun bildir')}>
        <h2>{t('Sorun bildir')}</h2>
        <label>
          {t('Ne oldu? Ne yapıyordunuz?')}
          <textarea
            autoFocus
            rows={5}
            value={what}
            placeholder={t('Örn. Windows’ta “Transit Takvimi”ne tıklayınca pencere boş kalıyor.')}
            onChange={(e) => setWhat(e.target.value)}
          />
        </label>
        <div className="report-public" role="note">
          {t('GitHub kayıtları herkese açıktır ve arama motorlarında görünebilir. Göndermeden önce metni gözden geçirin; kişisel bilgi yazmayın.')}
        </div>
        <details>
          <summary>{t('Eklenecek bilgiler (düzenleyebilirsiniz)')}</summary>
          <textarea className="report-info" rows={8} spellCheck={false} value={info} onChange={(e) => setInfo(e.target.value)} />
        </details>
        <p className="muted small">
          {t('Doğum verileriniz, haritalarınız ve sohbetleriniz eklenmez; kullanıcı adı, klasör yolları, e-posta adresleri ve anahtara benzeyen metinler maskelenir. Hiçbir şey kendiliğinden gönderilmez: “GitHub’da aç” tarayıcıda yeni bir kayıt sayfası açar, siz onaylayınca gönderilir. Herkese açık kayıt istemiyorsanız metni kopyalayıp astrofree@cklabs.tr adresine e-postayla gönderin.')}
        </p>
        <div className="actions">
          <button onClick={onClose}>{t('Kapat')}</button>
          <button
            onClick={() => {
              void navigator.clipboard.writeText(`${title()}\n\n${body()}`)
              setCopied(true)
              setTimeout(() => setCopied(false), 1600)
            }}
          >
            {copied ? t('Kopyalandı') : t('Metni kopyala')}
          </button>
          <button className="primary" onClick={() => void window.astro.report.openIssue(title(), body())}>
            {t('GitHub’da aç')}
          </button>
        </div>
      </div>
    </div>
  )
}
