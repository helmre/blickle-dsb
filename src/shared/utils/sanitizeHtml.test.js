import { describe, expect, it } from 'vitest'
import { isAllowedIframeUrl, sanitizeTemplateCss } from './sanitizeHtml.js'

describe('sanitizeTemplateCss', () => {
  it('scopes template selectors and removes risky CSS primitives', () => {
    const css = `
      @import url("https://example.com/font.css");
      body { display: none; }
      .tpl-card, .tpl-card h1 { position: fixed; background: url("https://example.com/x.png"); }
      @media screen { .tpl-card { color: red; } }
    `

    const clean = sanitizeTemplateCss(css, '.scope')

    expect(clean).not.toContain('@import')
    expect(clean).not.toContain('url(')
    expect(clean).not.toContain('position: fixed')
    expect(clean).toContain('.scope body')
    expect(clean).toContain('.scope .tpl-card, .scope .tpl-card h1')
    expect(clean).toContain('@media screen{.scope .tpl-card')
  })
})

describe('isAllowedIframeUrl', () => {
  it('allows only approved iframe providers', () => {
    expect(isAllowedIframeUrl('https://www.youtube.com/embed/abc')).toBe(true)
    expect(isAllowedIframeUrl('https://player.vimeo.com/video/123')).toBe(true)
    expect(isAllowedIframeUrl('https://intranet.example.com/dashboard')).toBe(false)
    expect(isAllowedIframeUrl('javascript:alert(1)')).toBe(false)
  })
})
