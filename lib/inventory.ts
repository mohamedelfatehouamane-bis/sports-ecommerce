import { createClient } from './supabase/server'

export type TransactionType = 'purchase' | 'sale' | 'adjustment' | 'damage' | 'return'

export async function recordInventoryTransaction(
  variantId: string,
  transactionType: TransactionType,
  quantity: number,
  notes?: string,
  referenceId?: string
) {
  const supabase = await createClient()

  const { data, error } = await supabase.from('inventory_transactions').insert({
    variant_id: variantId,
    transaction_type: transactionType,
    quantity,
    notes,
    reference_id: referenceId,
  })

  if (error) throw error
  return data
}

export async function updateVariantStock(variantId: string, quantityChange: number) {
  const supabase = await createClient()

  // First, get current quantity
  const { data: variant, error: fetchError } = await supabase
    .from('product_variants')
    .select('quantity_in_stock')
    .eq('id', variantId)
    .single()

  if (fetchError) throw fetchError

  const newQuantity = Math.max(0, (variant?.quantity_in_stock || 0) + quantityChange)

  // Update the variant stock
  const { error: updateError } = await supabase
    .from('product_variants')
    .update({ quantity_in_stock: newQuantity })
    .eq('id', variantId)

  if (updateError) throw updateError

  return newQuantity
}

export async function getVariantStock(variantId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('product_variants')
    .select('quantity_in_stock, reorder_level')
    .eq('id', variantId)
    .single()

  if (error) throw error
  return data
}

export async function getLowStockVariants(categoryId?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('product_variants')
    .select(
      `
      id,
      sku,
      quantity_in_stock,
      reorder_level,
      products(id, name, slug),
      sizes(name),
      colors(name),
      materials(name)
    `
    )
    .lt('quantity_in_stock', supabase.rpc('get_reorder_level'))

  if (categoryId) {
    query = query.eq('products.category_id', categoryId)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getInventoryHistory(variantId: string, limit = 50) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('inventory_transactions')
    .select('*')
    .eq('variant_id', variantId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}
