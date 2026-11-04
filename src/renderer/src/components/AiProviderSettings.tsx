import { t } from '../lib/i18n'
import { useState } from 'react'
import { LOCAL_PRESETS } from '@shared/defaults'
import type { ProviderConfig, ProviderId } from '@shared/types'

type Patch = (patch: Partial<ProviderConfig>) => void

/** Split a base URL into the parts the form edits; anything unparsable stays as the raw string. */
function parts(url: string): { https: boolean; host: string; port: string; path: string } | null {
  try {
    const u = new URL(url)
    return { https: u.protocol === 'https:', host: u.hostname, port: u.port, path: u.pathname.replace(/\/+$/, '') }
  } catch {
    return null
  }
}

const join = (p: { https: boolean; host: string; port: string; path: string }) =>
  `${p.https ? 'https' : 'http'}://${p.host || 'localhost'}${p.port ? ':' + p.port : ''}${p.path ? (p.path.startsWith('/') ? p.path : '/' + p.path) : ''}`

const num = (v: string): number | undefined => (v.trim() === '' || Number.isNaN(Number(v)) ? undefined : Number(v))

/** Address, key, model discovery for an OpenAI-compatible local or custom server. */
export function LocalServerSettings({
  cfg,
  apiKey,
  hasKey,
  onKey,
  onChange
}: {
  cfg: ProviderConfig
  apiKey: string
  hasKey: boolean
  onKey: (k: string) => void
  onChange: Patch
}) {
  const [models, setModels] = useState<string[] | null>(null)
  const [probe, setProbe] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const p = parts(cfg.baseUrl ?? '')
  const preset = LOCAL_PRESETS.find((x) => x.id === (cfg.preset ?? 'custom')) ?? LOCAL_PRESETS[LOCAL_PRESETS.length - 1]
  const setPart = (patch: Partial<NonNullable<typeof p>>) =>
    onChange({ baseUrl: join({ ...(p ?? { https: false, host: 'localhost', port: '', path: '/v1' }), ...patch }), preset: 'custom' })

  const test = async () => {
    setBusy(true)
    setProbe(null)
    const r = await window.astro.ai.models(cfg.baseUrl ?? '', apiKey.trim() || null, cfg.headers)
    setBusy(false)
    if (r.error) return setProbe({ ok: false, text: r.error })
    setModels(r.models ?? [])
    setProbe({ ok: true, text: r.models?.length ? t('Bağlantı başarılı · {n} model bulundu', { n: r.models.length }) : t('Bağlantı başarılı ama sunucu model listesi vermedi; model adını elle yazın.') })
    if (!cfg.model && r.models?.length) onChange({ model: r.models[0] })
  }

  return (
    <div className="local-server">
      <div className="ls-grid">
        <label>
          {t('Sunucu türü')}
          <select
            value={preset.id}
            onChange={(e) => {
              const pr = LOCAL_PRESETS.find((x) => x.id === e.target.value)!
              onChange({ preset: pr.id, ...(pr.url ? { baseUrl: pr.url } : {}) })
              setModels(null)
              setProbe(null)
            }}
          >
            {LOCAL_PRESETS.map((x) => (
              <option key={x.id} value={x.id}>
                {t(x.label)}
              </option>
            ))}
          </select>
          <span className="muted small">{t(preset.hint)}</span>
        </label>

        <label className="ls-url">
          {t('Adres (Base URL)')}
          <input
            spellCheck={false}
            value={cfg.baseUrl ?? ''}
            placeholder="http://localhost:11434/v1"
            onChange={(e) => onChange({ baseUrl: e.target.value.trim(), preset: LOCAL_PRESETS.find((x) => x.url === e.target.value.trim())?.id ?? 'custom' })}
          />
        </label>
      </div>

      {p && (
        <div className="ls-parts">
          <label className="inline">
            <input type="checkbox" checked={p.https} onChange={(e) => setPart({ https: e.target.checked })} /> HTTPS
          </label>
          <label>
            {t('Sunucu')}
            <input spellCheck={false} value={p.host} placeholder="localhost / 192.168.1.20" onChange={(e) => setPart({ host: e.target.value.trim() })} />
          </label>
          <label className="ls-port">
            {t('Port')}
            <input inputMode="numeric" value={p.port} placeholder={p.https ? '443' : '80'} onChange={(e) => setPart({ port: e.target.value.replace(/\D/g, '').slice(0, 5) })} />
          </label>
          <label className="ls-path">
            {t('Yol')}
            <input spellCheck={false} value={p.path} placeholder="/v1" onChange={(e) => setPart({ path: e.target.value.trim() })} />
          </label>
        </div>
      )}
      {!p && cfg.baseUrl && <div className="error small">{t('Adres geçerli bir URL değil (ör. http://localhost:11434/v1).')}</div>}

      <div className="ls-grid">
        <label>
          {t('API anahtarı (isteğe bağlı)')} {hasKey ? `(${t('kayıtlı')})` : ''}
          <input
            type="password"
            placeholder={hasKey ? `•••••••• (${t('değiştirmek için yazın')})` : t('ör. LiteLLM master key')}
            value={apiKey}
            onChange={(e) => onKey(e.target.value)}
          />
        </label>
        <label>
          {t('Model')}
          <input list="local-models" spellCheck={false} value={cfg.model} placeholder={t('ör. qwen3:8b')} onChange={(e) => onChange({ model: e.target.value })} />
          <datalist id="local-models">
            {(models ?? []).map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </label>
      </div>

      <div className="ls-test">
        <button disabled={busy || !p} onClick={() => void test()}>
          {busy ? t('Bağlanıyor…') : t('Bağlantıyı test et ve modelleri getir')}
        </button>
        {probe && <span className={probe.ok ? 'ls-ok small' : 'error small'}>{probe.text}</span>}
      </div>
      {models && models.length > 0 && (
        <div className="ls-models">
          {models.map((m) => (
            <button key={m} className={`chip-sign${cfg.model === m ? ' on' : ''}`} onClick={() => onChange({ model: m })}>
              {m}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Generation and connection options shared by all HTTP providers. */
export function AdvancedApiSettings({ id, cfg, onChange }: { id: ProviderId; cfg: ProviderConfig; onChange: Patch }) {
  const openaiLike = id === 'openai' || id === 'deepseek' || id === 'local'
  const [open, setOpen] = useState(id === 'local')
  return (
    <details className="adv" open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary>{t('Gelişmiş')}</summary>
      <div className="adv-grid">
        <label>
          {t('Sıcaklık')}
          <input type="number" min={0} max={2} step={0.1} value={cfg.temperature ?? ''} placeholder={t('sunucu varsayılanı')} onChange={(e) => onChange({ temperature: num(e.target.value) })} />
          <span className="muted small">{t('0 tutarlı, 1 ve üstü daha yaratıcı yanıtlar.')}</span>
        </label>
        <label>
          {t('En fazla yanıt (token)')}
          <input type="number" min={64} step={256} value={cfg.maxTokens ?? ''} placeholder={t('varsayılan')} onChange={(e) => onChange({ maxTokens: num(e.target.value) })} />
        </label>
        <label>
          {t('Zaman aşımı (saniye)')}
          <input type="number" min={10} step={10} value={cfg.timeoutSec ?? ''} placeholder={id === 'local' ? '300' : '180'} onChange={(e) => onChange({ timeoutSec: num(e.target.value) })} />
        </label>
        <label>
          {t('Gönderilen veri sınırı (karakter)')}
          <input type="number" min={2000} step={1000} value={cfg.contextLimit ?? ''} placeholder={t('sınırsız')} onChange={(e) => onChange({ contextLimit: num(e.target.value) })} />
          <span className="muted small">{t('Bağlam penceresi küçük modellerde harita ve bilgi bankası verisini kısaltır (ör. 8k bağlam için 12000).')}</span>
        </label>
      </div>
      {openaiLike && (
        <>
          <label className="inline">
            <input type="checkbox" checked={!!cfg.hideThinking} onChange={(e) => onChange({ hideThinking: e.target.checked })} />{' '}
            {t('Düşünme bloklarını gizle (<think>…</think>; Qwen, DeepSeek-R1 vb.)')}
          </label>
          <label>
            {t('Ek HTTP başlıkları (her satıra bir tane: Ad: değer)')}
            <textarea rows={2} spellCheck={false} value={cfg.headers ?? ''} placeholder="X-Api-Key: …" onChange={(e) => onChange({ headers: e.target.value })} />
            <span className="muted small">{t('Başlıklar ayarlarda düz metin saklanır; gizli anahtarlar için yukarıdaki şifreli API anahtarı alanını kullanın.')}</span>
          </label>
        </>
      )}
    </details>
  )
}

/** "Test key" for a cloud API provider: lists its models, so a wrong key, no credit or a blocked network shows up here, not mid-chat. */
export function ApiKeyTest({ id, cfg, apiKey, hasKey, onChange }: { id: ProviderId; cfg: ProviderConfig; apiKey: string; hasKey: boolean; onChange: Patch }) {
  const [busy, setBusy] = useState(false)
  const [res, setRes] = useState<{ ok: boolean; text: string; models?: string[] } | null>(null)
  const test = async () => {
    setBusy(true)
    setRes(null)
    const r = await window.astro.ai.testKey(id, apiKey.trim() || null, cfg.baseUrl, cfg.headers)
    setBusy(false)
    if (r.error) return setRes({ ok: false, text: r.error })
    setRes({ ok: true, text: t('Anahtar çalışıyor · {n} model', { n: r.models?.length ?? 0 }), models: r.models })
  }
  return (
    <>
      <div className="ls-test">
        <button disabled={busy || (!hasKey && !apiKey.trim())} onClick={() => void test()}>
          {busy ? t('Bağlanıyor…') : t('Anahtarı test et')}
        </button>
        {res && <span className={res.ok ? 'ls-ok small' : 'error small pre-line'}>{res.text}</span>}
      </div>
      {res?.ok && !!res.models?.length && (
        <div className="ls-models">
          {res.models.slice(0, 24).map((m) => (
            <button key={m} className={`chip-sign${cfg.model === m ? ' on' : ''}`} onClick={() => onChange({ model: m })}>
              {m}
            </button>
          ))}
        </div>
      )}
    </>
  )
}
