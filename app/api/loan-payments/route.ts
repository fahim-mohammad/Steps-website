import { NextRequest, NextResponse } from 'next/server'
import { createLoanPayment, getLoanPayments } from '@/lib/db'

// GET /api/loan-payments
export async function GET(request: NextRequest) {
  try {
    const loanId = request.nextUrl.searchParams.get('loanId')
    if (!loanId) {
      return NextResponse.json(
        { error: 'loanId is required' },
        { status: 400 }
      )
    }

    const payments = await getLoanPayments(loanId)
    return NextResponse.json(payments)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/loan-payments
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const payment = await createLoanPayment(body)
    return NextResponse.json(payment, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
