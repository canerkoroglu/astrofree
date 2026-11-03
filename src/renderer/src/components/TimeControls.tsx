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
  const steps = (dir: 1 | -1) => {
    const units: [StepUnit, string, string, string][] = [
      ['year', 'Y', '1 yıl', 'tb-coarse'],
      ['month', 'A', '1 ay', 'tb-coarse'],
      ['day', 'G', '1 gün', 'tb-coarse'],
      ['hour', 'S', '1 saat', 'tb-fine'],
      ['min', 'dk', '1 dakika', 'tb-fine']
    ]
    const list = dir < 0 ? units : [...units].reverse()
    return list.map(([unit, short, label, cls]) => (
      <button key={unit} className={cls} onClick={() => p.onStep(dir, unit, 1)} title={t(dir < 0 ? '−{x}' : '+{x}', { x: t(label) })}>
        {t(dir < 0 ? '−' + short : '+' + short)}
      </button>
    ))
  }
  return (
    <div className="timebar">
      <div className="tb-row">
        <div className="seg tb-mode" role="group" aria-label={t('Oynatılan zaman')}>
          <button className={p.target === 'event' ? 'on' : ''} disabled={!p.canTargetEvent} onClick={() => p.onTarget('event')} title={t('Transit/progresyon zamanını oynat')}>
            {t('Olay')}
          </button>
          <button className={p.target === 'natal' ? 'on' : ''} onClick={() => p.onTarget('natal')} title={t('Doğum zamanını oynat (rektifikasyon)')}>
            {t('Doğum')}
          </button>
        </div>

        <div className="steps tb-group">
          {steps(-1)}
          <button className="big" onClick={() => p.onStep(-1)} title={`−${t(step.label)} (←)`}>
            ◀
          </button>
          <DateTimeField className="dtf-bar" seconds value={p.local} onChange={p.onSetLocal} />
          <button className="big" onClick={() => p.onStep(1)} title={`+${t(step.label)} (→)`}>
            ▶
          </button>
          {steps(1)}
        </div>

        <div className="tb-group">
          <select className="tb-step" value={p.stepIndex} onChange={(e) => p.onStepIndex(Number(e.target.value))} title={t('◀ ▶ ve ← → tuşlarının adım boyu (↑ ↓)')}>
            {STEPS.map((s, i) => (
              <option key={i} value={i}>
                {t('Adım')}: {t(s.label)}
              </option>
            ))}
          </select>
          <button className={`toggle tb-play${p.playing ? ' on' : ''}`} aria-pressed={p.playing} onClick={() => p.onPlaying(!p.playing)} title={t('Animasyon (boşluk tuşu)')}>
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
        </div>

        <div className="tb-group tb-now">
          <button onClick={p.onNow} title={t('Şimdiki zaman (N)')}>
            {t('Şimdi')}
          </button>
          <button
            className={`toggle tb-live${p.live ? ' on' : ''}`}
            aria-pressed={p.live}
            onClick={() => p.onLive(!p.live)}
            title={t('Zamanı gerçek saate kilitle (olay zamanı veya Şu An haritası)')}
          >
            <span className="toggle-dot live" aria-hidden />
            {t('Canlı')}
          </button>
        </div>

      </div>
    </div>
  )
}
