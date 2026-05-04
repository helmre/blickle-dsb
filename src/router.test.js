import { beforeEach, describe, expect, it, vi } from 'vitest'

function installBrowserHistoryStubs() {
  Object.defineProperty(globalThis, 'window', {
    value: globalThis,
    configurable: true,
  })
  Object.defineProperty(globalThis, 'location', {
    value: {
      protocol: 'http:',
      host: 'localhost:5173',
      pathname: '/',
      search: '',
      hash: '',
    },
    configurable: true,
  })
  Object.defineProperty(globalThis, 'history', {
    value: {
      state: null,
      pushState: vi.fn(),
      replaceState: vi.fn(),
    },
    configurable: true,
  })
  Object.defineProperty(globalThis, 'document', {
    value: {
      querySelector: vi.fn(() => null),
      createElement: vi.fn(() => ({ innerHTML: '', content: { firstChild: null } })),
      createElementNS: vi.fn(() => ({})),
    },
    configurable: true,
  })
  globalThis.addEventListener = vi.fn()
  globalThis.removeEventListener = vi.fn()
}

describe('router compatibility routes', () => {
  beforeEach(() => {
    vi.resetModules()
    installBrowserHistoryStubs()
  })

  it('redirects legacy template editor deep links to the template catalog selection query', async () => {
    const { default: router } = await import('./router.js')
    const match = router.resolve('/admin/templates/tpl-announcement/edit')

    expect(match.name).toBe('admin-template-editor-legacy')
    expect(match.redirectedFrom).toBeUndefined()
    expect(match.matched.at(-1)?.redirect(match)).toEqual({
      name: 'admin-templates',
      query: { template: 'tpl-announcement' },
    })
  })
})
