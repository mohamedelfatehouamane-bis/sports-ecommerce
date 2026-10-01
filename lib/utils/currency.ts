/**
 * Format a number as Algerian Dinar (DZD)
 * Uses the native Intl.NumberFormat API with fr-DZ locale
 */
export function formatDZD(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(numValue)) {
    return 'DA 0.00'
  }

  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue)

  return `DA ${formattedNumber}`
}

/**
 * Format a Decimal as DZD
 * Handles Decimal objects by converting to number first
 */
export function formatDZDFromDecimal(value: any): string {
  let numValue: number

  if (typeof value === 'object' && value !== null) {
    // Handle Decimal type
    numValue = parseFloat(value.toString())
  } else if (typeof value === 'string') {
    numValue = parseFloat(value)
  } else if (typeof value === 'number') {
    numValue = value
  } else {
    return 'DA 0.00'
  }

  return formatDZD(numValue)
}
