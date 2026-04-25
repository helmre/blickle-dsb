import DOMPurify from 'dompurify'

const RICH_ALLOWED_TAGS = [
  'a',
  'article',
  'aside',
  'b',
  'br',
  'div',
  'em',
  'figcaption',
  'figure',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'iframe',
  'img',
  'li',
  'ol',
  'p',
  'section',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'ul',
]

const RICH_ALLOWED_ATTR = [
  'allow',
  'allowfullscreen',
  'alt',
  'aria-label',
  'class',
  'height',
  'href',
  'loading',
  'referrerpolicy',
  'rel',
  'role',
  'src',
  'target',
  'title',
  'width',
]

const FORBID_TAGS = [
  'base',
  'embed',
  'form',
  'input',
  'link',
  'meta',
  'object',
  'script',
  'style',
]

const ALLOWED_IFRAME_HOSTS = new Set([
  'blickle.com',
  'www.blickle.com',
  'player.vimeo.com',
  'vimeo.com',
  'www.youtube-nocookie.com',
  'www.youtube.com',
  'youtube-nocookie.com',
  'youtube.com',
])

function hostnameMatches(hostname, allowedHost) {
  return hostname === allowedHost || hostname.endsWith(`.${allowedHost}`)
}

export function isAllowedIframeUrl(rawSrc, baseOrigin = globalThis.location?.origin || 'https://display.local') {
  if (!rawSrc) return false
  let url
  try {
    url = new URL(rawSrc, baseOrigin)
  } catch {
    return false
  }
  if (!['https:', 'http:'].includes(url.protocol)) return false
  return [...ALLOWED_IFRAME_HOSTS].some(host => hostnameMatches(url.hostname.toLowerCase(), host))
}

function sanitize(dirty, options = {}) {
  return DOMPurify.sanitize(String(dirty || ''), {
    ALLOWED_TAGS: RICH_ALLOWED_TAGS,
    ALLOWED_ATTR: RICH_ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS,
    ...options,
  })
}

function secureIframe(iframe) {
  const src = iframe.getAttribute('src') || ''
  let url
  try {
    url = new URL(src, window.location.origin)
  } catch {
    iframe.remove()
    return
  }

  if (!isAllowedIframeUrl(url.href, window.location.origin)) {
    iframe.remove()
    return
  }

  iframe.setAttribute('src', url.href)
  iframe.setAttribute('loading', 'lazy')
  iframe.setAttribute('referrerpolicy', 'no-referrer')
  iframe.setAttribute('sandbox', 'allow-scripts allow-presentation')
  iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture')
}

function secureRenderedHtml(html) {
  if (!html || typeof window === 'undefined' || typeof DOMParser === 'undefined') return html
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html')
  doc.querySelectorAll('iframe').forEach(secureIframe)
  doc.querySelectorAll('a[target="_blank"]').forEach((link) => {
    link.setAttribute('rel', 'noopener noreferrer')
  })
  return doc.body.firstElementChild?.innerHTML || ''
}

function findMatchingBrace(css, openIndex) {
  let depth = 0
  for (let i = openIndex; i < css.length; i++) {
    if (css[i] === '{') depth++
    if (css[i] === '}') {
      depth--
      if (depth === 0) return i
    }
  }
  return css.length - 1
}

function scopeSelectors(selectorText, scope) {
  return selectorText
    .split(',')
    .map(selector => selector.trim())
    .filter(Boolean)
    .map((selector) => {
      if (selector.includes(scope)) return selector
      if (selector.startsWith('&')) return selector.replace(/^&/, scope)
      return `${scope} ${selector}`
    })
    .join(', ')
}

function scopeCssRules(css, scope) {
  let output = ''
  let cursor = 0

  while (cursor < css.length) {
    const open = css.indexOf('{', cursor)
    if (open === -1) {
      output += css.slice(cursor)
      break
    }

    const selector = css.slice(cursor, open).trim()
    const close = findMatchingBrace(css, open)
    const body = css.slice(open + 1, close)
    const lowerSelector = selector.toLowerCase()

    if (lowerSelector.startsWith('@media') || lowerSelector.startsWith('@supports')) {
      output += `${selector}{${scopeCssRules(body, scope)}}`
    } else if (lowerSelector.startsWith('@keyframes')) {
      output += `${selector}{${body}}`
    } else if (!lowerSelector.startsWith('@')) {
      output += `${scopeSelectors(selector, scope)}{${body}}`
    }

    cursor = close + 1
  }

  return output
}

export function sanitizeRichHtml(dirty) {
  return secureRenderedHtml(sanitize(dirty))
}

export function sanitizeEmbedHtml(dirty) {
  const clean = sanitize(dirty, {
    ALLOWED_TAGS: ['iframe'],
    ALLOWED_ATTR: ['allow', 'allowfullscreen', 'height', 'loading', 'referrerpolicy', 'src', 'title', 'width'],
  })
  return secureRenderedHtml(clean)
}

export function sanitizeTemplateCss(dirty, scope = '.zone-template-renderer .template-content') {
  const css = String(dirty || '')
    .replace(/<\/?style\b[^>]*>/gi, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/@import\b[^;]*;?/gi, '')
    .replace(/@charset\b[^;]*;?/gi, '')
    .replace(/url\s*\([^)]*\)/gi, 'none')
    .replace(/expression\s*\([^)]*\)/gi, '')
    .replace(/-moz-binding\s*:[^;}]*/gi, '')
    .replace(/behavior\s*:[^;}]*/gi, '')
    .replace(/\bposition\s*:\s*fixed\s*;?/gi, 'position:absolute;')

  return scopeCssRules(css, scope).trim()
}
