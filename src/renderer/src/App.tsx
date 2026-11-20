import { setLang, t } from './lib/i18n'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { AppSettings, AspectKey, ChartRecord, ImportResult, Interpretation, LocalDateTime, MoonStay, PlanetaryHours, SkyReport, TransitHit, TzSpec } from '@shared/types'
import Astrocartography from './components/Astrocartography'
import ChartEditor from './components/ChartEditor'
import ElectionalSearch from './components/ElectionalSearch'
import GoodDays from './components/GoodDays'
import MoonCalendar from './components/MoonCalendar'
import NightSky from './components/NightSky'
import ImportDialog from './components/ImportDialog'
import PeopleManager from './components/PeopleManager'
import Rectify from './components/Rectify'
import { matches, sortCharts } from './lib/people'
import Journal from './components/Journal'
import GraphicEphemeris from './components/GraphicEphemeris'
import Icon from './components/Icon'
import ChartWheel, { LAYER_COLOR } from './components/ChartWheel'
import BirthdayReport from './components/BirthdayReport'
import BasicReading from './components/BasicReading'
import TodayView from './components/TodayView'
import { customGroups, GROUP_PRESETS, groupLabel } from './lib/groups'
import ShareCard from './components/ShareCard'
import ReportDialog from './components/ReportDialog'
import WhatsNewDialog from './components/WhatsNewDialog'
import { whatsNewSince, type WhatsNew } from '@shared/whatsnew'
import ChatPanel from './components/ChatPanel'
import Interpretations from './components/Interpretations'
import NatalInfo, { type StarConj } from './components/NatalInfo'
import Onboarding from './components/Onboarding'
import Shortcuts from './components/Shortcuts'
import PrintReport from './components/PrintReport'
import SkyPanel from './components/SkyPanel'
import SettingsDialog, { type SettingsFocus } from './components/SettingsDialog'
import { AspectGrid, AspectList, HousesTable, PositionsTable } from './components/Tables'
import TimeControls, { STEPS } from './components/TimeControls'
import TransitCalendar, { calendarText } from './components/TransitCalendar'
import { ASPECT, diff180, fmtCoord, fmtPosText, HOUSE_SYSTEMS, moonPhase, POINT } from './lib/astro'
import { chartJd, compositeRecord, computeCharts, davisonRecord, OUTER_LABEL, type Computed, type OuterKind } from './lib/chart'
import { buildContext, patternsText, starsText, traditionalText } from './lib/context'
import { findPatterns } from './lib/patterns'
import { harmonicLayer } from './lib/midpoints'
import { moonText, skyContext } from './lib/sky'
import { detectTiming, timingText } from './lib/timing'
import { fmtLocal, fmtOffset, jdToLocal, localToJd, nowJd, offsetAt, stepJd, systemZone, tzLabel, type StepUnit } from './lib/time'
import { pickLocale } from '@shared/i18n'
import { parseKnowledge, type KbFile } from '@shared/knowledge'
import Knowledge from './components/Knowledge'
import Logo from './components/Logo'
import TermsDialog, { termsAccepted } from './components/TermsAck'
import { knowledgeText, matchKnowledge } from './lib/kb'

const NOW_ID = 'now'

/** One-time flags kept in localStorage (safe when storage is unavailable). */
function localStorageFlag(key: string): boolean {
  try {
    return localStorage.getItem(`astrofree:${key}`) === '1'
  } catch {
    return false
  }
}

const THEME_NEXT = { system: 'light', light: 'dark', dark: 'system' } as const
const THEME_ICON = { system: 'auto', light: 'sun', dark: 'moon' } as const
const THEME_LABEL = { system: 'Tema: sistem', light: 'Tema: açık', dark: 'Tema: koyu' } as const
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
    name: t('Bugünün Gökyüzü'),
    local: jdToLocal(nowJd(), tz, s.defaultPlace.lon),
    tz,
    place: s.defaultPlace,
    createdAt: 0,
    updatedAt: 0
  }
}

function blankChart(s: AppSettings, kind: 'person' | 'event' = 'person'): ChartRecord {
  const c = nowChart(s)
  return { ...c, id: crypto.randomUUID(), name: '', kind, local: { ...c.local, s: 0 } }
}

const initialsOf = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0] ?? '').join('').toLocaleUpperCase('tr') || '?'

type BottomTab = 'positions' | 'aspects' | 'grid' | 'houses'
type OpenMode = 'natal' | 'transit' | 'progressed' | 'info'
type View = 'chart' | 'today' | 'info' | 'reading' | 'days' | 'moon' | 'journal' | 'calendar' | 'notes' | 'acg' | 'election' | 'ephem' | 'kb'
// Amateur mode keeps the everyday tabs and layers; professional shows everything.
const AMATEUR_VIEWS: View[] = ['chart', 'today', 'reading', 'days', 'moon', 'journal', 'notes', 'kb']
const AMATEUR_LAYERS: OuterKind[] = ['transit', 'synastry']
const AMATEUR_TABS: BottomTab[] = ['positions']
const STAR_POINTS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'asc', 'mc']
// "When should I…" data sent to the AI, from today on, kept small (it rides on every chat's chart data):
// sky events and Mars–Pluto transits for TIMING_DAYS; the Moon calendar and Sun/Mercury/Venus transits
// for SHORT_DAYS; at most TIMING_LINES transits. The Moon is left out of the transits (it has its own calendar).
const TIMING_DAYS = 60
const SHORT_DAYS = 30
const TIMING_LINES = 40
const TIMING_BODIES = [0, 2, 3, 4, 5, 6, 7, 8, 9]
const FAST_BODIES = [0, 2, 3]
const TIMING_ASPECTS = (['conjunction', 'opposition', 'square', 'trine', 'sextile'] as AspectKey[]).map((k) => ({ key: k, angle: ASPECT[k].angle, orb: 1 }))

