// Deterministic JSON serialization: recursively sort object keys
// - Objects: keys sorted lexicographically using localeCompare
// - Arrays: preserve order
// - Primitives: JSON.stringify default behavior (with safe fallbacks)

function compareStrings(a: string, b: string): number {
  return a.localeCompare(b, 'en', { sensitivity: 'base' })
}

function compareKeys(a: string, b: string): number {
  return compareStrings(a, b)
}

// Helper function to create a sorted copy of an array (replaces toSorted() for Convex compatibility)
function sortedCopy<T>(arr: T[], compareFn: (a: T, b: T) => number): T[] {
  // eslint-disable-next-line unicorn/no-array-sort
  return [...arr].sort(compareFn)
}

function serializePrimitive(value: unknown): string | null {
  if (value === null) return 'null'

  const valueType = typeof value
  if (valueType === 'string' || valueType === 'boolean') return JSON.stringify(value)
  if (valueType === 'number') return JSON.stringify(Number.isFinite(value as number) ? (value as number) : null)
  if (valueType === 'bigint') return JSON.stringify((value as bigint).toString())
  if (valueType === 'undefined' || valueType === 'function' || valueType === 'symbol') return 'null'
  return null
}

function serializeDateOrRegExp(obj: object): string | null {
  if (obj instanceof Date) return JSON.stringify(obj.toJSON())
  if (obj instanceof RegExp) return JSON.stringify(obj.toString())
  return null
}

function serializeMap(obj: Map<unknown, unknown>, seen: WeakSet<object>): string {
  seen.add(obj)
  try {
    const pairStrings: string[] = []
    for (const [k, v] of obj.entries()) {
      const keyJson = serialize(k, seen)
      const valueJson = serialize(v, seen)
      pairStrings.push(`[${keyJson},${valueJson}]`)
    }
    const sortedPairs: string[] = sortedCopy(pairStrings, compareStrings)
    return `[${sortedPairs.join(',')}]`
  } finally {
    seen.delete(obj)
  }
}

function serializeSet(obj: Set<unknown>, seen: WeakSet<object>): string {
  seen.add(obj)
  try {
    const items: string[] = Array.from(obj.values()).map(v => serialize(v, seen))
    const sortedItems: string[] = sortedCopy(items, compareStrings)
    return `[${sortedItems.join(',')}]`
  } finally {
    seen.delete(obj)
  }
}

function serializeArray(arr: unknown[], seen: WeakSet<object>): string {
  seen.add(arr as object)
  try {
    const items = arr.map(item => {
      if (item === undefined || typeof item === 'function' || typeof item === 'symbol') return 'null'
      return serialize(item, seen)
    })
    return `[${items.join(',')}]`
  } finally {
    seen.delete(arr as object)
  }
}

function serializeObject(obj: Record<string, unknown>, seen: WeakSet<object>): string {
  seen.add(obj)
  try {
    const keys: string[] = sortedCopy(Object.keys(obj), compareKeys)
    const parts: string[] = []
    for (const key of keys) {
      const val = obj[key]
      // Omit undefined/function/symbol to match JSON.stringify behavior on objects
      if (val === undefined || typeof val === 'function' || typeof val === 'symbol') continue
      parts.push(`${JSON.stringify(key)}:${serialize(val, seen)}`)
    }
    return `{${parts.join(',')}}`
  } finally {
    seen.delete(obj)
  }
}

function serialize(value: unknown, seen: WeakSet<object> = new WeakSet<object>()): string {
  // Primitives first
  const primitive = serializePrimitive(value)
  if (primitive !== null) return primitive

  // Objects
  const obj = value as object
  if (seen.has(obj)) throw new TypeError('Converting circular structure to JSON')

  const special = serializeDateOrRegExp(obj)
  if (special !== null) return special

  if (obj instanceof Map) return serializeMap(obj, seen)
  if (obj instanceof Set) return serializeSet(obj, seen)
  if (Array.isArray(obj)) return serializeArray(obj as unknown[], seen)
  return serializeObject(obj as Record<string, unknown>, seen)
}

export function stableStringify(value: unknown): string {
  return serialize(value)
}
