import { NextRequest, NextResponse } from 'next/server'
import {
  notifyLoanApproved,
  notifyLoanDisbursed,
  sendContributionReminder,
  sendLoanPaymentReminder,
  sendTransactionReceipt,
  sendWelcomeEmail,
} from '@/lib/notifications'
import { getMember } from '@/lib/db'

// POST /api/notifications/send
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, memberId, data } = body

    // Get member info
    const member = await getMember(memberId)
    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Send appropriate notification based on type
    switch (type) {
      case 'loan-approved':
        await notifyLoanApproved(
          member,
          data.loanAmount,
          data.interestRate
        )
        break

      case 'loan-disbursed':
        await notifyLoanDisbursed(member, data.loanAmount)
        break

      case 'contribution-reminder':
        await sendContributionReminder(
          member,
          data.period,
          data.dueDate
        )
        break

      case 'loan-payment-reminder':
        await sendLoanPaymentReminder(
          member,
          data.monthlyPayment,
          data.dueDate
        )
        break

      case 'transaction-receipt':
        await sendTransactionReceipt(
          member,
          data.transactionType,
          data.amount,
          data.date
        )
        break

      case 'welcome':
        await sendWelcomeEmail(member)
        break

      default:
        return NextResponse.json(
          { error: 'Unknown notification type' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Notification error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