// i18n-ignore-start (layer abbreviations, as on the wheel)
const RAIL_ABBR: Record<OuterKind, string> = { transit: 'T', progressed: 'P', solarArc: 'SA', solarReturn: 'GD', lunarReturn: 'AD', synastry: 'S' }
// i18n-ignore-end

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
  const [speed, setSpeed] = useState(5)
  const [stepIndex, setStepIndex] = useState(0)
  const [computed, setComputed] = useState<Computed | null>(null)
  const [calcError, setCalcError] = useState('')
  const [tab, setTab] = useState<BottomTab>('positions')
  const [aspectLayer, setAspectLayer] = useState(-1)
  const [editor, setEditor] = useState<ChartRecord | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [settingsFocus, setSettingsFocus] = useState<SettingsFocus | undefined>()
  const [exportOpen, setExportOpen] = useState(false)
  const [zoneOpen, setZoneOpen] = useState(false)
  // The panel beside the main menu: the people and events list, the sky, or closed.
  const [panel, setPanelState] = useState<'people' | 'sky' | null>(() => {
    try {
      const v = localStorage.getItem('side-panel')
      return v === 'sky' ? 'sky' : v === 'none' ? null : 'people'
    } catch {
      return 'people'
    }
  })
  const setPanel = (v: 'people' | 'sky' | null) => {
    setPanelState(v)
    try {
      localStorage.setItem('side-panel', v ?? 'none')
    } catch {
      /* storage unavailable */
    }
  }
  const togglePanel = (v: 'people' | 'sky') => setPanel(panel === v ? null : v)
  // Choosing the synastry partner from the people list: the list opens in a picking mode.
  const [pickPartner, setPickPartner] = useState(false)
  const pickReturn = useRef<'people' | 'sky' | null>(null)
  const startPick = () => {
    pickReturn.current = panel
    setPickPartner(true)
    setPanelState('people')
  }
  const endPick = (id?: string) => {
    if (id) setPartnerId(id)
    setPickPartner(false)
    setPanelState(pickReturn.current)
  }
  // Side menu: full (icons and names) or narrow (icons only); remembered on this computer.
  const [railMini, setRailMini] = useState(() => {
    try {
      return localStorage.getItem('rail-mini') === '1'
    } catch {
      return false
    }
  })
  const toggleRailMini = () => {
    setRailMini(!railMini)
    try {
      localStorage.setItem('rail-mini', railMini ? '0' : '1')
    } catch {
      /* storage unavailable */
    }
  }
  // The list row menu (⋯ or right-click): opened at a screen point so the scrolling list never clips it.
  const [itemMenu, setItemMenu] = useState<{ id: string; x: number; y: number } | null>(null)
  useEffect(() => {
    if (!itemMenu) return
    const close = () => setItemMenu(null)
    const key = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('mousedown', close)
    window.addEventListener('resize', close)
    window.addEventListener('keydown', key)
    window.addEventListener('wheel', close, { passive: true })
    return () => {
      window.removeEventListener('mousedown', close)
      window.removeEventListener('resize', close)
      window.removeEventListener('keydown', key)
      window.removeEventListener('wheel', close)
    }
  }, [itemMenu])
  const menuChart = itemMenu ? charts.find((c) => c.id === itemMenu.id) : undefined
  const [filter, setFilter] = useState('')
  const [showChat, setShowChat] = useState(true)
  const [view, setView] = useState<View>('chart')
  const [showShare, setShowShare] = useState(false)
  // How the sidebar list is split: by kind (people/events) or by the charts' groups.
  const [groupBy, setGroupBy] = useState<'kind' | 'group'>(() => {
    try {
      return localStorage.getItem('sidebar-groupby') === 'group' ? 'group' : 'kind'
    } catch {
      return 'kind'
    }
  })
  const changeGroupBy = (v: 'kind' | 'group') => {
    setGroupBy(v)
    try {
      localStorage.setItem('sidebar-groupby', v)
    } catch {
      /* storage unavailable */
    }
  }
  const [showReport, setShowReport] = useState(false)
  const [appVersion, setAppVersion] = useState('')
  const [whatsNew, setWhatsNew] = useState<{ version: string; notes: WhatsNew[] } | null>(null)
  // The sky panel can be opened full size as a lightbox over the window.
  const [skyFull, setSkyFull] = useState(false)
  // Sidebar sections the user folded away (remembered per device).
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem('sidebar-collapsed') || '{}')
    } catch {
      return {}
    }
  })
  const toggleSection = (k: string) =>
    setCollapsed((c) => {
      const n = { ...c, [k]: !c[k] }
      try {
        localStorage.setItem('sidebar-collapsed', JSON.stringify(n))
      } catch {
        /* storage unavailable */
      }
      return n
    })
  const [sky, setSky] = useState<SkyReport | null>(null)
  const [hours, setHours] = useState<PlanetaryHours | null>(null)
  const [starPos, setStarPos] = useState<{ name: string; lon: number }[]>([])
  const [interps, setInterps] = useState<Interpretation[]>([])
  const [kbFiles, setKbFiles] = useState<KbFile[]>([])
  const reloadKb = useCallback(() => void window.astro.kb.list().then(setKbFiles), [])
  useEffect(() => {
    window.addEventListener('focus', reloadKb)
    return () => window.removeEventListener('focus', reloadKb)
  }, [reloadKb])
  const [calHits, setCalHits] = useState<TransitHit[]>([])
  const [printing, setPrinting] = useState(false)
  const [showBirthday, setShowBirthday] = useState(false)
  const [showNight, setShowNight] = useState(false)
  const [showPeople, setShowPeople] = useState(false)
  const [showRectify, setShowRectify] = useState(false)
  const [importing, setImporting] = useState<Extract<ImportResult, { kind: 'preview' }> | 'blank' | null>(null)
  const [notice, setNotice] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [update, setUpdate] = useState<{ version: string; url: string } | null>(null)
  const [obOpen, setObOpen] = useState(false)
  const [updateReady, setUpdateReady] = useState<string | null>(null)
  useEffect(() => window.astro.onUpdateReady(setUpdateReady), [])
  const [harmonic, setHarmonic] = useState(1)
  const [showKeys, setShowKeys] = useState(false)
  const [inject, setInject] = useState<{ id: number; text: string } | null>(null)
  const ask = useCallback((text: string) => {
    setShowChat(true)
    setInject({ id: Date.now(), text })
  }, [])

  // ---- boot ----------------------------------------------------------------
  useEffect(() => {
    void (async () => {
      let s = await window.astro.settings.get()
      const list0 = await window.astro.charts.list()
      // First run: speak the system language.
      if (!s.onboarded && list0.length === 0 && !localStorageFlag('lang-picked')) {
        const loc = pickLocale(navigator.languages)
        s = { ...s, uiLanguage: loc.code }
      }
      // Follow the computer's time zone (travel, DST rules) unless set by hand.
      if (s.timezoneMode === 'system') {
        const zone = systemZone()
        if (zone !== s.defaultZone) {
          const place = await window.astro.geo.placeForZone(zone)
          s = { ...s, defaultZone: zone, defaultPlace: place ? { ...place } : { ...s.defaultPlace, zone } }
        }
      }
      void window.astro.settings.set(s)
      setSettings(s)
      setCharts(await window.astro.charts.list())
      const list = await window.astro.charts.list()
      setInterps(await window.astro.interp.list())
      setKbFiles(await window.astro.kb.list())
      setWorking(nowChart(s))
      const firstRun = !s.onboarded && list.length === 0
      setObOpen(firstRun)
      const { version } = await window.astro.info()
      if (!firstRun && s.seenVersion !== version) {
        const notes = whatsNewSince(s.seenVersion, version)
        if (notes.length) setWhatsNew({ version, notes })
        else void window.astro.settings.set({ ...s, seenVersion: version })
      }
      setAppVersion(version)
      window.setTimeout(() => void window.astro.checkUpdate().then(setUpdate), 4000)
    })()
  }, [])

  if (settings) setLang(settings.uiLanguage, settings.dateOrder)
  useEffect(() => {
    if (!settings) return
    const root = document.documentElement
    if (settings.theme === 'system') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', settings.theme)
  }, [settings])
  // User aspect colours override the per-aspect theme tokens (see styles.css).
  useEffect(() => {
    if (!settings) return
    let tag = document.getElementById('aspect-colors')
    if (!tag) {
      tag = document.createElement('style')
      tag.id = 'aspect-colors'
      document.head.appendChild(tag)
    }
    const rules = Object.entries(settings.aspectColors ?? {})
      .filter(([, c]) => /^#[0-9a-f]{6}$/i.test(c ?? ''))
      .map(([k, c]) => `--asp-${k}: ${c};`)
    tag.textContent = rules.length ? `:root:root { ${rules.join(' ')} }` : ''
  }, [settings?.aspectColors]) // eslint-disable-line react-hooks/exhaustive-deps

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

  // Coming days from today, for timing questions; refreshed once a day and when the chart changes.
  const today = Math.floor(nowJd() + 0.5) - 0.5
  const timingPoints =
    computed && working && working.id !== NOW_ID
      ? computed.natal.points.filter((p) => STAR_POINTS.includes(p.key) && !(working.timeUnknown && (p.key === 'asc' || p.key === 'mc')))
      : []
  const timingKey = `${today}|${timingPoints.map((p) => `${p.key}:${p.lon.toFixed(3)}`).join(',')}`
  const [upcoming, setUpcoming] = useState<{ key: string; sky: SkyReport; moon: MoonStay[]; hits: TransitHit[] } | null>(null)
  useEffect(() => {
    if (!settings) return
    let alive = true
    const sid = settings.zodiac === 'sidereal' ? settings.sidMode : null
    const natal = timingPoints.map((p) => ({ key: p.key, lon: p.lon }))
    Promise.all([
      window.astro.sky(today, TIMING_DAYS, sid),
      window.astro.tools.moon(today, SHORT_DAYS, sid),
      natal.length ? window.astro.tools.transits({ start: today, end: today + TIMING_DAYS, bodies: TIMING_BODIES, natal, aspects: TIMING_ASPECTS, sidMode: sid }) : []
    ])
      .then(([sky, moon, all]) => {
        const hits = all.filter((h) => !FAST_BODIES.includes(h.body) || (h.exacts[0]?.jd ?? h.start) < today + SHORT_DAYS)
        if (alive) setUpcoming({ key: timingKey, sky, moon, hits })
      })
      .catch(() => alive && setUpcoming(null))
    return () => {
      alive = false
    }
  }, [timingKey, settings?.zodiac, settings?.sidMode]) // eslint-disable-line react-hooks/exhaustive-deps

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
  const shown = useMemo(
    () => (computed && harmonic !== 1 ? { natal: harmonicLayer(computed.natal, harmonic), outers: computed.outers.map((o) => harmonicLayer(o, harmonic)) } : computed),
    [computed, harmonic]
  )
  const kbEntries = useMemo(() => kbFiles.flatMap((f) => parseKnowledge(f.name, f.text)), [kbFiles])
  const kbBase = useMemo(() => {
    if (!computed || !working) return null
    const transit = working.id === NOW_ID ? undefined : computed.outers.find((o) => o.kind === 'transit')
    const topics = [
      ...(outers.includes('synastry') ? ['sinastri', 'ilişki'] : []), // i18n-ignore
      ...(working.composite ? ['kompozit', 'ilişki'] : []) // i18n-ignore
    ]
    return { natal: computed.natal, transit, stars: starConj, topics }
  }, [computed, working, outers, starConj])
  const kbMatches = useMemo(() => (kbBase && kbEntries.length ? matchKnowledge(kbEntries, kbBase) : []), [kbBase, kbEntries])
  const knowledgeFor = useCallback(
    (question: string) => (kbBase && kbEntries.length ? knowledgeText(matchKnowledge(kbEntries, { ...kbBase, question })) : ''),
    [kbBase, kbEntries]
  )

  // Timing questions ("best day for our wedding in 2027?"): candidate days and periods for the
  // range and topic the question names, computed when it is sent and attached to it alone.
  const timingFor = useCallback(
    async (question: string): Promise<string> => {
      if (!settings || !eventPlace) return ''
      const ask = detectTiming(question, eventTz, eventPlace.lon, nowJd())
      if (!ask) return ''
      const sid = settings.zodiac === 'sidereal' ? settings.sidMode : null
      const syn = computed?.outers.find((o) => o.kind === 'synastry')
      const own = timingPoints.map((p) => ({ key: p.key, lon: p.lon }))
      const natal = [
        ...own,
        ...(syn ? syn.points.filter((p) => STAR_POINTS.includes(p.key)).map((p) => ({ key: p.key, lon: p.lon, who: partner?.name || syn.label })) : [])
      ]
      // Slow transits only for ranges the chart's "coming days" do not cover already.
      const longRange = ask.start + ask.days > today + TIMING_DAYS
      const [facts, slow] = await Promise.all([
        window.astro.tools.timing(ask.start, ask.days, sid),
        own.length && longRange && (!ask.topic || ask.topic === 'health')
          ? window.astro.tools.transits({ start: ask.start, end: ask.start + ask.days, bodies: [5, 6, 7, 8, 9], natal: own, aspects: TIMING_ASPECTS, sidMode: sid })
          : Promise.resolve([] as TransitHit[])
      ])
      return timingText(ask, facts, natal, eventTz, eventPlace.lon, nowJd(), slow.length ? calendarText(slow, working?.tz ?? eventTz, working?.place.lon ?? eventPlace.lon, 20) : '')
    },
    [settings, eventPlace, eventTz, computed, timingPoints, partner, today, working]
  )

  // Chart points for the Good Days screen: the person's, plus the synastry partner's when shown.
  const goodDaysNatal = useMemo(() => {
    const syn = computed?.outers.find((o) => o.kind === 'synastry')
    return [
      ...timingPoints.map((p) => ({ key: p.key, lon: p.lon })),
      ...(syn ? syn.points.filter((p) => STAR_POINTS.includes(p.key)).map((p) => ({ key: p.key, lon: p.lon, who: partner?.name || syn.label })) : [])
    ]
  }, [timingKey, computed, partner]) // eslint-disable-line react-hooks/exhaustive-deps

  // ---- amateur / professional mode ---------------------------------------------
  const amateur = settings?.mode === 'amateur'
  const setMode = (m: AppSettings['mode']) => settings && saveSettings({ ...settings, mode: m, ai: { ...settings.ai, level: m } })
  // The journal belongs to a saved person: leave it when the sky or an event chart is opened.
  useEffect(() => {
    if (view === 'journal' && (!working || working.id === NOW_ID || working.kind === 'event')) setView('chart')
  }, [view, working?.id, working?.kind]) // eslint-disable-line react-hooks/exhaustive-deps
  // Switching to amateur leaves no professional tab, layer or harmonic behind on screen.
  useEffect(() => {
    if (!amateur) return
    if (!AMATEUR_VIEWS.includes(view)) setView('chart')
    if (!AMATEUR_TABS.includes(tab)) setTab('positions')
    if (outers.some((k) => !AMATEUR_LAYERS.includes(k))) setOuters(outers.filter((k) => AMATEUR_LAYERS.includes(k)))
    if (harmonic !== 1) setHarmonic(1)
  }, [amateur, view, tab, outers, harmonic])
  const chartInterps = useMemo(() => interps.filter((i) => i.chartId === working?.id), [interps, working?.id])

  const context = useMemo(() => {
    if (!computed || !working || !settings || !eventPlace) return ''
    const parts = [buildContext(computed, working, settings, eventJd, eventTz, eventPlace, partner)]
    const pt = patternsText(patterns)
    if (pt) parts.push(pt)
    const st = starsText(starConj)
    if (st) parts.push(st)
    if (working.id !== NOW_ID) parts.push(traditionalText(computed.natal, computed.natalJd, eventJd))
    // Coming days (only once computed for this chart and day).
    const up = upcoming?.key === timingKey ? upcoming : null
    const showSky = sky && (working.id === NOW_ID || outers.includes('transit'))
    if (showSky && !(up && Math.abs(sky.jd - up.sky.jd) < 1)) parts.push(skyContext(sky, eventTz, eventPlace.lon))
    if (up) {
      parts.push(skyContext(up.sky, eventTz, eventPlace.lon), moonText(up.moon, eventTz, eventPlace.lon))
      if (up.hits.length && !calHits.length) parts.push(calendarText(up.hits, working.tz, working.place.lon, TIMING_LINES))
    }
    if (calHits.length) parts.push(calendarText(calHits, working.tz, working.place.lon))
    if (harmonic !== 1 && shown)
      parts.push(
        t('# HARMONİK {n} HARİTASI (ekranda gösterilen)', { n: harmonic }) + '\n' +
          shown.natal.points.map((p) => `- ${POINT[p.key]?.name ?? p.key}: ${fmtPosText(p.lon)}`).join('\n')
      )
    return parts.join('\n\n')
  }, [computed, working, settings, eventJd, eventTz, eventPlace, partner, sky, upcoming, timingKey, outers, patterns, starConj, calHits, harmonic, shown])

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

  // A saved chart keeps its own moment: "Şimdi" and "Canlı" then move the transit time
  // (switching Transit on if no layer is open) instead of the birth time.
  const ownMoment = effTarget === 'natal' && !!working && working.id !== NOW_ID
  const toTransitNow = () => {
    if (!outers.length) toggleOuterRef.current('transit')
    setTarget('event')
    setEventJd(nowJd())
  }
  const toggleOuterRef = useRef<(k: OuterKind) => void>(() => undefined)
  const goNow = useCallback(() => {
    if (ownMoment) toTransitNow()
    else if (effTarget === 'natal') setNatalJd(nowJd())
    else setEventJd(nowJd())
  }, [effTarget, setNatalJd, ownMoment, outers.length]) // eslint-disable-line react-hooks/exhaustive-deps

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
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [live, playing, effTarget, workingId, setNatalJd])

  const goNowRef = useRef(goNow)
  goNowRef.current = goNow
  const stepRef = useRef(step)
  stepRef.current = step
  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => stepRef.current(1), Math.max(16, 1000 / speed))
    return () => window.clearInterval(timer)
  }, [playing, speed])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el.closest('input, textarea, select, [contenteditable]') || editor || showSettings) return
      if (e.key === '?') {
        e.preventDefault()
        setShowKeys((v) => !v)
        return
      }
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
      if (dirty && !confirm(t('Kaydedilmemiş değişiklikler kaybolacak. Devam edilsin mi?'))) return
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

  // Journal edits go to the stored record; unsaved edits on screen stay as they are.
  const saveJournal = async (journal: ChartRecord['journal']) => {
    if (!working || working.id === NOW_ID) return
    const base = saved ?? working
    const all = await window.astro.charts.save({ ...base, journal })
    setCharts(all)
    const stored = all.find((c) => c.id === base.id)
    if (!stored) return
    setSaved(structuredClone(stored))
    // Same journal and save time on screen, so only real unsaved edits count as changes.
    setWorking((w) => (w ? { ...w, journal: stored.journal, updatedAt: stored.updatedAt } : w))
  }

  // Changes made elsewhere (people manager, import): the list, and the fields they touch on
  // the chart on screen, so its own unsaved edits stay and are not flagged twice.
  const chartsChanged = (all: ChartRecord[]) => {
    setCharts(all)
    if (!working || working.id === NOW_ID) return
    const stored = all.find((c) => c.id === working.id)
    if (!stored) {
      if (settings) {
        setWorking(nowChart(settings))
        setSaved(null)
      }
      return
    }
    const keys = ['group', 'tags', 'notes', 'contact', 'sessions', 'favorite', 'journal', 'updatedAt'] as const
    const pick = (c: ChartRecord) => Object.fromEntries(keys.map((k) => [k, c[k]]))
    setSaved((s0) => (s0 ? { ...s0, ...pick(stored) } : s0))
    setWorking((w) => (w ? { ...w, ...pick(stored) } : w))
  }
  const flashNotice = (s: string) => {
    setNotice(s)
    window.setTimeout(() => setNotice(''), 4000)
  }
  const importFile = async () => {
    const r = await window.astro.charts.importFile()
    if (!r) return
    if (r.kind === 'restored') {
      chartsChanged(r.charts)
      flashNotice(t('Yedek geri yüklendi.'))
    } else setImporting(r)
  }

  const removeChart = async (c: ChartRecord) => {
    if (!confirm(`"${c.name}" — ${t('haritası silinsin mi?')}`)) return
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
    } else if (cmd === 'import') void importFile()
    else if (cmd === 'people') setShowPeople(true)
    else if (cmd === 'export') void window.astro.charts.exportAll(charts)
    else if (cmd === 'shortcuts') setShowKeys(true)
    else if (cmd === 'report') setShowReport(true)
    else if (cmd === 'about') {
      setSettingsFocus('about')
      setShowSettings(true)
    }
  }
  useEffect(() => window.astro.onMenu((cmd) => menuRef.current(cmd)), [])
  const openByIdRef = useRef<(id: string) => void>(() => undefined)
  openByIdRef.current = (id: string) => {
    const c = charts.find((x) => x.id === id)
    if (c) openChart(c, 'transit')
  }
  useEffect(() => window.astro.onOpenChart((id) => openByIdRef.current(id)), [])

  const toggleOuter = (k: OuterKind) => {
    setOuters((cur) => {
      if (cur.includes(k)) return cur.filter((x) => x !== k)
      const next = [...cur, k].slice(-3)
      if (k === 'synastry' && !partnerId) {
        const other = charts.find((c) => c.id !== working?.id)
        if (other) setPartnerId(other.id)
      }
      return next
    })
    setTarget('event')
    setAspectLayer(0)
  }
  toggleOuterRef.current = toggleOuter

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
        notes: t('{name} için {kind} haritası', { name: working.name, kind: t(OUTER_LABEL[kind]) }),
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

  if (!settings || !working) return <div className="loading">{t('Efemeris yükleniyor…')}</div>

  const targetTz = effTarget === 'natal' ? working.tz : eventTz
  const targetLon = effTarget === 'natal' ? working.place.lon : settings.defaultPlace.lon
  const targetJd = effTarget === 'natal' ? chartJd(working) : eventJd
  const targetLocal: LocalDateTime = effTarget === 'natal' ? working.local : jdToLocal(eventJd, eventTz, targetLon)
  const natalJd = chartJd(working)
  const sun = computed?.natal.points.find((p) => p.key === 'sun')
  const moon = computed?.natal.points.find((p) => p.key === 'moon')
  const allTags = [...new Set(charts.flatMap((c) => c.tags ?? []))].sort((a, b) => a.localeCompare(b, 'tr'))
  const visible = sortCharts(
    charts.filter((c) => (!tagFilter || (c.tags ?? []).includes(tagFilter)) && (!filter.trim() || matches(c, filter))),
    'name'
  )
  // Sidebar list sections: by kind (people / events) or by group.
  const listSections: { key: string; label: string; items: ChartRecord[] }[] =
    groupBy === 'group'
      ? [
          ...[...GROUP_PRESETS.map(([id]) => id), ...customGroups(charts)].map((g) => ({
            key: `g:${g}`,
            label: groupLabel(g),
            items: visible.filter((c) => c.group === g)
          })),
          { key: 'g:', label: t('Grupsuz'), items: visible.filter((c) => !c.group) }
        ]
      : [
          { key: 'person', label: t('Kişiler'), items: visible.filter((c) => (c.kind ?? 'person') === 'person') },
          { key: 'event', label: t('Olaylar'), items: visible.filter((c) => c.kind === 'event') }
        ]

  return (
    <div className={`app${showChat ? '' : ' no-chat'}${railMini ? ' rail-mini' : ''}${panel ? '' : ' no-side'}`}>
      <nav className="rail" aria-label={t('Ana menü')}>
        <div className="rail-top">
          <div className="brand rail-brand" title="AstroFree">
            <Logo size={20} className="brand-logo" /> <span className="brand-name">AstroFree</span>
          </div>
          <button
            className="rail-fold"
            onClick={() => toggleRailMini()}
            aria-label={railMini ? t('Menüyü genişlet') : t('Menüyü daralt')}
            title={railMini ? t('Menüyü genişlet') : t('Menüyü daralt')}
          >
            {railMini ? '»' : '«'}
          </button>
        </div>
        <div className="rail-group" role="group" aria-label={t('Paneller')}>
          <button className={`rail-btn${panel === 'people' ? ' on' : ''}`} aria-pressed={panel === 'people'} onClick={() => togglePanel('people')} title={t('Kişiler ve olaylar')}>
            <span className="rail-badge plain" aria-hidden>
              <Icon name="users" size={18} />
            </span>
            <span className="rail-lbl">{t('Kişiler ve olaylar')}</span>
          </button>
          <button className={`rail-btn${panel === 'sky' ? ' on' : ''}`} aria-pressed={panel === 'sky'} onClick={() => togglePanel('sky')} title={t('Gökyüzü')}>
            <span className="rail-badge plain" aria-hidden>
              <Icon name="star" size={18} />
            </span>
            <span className="rail-lbl">{t('Gökyüzü')}</span>
          </button>
        </div>
        <div className="rail-group rail-actions" role="group" aria-label={t('Yeni')}>
          <button className="rail-btn" onClick={() => setEditor(blankChart(settings))} title={t('Yeni kişi (⌘N)')}>
            <span className="rail-badge plain" aria-hidden>
              <Icon name="userPlus" size={18} />
            </span>
            <span className="rail-lbl">{t('+ Kişi')}</span>
          </button>
          <button className="rail-btn" onClick={() => setEditor(blankChart(settings, 'event'))} title={t('Evlilik, kuruluş, taşınma gibi bir olay haritası')}>
            <span className="rail-badge plain" aria-hidden>
              <Icon name="eventPlus" size={18} />
            </span>
            <span className="rail-lbl">{t('+ Olay')}</span>
          </button>
          <button className="rail-btn" onClick={openToday} title={t('Şu anki gökyüzü (canlı)')}>
            <span className="rail-badge plain" aria-hidden>
              <Icon name="clock" size={18} />
            </span>
            <span className="rail-lbl">{t('Bugün')}</span>
          </button>
          <button className="rail-btn rail-night" onClick={() => setShowNight(true)} title={t('Bu gece çıplak gözle görülebilecek gezegenler, Ay ve gökyüzü olayları')}>
            <span className="rail-badge plain" aria-hidden>
              <Icon name="telescope" size={18} />
            </span>
            <span className="rail-lbl">{t('Bu gece')}</span>
          </button>
        </div>
        <div className="rail-group rail-layers" role="group" aria-label={t('Katmanlar')}>
          <span className="rail-cap">{t('Katmanlar')}</span>
          {(['transit', 'progressed', 'solarArc', 'solarReturn', 'lunarReturn', 'synastry'] as OuterKind[]).filter((k) => !amateur || AMATEUR_LAYERS.includes(k)).map((k) => (
            <button
              key={k}
              className={outers.includes(k) ? 'rail-btn on' : 'rail-btn'}
              aria-pressed={outers.includes(k)}
              style={{ ['--layer' as string]: LAYER_COLOR[k] }}
              onClick={() => toggleOuter(k)}
              disabled={
                (k === 'synastry' && charts.filter((c) => c.id !== working.id).length === 0) ||
                ((k === 'solarReturn' || k === 'lunarReturn' || k === 'progressed' || k === 'solarArc') && working.id === NOW_ID)
              }
              title={t(OUTER_HELP[k]) + (working.id === NOW_ID && k !== 'transit' && k !== 'synastry' ? t(' — önce soldan bir kişi seçin') : '')}
            >
              <span className="rail-badge" aria-hidden>
                {RAIL_ABBR[k]}
              </span>
              <span className="rail-lbl">{t(OUTER_LABEL[k])}</span>
            </button>
          ))}
        </div>
        {outers.includes('synastry') && (
          <div className="rail-group rail-opts" role="group" aria-label={t('İlişki')}>
            <span className="rail-cap">{t('Sinastri')}</span>
            <span className="rail-sub">{t('Partner')}</span>
            <button className={`partner-card${pickPartner ? ' picking' : ''}`} onClick={() => (pickPartner ? endPick() : startPick())} title={t('Kişi listesinden seçin')}>
              <span className="avatar sm" aria-hidden style={{ ['--layer' as string]: LAYER_COLOR.synastry }}>
                {partner ? initialsOf(partner.name) : '?'}
              </span>
              <span className="partner-text">
                <span className="nm">{partner ? partner.name : t('Partner seçin')}</span>
                {partner && (
                  <span className="muted small">
                    {fmtLocal(partner.local).split(' ')[0]} · {partner.place.name.split(',')[0]}
                  </span>
                )}
              </span>
              <span className="partner-change">{pickPartner ? t('Vazgeç') : t('Değiştir')}</span>
            </button>
            {partner && working.id !== NOW_ID && !amateur && (
              <>
                <button onClick={() => openChart(compositeRecord(working, partner, jdToLocal), 'natal')} title={t('İki haritanın gezegen orta noktaları')}>
                  {t('Kompozit')}
                </button>
                <button
                  onClick={async () => {
                    const tmp = davisonRecord(working, partner, jdToLocal, null)
                    const zone = await window.astro.geo.zone(tmp.place.lat, tmp.place.lon)
                    openChart(davisonRecord(working, partner, jdToLocal, zone), 'natal')
                  }}
                  title={t('İki doğumun zaman ve mekân orta noktası')}
                >
                  {t('Davison')}
                </button>
              </>
            )}
          </div>
        )}
        {!amateur && <div className="rail-group rail-opts" role="group" aria-label={t('Görünüm')}>
        <span className="rail-cap">{t('Harita')}</span>
        <span className="rail-sub">{t('Harmonik')}</span>
        <select className="tg-harmonic" value={harmonic} onChange={(e) => setHarmonic(+e.target.value)} title={t('Harmonik harita (konumlar n ile çarpılır)')}>
          {Array.from({ length: 16 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n === 1 ? t('yok') : n}
            </option>
          ))}
        </select>
        <span className="rail-sub">{t('Ev sistemi')}</span>
        <select
          className="tg-house"
          value={settings.houseSystem}
          onChange={(e) => saveSettings({ ...settings, houseSystem: e.target.value })}
          title={t('Ev sistemi')}
        >
          {HOUSE_SYSTEMS.map(([k, n]) => (
            <option key={k} value={k}>
              {t(n)}
            </option>
          ))}
        </select>
        </div>}
        <span className="grow" />
        <span className="rail-cap rail-mode-cap">{t('Kullanım modu')}</span>
        <div className={`rail-mode is-${settings.mode}`} role="radiogroup" aria-label={t('Kullanım modu')}>
          <span className="rail-mode-thumb" aria-hidden />
          {(['amateur', 'professional'] as const).map((m) => (
            <button
              key={m}
              role="radio"
              aria-checked={settings.mode === m}
              className={settings.mode === m ? 'on' : ''}
              onClick={() => setMode(m)}
              title={m === 'amateur' ? t('Amatör: sade görünüm ve gündelik yanıtlar') : t('Profesyonel: tüm araçlar ve teknik yanıtlar')}
            >
              <span className="mode-full">{m === 'amateur' ? t('Amatör') : t('Profesyonel')}</span>
              <span className="mode-short" aria-hidden>
                {(m === 'amateur' ? t('Amatör') : t('Profesyonel')).charAt(0)}
              </span>
            </button>
          ))}
        </div>
      </nav>

      <TimeControls
        local={targetLocal}
        target={effTarget}
        natalLabel={working.id === NOW_ID ? t('Gökyüzü') : working.kind === 'event' ? t('Olay anı') : t('Doğum')}
        onTarget={(tg) => {
          // Stepping the transit date needs an outer layer: switch Transit on for it.
          if (tg === 'event' && !outers.length) toggleOuter('transit')
          else setTarget(tg)
        }}
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
        onLive={(v) => {
          if (v && ownMoment) toTransitNow()
          setLive(v)
        }}
        playing={playing}
        onPlaying={(v) => {
          setPlaying(v)
          if (v) setLive(false)
        }}
        speed={speed}
        onSpeed={setSpeed}
        zone={
          <>
        <div className="menu-wrap tb-zone-wrap">
          <button className="tb-zone" aria-expanded={zoneOpen} onClick={() => setZoneOpen(!zoneOpen)} title={t('Saat dilimleri')}>
            <Icon name="globe" size={15} />
            <span className="tz-name">{tzLabel(targetTz)}</span> <span className="muted">{fmtOffset(offsetAt(targetTz, targetJd, targetLon))}</span>
            <Icon name="chevron" size={13} />
          </button>
          {zoneOpen && (
            <div className="pop-menu zone-pop" onMouseLeave={() => setZoneOpen(false)}>
              {working.id !== NOW_ID && (
                <div className={`zone-row${effTarget === 'natal' ? ' current' : ''}`}>
                  <div>
                    <div className="zone-label">
                      {working.kind === 'event' ? t('Olay anı') : t('Doğum')}
                      {effTarget === 'natal' && <span className="zone-now">{t('oynatılıyor')}</span>}
                    </div>
                    <div className="zone-value">
                      {tzLabel(working.tz)} <span className="muted">{fmtOffset(offsetAt(working.tz, natalJd, working.place.lon))}</span>
                    </div>
                    <div className="muted small">{t('{place} konumundan gelir', { place: working.place.name.split(',')[0] })}</div>
                  </div>
                  <button className="small" onClick={() => (setZoneOpen(false), setEditor(working))}>
                    {t('Düzenle')}
                  </button>
                </div>
              )}
              <div className={`zone-row${effTarget === 'event' || working.id === NOW_ID ? ' current' : ''}`}>
                <div>
                  <div className="zone-label">
                    {t('Transit ve Bugün')}
                    {(effTarget === 'event' || working.id === NOW_ID) && <span className="zone-now">{t('oynatılıyor')}</span>}
                  </div>
                  <div className="zone-value">
                    {settings.defaultZone} <span className="muted">{fmtOffset(offsetAt(eventTz, eventJd, eventPlace?.lon ?? 0))}</span>
                  </div>
                  <div className="muted small">{settings.timezoneMode === 'system' ? t('Bilgisayarınızın saat dilimi') : t('Ayarlarda elle seçildi')}</div>
                </div>
                <button
                  className="small"
                  onClick={() => {
                    setZoneOpen(false)
                    setSettingsFocus('zone')
                    setShowSettings(true)
                  }}
                >
                  {t('Değiştir')}
                </button>
              </div>
            </div>
          )}
        </div>
          </>
        }
        right={
          <>
        {updateReady ? (
          <button className="update-pill" onClick={() => void window.astro.installUpdate()} title={t('İndirildi; uygulama yeniden başlayıp güncellenir')}>
            {t('v{v} hazır · Yeniden başlat', { v: updateReady })}
          </button>
        ) : update && (
          <a className="update-pill" href={update.url} target="_blank" rel="noreferrer" title={t('GitHub\'da yeni sürüm')}>
            {t('Yeni sürüm v{v} · İndir', { v: update.version })}
          </a>
        )}
        <div className="tb-app" role="group" aria-label={t('Ana menü')}>
          <button
            className="ghost-icon tip-end"
            onClick={() => saveSettings({ ...settings, theme: THEME_NEXT[settings.theme] })}
            title={`${t(THEME_LABEL[settings.theme])} — ${t('Tema: sistem → açık → koyu')}`}
            data-tip={t(THEME_LABEL[settings.theme])}
            aria-label={t(THEME_LABEL[settings.theme])}
          >
            <Icon name={THEME_ICON[settings.theme]} size={18} />
          </button>
          <button
            className={`ghost-icon tip-end tb-chat${showChat ? ' on' : ''}`}
            aria-pressed={showChat}
            onClick={() => setShowChat(!showChat)}
            aria-label={t('AI sohbet')}
            title={showChat ? t('Sohbeti gizle') : t('Sohbeti göster')}
            data-tip={t('AI sohbet')}
          >
            <Icon name="chat" size={18} />
          </button>
          <button className="ghost-icon tip-end" onClick={() => setShowSettings(true)} title={t('Ayarlar')} aria-label={t('Ayarlar')} data-tip={t('Ayarlar')}>
            <Icon name="gear" size={18} />
          </button>
        </div>
          </>
        }
      />

      <aside className="sidebar">
        {itemMenu && menuChart && (
          <div
            className="pop-menu row-menu"
            role="menu"
            style={{ left: Math.max(8, itemMenu.x - 200), top: Math.min(itemMenu.y, window.innerHeight - 280) }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {(
              [
                ['natal', menuChart.kind === 'event' ? 'Olay haritası' : 'Doğum haritası'],
                ['info', 'Bilgiler'],
                ['transit', 'Transit'],
                ...((menuChart.kind ?? 'person') === 'person' ? [['progressed', 'Progresyon']] : [])
              ] as [string, string][]
            ).map(([v, label]) => (
              <button key={v} role="menuitem" onClick={() => (setItemMenu(null), openChart(menuChart, v as Parameters<typeof openChart>[1]))}>
                {t(label)}
              </button>
            ))}
            <hr />
            <button role="menuitem" onClick={() => (setItemMenu(null), setEditor(menuChart))}>
              ✎ {t('Düzenle')}
            </button>
            <button role="menuitem" className="danger" onClick={() => (setItemMenu(null), void removeChart(menuChart))}>
              × {t('Sil')}
            </button>
          </div>
        )}
        <div className="side-head">
          <h2>{panel === 'sky' ? t('Gökyüzü') : t('Kişiler ve olaylar')}</h2>
          {panel === 'sky' && (
            <button className="ghost-icon sky-expand" title={t('Tam ekranda göster')} aria-label={t('Tam ekranda göster')} onClick={() => setSkyFull(true)}>
              ⤢
            </button>
          )}
          {panel === 'people' && (
            <button className="ghost-icon tip-end" data-tip={t('Kişiler ve olaylar: toplu düzenleme, içe/dışa aktarma, kopyalar')} aria-label={t('Kişiler ve olaylar')} onClick={() => setShowPeople(true)}>
              ☰
            </button>
          )}
          <button className="ghost-icon" onClick={() => setPanel(null)} aria-label={t('Paneli kapat')} title={t('Paneli kapat')}>
            <Icon name="close" />
          </button>
        </div>
        {panel === 'people' && (
          <>
        {pickPartner && (
          <div className="pick-banner" role="status">
            <strong>{t('Sinastri partneri seçin')}</strong>
            <span className="small">{t('{name} ile karşılaştırılacak kişiye tıklayın.', { name: working.name })}</span>
            <button className="small" onClick={() => endPick()}>
              {t('Vazgeç')}
            </button>
          </div>
        )}
        <div className="search-row">
          <input className="search" placeholder={t('Ara (isim, etiket, not, yer)…')} value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>
        {notice && <p className="small notice">{notice}</p>}
        {charts.some((c) => c.group) && (
          <div className="seg group-by" role="radiogroup" aria-label={t('Listeyi böl')}>
            <button role="radio" aria-checked={groupBy === 'kind'} className={groupBy === 'kind' ? 'on' : ''} onClick={() => changeGroupBy('kind')}>
              {t('Türe göre')}
            </button>
            <button role="radio" aria-checked={groupBy === 'group'} className={groupBy === 'group' ? 'on' : ''} onClick={() => changeGroupBy('group')}>
              {t('Gruba göre')}
            </button>
          </div>
        )}
        {allTags.length > 0 && (
          <div className="tag-filter">
            {allTags.map((t) => (
              <button key={t} className={tagFilter === t ? 'on' : ''} onClick={() => setTagFilter(tagFilter === t ? '' : t)}>
                #{t}
              </button>
            ))}
          </div>
        )}
        <div className="side-panes">
        <ul className="chart-list side-pane">
          {listSections.map(({ key: secKey, label, items: group }) => {
            if (!group.length) return null
            return [
              <li key={`h-${secKey}`} className="list-head">
                <button className="sec-toggle" aria-expanded={!collapsed[secKey]} onClick={() => toggleSection(secKey)}>
                  <span className="chev">{collapsed[secKey] ? '▸' : '▾'}</span> {label} <span className="muted">{group.length}</span>
                </button>
              </li>,
              ...group.filter((c) => !collapsed[secKey] || c.id === working.id).map((c) => {
                const kind = c.kind ?? 'person'
                return (
                <li
                  key={c.id}
                  className={[
                    c.id === working.id ? 'active' : '',
                    outers.includes('synastry') && c.id === partnerId ? 'is-partner' : '',
                    pickPartner && c.id === working.id ? 'pick-self' : ''
                  ].filter(Boolean).join(' ')}
                >
                  <div className="item-row">
                    <button
                      className="item"
                      disabled={pickPartner && c.id === working.id}
                      onClick={() => (pickPartner ? endPick(c.id) : openChart(c, 'natal'))}
                      onContextMenu={(e) => {
                        e.preventDefault()
                        setItemMenu({ id: c.id, x: e.clientX + 180, y: e.clientY })
                      }} title={kind === 'person' ? t('Doğum haritasına bak') : t('Olay haritasına bak')}>
                      <span className={`avatar sm ${kind === 'event' ? 'event' : ''}`}>{kind === 'event' ? '◆' : initialsOf(c.name)}</span>
                      <span className="item-text">
                        <span className="nm">
                          {c.favorite ? '★ ' : ''}
                          {c.name}
                          {outers.includes('synastry') && c.id === partnerId && (
                            <span className="partner-badge" style={{ ['--layer' as string]: LAYER_COLOR.synastry }} title={t('Sinastri partneri')}>
                              S
                            </span>
                          )}
                          {pickPartner && c.id === working.id && <span className="muted small"> · {t('bu harita')}</span>}
                        </span>
                        <span className="muted small">
                          {fmtLocal(c.local).split(' ')[0]}
                          {c.timeUnknown ? '' : ' ' + fmtLocal(c.local).split(' ')[1]} · {c.place.name.split(',')[0]}
                        </span>
                        {(c.tags?.length ?? 0) > 0 && <span className="item-tags">{c.tags!.map((t) => `#${t}`).join(' ')}</span>}
                      </span>
                    </button>
<button
                      className="row-more"
                      aria-label={t('Seçenekler')}
                      aria-haspopup="menu"
                      aria-expanded={itemMenu?.id === c.id}
                      onClick={(e) => {
                        const r = e.currentTarget.getBoundingClientRect()
                        setItemMenu(itemMenu?.id === c.id ? null : { id: c.id, x: r.right, y: r.bottom + 4 })
                      }}
                    >
                      ⋯
                    </button>
                  </div>
                </li>
                )
              })
            ]
          })}
          {!visible.length && (
            <li className="empty-list">
              <div>{t('Henüz kayıt yok')}</div>
              <div className="muted small">{t('“+ Kişi” ile doğum haritası, “+ Olay” ile olay haritası ekleyin.')}</div>
            </li>
          )}
        </ul>
        </div>
        <div className="side-actions">
          <button onClick={() => menuRef.current('import')}>{t('İçe aktar')}</button>
          <button onClick={() => menuRef.current('export')} disabled={!charts.length}>
            {t('Dışa aktar')}
          </button>
        </div>
          </>
        )}
        {panel === 'sky' && (
          <div className="side-sky-full">
            <SkyPanel report={sky} hours={hours} jd={skyJd} tz={eventTz} lon={settings.defaultPlace.lon} onJump={jumpTo} />
          </div>
        )}
      </aside>

      <main className="center">
        <div className="chart-head">
          <div>
            <h1>
              {working.name || t('İsimsiz')}
              {working.kind === 'event' && <span className="badge">{t('Olay')}</span>}
              {working.timeUnknown && <span className="badge warn" title={t('12:00 kullanıldı; yükselen ve evler güvenilmez')}>{t('Saat bilinmiyor')}</span>}
              {computed?.natal.houseFallback && (
                <span className="badge warn" title={t('Placidus, Koch ve Gauquelin kutup dairelerinin içinde (enlem ≥ 90° − 23,4°) matematiksel olarak tanımsızdır; Swiss Ephemeris bu durumda Porphyry ev başlangıçlarını kullanır.')}>
                  {t('Kutup dairesi: Porphyry kullanıldı')}
                </span>
              )}
              {working.rodden && !working.timeUnknown && <span className="badge" title={t('Rodden veri güvenilirliği')}>{working.rodden}</span>}
              <button
                className="head-edit"
                onClick={() => (working.id === NOW_ID ? menuRef.current('save') : setEditor(working))}
                title={working.id === NOW_ID ? t('Bu anı yeni bir harita olarak kaydet') : t('İsim, tarih, saat ve doğum yerini düzenle')}
              >
                {working.id === NOW_ID ? t('+ Harita olarak kaydet') : `✎ ${t('Düzenle')}`}
              </button>
            </h1>
            <div className="muted small">
              {fmtLocal(working.local, true)} {tzLabel(working.tz)} ({fmtOffset(offsetAt(working.tz, natalJd, working.place.lon))}) ·{' '}
              {working.place.name} {fmtCoord(working.place.lat, 'K', 'G')} {fmtCoord(working.place.lon, 'D', 'B')}
              {sun && moon ? ` · ${moonPhase(sun.lon, moon.lon).name}` : ''}
            </div>
            {computed?.outers.map((o, i) => (
              <div key={i} className="small" style={{ color: LAYER_COLOR[o.kind] }}>
                {t(o.label)}:{' '}
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
                      {t('◀ önceki')}
                    </button>
                    {o.kind === 'solarReturn' && (
                      <input
                        type="number"
                        className="ret-year"
                        title={t('Doğum günü yılı')}
                        value={computed.returns.find((r) => r.kind === 'solarReturn') ? jdToLocal(computed.returns.find((r) => r.kind === 'solarReturn')!.jd, working.tz, working.place.lon).y : ''}
                        onChange={(e) => e.target.value.length === 4 && setReturnYear(+e.target.value)}
                      />
                    )}
                    <button className="link small" onClick={() => shiftReturn(o.kind as 'solarReturn' | 'lunarReturn', 1)}>
                      {t('sonraki ▶')}
                    </button>
                    <button className="link small" onClick={() => openReturn(o.kind as 'solarReturn' | 'lunarReturn')}>
                      {t('ayrı harita olarak aç')}
                    </button>
                  </span>
                )}
                {o.kind === 'progressed' && computed.progressedJd ? ` (${t('progres tarih')} ${fmtLocal(jdToLocal(computed.progressedJd, working.tz, working.place.lon))})` : ''}
              </div>
            ))}
          </div>
          <div className="head-actions">
            {dirty && (
              <div className="unsaved" role="status">
                <span className="unsaved-dot" aria-hidden />
                <span>{t('Kaydedilmemiş değişiklik')}</span>
                {saved && <button onClick={() => setWorking(structuredClone(saved))}>{t('Geri al')}</button>}
                <button className="primary" onClick={() => menuRef.current('save')}>
                  {t('Kaydet')}
                </button>
              </div>
            )}
            <div className="menu-wrap">
              <button aria-expanded={exportOpen} onClick={() => setExportOpen(!exportOpen)}>
                {t('Dışa aktar')} ▾
              </button>
              {exportOpen && (
                <div className="pop-menu" onMouseLeave={() => setExportOpen(false)}>
                  {working.id !== NOW_ID && working.kind !== 'event' && (
                    <button onClick={() => (setExportOpen(false), setShowBirthday(true))} disabled={!computed}>
                      🎂 {t('Doğum günü raporu')} <span className="muted small">{t('bu yaşın sade özeti, PDF')}</span>
                    </button>
                  )}
                  <button onClick={() => (setExportOpen(false), setShowShare(true))} disabled={!computed}>
                    {t('Paylaşım kartı')} <span className="muted small">{t('Instagram, WhatsApp…')}</span>
                  </button>
                  <button onClick={() => (setExportOpen(false), void exportPng())}>
                    {t('Çark görseli (PNG)')}
                  </button>
                  <button onClick={() => (setExportOpen(false), void exportPdf())}>
                    {t('PDF rapor')} <span className="muted small">{t('çark, natal bilgiler, yorumlar')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="tabs view-tabs">
          <button className={view === 'chart' ? 'on' : ''} onClick={() => setView('chart')}>
            {t('Harita')}
          </button>
          <button className={view === 'today' ? 'on' : ''} onClick={() => setView('today')} title={t('Bugünün gökyüzü ve haritaya etkileri')}>
            {t('Bugün')}
          </button>
          {!amateur && (
            <button className={view === 'info' ? 'on' : ''} onClick={() => setView('info')}>
              {t('Natal Bilgiler')}
            </button>
          )}
          <button className={view === 'reading' ? 'on' : ''} onClick={() => setView('reading')} title={t('Yapay zekâ gerektirmeyen, çevrimdışı temel yorum')}>
            {t('Temel Yorum')}
          </button>
          {working.id !== NOW_ID && working.kind !== 'event' && (
            <button className={view === 'journal' ? 'on' : ''} onClick={() => setView('journal')} title={t('Hayatınızdaki olaylar ve o günlerin gökyüzü')}>
              {t('Olaylarım')}
              {working.journal?.length ? ` (${working.journal.length})` : ''}
            </button>
          )}
          <button className={view === 'days' ? 'on' : ''} onClick={() => setView('days')} title={t('Nikâh, yeni iş, saç, yolculuk… için geleneksel olarak uygun sayılan günler')}>
            {t('Uygun Günler')}
          </button>
          <button className={view === 'moon' ? 'on' : ''} onClick={() => setView('moon')} title={t('Ay evreleri, burçları ve boşluk saatleri; bahçe ve saç takvimi')}>
            {t('Ay Takvimi')}
          </button>
          {!amateur && (
            <>
              <button className={view === 'calendar' ? 'on' : ''} onClick={() => setView('calendar')}>
                {t('Transit Takvimi')}
              </button>
              <button className={view === 'ephem' ? 'on' : ''} onClick={() => setView('ephem')}>
                {t('Grafik Efemeris')}
              </button>
              <button className={view === 'acg' ? 'on' : ''} onClick={() => setView('acg')}>
                {t('Astrokartografi')}
              </button>
              <button className={view === 'election' ? 'on' : ''} onClick={() => setView('election')}>
                {t('Zaman Seçimi')}
              </button>
            </>
          )}
          <button className={view === 'notes' ? 'on' : ''} onClick={() => setView('notes')}>
            {t('Yorumlar')}
            {chartInterps.length ? ` (${chartInterps.length})` : ''}
          </button>
          <button className={view === 'kb' ? 'on' : ''} onClick={() => setView('kb')}>
            {t('Bilgi Bankası')}
            {kbMatches.length ? ` (${kbMatches.length})` : ''}
          </button>
        </div>

        {calcError && <div className="error pad">{t('Hesaplama hatası')}: {calcError}</div>}
        {view === 'info' && computed && (
          <NatalInfo
            natal={computed.natal}
            rec={working}
            settings={settings}
            natalJd={natalJd}
            eventJd={eventJd}
            patterns={patterns}
            stars={starConj}
            partner={(() => {
              const l = computed.outers.find((o) => o.kind === 'synastry')
              return l ? { name: partner?.name || l.label, layer: l } : null
            })()}
          />
        )}
        {view === 'today' && (
          <TodayView natal={computed?.natal ?? null} rec={working} settings={settings} tz={eventTz} isNow={working.id === NOW_ID} onAsk={ask} onJump={(jd) => {
            jumpTo(jd)
            setView('chart')
          }} />
        )}
        {view === 'journal' && computed && working.id !== NOW_ID && (
          <Journal natal={computed.natal} rec={working} settings={settings} onSave={saveJournal} onAsk={ask} onRectify={() => setShowRectify(true)} />
        )}
        {view === 'days' && eventPlace && <GoodDays natal={goodDaysNatal} tz={eventTz} lon={eventPlace.lon} settings={settings} onAsk={ask} />}
        {view === 'moon' && eventPlace && <MoonCalendar tz={eventTz} lat={eventPlace.lat} lon={eventPlace.lon} settings={settings} onAsk={ask} />}
        {view === 'reading' && computed && <BasicReading natal={computed.natal} rec={working} settings={settings} onAsk={ask} synastry={computed.outers.find((o) => o.kind === 'synastry') ?? null} partner={partner} onBirthday={working.id !== NOW_ID ? () => setShowBirthday(true) : undefined} />}
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
        {view === 'ephem' && computed && (
          <GraphicEphemeris natal={computed.natal} startJd={eventJd} tz={working.tz} lon={working.place.lon} settings={settings} onJump={jumpTo} />
        )}
        {view === 'election' && (
          <ElectionalSearch startJd={eventJd} place={settings.defaultPlace} tz={eventTz} settings={settings} onJump={jumpTo} onAsk={ask} />
        )}
        {view === 'acg' && computed && (
          <Astrocartography
            natal={computed.natal}
            rec={working}
            onAsk={ask}
            onRelocate={(place) => {
              const tz: TzSpec = place.zone ? { kind: 'zone', zone: place.zone } : { kind: 'lmt' }
              openChart(
                {
                  ...working,
                  id: `reloc-${working.id}-${place.lat.toFixed(2)}-${place.lon.toFixed(2)}`,
                  name: `${working.name} — ${place.name.split(',')[0]} (${t('taşınmış')})`,
                  local: jdToLocal(natalJd, tz, place.lon),
                  tz,
                  place: { name: place.name, lat: place.lat, lon: place.lon, cc: place.cc, country: place.country, zone: place.zone },
                  notes: t('{name} haritasının {place} konumuna taşınmış hâli (aynı doğum anı).', { name: working.name, place: place.name }),
                  createdAt: 0,
                  updatedAt: 0
                },
                'natal'
              )
            }}
          />
        )}
        {view === 'notes' && (
          <Interpretations
            items={chartInterps}
            onUpdate={async (id, patch) => setInterps(await window.astro.interp.update(id, patch))}
            onRemove={async (id) => setInterps(await window.astro.interp.remove(id))}
          />
        )}
        {view === 'kb' && <Knowledge files={kbFiles} entries={kbEntries} matches={kbMatches} starNames={starPos.map((st) => st.name)} onReload={reloadKb} onAsk={ask} />}
        {view === 'chart' && computed && (
          <ChartWheel natal={shown!.natal} outers={shown!.outers} settings={settings} aspectLayer={aspectLayer} onWheel={onWheel} onAsk={ask} timeKnown={!working.timeUnknown} />
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
            ).filter(([k]) => !amateur || AMATEUR_TABS.includes(k)).map(([k, l]) => (
              <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
                {t(l)}
              </button>
            ))}
            {outers.length > 0 && !amateur && (
              <select value={aspectLayer} onChange={(e) => setAspectLayer(Number(e.target.value))} title={t('Çarkta ve tabloda gösterilen açılar')}>
                <option value={-1}>{t('Açılar: Natal ↔ Natal')}</option>
                {computed?.outers.map((o, i) => (
                  <option key={i} value={i}>
                    {t('Açılar')}: {t(o.label)} → Natal
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
              {tab === 'positions' && <PositionsTable natal={shown!.natal} outers={shown!.outers} />}
              {tab === 'aspects' && <AspectList natal={computed.natal} outer={aspectLayer >= 0 ? computed.outers[aspectLayer] ?? null : null} settings={settings} />}
              {tab === 'grid' && <AspectGrid natal={computed.natal} outer={aspectLayer >= 0 ? computed.outers[aspectLayer] ?? null : null} settings={settings} />}
              {tab === 'houses' && <HousesTable natal={computed.natal} />}
            </div>
          )}
        </div>}
      </main>

      {skyFull && (
        <div
          className="lightbox-back"
          onMouseDown={(e) => e.target === e.currentTarget && setSkyFull(false)}
          onKeyDown={(e) => e.key === 'Escape' && setSkyFull(false)}
        >
          <div className="lightbox sky-lightbox" role="dialog" aria-label={t('Gökyüzü')}>
            <div className="lightbox-head">
              <div>
                <h2>{t('Gökyüzü')}</h2>
                <div className="muted small">{t('Anlık gökyüzü; zamanı ilerlettikçe güncellenir.')}</div>
              </div>
              <button autoFocus onClick={() => setSkyFull(false)}>
                ⤡ {t('Küçült')}
              </button>
            </div>
            <div className="lightbox-body">
              <SkyPanel report={sky} hours={hours} jd={skyJd} tz={eventTz} lon={settings.defaultPlace.lon} onJump={jumpTo} wide />
            </div>
          </div>
        </div>
      )}
      {showShare && computed && <ShareCard
          natal={computed.natal}
          rec={working}
          settings={settings}
          events={sky ? [...sky.events, ...sky.nextEclipses.filter((e) => !sky.events.includes(e))].filter((e) => e.jd > nowJd() - 1).sort((a, b) => a.jd - b.jd).slice(0, 30) : []}
          tz={eventTz}
          lon={settings.defaultPlace.lon}
          onClose={() => setShowShare(false)}
        />}
      {showChat && (
        <aside className="chatside">
          <ChatPanel
            chatKey={working.id}
            context={context}
            live={live}
            layers={working.id === NOW_ID ? ['sky', ...outers] : ['natal', ...outers]}
            settings={settings}
            onSettings={saveSettings}
            onSave={saveInterpretation}
            inject={inject}
            knowledge={knowledgeFor}
            timing={timingFor}
            knowledgeCount={kbFiles.length}
            onOpenSettings={(f) => {
              setSettingsFocus(f)
              setShowSettings(true)
            }}
          />
        </aside>
      )}
      {showRectify && working.id !== NOW_ID && (
        <Rectify
          rec={working}
          onClose={() => setShowRectify(false)}
          onApply={(h, mi) => {
            // On screen only; the user saves it if it looks right.
            setWorking({ ...working, local: { ...working.local, h, mi, s: 0 }, timeUnknown: undefined, rodden: working.timeUnknown || !working.rodden ? 'C' : working.rodden })
            setShowRectify(false)
            setView('chart')
          }}
        />
      )}
      {showPeople && (
        <PeopleManager
          charts={charts}
          professional={!amateur}
          onChange={chartsChanged}
          onOpen={(c) => (setShowPeople(false), openChart(c, 'natal'))}
          onEdit={(c) => (setShowPeople(false), setEditor(c))}
          onImport={() => setImporting('blank')}
          onClose={() => setShowPeople(false)}
        />
      )}
      {importing && (
        <ImportDialog
          initial={importing === 'blank' ? null : importing}
          charts={charts}
          onDone={(all, m) => (chartsChanged(all), setImporting(null), flashNotice(m))}
          onClose={() => setImporting(null)}
        />
      )}
      {showNight && eventPlace && <NightSky place={eventPlace} tz={eventTz} sidMode={settings.zodiac === 'sidereal' ? settings.sidMode : null} onClose={() => setShowNight(false)} />}
      {showBirthday && computed && working.id !== NOW_ID && (
        <BirthdayReport natal={computed.natal} rec={working} settings={settings} onAsk={ask} onClose={() => setShowBirthday(false)} />
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
          existing={charts}
          sidMode={settings.zodiac === 'sidereal' ? settings.sidMode : null}
          onClose={() => setEditor(null)}
          onApply={(rec, save) => {
            // The very first saved chart opens on the offline reading: something to read right away, no AI needed.
            const firstChart = save && charts.length === 0
            setEditor(null)
            if (save) void persist(rec)
            else {
              setWorking(rec)
              if (!charts.some((c) => c.id === rec.id)) setSaved(null)
            }
            setOuters([])
            setAspectLayer(-1)
            setView(firstChart ? 'reading' : 'chart')
          }}
        />
      )}
      {obOpen && (
        <Onboarding
          hidden={!!editor}
          settings={settings}
          onSettings={saveSettings}
          onAddPerson={() => setEditor(blankChart(settings))}
          onDone={() => {
            setObOpen(false)
            saveSettings({ ...settings, onboarded: true, seenVersion: appVersion || settings.seenVersion })
          }}
        />
      )}
      {!obOpen && !termsAccepted(settings) && <TermsDialog settings={settings} onAccept={saveSettings} />}
      {showKeys && <Shortcuts onClose={() => setShowKeys(false)} />}
      {showReport && <ReportDialog onClose={() => setShowReport(false)} />}
      {whatsNew && !obOpen && (
        <WhatsNewDialog
          version={whatsNew.version}
          notes={whatsNew.notes}
          onClose={() => {
            setWhatsNew(null)
            saveSettings({ ...settings, seenVersion: whatsNew.version })
          }}
        />
      )}
      {showSettings && (
        <SettingsDialog
          settings={settings}
          people={charts.filter((c) => (c.kind ?? 'person') === 'person').map((c) => ({ id: c.id, name: c.name }))}
          focus={settingsFocus}
          onClose={() => {
            setShowSettings(false)
            setSettingsFocus(undefined)
          }}
          onSave={(s) => {
            setShowSettings(false)
            setSettingsFocus(undefined)
            saveSettings(s)
          }}
        />
      )}
    </div>
  )
}
