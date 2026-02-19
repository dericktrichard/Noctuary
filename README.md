# Noctuary - Poetry Commission Platform

> Human Ink, Soul Scripted

A premium poetry commission platform where every poem is crafted by human hands, never by algorithms.

## 🚀 Quick Start
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your credentials

# Initialize database
npx prisma db push
npx prisma generate
npm run prisma:seed

# Run development server
npm run dev
```

Visit `http://localhost:3000`

## 🏗️ Project Structure
```
src/
├── app/                    # Next.js pages & routes
│   ├── actions/           # Server Actions (form submissions)
│   ├── admin/            # Admin dashboard (/admin)
│   ├── order/            # Order tracking (/order/[token])
│   ├── payment/          # Payment flow pages
│   └── page.tsx          # Landing page (main entry point)
├── components/
│   ├── admin/            # Admin dashboard components
│   ├── features/         # Landing page sections
│   ├── shared/           # Navbar, Footer, etc.
│   └── ui/               # Reusable UI components
├── lib/                   # Utilities & config
├── services/             # Business logic
│   ├── email.ts         # Resend email service
│   ├── orders.ts        # Order management
│   ├── paypal.ts        # PayPal integration
│   └── paystack.ts      # M-Pesa/Paystack integration
└── types/                # TypeScript definitions
```

## 📁 Key Files

- **Landing Page:** `src/app/page.tsx`
- **Order Form:** `src/components/features/commission-form.tsx`
- **Admin Dashboard:** `src/app/admin/dashboard/page.tsx`
- **Payment Logic:** `src/services/paypal.ts`, `src/services/paystack.ts`
- **Database Schema:** `prisma/schema.prisma`

## 🔐 Admin Access

Default credentials (change immediately):
- Email: `admin@noctuary.com`
- Password: `admin123`

## 🧪 Testing

### PayPal (Sandbox)
- Use PayPal Developer test accounts
- Test cards available in PayPal sandbox

### Paystack (Test Mode)
- Test card: `4084084084084081`
- CVV: `408`, Expiry: any future date
- PIN: `0000`, OTP: `123456`

## 🌐 Environment Variables
```env
# Database (Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID="..."
PAYPAL_CLIENT_SECRET="..."
PAYPAL_MODE="sandbox"

# Paystack
PAYSTACK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_..."

# Resend
RESEND_API_KEY="re_..."
RESEND_VERIFIED_EMAIL="your@email.com"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 💰 Pricing Structure

### Quick Poem
- **Price:** $0.99 USD / 130 KES
- **Delivery:** 24 hours
- **Input:** Email only

### Custom Poem
- **Price:** $1.99-$4.99 USD / 260-650 KES
- **Delivery:** 6-12 hours (based on urgency)
- **Input:** Title, mood, instructions, budget

## 📦 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production
- Set `PAYPAL_MODE="live"`
- Use production Paystack keys
- Update `NEXT_PUBLIC_APP_URL` to your domain

## 🔒 Security Features

- ✅ HTTP-only cookies for admin sessions
- ✅ HMAC-signed magic links for orders
- ✅ Server-side payment verification
- ✅ Zod validation on all inputs
- ✅ Middleware route protection
- ✅ Rate limiting ready (TODO: implement)

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Payments:** PayPal + Paystack
- **Emails:** Resend
- **Hosting:** Vercel

## 📝 Development Notes

### Component Patterns
- Server Components by default
- "use client" only for interactivity
- Server Actions for mutations
- Services layer for business logic

### File Naming
- Components: `PascalCase`
- Files: `kebab-case.tsx`
- Functions: `camelCase`

## 📧 Email Setup (Post-Launch)

1. Purchase domain (noctuary.ink)
2. Add domain to Resend dashboard
3. Configure DNS records
4. Wait for verification (5 mins - 48 hours)
5. Update `FROM_EMAIL` in `src/services/email.ts`

## 🐛 Troubleshooting

### Prisma Issues
```bash
npx prisma generate
npx prisma db push
```

### Payment Not Working
- Check environment variables
- Verify PayPal/Paystack credentials
- Check browser console for errors

### Emails Not Sending
- Verify RESEND_API_KEY
- Check Resend dashboard for errors
- Remember: free tier only sends to verified email

## 📄 License

Proprietary - All rights reserved