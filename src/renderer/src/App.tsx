import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { AppSettings, ChartRecord, Interpretation, LocalDateTime, PlanetaryHours, SkyReport, TransitHit, TzSpec } from '@shared/types'
import ChartEditor from './components/ChartEditor'
import ChartWheel, { LAYER_COLOR } from './components/ChartWheel'
import ChatPanel from './components/ChatPanel'
import Interpretations from './components/Interpretations'
import NatalInfo, { type StarConj } from './components/NatalInfo'
import PrintReport from './components/PrintReport'
import SkyPanel from './components/SkyPanel'
import SettingsDialog from './components/SettingsDialog'
import { AspectGrid, AspectList, HousesTable, PositionsTable } from './components/Tables'
import TimeControls, { STEPS } from './components/TimeControls'
import TransitCalendar, { calendarText } from './components/TransitCalendar'
import { diff180, fmtCoord, HOUSE_SYSTEMS, moonPhase } from './lib/astro'
import { chartJd, computeCharts, OUTER_LABEL, type Computed, type OuterKind } from './lib/chart'
import { buildContext, patternsText, starsText, traditionalText } from './lib/context'
import { findPatterns } from './lib/patterns'
import { skyContext } from './lib/sky'
import { fmtLocal, fmtOffset, jdToLocal, localToJd, nowJd, offsetAt, stepJd, tzLabel, type StepUnit } from './lib/time'

const NOW_ID = 'now'

const THEME_NEXT = { system: 'light', light: 'dark', dark: 'system' } as const
const THEME_LABEL = { system: '◐ Sistem', light: '☀ Açık', dark: '☾ Koyu' } as const
const OUTER_HELP: Record<OuterKind, string> = {
  transit: 'Seçili tarihteki gökyüzü, natal haritanın etrafında',
  progressed: 'İkincil progresyonlar (bir gün = bir yıl)',
  solarArc: 'Solar ark direksiyonları',
  solarReturn: 'Doğum günü haritası: Güneş’in natal konumuna döndüğü an; yıl başlıktan seçilir',
  lunarReturn: 'Ay dönüşü: Ay’ın natal konumuna döndüğü an (yaklaşık ayda bir)',
  synastry: 'İki kişinin haritası (kayıtlı ikinci bir harita gerekir)'
}

function nowChart(s: AppSettings): ChartRecord {
  const tz: TzSpec = { kind: 'zone', zone: s.defaultZone }
  return {
    id: NOW_ID,
    name: 'Bugünün Gökyüzü',
    local: jdToLocal(nowJd(), tz, s.defaultPlace.lon),
    tz,
    place: s.defaultPlace,
    createdAt: 0,
    updatedAt: 0
  }
}

function blankChart(s: AppSettings): ChartRecord {
  const c = nowChart(s)
  return { ...c, id: crypto.randomUUID(), name: '', local: { ...c.local, s: 0 } }
}

type BottomTab = 'positions' | 'aspects' | 'grid' | 'houses'
type OpenMode = 'natal' | 'transit' | 'progressed' | 'info'
type View = 'chart' | 'info' | 'calendar' | 'notes'
const STAR_POINTS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'asc', 'mc']

