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
}

export interface KbFile {
  name: string
  text: string
}

const META = /^-\s*(anahtarlar|keys|etiketler|tags)\s*:\s*(.*)$/i

const list = (s: string) =>
  s
    .split(',')
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean)

export function parseKnowledge(file: string, text: string): KbEntry[] {
  const out: KbEntry[] = []
  let category = file.replace(/\.(md|txt)$/i, '')
  let section = ''
  let cur: KbEntry | null = null
  let inMeta = false
  const flush = () => {
    if (cur) {
      cur.body = cur.body.trim()
      out.push(cur)
    }
    cur = null
  }
  for (const line of text.replace(/\r\n/g, '\n').split('\n')) {
    if (/^#\s+/.test(line)) {
      flush()
      category = line.replace(/^#\s+/, '').trim()
      continue
    }
    if (/^##\s+/.test(line)) {
      flush()
      section = line.replace(/^##\s+/, '').trim()
      continue
    }
    if (/^###\s+/.test(line)) {
      flush()
      const title = line.replace(/^###\s+/, '').trim()
      cur = { id: `${file}#${out.length}`, file, category, section, title, keys: [], tags: [], body: '' }
      inMeta = true
      continue
    }
    if (!cur) continue
    const m = inMeta ? META.exec(line.trim()) : null
    if (m) {
      const isKeys = /^(anahtarlar|keys)$/i.test(m[1])
      ;(isKeys ? cur.keys : cur.tags).push(...list(m[2]))
      continue
    }
    if (line.trim()) inMeta = false
    cur.body += line + '\n'
  }
  flush()
  return out
}
