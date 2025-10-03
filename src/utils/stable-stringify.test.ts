import { describe, expect, it } from 'vitest'
import stableStringify, { compareKeys } from './stable-stringify'

describe('compareKeys', () => {
  it('orders case-insensitively using localeCompare', () => {
    const keys = ['b', 'A', 'c'].toSorted(compareKeys)
    expect(keys).toEqual(['A', 'b', 'c'])
  })
})

describe('stableStringify', () => {
  it('serializes primitives', () => {
    expect(stableStringify('x')).toBe('"x"')
    expect(stableStringify(true)).toBe('true')
    expect(stableStringify(42)).toBe('42')
    expect(stableStringify(Number.NaN)).toBe('null')
  })

  it('stably sorts object keys and omits non-serializable members', () => {
    const input = { b: 1, A: 2, skip: undefined as unknown, fn: () => 1 }
    const output = stableStringify(input)
    expect(output).toBe('{"A":2,"b":1}')
  })

  it('stably serializes Map and Set content', () => {
    const m = new Map<string, number>([
      ['b', 1],
      ['A', 2],
    ])
    const s = new Set<string>(['b', 'A'])
    expect(stableStringify(m)).toBe('[["A",2],["b",1]]')
    expect(stableStringify(s)).toBe('["A","b"]')
  })

  it('throws on circular structures', () => {
    interface Circular {
      self?: Circular
    }
    const obj: Circular = {}
    obj.self = obj
    expect(() => stableStringify(obj)).toThrow('Converting circular structure to JSON')
  })
})