export default function App() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [charts, setCharts] = useState<ChartRecord[]>([])
  const [working, setWorking] = useState<ChartRecord | null>(null)
  const [saved, setSaved] = useState<ChartRecord | null>(null)
  const [outers, setOuters] = useState<OuterKind[]>([])
  const [partnerId, setPartnerId] = useState<string | null>(null)
  const [eventJd, setEventJd] = useState(nowJd())
  const [target, setTarget] = useState<'event' | 'natal'>('natal')
  const [live, setLive] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(4)
  const [stepIndex, setStepIndex] = useState(0)
  const [computed, setComputed] = useState<Computed | null>(null)
  const [calcError, setCalcError] = useState('')
  const [tab, setTab] = useState<BottomTab>('positions')
  const [aspectLayer, setAspectLayer] = useState(-1)
  const [editor, setEditor] = useState<ChartRecord | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [filter, setFilter] = useState('')
  const [showChat, setShowChat] = useState(true)
  const [view, setView] = useState<View>('chart')
  const [sky, setSky] = useState<SkyReport | null>(null)
  const [hours, setHours] = useState<PlanetaryHours | null>(null)
  const [starPos, setStarPos] = useState<{ name: string; lon: number }[]>([])
  const [interps, setInterps] = useState<Interpretation[]>([])
  const [calHits, setCalHits] = useState<TransitHit[]>([])
  const [printing, setPrinting] = useState(false)
  const [tagFilter, setTagFilter] = useState('')
  const [update, setUpdate] = useState<{ version: string; url: string } | null>(null)

  // ---- boot ----------------------------------------------------------------
  useEffect(() => {
    void (async () => {
      const s = await window.astro.settings.get()
      setSettings(s)
      setCharts(await window.astro.charts.list())
      setInterps(await window.astro.interp.list())
      setWorking(nowChart(s))
      window.setTimeout(() => void window.astro.checkUpdate().then(setUpdate), 4000)
    })()
  }, [])

  useEffect(() => {
    if (!settings) return
    const root = document.documentElement
    if (settings.theme === 'system') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', settings.theme)
  }, [settings])

  const saveSettings = useCallback((s: AppSettings) => {
    setSettings(s)
    void window.astro.settings.set(s)
  }, [])

  const eventPlace = settings?.defaultPlace
  const eventTz: TzSpec = useMemo(() => ({ kind: 'zone', zone: settings?.defaultZone ?? 'UTC' }), [settings?.defaultZone])
  const partner = useMemo(() => charts.find((c) => c.id === partnerId) ?? null, [charts, partnerId])
  const dirty = !!working && working.id !== NOW_ID && JSON.stringify(working) !== JSON.stringify(saved)

  // ---- compute ---------------------------------------------------------------
  const seq = useRef(0)
  useEffect(() => {
    if (!settings || !working || !eventPlace) return
    const my = ++seq.current
    computeCharts({ natal: working, eventJd, eventPlace, eventTz, outers, partner, settings })
      .then((c) => {
        if (my !== seq.current) return
        setComputed(c)
        setCalcError('')
      })
      .catch((e) => my === seq.current && setCalcError(String(e?.message ?? e)))
  }, [settings, working, eventJd, eventPlace, eventTz, outers, partner])

  useEffect(() => {
    if (aspectLayer >= outers.length) setAspectLayer(outers.length ? 0 : -1)
  }, [outers, aspectLayer])

  // Sky events follow the transit date, or the clock of the "today" chart.
  const skyJd = working ? (working.id === NOW_ID ? chartJd(working) : eventJd) : eventJd
  const skyHour = Math.floor(skyJd * 24)
  useEffect(() => {
    if (!settings) return
    let alive = true
    window.astro
      .sky(skyHour / 24, 45, settings.zodiac === 'sidereal' ? settings.sidMode : null)
      .then((r) => alive && setSky(r))
      .catch(() => alive && setSky(null))
    return () => {
      alive = false
    }
  }, [skyHour, settings?.zodiac, settings?.sidMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // Planetary hours for the sky date at the default place.
  useEffect(() => {
    if (!settings) return
    const place = settings.defaultPlace
    const tzOff = offsetAt({ kind: 'zone', zone: settings.defaultZone }, skyJd, place.lon)
    let alive = true
    window.astro.tools
      .hours(skyJd, place.lat, place.lon, tzOff)
      .then((h) => alive && setHours(h))
      .catch(() => alive && setHours(null))
    return () => {
      alive = false
    }
  }, [Math.floor(skyJd * 96), settings?.defaultPlace, settings?.defaultZone]) // eslint-disable-line react-hooks/exhaustive-deps

  const natalJdNow = working ? chartJd(working) : 0
  const sidMode = settings?.zodiac === 'sidereal' ? settings.sidMode : null
  useEffect(() => {
    if (!working) return
    let alive = true
    window.astro.tools.stars(natalJdNow, sidMode).then((r) => alive && setStarPos(r))
    return () => {
      alive = false
    }
  }, [Math.round(natalJdNow * 24), sidMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // Transit calendar results belong to the chart they were computed for.
  useEffect(() => setCalHits([]), [working?.id])

  const patterns = useMemo(() => (computed && settings ? findPatterns(computed.natal.points, settings) : []), [computed, settings])
  const starConj: StarConj[] = useMemo(() => {
    if (!computed) return []
    const out: StarConj[] = []
    for (const p of computed.natal.points) {
      if (!STAR_POINTS.includes(p.key)) continue
      for (const st of starPos) {
        const orb = Math.abs(diff180(p.lon, st.lon))
        if (orb <= 1) out.push({ star: st.name, key: p.key, orb })
      }
    }
    return out.sort((a, b) => a.orb - b.orb)
  }, [computed, starPos])
  const chartInterps = useMemo(() => interps.filter((i) => i.chartId === working?.id), [interps, working?.id])

  const context = useMemo(() => {
    if (!computed || !working || !settings || !eventPlace) return ''
    const parts = [buildContext(computed, working, settings, eventJd, eventTz, eventPlace, partner)]
    const pt = patternsText(patterns)
    if (pt) parts.push(pt)
    const st = starsText(starConj)
    if (st) parts.push(st)
    if (working.id !== NOW_ID) parts.push(traditionalText(computed.natal, computed.natalJd, eventJd))
    if (sky && (working.id === NOW_ID || outers.includes('transit'))) parts.push(skyContext(sky, eventTz, eventPlace.lon))
    if (calHits.length) parts.push(calendarText(calHits, working.tz, working.place.lon))
    return parts.join('\n\n')
  }, [computed, working, settings, eventJd, eventTz, eventPlace, partner, sky, outers, patterns, starConj, calHits])

  // ---- time --------------------------------------------------------------------
  const effTarget = outers.length ? target : 'natal'

  const setNatalJd = useCallback((jd: number) => {
    setWorking((w) => (w ? { ...w, local: jdToLocal(jd, w.tz, w.place.lon) } : w))
  }, [])

  const step = useCallback(
    (dir: number, unit?: StepUnit, n?: number, keepLive = false) => {
      if (!working || !settings) return
      if (!keepLive) setLive(false)
      const u = unit ?? STEPS[stepIndex].unit
      const k = (n ?? STEPS[stepIndex].n) * dir
      if (effTarget === 'natal') setNatalJd(stepJd(chartJd(working), u, k, working.tz, working.place.lon))
      else setEventJd((jd) => stepJd(jd, u, k, eventTz, settings.defaultPlace.lon))
    },
    [working, settings, stepIndex, effTarget, eventTz, setNatalJd]
  )

  const goNow = useCallback(() => {
    if (effTarget === 'natal') setNatalJd(nowJd())
    else setEventJd(nowJd())
  }, [effTarget, setNatalJd])

  // Live mode follows the wall clock. It only drives the birth time of the
  // "Şu An" chart; a real birth chart is never overwritten by the clock.
  const workingId = working?.id
  useEffect(() => {
    if (!live || playing) return
    const tick = () => {
      if (effTarget === 'event') setEventJd(nowJd())
      else if (workingId === NOW_ID) setNatalJd(nowJd())
    }
    tick()
    const t = window.setInterval(tick, 1000)
    return () => window.clearInterval(t)
  }, [live, playing, effTarget, workingId, setNatalJd])

  const goNowRef = useRef(goNow)
  goNowRef.current = goNow
  const stepRef = useRef(step)
  stepRef.current = step
  useEffect(() => {
    if (!playing) return
    const t = window.setInterval(() => stepRef.current(1), Math.max(16, 1000 / speed))
    return () => window.clearInterval(t)
  }, [playing, speed])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el.closest('input, textarea, select, [contenteditable]') || editor || showSettings) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault()
        const dir = e.key === 'ArrowRight' ? 1 : -1
        stepRef.current(dir, undefined, e.shiftKey ? STEPS[stepIndex].n * 10 : undefined)
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault()
        setStepIndex((i) => Math.max(0, Math.min(STEPS.length - 1, i + (e.key === 'ArrowUp' ? 1 : -1))))
      } else if (e.key === ' ') {
        e.preventDefault()
        setPlaying((p) => !p)
      } else if (e.key === 'n' || e.key === 'N') {
        goNowRef.current()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editor, showSettings, stepIndex])

  const wheelAcc = useRef(0)
  const onWheel = useCallback((dy: number, shift: boolean) => {
    wheelAcc.current += dy
    if (Math.abs(wheelAcc.current) < 40) return
    const dir = wheelAcc.current > 0 ? 1 : -1
    wheelAcc.current = 0
    stepRef.current(dir, undefined, shift ? STEPS[stepIndex].n * 10 : undefined)
  }, [stepIndex])

  // ---- charts -------------------------------------------------------------------
  const openChart = (c: ChartRecord, mode: OpenMode) => {
    if (c.id !== working?.id) {
      if (dirty && !confirm('Kaydedilmemiş değişiklikler kaybolacak. Devam edilsin mi?')) return
      setWorking(structuredClone(c))
      setSaved(c.id === NOW_ID ? null : structuredClone(c))
    }
    setView(mode === 'info' ? 'info' : 'chart')
    if (mode === 'natal' || mode === 'info') {
      setOuters([])
      setAspectLayer(-1)
    } else {
      setOuters([mode])
      setTarget('event')
      setAspectLayer(0)
    }
  }

  const openToday = () => {
    if (!settings) return
    openChart(nowChart(settings), 'natal')
    setLive(true)
  }

  const jumpTo = (jd: number) => {
    setLive(false)
    setPlaying(false)
    if (working?.id === NOW_ID) setNatalJd(jd)
    else {
      setEventJd(jd)
      if (!outers.includes('transit')) {
        setOuters((o) => [...o, 'transit' as OuterKind].slice(-2))
        setAspectLayer(0)
      }
      setTarget('event')
      setView('chart')
    }
  }

  const persist = async (rec: ChartRecord) => {
    const toSave = { ...rec, id: rec.id === NOW_ID ? crypto.randomUUID() : rec.id, createdAt: rec.createdAt || Date.now() }
    const all = await window.astro.charts.save(toSave)
    setCharts(all)
    const stored = all.find((c) => c.id === toSave.id) ?? toSave
    setWorking(structuredClone(stored))
    setSaved(structuredClone(stored))
  }

  const removeChart = async (c: ChartRecord) => {
    if (!confirm(`"${c.name}" haritası silinsin mi?`)) return
    setCharts(await window.astro.charts.remove(c.id))
    if (working?.id === c.id && settings) {
      setWorking(nowChart(settings))
      setSaved(null)
    }
  }

  const menuRef = useRef<(cmd: string) => void>(() => undefined)
  menuRef.current = (cmd: string) => {
    if (!settings || !working) return
    if (cmd === 'new') setEditor(blankChart(settings))
    else if (cmd === 'save') {
      if (working.id === NOW_ID || !working.name) setEditor({ ...working, name: working.id === NOW_ID ? '' : working.name })
      else void persist(working)
    } else if (cmd === 'import') void window.astro.charts.importFile().then((all) => all && setCharts(all))
    else if (cmd === 'export') void window.astro.charts.exportAll(charts)
  }
  useEffect(() => window.astro.onMenu((cmd) => menuRef.current(cmd)), [])

  const toggleOuter = (k: OuterKind) => {
    setOuters((cur) => {
      if (cur.includes(k)) return cur.filter((x) => x !== k)
      const next = [...cur, k].slice(-2)
      if (k === 'synastry' && !partnerId) {
        const other = charts.find((c) => c.id !== working?.id)
        if (other) setPartnerId(other.id)
      }
      return next
    })
    setTarget('event')
    setAspectLayer(0)
  }

  const openReturn = (kind: 'solarReturn' | 'lunarReturn') => {
    const r = computed?.returns.find((x) => x.kind === kind)
    if (!r || !working || !settings) return
    const tz: TzSpec = settings.returnPlace === 'natal' ? working.tz : eventTz
    const local = jdToLocal(r.jd, tz, r.place.lon)
    openChart(
      {
        id: `ret-${kind}-${working.id}-${Math.round(r.jd)}`,
        name: `${working.name} — ${OUTER_LABEL[kind]} ${local.y}${kind === 'lunarReturn' ? '/' + String(local.m).padStart(2, '0') : ''}`,
        local,
        tz,
        place: r.place,
        notes: `${working.name} için ${OUTER_LABEL[kind].toLocaleLowerCase('tr')} haritası`,
        createdAt: 0,
        updatedAt: 0
      },
      'natal'
    )
  }

  const shiftReturn = (kind: 'solarReturn' | 'lunarReturn', dir: number) => {
    const r = computed?.returns.find((x) => x.kind === kind)
    if (!r) return
    setLive(false)
    setPlaying(false)
    setTarget('event')
    // The layer shows the last return at or before the event date.
    setEventJd(dir < 0 ? r.jd - 1 : r.jd + (kind === 'solarReturn' ? 370 : 28.6))
  }

  const setReturnYear = (y: number) => {
    if (!working || y < 1 || y > 3000) return
    setLive(false)
    setTarget('event')
    setEventJd(localToJd({ ...working.local, y, d: Math.min(working.local.d, 28) }, working.tz, working.place.lon) + 3)
  }

  const exportPng = async () => {
    if (view !== 'chart') setView('chart')
    await new Promise((r) => setTimeout(r, 150))
    const el = document.querySelector('.wheel-wrap')
    if (!el || !working) return
    el.scrollIntoView({ block: 'start' })
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    const b = el.getBoundingClientRect()
    await window.astro.exporter.png({ x: b.left, y: b.top, width: b.width, height: Math.min(b.height, window.innerHeight - b.top) }, working.name || 'harita')
  }

  const exportPdf = async () => {
    if (!working) return
    setPrinting(true)
    await new Promise((r) => setTimeout(r, 400))
    try {
      await window.astro.exporter.pdf(`${working.name || 'harita'} - rapor`)
    } finally {
      setPrinting(false)
    }
  }

  const saveInterpretation = async (content: string, question: string, provider: string) => {
    if (!working) return
    const title = (question || 'Yorum').replace(/\s+/g, ' ').slice(0, 80)
    setInterps(
      await window.astro.interp.add({ id: crypto.randomUUID(), chartId: working.id, title, content, provider, createdAt: Date.now() })
    )
  }

  if (!settings || !working) return <div className="loading">Efemeris yükleniyor…</div>

  const targetTz = effTarget === 'natal' ? working.tz : eventTz
  const targetLon = effTarget === 'natal' ? working.place.lon : settings.defaultPlace.lon
  const targetJd = effTarget === 'natal' ? chartJd(working) : eventJd
  const targetLocal: LocalDateTime = effTarget === 'natal' ? working.local : jdToLocal(eventJd, eventTz, targetLon)
  const natalJd = chartJd(working)
  const sun = computed?.natal.points.find((p) => p.key === 'sun')
  const moon = computed?.natal.points.find((p) => p.key === 'moon')
  const q = filter.toLocaleLowerCase('tr')
  const allTags = [...new Set(charts.flatMap((c) => c.tags ?? []))].sort((a, b) => a.localeCompare(b, 'tr'))
  const visible = charts
    .filter((c) => !tagFilter || (c.tags ?? []).includes(tagFilter))
    .filter((c) => !q || `${c.name} ${(c.tags ?? []).join(' ')} ${c.notes ?? ''} ${c.place.name}`.toLocaleLowerCase('tr').includes(q))
    .sort((a, b) => a.name.localeCompare(b.name, 'tr'))

  return (
    <div className={showChat ? 'app' : 'app no-chat'}>
      <header className="toolbar">
        <div className="brand">✶ AstroFree</div>
        <div className="seg">
          {(['transit', 'progressed', 'solarArc', 'solarReturn', 'lunarReturn', 'synastry'] as OuterKind[]).map((k) => (
            <button
              key={k}
              className={outers.includes(k) ? 'on' : ''}
              style={outers.includes(k) ? { borderColor: LAYER_COLOR[k], color: LAYER_COLOR[k] } : undefined}
              onClick={() => toggleOuter(k)}
              disabled={
                (k === 'synastry' && charts.filter((c) => c.id !== working.id).length === 0) ||
                ((k === 'solarReturn' || k === 'lunarReturn' || k === 'progressed' || k === 'solarArc') && working.id === NOW_ID)
              }
              title={OUTER_HELP[k] + (working.id === NOW_ID && k !== 'transit' && k !== 'synastry' ? ' — önce soldan bir kişi seçin' : '')}
            >
              {OUTER_LABEL[k]}
            </button>
          ))}
        </div>
        {outers.includes('synastry') && (
          <select value={partnerId ?? ''} onChange={(e) => setPartnerId(e.target.value)}>
            {charts
              .filter((c) => c.id !== working.id)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        )}
        <select
          value={settings.houseSystem}
          onChange={(e) => saveSettings({ ...settings, houseSystem: e.target.value })}
          title="Ev sistemi"
        >
          {HOUSE_SYSTEMS.map(([k, n]) => (
            <option key={k} value={k}>
              {n}
            </option>
          ))}
        </select>
        <span className="grow" />
        {update && (
          <a className="update-pill" href={update.url} target="_blank" rel="noreferrer" title="GitHub'da yeni sürüm">
            Yeni sürüm v{update.version} · İndir
          </a>
        )}
        <button
          onClick={() => saveSettings({ ...settings, theme: THEME_NEXT[settings.theme] })}
          title="Tema: sistem → açık → koyu"
        >
          {THEME_LABEL[settings.theme]}
        </button>
        <button onClick={() => setShowChat(!showChat)}>{showChat ? 'Sohbeti gizle' : 'AI sohbet'}</button>
        <button onClick={() => setShowSettings(true)} title="Ayarlar">
          ⚙ Ayarlar
        </button>
      </header>

      <TimeControls
        local={targetLocal}
        tzText={`${effTarget === 'natal' ? 'Doğum' : 'Olay'} · ${tzLabel(targetTz)} ${fmtOffset(offsetAt(targetTz, targetJd, targetLon))}`}
        target={effTarget}
        canTargetEvent={outers.length > 0}
        onTarget={setTarget}
        stepIndex={stepIndex}
        onStepIndex={setStepIndex}
        onStep={(d, u, n) => step(d, u, n)}
        onSetLocal={(l) => {
          setLive(false)
          if (effTarget === 'natal') setWorking({ ...working, local: l })
          else setEventJd(localToJd(l, eventTz, targetLon))
        }}
        onNow={goNow}
        live={live}
        onLive={setLive}
        playing={playing}
        onPlaying={(v) => {
          setPlaying(v)
          if (v) setLive(false)
        }}
        speed={speed}
        onSpeed={setSpeed}
      />

      <aside className="sidebar">
        <div className="side-actions">
          <button className="primary" onClick={() => setEditor(blankChart(settings))}>
            + Yeni
          </button>
          <button onClick={openToday} title="Şu anki gökyüzü (canlı)">
            Bugün
          </button>
        </div>
        <input className="search" placeholder="Ara (isim, etiket, not, yer)…" value={filter} onChange={(e) => setFilter(e.target.value)} />
        {allTags.length > 0 && (
          <div className="tag-filter">
            {allTags.map((t) => (
              <button key={t} className={tagFilter === t ? 'on' : ''} onClick={() => setTagFilter(tagFilter === t ? '' : t)}>
                #{t}
              </button>
            ))}
          </div>
        )}
        <ul className="chart-list">
          {visible.map((c) => (
            <li key={c.id} className={c.id === working.id ? 'active' : ''}>
              <div className="item-row">
                <button className="item" onClick={() => openChart(c, 'natal')} title="Doğum haritasına bak">
                  <span className="nm">{c.name}</span>
                  <span className="muted small">
                    {fmtLocal(c.local)} · {c.place.name.split(',')[0]}
                  </span>
                  {(c.tags?.length ?? 0) > 0 && <span className="item-tags">{c.tags!.map((t) => `#${t}`).join(' ')}</span>}
                </button>
                <button className="x" title="Sil" onClick={() => void removeChart(c)}>
                  ×
                </button>
              </div>
              <div className="chips">
                <button onClick={() => openChart(c, 'natal')}>Natal</button>
                <button onClick={() => openChart(c, 'info')}>Bilgiler</button>
                <button onClick={() => openChart(c, 'transit')}>Transit</button>
                <button onClick={() => openChart(c, 'progressed')}>Progresyon</button>
              </div>
            </li>
          ))}
          {!visible.length && <li className="muted small pad">Kayıtlı harita yok. “+ Yeni” ile ekleyin.</li>}
        </ul>
        <SkyPanel report={sky} hours={hours} jd={skyJd} tz={eventTz} lon={settings.defaultPlace.lon} onJump={jumpTo} />
        <div className="side-actions">
          <button onClick={() => menuRef.current('import')}>İçe aktar</button>
          <button onClick={() => menuRef.current('export')} disabled={!charts.length}>
            Dışa aktar
          </button>
        </div>
      </aside>

      <main className="center">
        <div className="chart-head">
          <div>
            <h1>
              {working.name || 'İsimsiz'}
              {dirty && <span className="dirty" title="Kaydedilmemiş değişiklik"> ●</span>}
            </h1>
            <div className="muted small">
              {fmtLocal(working.local, true)} {tzLabel(working.tz)} ({fmtOffset(offsetAt(working.tz, natalJd, working.place.lon))}) ·{' '}
              {working.place.name} {fmtCoord(working.place.lat, 'K', 'G')} {fmtCoord(working.place.lon, 'D', 'B')}
              {sun && moon ? ` · ${moonPhase(sun.lon, moon.lon).name}` : ''}
            </div>
            {computed?.outers.map((o, i) => (
              <div key={i} className="small" style={{ color: LAYER_COLOR[o.kind] }}>
                {o.label}:{' '}
                {o.kind === 'synastry' && partner
                  ? `${fmtLocal(partner.local)} · ${partner.place.name}`
                  : o.kind === 'solarReturn' || o.kind === 'lunarReturn'
                    ? (() => {
                        const r = computed.returns.find((x) => x.kind === o.kind)
                        return r ? `${fmtLocal(jdToLocal(r.jd, settings.returnPlace === 'natal' ? working.tz : eventTz, r.place.lon))} · ${r.place.name.split(',')[0]}` : ''
                      })()
                    : `${fmtLocal(jdToLocal(eventJd, eventTz, settings.defaultPlace.lon))} ${tzLabel(eventTz)}`}
                {(o.kind === 'solarReturn' || o.kind === 'lunarReturn') && (
                  <span className="ret-nav">
                    <button className="link small" onClick={() => shiftReturn(o.kind as 'solarReturn' | 'lunarReturn', -1)}>
                      ◀ önceki
                    </button>
                    {o.kind === 'solarReturn' && (
                      <input
                        type="number"
                        className="ret-year"
                        title="Doğum günü yılı"
                        value={computed.returns.find((r) => r.kind === 'solarReturn') ? jdToLocal(computed.returns.find((r) => r.kind === 'solarReturn')!.jd, working.tz, working.place.lon).y : ''}
                        onChange={(e) => e.target.value.length === 4 && setReturnYear(+e.target.value)}
                      />
                    )}
                    <button className="link small" onClick={() => shiftReturn(o.kind as 'solarReturn' | 'lunarReturn', 1)}>
                      sonraki ▶
                    </button>
                    <button className="link small" onClick={() => openReturn(o.kind as 'solarReturn' | 'lunarReturn')}>
                      ayrı harita olarak aç
                    </button>
                  </span>
                )}
                {o.kind === 'progressed' && computed.progressedJd ? ` (progres tarih ${fmtLocal(jdToLocal(computed.progressedJd, working.tz, working.place.lon))})` : ''}
              </div>
            ))}
          </div>
          <div className="head-actions">
            <button onClick={() => void exportPng()} title="Çarkı PNG olarak kaydet">
              PNG
            </button>
            <button onClick={() => void exportPdf()} title="Çark, natal bilgiler ve kayıtlı yorumlarla PDF rapor">
              PDF rapor
            </button>
            <button onClick={() => setEditor(working.id === NOW_ID ? { ...working, id: crypto.randomUUID(), name: '' } : working)}>Düzenle</button>
            {dirty && saved && <button onClick={() => setWorking(structuredClone(saved))}>Geri al</button>}
            <button className={dirty ? 'primary' : ''} onClick={() => menuRef.current('save')}>
              Kaydet
            </button>
          </div>
        </div>

        <div className="tabs view-tabs">
          <button className={view === 'chart' ? 'on' : ''} onClick={() => setView('chart')}>
            Harita
          </button>
          <button className={view === 'info' ? 'on' : ''} onClick={() => setView('info')}>
            Natal Bilgiler
          </button>
          <button className={view === 'calendar' ? 'on' : ''} onClick={() => setView('calendar')}>
            Transit Takvimi
          </button>
          <button className={view === 'notes' ? 'on' : ''} onClick={() => setView('notes')}>
            Yorumlar{chartInterps.length ? ` (${chartInterps.length})` : ''}
          </button>
        </div>

        {calcError && <div className="error pad">Hesaplama hatası: {calcError}</div>}
        {view === 'info' && computed && (
          <NatalInfo natal={computed.natal} rec={working} settings={settings} natalJd={natalJd} eventJd={eventJd} patterns={patterns} stars={starConj} />
        )}
        {view === 'calendar' && computed && (
          <TransitCalendar
            natal={computed.natal}
            settings={settings}
            startJd={eventJd}
            tz={working.tz}
            lon={working.place.lon}
            onJump={jumpTo}
            onHits={setCalHits}
          />
        )}
        {view === 'notes' && (
          <Interpretations
            items={chartInterps}
            onUpdate={async (id, patch) => setInterps(await window.astro.interp.update(id, patch))}
            onRemove={async (id) => setInterps(await window.astro.interp.remove(id))}
          />
        )}
        {view === 'chart' && computed && (
          <ChartWheel natal={computed.natal} outers={computed.outers} settings={settings} aspectLayer={aspectLayer} onWheel={onWheel} />
        )}

        {view === 'chart' && <div className="bottom">
          <div className="tabs">
            {(
              [
                ['positions', 'Konumlar'],
                ['aspects', 'Açı listesi'],
                ['grid', 'Açı tablosu'],
                ['houses', 'Evler']
              ] as [BottomTab, string][]
            ).map(([k, l]) => (
              <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
                {l}
              </button>
            ))}
            {outers.length > 0 && (
              <select value={aspectLayer} onChange={(e) => setAspectLayer(Number(e.target.value))} title="Çarkta ve tabloda gösterilen açılar">
                <option value={-1}>Açılar: Natal ↔ Natal</option>
                {computed?.outers.map((o, i) => (
                  <option key={i} value={i}>
                    Açılar: {o.label} → Natal
                  </option>
                ))}
              </select>
            )}
            <span className="grow" />
            <span className="muted small">
              {HOUSE_SYSTEMS.find((h) => h[0] === settings.houseSystem)?.[1]} · {settings.zodiac === 'tropical' ? 'Tropikal' : 'Sidereal'}
            </span>
          </div>
          {computed && (
            <div className="table-wrap">
              {tab === 'positions' && <PositionsTable natal={computed.natal} outers={computed.outers} />}
              {tab === 'aspects' && <AspectList natal={computed.natal} outer={aspectLayer >= 0 ? computed.outers[aspectLayer] ?? null : null} settings={settings} />}
              {tab === 'grid' && <AspectGrid natal={computed.natal} outer={aspectLayer >= 0 ? computed.outers[aspectLayer] ?? null : null} settings={settings} />}
              {tab === 'houses' && <HousesTable natal={computed.natal} />}
            </div>
          )}
        </div>}
      </main>

      {showChat && (
        <aside className="chatside">
          <ChatPanel
            chatKey={working.id}
            context={context}
            layers={working.id === NOW_ID ? ['sky', ...outers] : ['natal', ...outers]}
            settings={settings}
            onSettings={saveSettings}
            onSave={saveInterpretation}
          />
        </aside>
      )}
      {printing &&
        computed &&
        createPortal(
          <PrintReport
          computed={computed}
          rec={working}
          settings={settings}
          natalJd={natalJd}
          eventJd={eventJd}
          patterns={patterns}
          stars={starConj}
          interpretations={chartInterps}
          />,
          document.body
        )}

      {editor && (
        <ChartEditor
          initial={editor}
          onClose={() => setEditor(null)}
          onApply={(rec, save) => {
            setEditor(null)
            if (save) void persist(rec)
            else {
              setWorking(rec)
              if (!charts.some((c) => c.id === rec.id)) setSaved(null)
            }
            setOuters([])
            setAspectLayer(-1)
            setView('chart')
          }}
        />
      )}
      {showSettings && (
        <SettingsDialog
          settings={settings}
          onClose={() => setShowSettings(false)}
          onSave={(s) => {
            setShowSettings(false)
            saveSettings(s)
          }}
        />
      )}
    </div>
  )
}
