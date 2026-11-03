import { t } from '../lib/i18n'
import type { LocalDateTime } from '@shared/types'
import type { StepUnit } from '../lib/time'
import DateTimeField from './DateTimeField'

export const STEPS: { unit: StepUnit; n: number; label: string }[] = [
  { unit: 'min', n: 1, label: '1 dk' },
  { unit: 'min', n: 5, label: '5 dk' },
  { unit: 'min', n: 15, label: '15 dk' },
  { unit: 'hour', n: 1, label: '1 saat' },
  { unit: 'day', n: 1, label: '1 gün' },
  { unit: 'week', n: 1, label: '1 hafta' },
  { unit: 'month', n: 1, label: '1 ay' },
  { unit: 'year', n: 1, label: '1 yıl' }
]


interface Props {
  local: LocalDateTime
  tzText: string
  target: 'event' | 'natal'
  canTargetEvent: boolean
  onTarget: (t: 'event' | 'natal') => void
  stepIndex: number
  onStepIndex: (i: number) => void
  onStep: (dir: number, unit?: StepUnit, n?: number) => void
  onSetLocal: (l: LocalDateTime) => void
  onNow: () => void
  live: boolean
  onLive: (v: boolean) => void
  playing: boolean
  onPlaying: (v: boolean) => void
  speed: number
  onSpeed: (v: number) => void
}

export default function TimeControls(p: Props) {
  const step = STEPS[p.stepIndex]
  return (
    <div className="timebar">
      <div className="seg">
        <button className={p.target === 'event' ? 'on' : ''} disabled={!p.canTargetEvent} onClick={() => p.onTarget('event')} title={t('Transit/progresyon zamanını oynat')}>
          {t('Olay zamanı')}
        </button>
        <button className={p.target === 'natal' ? 'on' : ''} onClick={() => p.onTarget('natal')} title={t('Doğum zamanını oynat (rektifikasyon)')}>
          {t('Doğum zamanı')}
        </button>
      </div>

      <div className="steps">
        <button onClick={() => p.onStep(-1, 'year', 1)} title={t('−1 yıl')}>
          {t('−Y')}
        </button>
        <button onClick={() => p.onStep(-1, 'month', 1)} title={t('−1 ay')}>
          {t('−A')}
        </button>
        <button onClick={() => p.onStep(-1, 'day', 1)} title={t('−1 gün')}>
          {t('−G')}
        </button>
        <button onClick={() => p.onStep(-1, 'hour', 1)} title={t('−1 saat')}>
          {t('−S')}
        </button>
        <button onClick={() => p.onStep(-1, 'min', 1)} title={t('−1 dakika')}>
          {t('−dk')}
        </button>
        <button className="big" onClick={() => p.onStep(-1)} title={`−${t(step.label)} (←)`}>
          ◀
        </button>
        <DateTimeField className="dtf-bar" seconds value={p.local} onChange={p.onSetLocal} />
        <button className="big" onClick={() => p.onStep(1)} title={`+${t(step.label)} (→)`}>
          ▶
        </button>
        <button onClick={() => p.onStep(1, 'min', 1)} title={t('+1 dakika')}>
          {t('+dk')}
        </button>
        <button onClick={() => p.onStep(1, 'hour', 1)} title={t('+1 saat')}>
          {t('+S')}
        </button>
        <button onClick={() => p.onStep(1, 'day', 1)} title={t('+1 gün')}>
          {t('+G')}
        </button>
        <button onClick={() => p.onStep(1, 'month', 1)} title={t('+1 ay')}>
          {t('+A')}
        </button>
        <button onClick={() => p.onStep(1, 'year', 1)} title={t('+1 yıl')}>
          {t('+Y')}
        </button>
      </div>
      <span className="muted small tz">{p.tzText}</span>

      <label className="inline">
        {t('Adım')}
        <select value={p.stepIndex} onChange={(e) => p.onStepIndex(Number(e.target.value))}>
          {STEPS.map((s, i) => (
            <option key={i} value={i}>
              {t(s.label)}
            </option>
          ))}
        </select>
      </label>
      <button className={p.playing ? 'on' : ''} onClick={() => p.onPlaying(!p.playing)} title={t('Animasyon (boşluk tuşu)')}>
        {p.playing ? `❚❚ ${t('Durdur')}` : `▶ ${t('Oynat')}`}
      </button>
      <input
        type="range"
        min={1}
        max={30}
        value={p.speed}
        onChange={(e) => p.onSpeed(Number(e.target.value))}
        title={t('Animasyon hızı (adım/saniye)')}
        className="speed"
      />
      <button onClick={p.onNow} title={t('Şimdiki zaman (N)')}>
        {t('Şimdi')}
      </button>
      <label className="inline" title={t('Zamanı gerçek saate kilitle (olay zamanı veya Şu An haritası)')}>
        <input type="checkbox" checked={p.live} onChange={(e) => p.onLive(e.target.checked)} />
        {t('Canlı')}
      </label>
    </div>
  )
}
