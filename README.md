# 🖋️ Noctuary Ink - Soul Scripted

> **Premium poetry commission platform where human emotion meets digital elegance.**

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat)](LICENSE)

---

## 📖 Overview

**Noctuary** is a production-ready poetry commission platform that connects clients with human poets. Built with a "dark glassmorphic" aesthetic, the platform emphasizes emotional authenticity with a strict **No AI** guarantee.

### Key Differentiators
- 🎭 **Human-Only Poetry** - Every poem crafted by real poets, not AI
- 🔒 **Privacy-First** - No account required; magic link access
- 💳 **Global Payments** - PayPal (worldwide) + M-Pesa (Kenya)
- ⚡ **Real-Time Tracking** - Order status updates via email
- 🎨 **Midnight Glass** - Elegant dark theme with glassmorphic UI

---

## ✨ Features

### For Clients
- **Quick Poems** - Fixed price ($0.99), 24-hour delivery
- **Custom Poems** - Variable pricing ($1.99-$5.00), 6-12 hour delivery
- **Magic Link Access** - Track orders via secure email links (no password needed)
- **Multi-Currency** - USD via PayPal, KES via M-Pesa (Paystack)
- **Auto-Cancel** - Unpaid orders cancelled after 3 minutes

### For Admins
- **Order Management** - Kanban-style dashboard with priority sorting
- **Content Management** - Upload/edit sample works with images
- **Analytics** - Revenue tracking, order statistics
- **Testimonial Moderation** - Approve/reject client reviews
- **Secure Auth** - Session-based authentication with auto-expiry

---

## 🛠️ Tech Stack

### Core Framework
- **Next.js 16** (App Router, Turbopack)
- **React 19** (Server Components)
- **TypeScript** (Strict mode)

### Styling & UI
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Accessible component primitives
- **Framer Motion** - Smooth animations
- **Lucide React** - Icon library

### Database & ORM
- **PostgreSQL** - Production database (Supabase)
- **Prisma 5** - Type-safe ORM with migrations
- **Supabase** - Database hosting + storage

### Payments
- **PayPal SDK** - Global credit/debit cards
- **Paystack** - M-Pesa (Kenya)
- **Stripe** - Alternative payment processor

### Infrastructure
- **Vercel** - Deployment & serverless functions
- **Upstash Redis** - Rate limiting (5 orders/day per email)
- **Resend** - Transactional emails

### Security
- **Zod** - Runtime schema validation
- **bcryptjs** - Password hashing
- **HMAC SHA-512** - Webhook signature verification
- **HttpOnly Cookies** - XSS-safe session tokens

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (or Supabase account)
- Upstash Redis account (optional for rate limiting)
- Payment provider API keys (PayPal, Paystack, or Stripe)
- Resend API key for emails

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/noctuary.git
cd noctuary
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJxxx..."

# Payments
NEXT_PUBLIC_PAYPAL_CLIENT_ID="..."
PAYPAL_CLIENT_SECRET="..."
PAYSTACK_SECRET_KEY="..."

# Email
RESEND_API_KEY="re_xxx..."

# Rate Limiting (optional)
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. **Run database migrations**
```bash
npx prisma migrate dev
npx prisma generate
```

5. **Seed initial data** (optional)
```bash
npx prisma db seed
```
> Default admin credentials: `admin@noctuary.com` / `admin123`

