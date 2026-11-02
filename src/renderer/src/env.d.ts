import type { AstroApi } from '../../preload'

declare global {
  interface Window {
    astro: AstroApi
  }
}
