# Noctuary MVP Testing Checklist

**Tester:** ___________  
**Date:** ___________  
**Environment:** [ ] Local [ ] Production

---

## Pre-Deployment Testing

### **1. Visual & Theme Tests** ✓

- [ ] Homepage loads without errors
- [ ] Vanta.js birds animation working
- [ ] Birds fly smoothly (no lag)
- [ ] Dark mode: Pink/Cyan birds on dark background
- [ ] Light mode: Indigo/Blue birds on light background
- [ ] Theme toggle works (smooth transition)
- [ ] Theme persists on page reload
- [ ] All sections visible (Hero, Samples, Testimonials, Pact, Commission, How It Works, About)
- [ ] Glass-morphism effects working
- [ ] Text readable over animated background
- [ ] Mobile: Hamburger menu opens/closes
- [ ] Mobile: Close (X) button visible in menu
- [ ] Mobile: Navigation smooth scroll works
- [ ] Footer links present and working

**Visual Issues Found:**
```
_________________________________
_________________________________
```

---

### **2. Commission Form - Quick Poem** ✓

#### Test A: Quick Poem - PayPal (USD)
- [ ] Select "Quick Poem" card
- [ ] Shows: $0.99 USD / [Live KES rate]
- [ ] Live exchange rate displayed at top
- [ ] Email field validation works
- [ ] Select USD currency
- [ ] Select PayPal payment
- [ ] Click "Proceed to Payment"
- [ ] Redirects to PayPal sandbox
- [ ] Complete payment with test account
- [ ] Redirects to success page
- [ ] Auto-redirects to order tracking page
- [ ] Order shows in admin dashboard
- [ ] Status: PAID
- [ ] Amount: $0.99 USD

**Issues Found:**
```
_________________________________
```

#### Test B: Quick Poem - Paystack (KES)
- [ ] Select "Quick Poem"
- [ ] Enter email
- [ ] Select KES currency
- [ ] Shows correct KES amount (live rate)
- [ ] Select M-Pesa/Card payment
- [ ] Click "Proceed to Payment"
- [ ] Redirects to Paystack
- [ ] Use test card: 4084084084084081
- [ ] Complete payment
- [ ] Redirects to success page
- [ ] Order tracking page shows order
- [ ] Admin dashboard shows order
- [ ] Status: PAID

**Issues Found:**
```
_________________________________
```

---

### **3. Commission Form - Custom Poem** ✓

#### Test C: Custom Poem - PayPal (USD)
- [ ] Select "Custom Poem"
- [ ] Fill in: Email, Title, Mood
- [ ] Add special instructions (optional)
- [ ] Enter budget: $3.50
- [ ] Real-time delivery calculation works (shows ~9 hours)
- [ ] Can type decimal amounts (3.50 works, not 350)
- [ ] Min/Mid/Max buttons work
- [ ] Budget range shown correctly
- [ ] Select USD + PayPal
- [ ] Shows "Your Price" and "You'll Pay"
- [ ] Complete payment
- [ ] Order tracking shows all details
- [ ] Admin can see title, mood, instructions

**Issues Found:**
```
_________________________________
```

#### Test D: Custom Poem - Paystack (KES)
- [ ] Select "Custom Poem"
- [ ] Fill all fields
- [ ] Enter budget: 450 KES
- [ ] Delivery time updates (shows ~8 hours)
- [ ] Select KES + Paystack
- [ ] Complete payment
- [ ] Order appears in admin

**Issues Found:**
```
_________________________________
```

---

### **4. Currency Conversion** ✓

#### Test E: Cross-Currency Payments
- [ ] USD + Paystack shows conversion notice
- [ ] Conversion notice: "Your payment will be converted to KES"
- [ ] Correct KES amount shown in "You'll Pay"
- [ ] Payment processes with correct amount
- [ ] KES + PayPal shows conversion notice
- [ ] Correct USD amount charged

**Exchange Rate Test:**
- Current live rate displayed: _______
- $0.99 USD = _______ KES (should match live rate)
- Rate updates every hour (cache working)

**Issues Found:**
```
_________________________________
```

---

### **5. Admin Dashboard** ✓

#### Login
- [ ] Go to /admin
- [ ] Redirects to /admin/login
- [ ] "Back to Homepage" link works
- [ ] Login with: admin@noctuary.com / admin123
- [ ] Redirects to /admin/dashboard
- [ ] "Welcome back, Admin" displayed

#### Dashboard Features
- [ ] Stats cards display correctly:
  - Total Orders
  - Pending Payment
  - Ready to Write (PAID status)
  - Delivered
- [ ] Stats numbers accurate
- [ ] Trend indicators show (+X today)
- [ ] Recent orders table loads
- [ ] Search by email works
- [ ] Search by order ID works
- [ ] Filter buttons work (ALL, PENDING, PAID, WRITING, DELIVERED)
- [ ] Orders sorted by priority (time remaining)
- [ ] Time remaining displayed and accurate
- [ ] Overdue orders shown in red
- [ ] Orders close to deadline in orange
- [ ] Can expand custom poem details (arrow icon)
- [ ] Expanded view shows: Title, Mood, Instructions

