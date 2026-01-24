import { sendEmail } from './email'
import { sendWhatsAppMessage } from './whatsapp'
import { Member } from './types'

interface NotificationOptions {
  recipientEmail?: string
  recipientPhone?: string
  subject?: string
  htmlContent?: string
  message?: string
  templateId?: number
}

/**
 * Send notification for loan approval
 */
export const notifyLoanApproved = async (
  member: Member,
  loanAmount: number,
  interestRate: number
) => {
  const htmlContent = `
    <h2>Loan Approved</h2>
    <p>Dear ${member.full_name},</p>
    <p>Your loan application of $${loanAmount.toFixed(2)} at ${interestRate}% interest has been approved!</p>
    <p>Please log in to your Steps account to view details and accept the loan.</p>
    <p>Best regards,<br/>Steps Team</p>
  `

  const message = `Hello ${member.full_name}! Your loan of $${loanAmount.toFixed(2)} has been approved! Login to Steps to accept.`

  try {
    if (member.email) {
      await sendEmail({
        to: member.email,
        subject: 'Loan Approved - Steps',
        htmlContent,
      })
    }
    if (member.phone) {
      await sendWhatsAppMessage({
        phoneNumber: member.phone,
        message,
      })
    }
  } catch (error) {
    console.error('Error sending loan approval notification:', error)
  }
}

/**
 * Send notification for loan disbursement
 */
export const notifyLoanDisbursed = async (
  member: Member,
  loanAmount: number
) => {
  const htmlContent = `
    <h2>Loan Disbursed</h2>
    <p>Dear ${member.full_name},</p>
    <p>Your loan of $${loanAmount.toFixed(2)} has been disbursed!</p>
    <p>The funds should be in your account shortly.</p>
    <p>Best regards,<br/>Steps Team</p>
  `

  const message = `Hi ${member.full_name}! Your loan of $${loanAmount.toFixed(2)} has been disbursed. Check your account!`

  try {
    if (member.email) {
      await sendEmail({
        to: member.email,
        subject: 'Loan Disbursed - Steps',
        htmlContent,
      })
    }
    if (member.phone) {
      await sendWhatsAppMessage({
        phoneNumber: member.phone,
        message,
      })
    }
  } catch (error) {
    console.error('Error sending loan disbursement notification:', error)
  }
}

/**
 * Send contribution reminder
 */
export const sendContributionReminder = async (
  member: Member,
  period: string,
  dueDate: string
) => {
  const htmlContent = `
    <h2>Contribution Reminder</h2>
    <p>Dear ${member.full_name},</p>
    <p>This is a friendly reminder that your ${period} contribution is due on ${dueDate}.</p>
    <p>Please log in to Steps to make your contribution.</p>
    <p>Best regards,<br/>Steps Team</p>
  `

  const message = `Hi ${member.full_name}! Your ${period} contribution is due on ${dueDate}. Please contribute via Steps.`

  try {
    if (member.email) {
      await sendEmail({
        to: member.email,
        subject: `${period.charAt(0).toUpperCase() + period.slice(1)} Contribution Reminder - Steps`,
        htmlContent,
      })
    }
    if (member.phone) {
      await sendWhatsAppMessage({
        phoneNumber: member.phone,
        message,
      })
    }
  } catch (error) {
    console.error('Error sending contribution reminder:', error)
  }
}

/**
 * Send loan payment reminder
 */
export const sendLoanPaymentReminder = async (
  member: Member,
  monthlyPayment: number,
  dueDate: string
) => {
  const htmlContent = `
    <h2>Loan Payment Due</h2>
    <p>Dear ${member.full_name},</p>
    <p>Your loan payment of $${monthlyPayment.toFixed(2)} is due on ${dueDate}.</p>
    <p>Please log in to Steps to make your payment.</p>
    <p>Best regards,<br/>Steps Team</p>
  `

  const message = `Hi ${member.full_name}! Your loan payment of $${monthlyPayment.toFixed(2)} is due on ${dueDate}.`

  try {
    if (member.email) {
      await sendEmail({
        to: member.email,
        subject: 'Loan Payment Due - Steps',
        htmlContent,
      })
    }
    if (member.phone) {
      await sendWhatsAppMessage({
        phoneNumber: member.phone,
        message,
      })
    }
  } catch (error) {
    console.error('Error sending loan payment reminder:', error)
  }
}

/**
 * Send transaction receipt
 */
export const sendTransactionReceipt = async (
  member: Member,
  transactionType: string,
  amount: number,
  date: string
) => {
  const htmlContent = `
    <h2>Transaction Receipt</h2>
    <p>Dear ${member.full_name},</p>
    <p>A ${transactionType} transaction of $${amount.toFixed(2)} was recorded on ${date}.</p>
    <p>Please log in to Steps for more details.</p>
    <p>Best regards,<br/>Steps Team</p>
  `

  const message = `${member.full_name}, your ${transactionType} of $${amount.toFixed(2)} on ${date} has been recorded.`

  try {
    if (member.email) {
      await sendEmail({
        to: member.email,
        subject: 'Transaction Receipt - Steps',
        htmlContent,
      })
    }
    if (member.phone) {
      await sendWhatsAppMessage({
        phoneNumber: member.phone,
        message,
      })
    }
  } catch (error) {
    console.error('Error sending transaction receipt:', error)
  }
}

/**
 * Send welcome email to new member
 */
export const sendWelcomeEmail = async (member: Member) => {
  const htmlContent = `
    <h2>Welcome to Steps!</h2>
    <p>Dear ${member.full_name},</p>
    <p>Welcome to Steps - your community fund management platform.</p>
    <p>You can now:</p>
    <ul>
      <li>Make and track contributions</li>
      <li>Apply for and manage loans</li>
      <li>View your transaction history</li>
      <li>Access reports and analytics</li>
    </ul>
    <p>Get started by logging in to your account.</p>
    <p>Best regards,<br/>Steps Team</p>
  `

  try {
    if (member.email) {
      await sendEmail({
        to: member.email,
        subject: 'Welcome to Steps!',
        htmlContent,
      })
    }
  } catch (error) {
    console.error('Error sending welcome email:', error)
  }
}
