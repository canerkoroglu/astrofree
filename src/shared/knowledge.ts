// Personal knowledge base: Markdown files in the user's data folder. Each
// "### Title" block is one entry; optional "- anahtarlar:" / "- etiketler:"
// lines (or "- keys:" / "- tags:") right after the title tie it to charts.

export interface KbEntry {
  id: string
  file: string
  /** The file's "# " heading, or its name. */
  category: string
  /** The nearest "## " heading above the entry, if any. */
  section: string
  title: string
  keys: string[]
  tags: string[]
  body: string
  /** Line range of the block in its file (end exclusive), for in-place edits. */
  start: number
  end: number
}

export interface KbFile {
  name: string
  text: string
}

const META = /^-\s*(anahtarlar|keys|etiketler|tags)\s*:\s*(.*)$/i
const FENCE = /^\s*(```|~~~)/

const list = (s: string) =>
  s
    .split(',')
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean)

const lines = (text: string) => text.replace(/\r\n/g, '\n').split('\n')

/** The file's own "# " title, or its name without number prefix and extension. */
export function fileTitle(name: string, text: string): string {
  const h = lines(text).find((l) => /^#\s+/.test(l))
  if (h) return h.replace(/^#\s+/, '').trim()
  return name.replace(/\.(md|txt)$/i, '').replace(/^\d+[-_ ]*/, '').replace(/[-_]+/g, ' ')
}

export function parseKnowledge(file: string, text: string): KbEntry[] {
  const out: KbEntry[] = []
  let category = fileTitle(file, text)
  let section = ''
  let cur: KbEntry | null = null
  let inMeta = false
  let fence = false
  const all = lines(text)
  const flush = (end: number) => {
    if (cur) {
      cur.body = cur.body.trim()
      cur.end = end
      out.push(cur)
    }
    cur = null
  }
  all.forEach((line, i) => {
    // Headings inside code blocks are examples, not entries.
    if (FENCE.test(line)) fence = !fence
    if (fence || FENCE.test(line)) {
      if (cur) cur.body += line + '\n'
      return
    }
    if (/^#\s+/.test(line)) {
      flush(i)
      category = line.replace(/^#\s+/, '').trim()
      return
    }
    if (/^##\s+/.test(line)) {
      flush(i)
      section = line.replace(/^##\s+/, '').trim()
      return
    }
    if (/^###\s+/.test(line)) {
      flush(i)
      const title = line.replace(/^###\s+/, '').trim()
      cur = { id: `${file}#${out.length}`, file, category, section, title, keys: [], tags: [], body: '', start: i, end: i + 1 }
      inMeta = true
      return
    }
    if (!cur) return
    const m = inMeta ? META.exec(line.trim()) : null
    if (m) {
      const isKeys = /^(anahtarlar|keys)$/i.test(m[1])
      ;(isKeys ? cur.keys : cur.tags).push(...list(m[2]))
      return
    }
    if (line.trim()) inMeta = false
    cur.body += line + '\n'
  })
  flush(all.length)
  return out
}

export function serializeEntry(e: Pick<KbEntry, 'title' | 'keys' | 'tags' | 'body'>): string {
  const out = [`### ${e.title.trim()}`]
  if (e.keys.length) out.push(`- anahtarlar: ${e.keys.join(', ')}`)
  if (e.tags.length) out.push(`- etiketler: ${e.tags.join(', ')}`)
  out.push(e.body.trim(), '')
  return out.join('\n')
}

/** Replace one entry's block in its file text. */
export function replaceEntry(text: string, e: KbEntry, block: string): string {
  const all = lines(text)
  const after = all.slice(e.end)
  while (after.length && !after[0].trim()) after.shift()
  return [...all.slice(0, e.start), ...block.replace(/\n+$/, '').split('\n'), '', ...after].join('\n')
}

/** Remove one entry's block from its file text. */
export function removeEntry(text: string, e: KbEntry): string {
  const all = lines(text)
  return [...all.slice(0, e.start), ...all.slice(e.end)].join('\n')
}

/** Append an entry at the end of a file (creating its title when empty). */
export function appendEntry(text: string, title: string, block: string): string {
  const base = text.trim() ? text.replace(/\s+$/, '') : `# ${title}`
  return `${base}\n\n${block.replace(/\n+$/, '')}\n`
}
