import { NextRequest, NextResponse } from 'next/server'
import { createContribution, getContributions } from '@/lib/db'

// GET /api/contributions
export async function GET(request: NextRequest) {
  try {
    const memberId = request.nextUrl.searchParams.get('memberId')
    if (!memberId) {
      return NextResponse.json(
        { error: 'memberId is required' },
        { status: 400 }
      )
    }

    const contributions = await getContributions(memberId)
    return NextResponse.json(contributions)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/contributions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const contribution = await createContribution(body)
    return NextResponse.json(contribution, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
