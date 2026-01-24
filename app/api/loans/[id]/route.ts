import { NextRequest, NextResponse } from 'next/server'
import { getLoan, updateLoan, approveLoan, disburseLoan } from '@/lib/db'

// GET /api/loans/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const loan = await getLoan(params.id)
    return NextResponse.json(loan)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/loans/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const loan = await updateLoan(params.id, body)
    return NextResponse.json(loan)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/loans/[id]/approve
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const action = request.nextUrl.searchParams.get('action')

    if (action === 'approve') {
      const loan = await approveLoan(params.id, body.adminId)
      return NextResponse.json(loan)
    } else if (action === 'disburse') {
      const loan = await disburseLoan(params.id)
      return NextResponse.json(loan)
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
