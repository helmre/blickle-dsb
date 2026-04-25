import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { commitRef, commitRefs } from './storeCommit.js'

describe('storeCommit', () => {
  it('rolls a ref back when persistence fails', () => {
    const state = ref(['a'])

    expect(() => {
      commitRef(state, ['a', 'b'], () => {
        throw new Error('quota')
      })
    }).toThrow('quota')

    expect(state.value).toEqual(['a'])
  })

  it('rolls multiple refs back together when persistence fails', () => {
    const first = ref('a')
    const second = ref('b')

    expect(() => {
      commitRefs([
        { target: first, value: 'next-a' },
        { target: second, value: 'next-b' },
      ], () => {
        throw new Error('quota')
      })
    }).toThrow('quota')

    expect(first.value).toBe('a')
    expect(second.value).toBe('b')
  })
})
