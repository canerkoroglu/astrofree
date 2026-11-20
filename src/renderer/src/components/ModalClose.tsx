// The × in a dialog's top-right corner; stays in place while the dialog scrolls.
import { t } from '../lib/i18n'

export default function ModalClose({ onClose }: { onClose: () => void }) {
  return (
    <button type="button" className="modal-x" onClick={onClose} aria-label={t('Kapat')} title={t('Kapat (Esc)')}>
      ×
    </button>
  )
}
