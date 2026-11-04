import { getLang, t } from '../lib/i18n'
import { useState } from 'react'

type Os = 'win' | 'mac' | 'linux'
const currentOs = (): Os => (/Windows/i.test(navigator.userAgent) ? 'win' : /Mac/i.test(navigator.userAgent) ? 'mac' : 'linux')

const guideUrl = () => `https://github.com/canerkoroglu/astrofree/blob/main/docs/${getLang() === 'tr' ? '' : 'en/'}ai-setup.md`

function Cmd({ children }: { children: string }) {
  const [done, setDone] = useState(false)
  return (
    <div className="guide-cmd">
      <code>{children}</code>
      <button
        className="ghost small"
        onClick={() =>
          void navigator.clipboard.writeText(children).then(() => {
            setDone(true)
            setTimeout(() => setDone(false), 1500)
          })
        }
      >
        {done ? t('Kopyalandı') : t('Kopyala')}
      </button>
    </div>
  )
}

/** Step-by-step help for connecting an AI provider, opened when none is reachable. */
export default function AiSetupGuide({ onClose, onRecheck }: { onClose: () => void; onRecheck?: () => void }) {
  const [os, setOs] = useState<Os>(currentOs)
  const terminal = os === 'win' ? 'PowerShell' : 'Terminal'
  const which = os === 'win' ? 'where.exe claude codex' : 'which claude codex'
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal wide ai-guide" role="dialog" aria-modal="true" aria-label={t('Yapay zekâ bağlantı rehberi')} onClick={(e) => e.stopPropagation()}>
        <h2>{t('Yapay zekâ bağlantı rehberi')}</h2>
        <p className="muted">
          {t('AstroFree’de kendi yapay zekâ modeli yok; bilgisayarınızdaki bir yapay zekâ aracına, bir API anahtarına ya da yerel bir model sunucusuna bağlanır. Size uyan yollardan birini seçin.')}
        </p>
        <div className="seg" role="tablist">
          {(
            [
              ['win', 'Windows'],
              ['mac', 'macOS'],
              ['linux', 'Linux']
            ] as const
          ).map(([id, label]) => (
            <button key={id} role="tab" aria-selected={os === id} className={os === id ? 'on' : ''} onClick={() => setOs(id)}>
              {label}
            </button>
          ))}
        </div>

        <section>
          <h3>{t('1. Claude aboneliğiyle (Claude Code)')}</h3>
          <p className="guide-note">
            {t('Claude masaüstü uygulaması ya da claude.ai tek başına yetmez: AstroFree, Claude Code adlı komut satırı aracını (`claude` komutu) kullanır. Aynı Claude hesabıyla çalışır, ayrıca kurulması gerekir.')}
          </p>
          <ol>
            <li>
              {t('{app} açın ve şu komutu çalıştırın:', { app: terminal })}
              {os === 'win' ? <Cmd>irm https://claude.ai/install.ps1 | iex</Cmd> : <Cmd>curl -fsSL https://claude.ai/install.sh | bash</Cmd>}
              <span className="muted small">
                {t('Node.js kuruluysa bunun yerine şu da olur:')} <code>npm install -g @anthropic-ai/claude-code</code>
              </span>
              {os === 'win' && <span className="muted small">{t('Windows’ta Claude Code, Git for Windows (Git Bash) da isteyebilir; kurulum sırasında uyarı görürseniz git-scm.com adresinden kurun.')}</span>}
            </li>
            <li>
              {t('Yeni bir {app} penceresinde bir kez çalıştırıp Claude hesabınızla giriş yapın:', { app: terminal })}
              <Cmd>claude</Cmd>
            </li>
            <li>{t('AstroFree’ye dönüp “Tekrar kontrol et”e basın.')}</li>
          </ol>
        </section>

        <section>
          <h3>{t('2. ChatGPT hesabıyla (Codex)')}</h3>
          <p className="guide-note">{t('ChatGPT uygulaması tek başına yetmez: AstroFree, Codex CLI adlı komut satırı aracını (`codex` komutu) kullanır.')}</p>
          <ol>
            <li>
              {t('Node.js kuruluyken:')}
              <Cmd>npm install -g @openai/codex</Cmd>
            </li>
            <li>
              {t('Giriş yapın:')}
              <Cmd>codex login</Cmd>
            </li>
          </ol>
        </section>

        <section>
          <h3>{t('3. API anahtarıyla')}</h3>
          <p>
            {t('Anthropic, OpenAI, Google Gemini ya da DeepSeek sitesinden bir API anahtarı alın ve Ayarlar → Yapay zekâ bölümünde ilgili sağlayıcıya girin. Kurulum gerekmez; kullanım ücretini sağlayıcı ayrıca faturalar.')}
          </p>
          <ul>
            <li>{t('API kullanımı, Claude Pro veya ChatGPT Plus aboneliğine dahil değildir; sağlayıcının geliştirici panelinde ayrıca ödeme yöntemi ya da kredi gerekir.')}</li>
            <li>{t('Anahtarı girdikten sonra “Anahtarı test et”e basın: anahtar yanlışsa, bakiye yoksa ya da ağ engelliyorsa orada görürsünüz.')}</li>
          </ul>
        </section>

        <section>
          <h3>{t('4. Kendi bilgisayarınızda yerel model')}</h3>
          <p>
            {t('Ollama’yı (ollama.com) kurun, bir model indirin ve Ayarlar → Yapay zekâ → Yerel sunucu bölümünde “Bağlantıyı test et”e basın. İnternet ve hesap gerekmez; güçlü bir bilgisayar gerekir.')}
          </p>
          <Cmd>ollama pull qwen3:8b</Cmd>
          <ul>
            <li>{t('LM Studio’da Developer sekmesinden sunucuyu başlatmayı unutmayın; llama.cpp için llama-server çalışıyor olmalı.')}</li>
            <li>{t('Sunucu başka bir bilgisayardaysa, orada ağdan erişime açın (Ollama: OLLAMA_HOST=0.0.0.0) ve güvenlik duvarında portu açın.')}</li>
          </ul>
        </section>

        <section>
          <h3>{t('Kurduğum halde “bulunamadı” diyor')}</h3>
          <ul>
            <li>{t('AstroFree’yi tamamen kapatıp yeniden açın; yeni kurulan programlar bazen ancak böyle görünür.')}</li>
            <li>
              {t('{app} içinde komutun yerini öğrenin ve çıkan yolu Ayarlar → Yapay zekâ → ilgili araç (Claude Code / Codex) → “Komut / yol” alanına yapıştırın:', { app: terminal })}
              <Cmd>{which}</Cmd>
            </li>
            {os === 'win' && <li>{t('Claude Code’u WSL (Linux alt sistemi) içine kurduysanız Windows programları onu göremez; Windows’a ayrıca kurun.')}</li>}
            <li>{t('Komut çalışıyor ama yanıt gelmiyorsa bir kez terminalde çalıştırıp giriş yaptığınızdan emin olun.')}</li>
            <li>{t('Şirket bilgisayarında proxy ya da güvenlik yazılımı bağlantıyı engelleyebilir; hata mesajı bunu söylüyorsa API anahtarı ya da yerel model yolunu deneyin.')}</li>
          </ul>
        </section>

        <footer className="actions">
          <a href={guideUrl()} target="_blank" rel="noreferrer" className="small">
            {t('Ayrıntılı rehber (web)')}
          </a>
          <span className="grow" />
          {onRecheck && <button onClick={onRecheck}>{t('Tekrar kontrol et')}</button>}
          <button className="primary" onClick={onClose}>
            {t('Kapat')}
          </button>
        </footer>
      </div>
    </div>
  )
}
