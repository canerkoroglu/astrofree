import type { AppSettings, ChartRecord, Interpretation } from '@shared/types'
import type { Pattern } from '../lib/patterns'
import type { Computed } from '../lib/chart'
import ChartWheel from './ChartWheel'
import { MarkdownBlock } from './Interpretations'
import NatalInfo, { type StarConj } from './NatalInfo'

/** Print-only layout used for the PDF report (hidden on screen). */
export default function PrintReport({
  computed,
  rec,
  settings,
  natalJd,
  eventJd,
  patterns,
  stars,
  interpretations
}: {
  computed: Computed
  rec: ChartRecord
  settings: AppSettings
  natalJd: number
  eventJd: number
  patterns: Pattern[]
  stars: StarConj[]
  interpretations: Interpretation[]
}) {
  return (
    <div className="print-root">
      <div className="print-wheel">
        <ChartWheel natal={computed.natal} outers={computed.outers} settings={settings} aspectLayer={computed.outers.length ? 0 : -1} />
      </div>
      <NatalInfo natal={computed.natal} rec={rec} settings={settings} natalJd={natalJd} eventJd={eventJd} patterns={patterns} stars={stars} />
      {interpretations.length > 0 && (
        <section className="print-interp">
          <h2>Yorumlar</h2>
          {[...interpretations]
            .sort((a, b) => a.createdAt - b.createdAt)
            .map((it) => (
              <article key={it.id}>
                <h3>{it.title}</h3>
                <MarkdownBlock text={it.content} />
              </article>
            ))}
        </section>
      )}
      <p className="print-foot">AstroFree · Swiss Ephemeris</p>
    </div>
  )
}
