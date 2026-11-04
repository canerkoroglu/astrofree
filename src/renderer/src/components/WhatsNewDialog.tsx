// Shown once after an update: what changed since the version the user last saw.
import type { WhatsNew } from '@shared/whatsnew'
import { getLang, t } from '../lib/i18n'

export default function WhatsNewDialog({ version, notes, onClose }: { version: string; notes: WhatsNew[]; onClose: () => void }) {
  const lang = getLang()
  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="modal whats-new" role="dialog" aria-label={t('Yenilikler')}>
        <h2>{t('AstroFree {v} ile gelen yenilikler', { v: version })}</h2>
        {notes.map((n) => (
          <section key={n.version}>
            {notes.length > 1 && <h3>{n.version}</h3>}
            <ul>
              {(n.items[lang] ?? n.items.en).map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </section>
        ))}
        <div className="actions">
          <button className="primary" autoFocus onClick={onClose}>
            {t('Harika, devam')}
          </button>
        </div>
      </div>
    </div>
  )
}
