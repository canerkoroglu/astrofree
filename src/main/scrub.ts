// Masks personal data in error reports ("Report a problem"). Pure functions,
// no Electron imports, so they can be tested on their own.
import { homedir } from 'node:os'
import { basename } from 'node:path'

const escapeRe = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Remove what could identify the user before anything reaches the report:
 * home-folder paths in every spelling (\ or /, file:// URLs, any case), the
 * user name, e-mail addresses, API-key-like strings and secrets in URL queries.
 */
export function scrub(s: string, max = 2000): string {
  let out = s
  const home = homedir()
  const user = basename(home)
  const variants = new Set([home, home.replace(/\\/g, '/'), home.replace(/\//g, '\\')])
  for (const v of variants) if (v.length > 3) out = out.replace(new RegExp(escapeRe(v), 'gi'), '~')
  // Other users' folders or the user name on its own (e.g. in paths from another drive).
  out = out.replace(/([\\/](?:Users|home)[\\/])[^\\/\s:'"]+/gi, '$1<user>')
  if (user.length >= 3) out = out.replace(new RegExp(`\\b${escapeRe(user)}\\b`, 'gi'), '<user>')
  out = out
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, '<email>')
    .replace(/\b(sk-(?:ant-|proj-)?[A-Za-z0-9_-]{4,}|AIza[0-9A-Za-z_-]{10,}|gh[pousr]_[A-Za-z0-9]{10,}|xox[abpr]-[A-Za-z0-9-]{10,})/g, '<key>')
    .replace(/\b(Bearer|x-api-key:?|api[_-]?key[=:]\s*)\s*[A-Za-z0-9._-]{8,}/gi, '$1 <key>')
    .replace(/([?&](?:key|token|access_token|api_key|apikey|auth|sig|signature)=)[^&\s]+/gi, '$1<redacted>')
    .replace(/\b[A-Za-z0-9_-]{32,}\b/g, '<long-token>')
  return out.replace(/\s+$/, '').slice(0, max)
}

const ISSUE_URL_MAX = 7000

/** New-issue address with the scrubbed text, kept under the length GitHub accepts. */
export function issueUrl(repo: string, title: string, body: string): string {
  const t = encodeURIComponent(scrub(String(title), 200))
  let b = scrub(String(body), 20000)
  const make = () => `${repo}/issues/new?title=${t}&body=${encodeURIComponent(b)}`
  while (make().length > ISSUE_URL_MAX && b.length > 200) b = b.slice(0, Math.floor(b.length * 0.85)) + '\n…'
  return make()
}

