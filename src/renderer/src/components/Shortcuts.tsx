import { t } from '../lib/i18n'

const isMac = navigator.platform.toLowerCase().includes('mac')
const MOD = isMac ? '⌘' : 'Ctrl'
const ALT = isMac ? '⌥' : 'Alt'

const GROUPS: [string, [string, string][]][] = [
  [
    'Zaman',
    [
      ['← →', 'Seçili adım kadar geri / ileri'],
      ['Shift + ← →', '10 adım'],
      ['↑ ↓', 'Adım boyunu değiştir'],
      [`${ALT} + tekerlek`, 'Çarkın üzerinde zamanı ilerlet'],
      ['Boşluk', 'Animasyonu başlat / durdur'],
      ['N', 'Şimdiki zamana git']
    ]
  ],
  [
    'Haritalar',
    [
      [`${MOD} + N`, 'Yeni kişi'],
      [`${MOD} + S`, 'Kaydet'],
      ['Esc', 'Pencereyi kapat'],
      [`${MOD} + Enter`, 'Formu kaydet']
    ]
  ],
  [
    'Çark',
    [
      ['Tıklama (gezegen)', 'Ayrıntı kartı ve “Yorumla”'],
      ['Tıklama (açı çizgisi)', 'Bu açıyı yorumlat'],
      ['Üzerine gelme', 'Hızlı bilgi']
    ]
  ],
  [
    'Sohbet',
    [
      ['Enter', 'Gönder'],
      ['Shift + Enter', 'Yeni satır']
    ]
  ],
  ['Genel', [['?', 'Bu pencere']]]
]

export default function Shortcuts({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="modal shortcuts" role="dialog" aria-label={t('Klavye kısayolları')}>
        <h2>{t('Klavye kısayolları')}</h2>
        <div className="sc-grid">
          {GROUPS.map(([title, rows]) => (
            <section key={title}>
              <h3>{t(title)}</h3>
              <table className="data">
                <tbody>
                  {rows.map(([k, d]) => (
                    <tr key={k}>
                      <td className="sc-key">
                        <kbd>{t(k)}</kbd>
                      </td>
                      <td>{t(d)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
        </div>
        <div className="actions">
          <button className="primary" autoFocus onClick={onClose}>
            {t('Kapat')}
          </button>
        </div>
      </div>
    </div>
  )
}
