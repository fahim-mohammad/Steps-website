# STEPS - Community Fund Management Platform

![STEPS Logo](public/steps-logo.png)

A modern, full-featured community fund management system built with **Next.js 16**, **Supabase**, **TypeScript**, and **Tailwind CSS**.

> "Take STEPS Toward a Better Financial Future"

## 🚀 Features

### Core Functionality
- **Member Management**: Register, approve, and manage community members
- **Contribution Tracking**: Record and monitor member contributions
- **Loan Management**: Create, approve, disburse, and track loans with calculations
- **Profit Distribution**: Distribute profits based on member contributions
- **Transaction History**: Maintain detailed records of all financial transactions
- **Dashboard & Analytics**: Visual dashboards with charts and real-time statistics
- **Reports**: Generate comprehensive reports (CSV/Excel export)

### Authentication & Security
- Supabase authentication with email/password
- Role-based access control (Member, Manager, Owner)
- Protected routes with middleware
- Secure API endpoints
- Session management

### Notifications
- Email notifications via Brevo (Sendinblue)
- WhatsApp notifications via Meta API
- Automated alerts for loans, contributions, and transactions

### Admin Features
- Manage all members and approve new registrations
- Create and approve loans
- Assign accountants for record keeping
- Track contributions and distribute profits
- View comprehensive dashboards
- Generate reports

### UI/UX
- Dark mode and light mode support
- Multi-language support (English & Bengali)
- Mobile-responsive design
- Accessible components
- Smooth animations and transitions
- Generate reports
- Monitor system status

### Member Features
- View personal dashboard
- Track contributions
- Manage loans
- View transaction history
- Update profile information

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Next.js API Routes  
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Email**: Brevo API
- **SMS/WhatsApp**: Meta WhatsApp Business API
- **UI Components**: Shadcn/ui with Radix UI
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Supabase account with PostgreSQL database
- Environment variables configured

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📋 Setup Instructions

### 1. Database Setup
Run the SQL schema files in your Supabase instance:
- `database-setup.sql` - Core tables
- `database-extended.sql` - Additional features (profit distribution, accountants)

### 2. Environment Variables

Create `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
SUPABASE_SERVICE_KEY=your_service_key

# Email Service (Brevo)
BREVO_API_KEY=your_brevo_api_key

# WhatsApp API (Meta)
WHATSAPP_API_TOKEN=your_whatsapp_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
```

### 3. Run the Application

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Run production server
pnpm start
```

The app will be available at `http://localhost:3000`

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── admin/             # Admin pages
│   ├── member/            # Member pages
│   ├── api/               # API routes
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   └── *.tsx             # Custom components
├── lib/                   # Utilities and services
│   ├── supabase.ts       # Supabase client
│   ├── auth-context.tsx  # Auth provider
│   ├── *-service.ts      # Business logic
│   └── translations.ts    # Language support
├── public/               # Static assets
│   └── steps-logo.png    # STEPS logo
└── database-*.sql        # Database schemas
```## Project Structure

```
├── app/
│   ├── admin/           # Admin pages
│   │   ├── dashboard/
│   │   ├── members/
│   │   ├── loans/
│   │   ├── contributions/
│   │   └── reports/
│   ├── member/          # Member pages
│   │   ├── dashboard/
│   │   ├── contributions/
│   │   ├── loans/
│   │   ├── profile/
│   │   └── transactions/
│   ├── api/             # API routes
│   │   ├── members/
│   │   ├── loans/
│   │   ├── contributions/
│   │   ├── loan-payments/
│   │   └── notifications/
│   ├── login/           # Authentication pages
│   ├── signup/
│   └── layout.tsx
├── components/
│   ├── admin-sidebar.tsx
│   ├── member-sidebar.tsx
│   ├── protected-route.tsx
│   └── ui/              # Shadcn/ui components
├── lib/
│   ├── auth-context.tsx # Auth provider
│   ├── supabase.ts      # Supabase client
│   ├── db.ts            # Database functions
│   ├── email.ts         # Email service
│   ├── whatsapp.ts      # WhatsApp service
│   ├── notifications.ts # Notification helpers
│   ├── types.ts         # TypeScript types
│   └── utils.ts
└── middleware.ts        # Route protection
```

## Database Schema

### Tables
1. **users** - Authentication & user profiles
2. **members** - Member details and status
3. **contributions** - Member contributions
4. **loans** - Loan records
5. **loan_payments** - Loan repayment history
6. **transactions** - Transaction audit log
7. **reports** - Generated reports

## API Endpoints

### Members
- `GET /api/members` - List all members
- `POST /api/members` - Create member
- `GET /api/members/[id]` - Get member details
- `PUT /api/members/[id]` - Update member

### Loans
- `GET /api/loans` - List loans
- `POST /api/loans` - Create loan
- `GET /api/loans/[id]` - Get loan details
- `PUT /api/loans/[id]` - Update loan
- `POST /api/loans/[id]?action=approve` - Approve loan
- `POST /api/loans/[id]?action=disburse` - Disburse loan

### Contributions
- `GET /api/contributions?memberId=...` - Get member contributions
- `POST /api/contributions` - Record contribution

### Notifications
- `POST /api/notifications` - Send notification

## Authentication Flow

1. User signs up on `/signup`
2. Supabase creates auth user
3. Member profile created automatically
4. User logs in on `/login`
5. Auth context manages session
6. Routes protected by middleware and components
7. Role-based access to admin/member pages

## Notification System

### Triggers
- **Loan Approved**: Automatic notification when loan is approved
- **Loan Disbursed**: Notification when loan is disbursed
- **Contribution Reminder**: Periodic reminders for contributions
- **Payment Reminders**: Loan payment reminders
- **Welcome Email**: Sent to new members

### Channels
- Email via Brevo
- WhatsApp via Meta API

## Security Considerations

1. **Row Level Security (RLS)**: All tables have RLS enabled
2. **API Authentication**: Protected routes require valid token
3. **Environment Variables**: Sensitive data in `.env.local`
4. **Middleware**: Route-level protection
5. **Component-level Guards**: ProtectedRoute component

## Next Steps / Roadmap

- [ ] Advanced reporting with export to PDF/Excel
- [ ] SMS notifications support
- [ ] Mobile app (React Native)
- [ ] Payment gateway integration
- [ ] Multi-language support
- [ ] Advanced analytics and forecasting
- [ ] Member communication tools
- [ ] Dividend calculation and distribution
- [ ] Emergency fund features
- [ ] Savings goals tracking

## Troubleshooting

### Supabase Connection Issues
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Check Supabase project is active
- Ensure RLS policies don't block queries

### Email Not Sending
- Verify `BREVO_API_KEY` is correct
- Check Brevo account has credits
- Verify sender email is verified in Brevo

### WhatsApp Not Working
- Verify `WHATSAPP_API_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID`
- Check WhatsApp Business account is active
- Ensure phone numbers are in correct format

## Support & Contact

For issues or questions, please contact support or open an issue on GitHub.

## License

This project is licensed under the MIT License - see LICENSE file for details.

---

**Last Updated**: January 25, 2026