6. **Start development server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
noctuary/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Initial data seeding
├── src/
│   ├── app/
│   │   ├── actions/           # Server actions (order, admin, reviews)
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── api/               # API routes (webhooks, auto-cancel)
│   │   ├── order/             # Order tracking pages
│   │   ├── payment/           # Payment flow pages
│   │   └── review/            # Review submission
│   ├── components/
│   │   ├── admin/             # Admin-specific components
│   │   ├── features/          # Main features (commission form, samples)
│   │   ├── shared/            # Shared components (navbar, footer)
│   │   └── ui/                # Reusable UI primitives (shadcn)
│   ├── lib/
│   │   ├── validations/       # Zod schemas
│   │   ├── auth-server.ts     # Session verification
│   │   ├── rate-limit.ts      # Upstash rate limiting
│   │   └── pricing.ts         # Dynamic pricing logic
│   ├── services/
│   │   ├── orders.ts          # Order CRUD operations
│   │   ├── email.ts           # Email templates & sending
│   │   ├── paypal.ts          # PayPal integration
│   │   ├── paystack.ts        # Paystack/M-Pesa integration
│   │   └── stripe.ts          # Stripe integration
│   └── types/                 # TypeScript type definitions
└── public/                    # Static assets (icons, manifest)
```

---

## 🔐 Security Features

### Rate Limiting
- **5 orders per 24 hours** per email address
- Upstash Redis for production, in-memory fallback for dev
- Sliding window algorithm

### Payment Security
- HMAC signature verification for webhooks
- Server-side price validation (never trust client)
- Atomic database updates (prevents race conditions)

### Admin Authentication
- Session-based auth with 7-day expiry
- HttpOnly cookies (XSS protection)
- Database session validation on every request
- Automatic cleanup of expired sessions

### Data Protection
- Magic links for order access (no passwords to leak)
- Auto-cancel unpaid orders after 3 minutes
- Input sanitization with Zod schemas

---

## 💳 Payment Flow

### Client Side
1. User selects poem type (Quick or Custom)
2. Form validates pricing client-side
3. User chooses payment method (PayPal or M-Pesa)
4. Redirects to payment provider

### Server Side
1. Order created with `PENDING` status
2. Auto-cancel scheduled (3 minutes)
3. Payment provider processes transaction
4. Webhook verifies payment signature
5. Order updated to `PAID` status
6. Confirmation emails sent (client + admin)

### Supported Methods
- **PayPal** - Global (USD)
- **Paystack** - Kenya M-Pesa (KES)
- **Stripe** - Alternative processor (USD)

---

## 📧 Email Templates

All emails sent via **Resend** with custom templates:

1. **Order Confirmation** - Sent after payment success
2. **Poem Delivery** - Sent when admin completes poem
3. **Admin Notification** - New order alert
4. **Review Request** - Post-delivery feedback request

---

## 🎨 Design System

### Color Palette
- **Background**: `#0a0a0a` (Deep charcoal)
- **Surface**: Glass cards with `backdrop-blur-xl`
- **Primary**: `#ffffff` (White text)
- **Accent**: Minimal, no gradients

### Typography
- **Headings**: Philosopher (Serif)
- **Body**: Nunito (Sans-serif)

### Animations
- Slow, fluid transitions (300ms)
- Framer Motion for complex interactions
- Glass hover effects

---

## 🧪 Testing

### Run Tests
```bash
npm run test
```

### Build for Production
```bash
npm run build
npm run start
```

### Lint Code
```bash
npm run lint
```

---

## 📊 Analytics

Track key metrics in admin dashboard:
- Total orders (all-time)
- Revenue by currency (USD/KES)
- Orders by status (Pending, Paid, Writing, Delivered)
- Conversion rate (orders → delivered)

---

## 🚢 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Environment Requirements
- Node.js 18+ runtime
- PostgreSQL database (Supabase recommended)
- Redis for rate limiting (Upstash)

---

## 📝 Development Notes

### Key Files to Know
- `src/app/actions/orders.ts` - Order creation & payment logic
- `src/lib/rate-limit.ts` - Rate limiting implementation
- `src/lib/auth-server.ts` - Session management
- `src/components/features/commission-form.tsx` - Main order form
- `prisma/schema.prisma` - Database schema

### Common Tasks

**Add new sample work:**
```typescript
// Admin dashboard → Samples → Add New
```

**Update pricing:**
```typescript
// Admin dashboard → Settings → Pricing
```

**View order details:**
```typescript
// Admin dashboard → Orders → Click order card
```

---

## 🐛 Troubleshooting

### Build Errors

**Tailwind warning about ease curve:**
```bash
# Add to tailwind.config.ts:
transitionTimingFunction: {
  'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
}
```

**Webpack config conflict:**
```bash
# In next.config.ts, remove webpack: {...} section
# Add: turbopack: {}
```

### Runtime Issues

**Rate limiting not working:**
- Check `UPSTASH_REDIS_REST_URL` in `.env`
- Falls back to in-memory if Redis unavailable

**Emails not sending:**
- Verify `RESEND_API_KEY` is correct
- Check Resend dashboard for errors

**Payment webhooks failing:**
- Verify webhook signature keys match
- Check API route logs for signature mismatch

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Aprel Richards**
- Website: [noctuary.com](https://noctuary.com)
- GitHub: [@aprelrichards](https://github.com/aprelrichards)

---

## 🙏 Acknowledgments

- **shadcn/ui** - Component primitives
- **Vercel** - Hosting & deployment
- **Supabase** - Database infrastructure
- **Upstash** - Redis rate limiting
- **Resend** - Email infrastructure

---

## 📮 Support

For support, email support@noctuary.com or open an issue on GitHub.

---

Made with ❤️ and human creativity