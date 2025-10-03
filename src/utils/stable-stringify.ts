// Deterministic JSON serialization with stable ordering
// - Objects: keys sorted via localeCompare
// - Arrays: preserve order (unsupported values coerced to null)
// - Map/Set: entries serialized and locale-sorted for stability
// - Dates/RegExp: string representations

function sortStringsLocaleAware(values: string[]): string[] {
  return values.sort((a, b) => a.localeCompare(b))
}

function serializePrimitive(value: unknown): string {
  if (value === null) return 'null'
  const type = typeof value
  if (type === 'string' || type === 'boolean') return JSON.stringify(value)
  if (type === 'number') return JSON.stringify(Number.isFinite(value as number) ? value : null)
  if (type === 'bigint') return JSON.stringify((value as bigint).toString())
  if (type === 'undefined' || type === 'function' || type === 'symbol') return 'null'
  return ''
}

function serializeArray(arr: unknown[], seen: WeakSet<object>): string {
  seen.add(arr)
  const items = arr.map(item => {
    if (typeof item === 'undefined' || typeof item === 'function' || typeof item === 'symbol') return 'null'
    return serialize(item as unknown, seen)
  })
  return `[${items.join(',')}]`
}

function serializeMap(map: Map<unknown, unknown>, seen: WeakSet<object>): string {
  seen.add(map)
  const pairStrings: string[] = []
  for (const [k, v] of map.entries()) {
    const keyJson = serialize(k, seen)
    const valueJson = serialize(v, seen)
    pairStrings.push(`[${keyJson},${valueJson}]`)
  }
  sortStringsLocaleAware(pairStrings)
  return `[${pairStrings.join(',')}]`
}

function serializeSet(set: Set<unknown>, seen: WeakSet<object>): string {
  seen.add(set)
  const items = Array.from(set.values()).map(v => serialize(v, seen))
  sortStringsLocaleAware(items)
  return `[${items.join(',')}]`
}

function serializePlainObject(obj: Record<string, unknown>, seen: WeakSet<object>): string {
  seen.add(obj)
  const keys = sortStringsLocaleAware(Object.keys(obj))
  const parts: string[] = []
  for (const key of keys) {
    const val = obj[key]
    if (typeof val === 'undefined' || typeof val === 'function' || typeof val === 'symbol') continue
    parts.push(`${JSON.stringify(key)}:${serialize(val, seen)}`)
  }
  return `{${parts.join(',')}}`
}

function serializeNonPrimitive(obj: object, seen: WeakSet<object>): string {
  if (seen.has(obj)) throw new TypeError('Converting circular structure to JSON')
  if (obj instanceof Date) return JSON.stringify(obj.toJSON())
  if (obj instanceof RegExp) return JSON.stringify(obj.toString())
  if (obj instanceof Map) return serializeMap(obj, seen)
  if (obj instanceof Set) return serializeSet(obj, seen)
  if (Array.isArray(obj)) return serializeArray(obj as unknown[], seen)
  return serializePlainObject(obj as Record<string, unknown>, seen)
}

function serialize(value: unknown, seen: WeakSet<object> = new WeakSet<object>()): string {
  const primitive = serializePrimitive(value)
  if (primitive !== '') return primitive
  return serializeNonPrimitive(value as object, seen)
}

export function stableStringify(value: unknown): string {
  return serialize(value)
}

export default stableStringify