#### Navigation
- [ ] Sidebar collapses/expands
- [ ] Content adjusts when sidebar collapses
- [ ] "Homepage" link works (goes to main site)
- [ ] Sample Works navigation works
- [ ] Settings navigation works (shows placeholder)
- [ ] Logout works
- [ ] Theme toggle works in admin

**Issues Found:**
```
_________________________________
```

---

### **6. Order Management** ✓

#### Deliver Poem
- [ ] Click "Deliver" on PAID order
- [ ] Modal opens with order details showing:
  - Customer email
  - Type (QUICK or CUSTOM)
  - Title (if custom)
  - Mood (if custom)
  - Instructions (if custom)
  - Amount paid
  - Delivery time
- [ ] Write poem in text area
- [ ] Click "Deliver Poem"
- [ ] Success toast appears
- [ ] Modal closes
- [ ] Order status changes to DELIVERED
- [ ] Time remaining changes to "Completed"
- [ ] Can view delivered poem (View button)
- [ ] Email sent to customer (check logs for error - expected in dev)

**Issues Found:**
```
_________________________________
```

---

### **7. Sample Works Management** ✓

#### Create Sample
- [ ] Go to /admin/dashboard/samples
- [ ] Click "Add Sample"
- [ ] Modal opens
- [ ] Fill in: Title, Content, Mood (optional), Image URL (optional)
- [ ] Click "Create"
- [ ] Success toast appears
- [ ] Sample appears in list
- [ ] Sample visible on homepage

#### Edit Sample
- [ ] Click "Edit" on sample
- [ ] Modal opens with existing data
- [ ] Modify content
- [ ] Click "Update"
- [ ] Success toast
- [ ] Changes reflected

#### Toggle Visibility
- [ ] Click eye icon
- [ ] Badge changes (Visible ↔ Hidden)
- [ ] Homepage updates (sample appears/disappears)

#### Delete Sample
- [ ] Click trash icon
- [ ] Confirmation dialog appears
- [ ] Confirm deletion
- [ ] Success toast
- [ ] Sample removed from list
- [ ] Homepage updates

**Issues Found:**
```
_________________________________
```

---

### **8. Security & Edge Cases** ✓

#### Rate Limiting
- [ ] Submit 5 orders with same email
- [ ] 6th order shows error: "You have reached the maximum number of orders (5) per day"
- [ ] Error message mentions 24 hours
- [ ] Rate limit counter resets after 24 hours (or server restart)

#### Form Validation
- [ ] Empty email shows error
- [ ] Invalid email format shows error
- [ ] Custom poem: Empty title shows error
- [ ] Custom poem: No mood selected shows error
- [ ] Budget below minimum shows error with live pricing
- [ ] Budget above maximum shows error

#### Payment Edge Cases
- [ ] Cancel PayPal payment (click back)
- [ ] Order stays PENDING
- [ ] Can retry payment later
- [ ] Cancel Paystack payment
- [ ] Order stays PENDING

#### Security
- [ ] /admin/dashboard redirects to login if not authenticated
- [ ] Logout clears session
- [ ] Cannot access orders without correct access token
- [ ] Invalid order token shows 404

**Issues Found:**
```
_________________________________
```

---

### **9. Mobile Responsiveness** ✓

Test on mobile device or browser DevTools (360px width):

#### Public Site
- [ ] Hero section readable
- [ ] Vanta birds animate smoothly (2 birds on mobile)
- [ ] All sections stack properly
- [ ] Commission form usable
- [ ] Currency buttons tap-friendly
- [ ] Payment method buttons work
- [ ] Budget input works (no arrows)
- [ ] No horizontal scroll anywhere

#### Admin Dashboard
- [ ] Sidebar hidden on mobile
- [ ] Hamburger menu appears
- [ ] Menu opens/closes smoothly
- [ ] Navigation works
- [ ] Stats cards stack
- [ ] Orders table scrollable
- [ ] Can deliver poems
- [ ] Can manage samples

**Issues Found:**
```
_________________________________
```

---

### **10. Performance** ✓

#### Load Times
- Homepage first load: _______ seconds
- Admin dashboard load: _______ seconds
- Vanta.js initialization: _______ seconds

#### Build
- [ ] `npm run build` completes without errors
- [ ] No TypeScript errors
- [ ] No hydration warnings
- [ ] Bundle size reasonable

#### Runtime
- [ ] No console errors
- [ ] No memory leaks (check DevTools)
- [ ] Vanta FPS: _______ (should be >30)
- [ ] Smooth scrolling
- [ ] Theme toggle smooth

**Issues Found:**
```
_________________________________
```

---

## Summary

**Total Tests:** 150+  
**Passed:** _______  
**Failed:** _______  
**Blocked:** _______  

### Critical Issues
```
1. _________________________________
2. _________________________________
3. _________________________________
```

### Minor Issues
```
1. _________________________________
2. _________________________________
```

### Notes
```
_________________________________
_________________________________
_________________________________
```

---

## Sign-Off

**Ready for Deployment:** [ ] YES [ ] NO

**Tester Signature:** ___________  
**Date:** ___________