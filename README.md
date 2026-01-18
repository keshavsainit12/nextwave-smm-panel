# NextWave Panel - Professional SMM Panel

A complete, production-ready Social Media Marketing (SMM) panel built with Next.js 16, Supabase, and modern web technologies.

## Features

### User Panel
- Secure authentication with email verification
- Balance/wallet system with crypto deposits
- Service catalog with real-time pricing
- Order placement and tracking
- Refill and cancel buttons (rule-based)
- Support ticket system
- API access for resellers
- Referral program with earnings
- Mobile-responsive design

### Admin Panel
- User management (edit balance, ban/unban, delete)
- Service and pricing management
- API provider configuration with failover
- Crypto wallet address management (instant updates)
- Order control (auto/manual, refunds, CSV export)
- Deposit approval system
- Revenue and profit analytics
- Support ticket management
- Coupon system
- Activity logs for fraud monitoring
- System settings configuration

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Language:** TypeScript

## Quick Start

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for complete setup instructions.

### Quick Setup

1. **Clone/Download the project**

2. **Set up Supabase:**
   - Create project at supabase.com
   - Run SQL scripts in order (001, 002, 003)
   - Create first admin user

3. **Set environment variables:**
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   SUPABASE_SERVICE_ROLE_KEY=your_secret
   ADMIN_SECRET_PATH=admin-nx-wave-secure
   \`\`\`

4. **Deploy or run locally:**
   \`\`\`bash
   npm install
   npm run dev
   \`\`\`

5. **Access admin panel:**
   \`\`\`
   http://localhost:3000/admin-nx-wave-secure
   \`\`\`

## Project Structure

\`\`\`
app/
├── auth/               # Authentication pages
├── dashboard/          # User panel
├── admin-nx-wave-secure/  # Admin panel
├── actions/            # Server actions
components/
├── admin/              # Admin components
├── dashboard/          # User components
├── ui/                 # UI components
lib/
├── supabase/           # Supabase clients
├── types/              # TypeScript types
scripts/                # SQL setup scripts
\`\`\`

## Admin Panel Access

Default URL: `/admin-nx-wave-secure`

Change via `ADMIN_SECRET_PATH` environment variable.

## Security Features

- Row Level Security (RLS)
- Role-based access control
- Secure password hashing
- API key authentication
- Activity logging
- Fraud detection

## License

Proprietary - All rights reserved
