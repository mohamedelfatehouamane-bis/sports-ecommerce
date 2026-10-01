
import * as db from '@/lib/data'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const categories = await db.getCategories({ orderBy: { name: 'asc' } })
    return NextResponse.json({ categories })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
