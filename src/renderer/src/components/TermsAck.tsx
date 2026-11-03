import { t } from '../lib/i18n'
import { useState } from 'react'
import { TERMS_VERSION } from '@shared/defaults'
import type { AppSettings } from '@shared/types'

export const termsAccepted = (s: AppSettings) => s.termsAccepted === TERMS_VERSION

export const acceptTerms = (s: AppSettings): AppSettings => ({ ...s, termsAccepted: TERMS_VERSION, termsAcceptedAt: new Date().toISOString() })

/**
 * Acknowledgement of the licence notice and disclaimer (NOTICE.md). It restates what the AGPL and its
 * section 7 terms already say; it adds no further restriction on using the program.
 */
export function TermsCheckbox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="terms-ack">
      <label className="terms-check">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span>
          {t(
            'AstroFree’nin GNU AGPL-3.0 lisansı ve ek koşullarıyla, hiçbir garanti verilmeden sunulduğunu; astrolojik yorumların ve yapay zekâ çıktılarının tıbbi, hukuki, finansal ya da başka bir profesyonel tavsiye olmadığını okudum ve kabul ediyorum.'
          )}
        </span>
      </label>
      <div className="terms-links small">
        <button className="link" onClick={() => void window.astro.openDoc('NOTICE.md')}>
          {t('Telif ve ek koşullar')}
        </button>
        <span aria-hidden>·</span>
        <button className="link" onClick={() => void window.astro.openDoc('LICENSE')}>
          {t('Lisans metni')}
        </button>
        <span aria-hidden>·</span>
        <a href="https://astrofree.cklabs.tr" target="_blank" rel="noreferrer">
          astrofree.cklabs.tr
        </a>
      </div>
    </div>
  )
}

/** One-time prompt for people who finished onboarding before the notice existed (or after it changed). */
export default function TermsDialog({ settings, onAccept }: { settings: AppSettings; onAccept: (s: AppSettings) => void }) {
  const [ok, setOk] = useState(false)
  return (
    <div className="modal-back">
      <div className="modal terms-dialog" role="dialog" aria-modal="true" aria-label={t('Lisans ve koşullar')}>
        <h2>{t('Lisans ve koşullar')}</h2>
        <p className="muted">
          {t('AstroFree ücretsiz ve açık kaynaktır. Devam etmeden önce lütfen aşağıdaki bildirimi onaylayın.')}
        </p>
        <TermsCheckbox checked={ok} onChange={setOk} />
        <footer className="actions">
          <span className="grow" />
          <button className="primary" disabled={!ok} onClick={() => onAccept(acceptTerms(settings))}>
            {t('Onayla ve devam et')}
          </button>
        </footer>
      </div>
    </div>
  )
}
