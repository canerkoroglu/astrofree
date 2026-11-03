import { t } from '../lib/i18n'
import { useMemo } from 'react'
import type { AppSettings } from '@shared/types'
import {
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

const ASPECT_CLASS = { hard: 'asp-hard', soft: 'asp-soft', minor: 'asp-minor' } as const

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
  return (
    <table className="data">
      <thead>
        <tr>
          <th>{t('Ev')}</th>
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
          return (
            <tr key={i}>
              <td className="num">{i + 1}</td>
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
            </tr>
          )
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

function Cell({ a }: { a: Aspect | undefined }) {
  if (!a) return <td className="cell" />
  return (
    <td className={`cell ${ASPECT_CLASS[a.aspect.kind]}`} title={`${ASPECT[a.aspect.key].name} · orb ${fmtOrb(a.orb)} · ${a.applying ? t('yaklaşan') : t('ayrılan')}`}>
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
  const usable = (p: ChartPoint) => POINT[p.key]?.aspects
  const cols = natal.points.filter(usable)
  const rows = (outer ?? natal).points.filter(usable)
  const lookup = new Map<string, Aspect>()
  for (const a of aspects) {
    lookup.set(`${a.a.key}|${a.b.key}`, a)
    if (!outer) lookup.set(`${a.b.key}|${a.a.key}`, a)
  }
  return (
    <table className="grid">
      <thead>
        <tr>
          <th />
          {cols.map((c) => (
            <th key={c.key} title={POINT[c.key].name}>
              <span className="glyph">{glyph(c.key)}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, ri) => (
          <tr key={r.key}>
            <th title={POINT[r.key].name} style={outer ? { color: LAYER_COLOR[outer.kind] } : undefined}>
              <span className="glyph">{glyph(r.key)}</span>
            </th>
            {cols.map((c, ci) =>
              !outer && ci >= ri ? <td key={c.key} className="cell empty" /> : <Cell key={c.key} a={lookup.get(`${r.key}|${c.key}`)} />
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function AspectList({ natal, outer, settings }: { natal: Layer; outer: Layer | null; settings: AppSettings }) {
  const aspects = useAspects(natal, outer, settings)
  const pre = outer ? { transit: 'T.', progressed: 'P.', solarArc: 'SA.', synastry: 'S.' }[outer.kind as string] ?? '' : ''
  if (!aspects.length) return <p className="muted pad">{t('Seçili orb sınırları içinde açı yok.')}</p>
  return (
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
          <tr key={i}>
            <td>
              <span className="glyph" style={outer ? { color: LAYER_COLOR[outer.kind] } : undefined}>
                {glyph(a.a.key)}
              </span>{' '}
              {pre}
              {POINT[a.a.key].name} <span className={`glyph ${ASPECT_CLASS[a.aspect.kind]}`}>{a.aspect.glyph}</span> {a.aspect.name}{' '}
              <span className="glyph">{glyph(a.b.key)}</span> {outer ? 'N.' : ''}
              {POINT[a.b.key].name}
            </td>
            <td className="num">{fmtOrb(a.orb)}</td>
            <td className="muted">{a.applying ? t('yaklaşan') : t('ayrılan')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
