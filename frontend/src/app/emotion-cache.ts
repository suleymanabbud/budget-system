import createCache from '@emotion/cache'
import { prefixer } from 'stylis'
import rtlPlugin from 'stylis-plugin-rtl'

// RTL cache for Material-UI to generate proper RTL CSS from the start
const isBrowser = typeof document !== 'undefined'
let insertionPoint: HTMLElement | undefined

if (isBrowser) {
  const meta = document.querySelector('meta[name="emotion-insertion-point"]') as HTMLElement | null
  if (meta) insertionPoint = meta
}

export const rtlCache = createCache({
  key: 'mui-rtl',
  stylisPlugins: [prefixer, rtlPlugin],
  insertionPoint,
})


