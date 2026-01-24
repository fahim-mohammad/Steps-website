import { NextRequest, NextResponse } from 'next/server'
import { createLoan, getAllLoans } from '@/lib/db'

// GET /api/loans
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const memberId = searchParams.get('memberId')

    let query = 'SELECT * FROM loans'
    const conditions = []

    if (status) conditions.push(`status = '${status}'`)
    if (memberId) conditions.push(`member_id = '${memberId}'`)

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    query += ' ORDER BY created_at DESC'

    // For now, use getAllLoans
    const loans = await getAllLoans(status || undefined)
    return NextResponse.json(loans)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/loans
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const loan = await createLoan(body)
    return NextResponse.json(loan, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
