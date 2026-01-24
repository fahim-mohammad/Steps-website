import { NextRequest, NextResponse } from 'next/server'
import { createMember, getMember, getAllMembers, updateMember } from '@/lib/db'

// GET /api/members - Get all members
export async function GET(request: NextRequest) {
  try {
    const members = await getAllMembers()
    return NextResponse.json(members)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/members - Create new member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const member = await createMember(body)
    return NextResponse.json(member, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
