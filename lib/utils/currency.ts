/**
 * Format a number as Algerian Dinar (DZD)
 * Uses the native Intl.NumberFormat API with fr-DZ locale
 */
export function formatDZD(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(numValue)) {
    return '0.00 DZD'
  }

  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue)
}

/**
 * Format a Decimal (from Prisma) as DZD
 * Handles Decimal objects from Prisma by converting to number first
 */
export function formatDZDFromDecimal(value: any): string {
  let numValue: number

  if (typeof value === 'object' && value !== null) {
    // Handle Prisma Decimal type
    numValue = parseFloat(value.toString())
  } else if (typeof value === 'string') {
    numValue = parseFloat(value)
  } else if (typeof value === 'number') {
    numValue = value
  } else {
    return '0.00 DZD'
  }

  return formatDZD(numValue)
}
