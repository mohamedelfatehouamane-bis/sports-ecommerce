// No longer needed

/**
 * Recursively walks an object and converts any Decimal values to plain numbers.
 * This utility can be used on any data returned from the data layer before sending it to
 * a client component or JSON response.
 */
export function serializePrisma<T>(data: T): T {
  if (data === null || data === undefined) return data

  // If the value looks like a Decimal, convert it.
  // Decimal objects have a `toNumber` method.
  if (typeof (data as any).toNumber === 'function') {
    return Number(data) as any
  }

  if (Array.isArray(data)) {
    return data.map((item) => serializePrisma(item)) as any
  }

  if (typeof data === 'object') {
    const result: any = {}
    for (const [key, value] of Object.entries(data)) {
      result[key] = serializePrisma(value)
    }
    return result as T
  }

  // Primitive values are returned as‑is.
  return data
}
