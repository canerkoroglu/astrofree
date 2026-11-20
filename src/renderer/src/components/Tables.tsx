import { t } from '../lib/i18n'
import { houseText, M } from '../lib/meanings'
import { useMemo, useState } from 'react'
import type { AppSettings } from '@shared/types'
import {
  ASPECTS,
  ASPECT,
  dignity,
  findAspects,
  fmtDecl,
  fmtOrb,
  fmtPos,
  glyph,
  POINT,
  rulerOf,
  splitDeg,
  type Aspect,
  type ChartPoint,
  type Layer
} from '../lib/astro'
import { LAYER_COLOR } from './ChartWheel'


export function PositionsTable({ natal, outers }: { natal: Layer; outers: Layer[] }) {
  const keys = natal.points.map((p) => p.key)
  for (const o of outers) for (const p of o.points) if (!keys.includes(p.key)) keys.push(p.key)
  const find = (l: Layer, k: string) => l.points.find((p) => p.key === k)
  return (
    <table className="data">
      <thead>
        <tr>
          <th />
          <th style={{ color: LAYER_COLOR.natal }}>{natal.label}</th>
          <th>{t('Ev')}</th>
          <th>{t('Hız')}</th>
          <th>{t('Dekl.')}</th>
          {outers.map((o, i) => (
            <th key={i} colSpan={2} style={{ color: LAYER_COLOR[o.kind] }}>
              {t(o.label)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {keys.map((k) => {
          const n = find(natal, k)
          return (
            <tr key={k}>
              <td className="name">
                <span className="glyph">{glyph(k)}</span> {POINT[k]?.name}
              </td>
              <td className="pos">
                {n ? fmtPos(n.lon, true) : ''}
                {n?.retro ? <span className="retro"> ℞</span> : null}
                {n && dignity(k, splitDeg(n.lon).sign) ? <span className="dig"> {t(dignity(k, splitDeg(n.lon).sign))}</span> : null}
              </td>
              <td className="num">{n && !['asc', 'mc'].includes(k) ? n.house : ''}</td>
              <td className="num muted">{n && !['asc', 'mc', 'fortune', 'vertex'].includes(k) ? n.speed.toFixed(3) : ''}</td>
              <td className="num muted">{n && !['asc', 'mc', 'fortune', 'vertex'].includes(k) ? fmtDecl(n.decl) : ''}</td>
              {outers.map((o, i) => {
                const p = find(o, k)
                return [
                  <td key={`${i}p`} className="pos" style={{ color: LAYER_COLOR[o.kind] }}>
                    {p ? fmtPos(p.lon) : ''}
                    {p?.retro ? <span className="retro"> ℞</span> : null}
                  </td>,
                  <td key={`${i}h`} className="num">
                    {p && !['asc', 'mc'].includes(k) ? p.house : ''}
                  </td>
                ]
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export function HousesTable({ natal }: { natal: Layer }) {
  // Short topic always shown; a click on a row opens what the house is about, where its
  // ruler sits and the built-in text for each planet in it.
  const [open, setOpen] = useState<Set<number>>(new Set())
  const toggle = (i: number) => {
    const n = new Set(open)
    if (n.has(i)) n.delete(i)
    else n.add(i)
    setOpen(n)
  }
  const houses = M().houses
  return (
    <table className="data houses-table">
      <colgroup>
        <col className="hc-ev" />
        <col className="hc-topic" />
        <col className="hc-cusp" />
        <col className="hc-ruler" />
        <col className="hc-rh" />
        <col className="hc-in" />
      </colgroup>
      <thead>
        <tr>
          <th>{t('Ev')}</th>
          <th>{t('Konusu')}</th>
          <th>{t('Başlangıç')}</th>
          <th>{t('Yönetici')}</th>
          <th>{t('Yöneticinin evi')}</th>
          <th>{t('İçindekiler')}</th>
        </tr>
      </thead>
      <tbody>
        {natal.cusps.map((c, i) => {
          const ruler = rulerOf(splitDeg(c).sign)
          const rp = natal.points.find((p) => p.key === ruler)
          const inside = natal.points.filter((p) => p.house === i + 1 && !['asc', 'mc'].includes(p.key))
          const isOpen = open.has(i)
          const h = houses[i]
          return [
            <tr key={i} className={`house-row${isOpen ? ' open' : ''}`} onClick={() => toggle(i)}>
              <td className="num">
                <button
                  type="button"
                  className="house-toggle"
                  aria-expanded={isOpen}
                  aria-label={t('{n}. ev', { n: i + 1 })}
                  onClick={(e) => (e.stopPropagation(), toggle(i))}
                >
                  <span className="house-chev" aria-hidden>
                    ›
                  </span>
                  {i + 1}
                </button>
              </td>
              <td className="house-topic">{h?.keywords ?? ''}</td>
              <td className="pos">{fmtPos(c, true)}</td>
              <td>
                <span className="glyph">{glyph(ruler)}</span> {POINT[ruler].name}
              </td>
              <td className="num">{rp?.house ?? ''}</td>
              <td>
                {inside.map((p) => (
                  <span key={p.key} className="glyph" title={POINT[p.key].name}>
                    {glyph(p.key)}{' '}
                  </span>
                ))}
              </td>
            </tr>,
            <tr key={`${i}d`} className={`house-detail${isOpen ? ' open' : ''}`} aria-hidden={!isOpen}>
              <td colSpan={6}>
                <div className="house-slide">
                  <div className="house-slide-in">
                      <p className="house-about">{h?.about}</p>
                      <p className="small">
                        {t('Yöneticisi {planet}, {n}. evde.', { planet: POINT[ruler].name, n: rp?.house ?? '—' })}
                      </p>
                      {inside.length > 0 ? (
                        <ul className="house-in small">
                          {inside.map((p) => {
                            const txt = houseText(p.key, i + 1)
                            return (
                              <li key={p.key}>
                                <span className="glyph">{glyph(p.key)}</span> <strong>{POINT[p.key].name}</strong>
                                {txt ? <> — {txt}</> : null}
                              </li>
                            )
                          })}
                        </ul>
                      ) : (
                        <p className="small muted">{t('Bu evde gezegen yok; konuları daha çok yöneticisi üzerinden okunabilir.')}</p>
                      )}
                      <p className="small muted house-note">{M().disclaimer}</p>
                  </div>
                </div>
              </td>
            </tr>
          ]
        })}
      </tbody>
    </table>
  )
}

function useAspects(natal: Layer, outer: Layer | null, settings: AppSettings) {
  return useMemo(
    () => (outer ? findAspects(outer.points, natal.points, settings, true) : findAspects(natal.points, null, settings, false)),
    [natal, outer, settings]
  )
}

function Cell({ a, cls = '', onEnter }: { a: Aspect | undefined; cls?: string; onEnter?: () => void }) {
  if (!a) return <td className={`cell ${cls}`} onMouseEnter={onEnter} />
  return (
    <td className={`cell asp-k-${a.aspect.key} ${cls}`} onMouseEnter={onEnter} title={`${ASPECT[a.aspect.key].name} · orb ${fmtOrb(a.orb)} · ${a.applying ? t('yaklaşan') : t('ayrılan')}`}>
      <span className="glyph">{a.aspect.glyph}</span>
      <small>
        {fmtOrb(a.orb).replace("'", '')}
        {a.applying ? 'a' : 's'}
      </small>
    </td>
  )
}

export function AspectGrid({ natal, outer, settings }: { natal: Layer; outer: Layer | null; settings: AppSettings }) {
  const aspects = useAspects(natal, outer, settings)
  // Crosshair: the hovered cell's row and column are tinted.
  const [hov, setHov] = useState<{ r: number; c: number } | null>(null)
  const usable = (p: ChartPoint) => POINT[p.key]?.aspects
  const cols = natal.points.filter(usable)
  const rows = (outer ?? natal).points.filter(usable)
  const lookup = new Map<string, Aspect>()
  for (const a of aspects) {
    lookup.set(`${a.a.key}|${a.b.key}`, a)
    if (!outer) lookup.set(`${a.b.key}|${a.a.key}`, a)
  }
  return (
    <table className="grid" onMouseLeave={() => setHov(null)}>
      <thead>
        <tr>
          <th />
          {cols.map((c, ci) => (
            <th key={c.key} title={POINT[c.key].name} className={hov?.c === ci ? 'x-hl' : ''}>
              <span className="glyph">{glyph(c.key)}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, ri) => (
          <tr key={r.key}>
            <th title={POINT[r.key].name} style={outer ? { color: LAYER_COLOR[outer.kind] } : undefined} className={hov?.r === ri ? 'x-hl' : ''}>
              <span className="glyph">{glyph(r.key)}</span>
            </th>
            {cols.map((c, ci) =>
              !outer && ci >= ri ? (
                <td key={c.key} className="cell empty" />
              ) : (
                <Cell
                  key={c.key}
                  a={lookup.get(`${r.key}|${c.key}`)}
                  cls={hov && (hov.r === ri || hov.c === ci) ? (hov.r === ri && hov.c === ci ? 'x-hl x-at' : 'x-hl') : ''}
                  onEnter={() => setHov({ r: ri, c: ci })}
                />
              )
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// i18n-ignore-start (preset names go through t())
const ASPECT_PRESETS: [string, string[] | null][] = [
  ['Tümü', null],
  ['Ana açılar', ['conjunction', 'opposition', 'trine', 'square', 'sextile']],
  ['Zorlayıcı', ['conjunction', 'opposition', 'square', 'semisquare', 'sesquiquadrate']],
  ['Uyumlu', ['conjunction', 'trine', 'sextile']]
]
// i18n-ignore-end

export function AspectList({
  natal,
  outer,
  settings,
  hidden,
  onHidden
}: {
  natal: Layer
  outer: Layer | null
  settings: AppSettings
  /** Aspect kinds whose lines are hidden on the wheel. */
  hidden?: ReadonlySet<string>
  onHidden?: (next: Set<string>) => void
}) {
  const aspects = useAspects(natal, outer, settings)
  const kinds = ASPECTS.filter((d) => settings.aspects[d.key]?.enabled)
  const count = (k: string) => aspects.filter((a) => a.aspect.key === k).length
  const filterBar = hidden && onHidden && (
    <div className="asp-filter">
      <div className="asp-filter-head">
        <strong className="small">{t('Haritada gösterilen açılar')}</strong>
        <span className="grow" />
        {ASPECT_PRESETS.map(([name, keys]) => {
          const on = keys === null ? hidden.size === 0 : kinds.every((d) => keys.includes(d.key) !== hidden.has(d.key))
          return (
            <button
              key={name}
              className={`asp-preset${on ? ' on' : ''}`}
              onClick={() => onHidden(new Set(keys === null ? [] : kinds.map((d) => d.key).filter((k) => !keys.includes(k))))}
            >
              {t(name)}
            </button>
          )
        })}
      </div>
      <div className="asp-chips">
        {kinds.map((d) => {
          const shown = !hidden.has(d.key)
          const n = count(d.key)
          return (
            <button
              key={d.key}
              className={`asp-chip${shown ? ' on' : ''}`}
              aria-pressed={shown}
              onClick={() => {
                const next = new Set(hidden)
                if (shown) next.add(d.key)
                else next.delete(d.key)
                onHidden(next)
              }}
              title={shown ? t('Haritada gizle') : t('Haritada göster')}
            >
              <span className={`glyph asp-k-${d.key}`}>{d.glyph}</span>
              {d.name}
              <span className="asp-count">{n}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
  const pre = outer ? { transit: 'T.', progressed: 'P.', solarArc: 'SA.', synastry: 'S.' }[outer.kind as string] ?? '' : ''
  if (!aspects.length)
    return (
      <>
        {filterBar}
        <p className="muted pad">{t('Seçili orb sınırları içinde açı yok.')}</p>
      </>
    )
  return (
    <>
    {filterBar}
    <table className="data">
      <thead>
        <tr>
          <th>{t('Açı')}</th>
          <th>{t('Orb')}</th>
          <th>{t('Durum')}</th>
        </tr>
      </thead>
      <tbody>
        {aspects.map((a, i) => (
          <tr key={i} className={hidden?.has(a.aspect.key) ? 'asp-hidden' : ''}>
            <td>
              <span className="glyph" style={outer ? { color: LAYER_COLOR[outer.kind] } : undefined}>
                {glyph(a.a.key)}
              </span>{' '}
              {pre}
              {POINT[a.a.key].name} <span className={`glyph asp-k-${a.aspect.key}`}>{a.aspect.glyph}</span> {a.aspect.name}{' '}
              <span className="glyph">{glyph(a.b.key)}</span> {outer ? 'N.' : ''}
              {POINT[a.b.key].name}
            </td>
            <td className="num">{fmtOrb(a.orb)}</td>
            <td className="muted">{a.applying ? t('yaklaşan') : t('ayrılan')}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </>
  )
}
