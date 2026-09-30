# Admin Panel - Separate Branch Setup

## Overview

The FNGPay application is now split into **two separate branches**:

1. **`main` branch** - User-facing partner panel (existing app)
2. **`admin-panel` branch** - Admin-only dashboard (NEW)

---

## Branch Structure

### Main Branch (Partner Panel)
- **URL:** https://fngpay.com (or fngpay.vercel.app)
- **Users:** Partner agents (PV-DEMO1, PV-DEMO2, etc.)
- **Features:** 
  - Full partner panel functionality
  - Payin/Payout orders
  - Wallet management
  - Bank accounts
  - Commission tracking
  - NO admin panel access

### Admin-Panel Branch (Admin Dashboard)
- **URL:** admin.fngpay.com (or separate Vercel deployment)
- **Users:** Only PV-ADMIN and PV-ADMIN1
- **Features:**
  - Simple username/password login
  - NO registration or 2FA required
  - Exchange rate management
  - Withdrawal request approval
  - Admin dashboard
  - Fully mobile responsive

---

## How to Deploy

### Step 1: Deploy Admin Panel Branch

#### Option A: Vercel (Recommended)

1. Go to Vercel Dashboard
2. Click **"Add New Project"**
3. Import **vicky040/Fngpay** repository
4. **IMPORTANT:** Select **`admin-panel`** branch (not main!)
5. Click **Deploy**
6. Set custom domain: `admin.fngpay.com` (optional)

#### Option B: Railway/Render/Other

1. Create new deployment
2. Connect to GitHub repo
3. Select **`admin-panel`** branch
4. Deploy

---

### Step 2: Keep Main Branch Deployed

Your existing deployment (`fngpay.vercel.app` or `fngpay.com`) continues to run from `main` branch.

No changes needed here - just redeploy if you made updates.

---

## Admin Panel Login

### Access URL
```
https://admin-fngpay.vercel.app/admin-login
```
(or your custom domain)

### Login Credentials

**Username:** `PV-ADMIN` or `PV-ADMIN1`  
**Password:** (Admin account password from database)

**OR**

**Username:** (Admin email from database)  
**Password:** (Admin account password)

### Features
- ✅ Simple username/password login
- ✅ No registration page
- ✅ No 2FA authenticator
- ✅ 24-hour session (JWT)
- ✅ Logout button
- ✅ Fully mobile responsive

---

## What Changed

### In `main` Branch
- ❌ Removed admin panel pages
- ❌ Removed admin navigation menu
- ✅ Users cannot access admin features
- ✅ Clean user-focused app

### In `admin-panel` Branch
- ✅ New admin login page (`/admin-login`)
- ✅ Root page (`/`) redirects to login
- ✅ Simple JWT authentication (no 2FA)
- ✅ Admin dashboard at `/admin`
- ✅ Logout functionality
- ✅ Mobile responsive design

---

## Mobile Responsive Design

The admin login page is fully responsive:

### Desktop (>768px)
- Centered login card
- Large FNGPay logo
- Clean, professional UI

### Mobile (<768px)
- Full-screen login
- Touch-friendly buttons (48px height)
- Larger input fields (16px font to prevent zoom)
- Responsive padding

### Tablet (768px-1024px)
- Balanced layout
- Optimal button sizes
- Comfortable spacing

---

## Database Requirements

Admin accounts must exist in database:

```sql
SELECT * FROM agents WHERE agent_code IN ('PV-ADMIN', 'PV-ADMIN1');
```

Make sure these accounts have:
- ✅ Valid `password_hash` (bcrypt)
- ✅ Email address
- ✅ Full name

---

## Environment Variables

### Optional (for both branches)

```env
# JWT Secret (default: "fngpay-admin-secret-2024")
JWT_SECRET=your-secret-here

# Database URL
DATABASE_URL=postgresql://...

# NOWPayments API
NOWPAYMENTS_API_KEY=your-key

# Telegram Bot
BOT_TOKEN=your-token
```

If not set, uses hardcoded defaults.

---

## Testing

### Test Admin Login

1. Deploy `admin-panel` branch
2. Visit `/admin-login`
3. Enter credentials:
   - Username: `PV-ADMIN` or `PV-ADMIN1`
   - Password: (database password)
4. Click **Login**
5. Should redirect to `/admin` dashboard

### Test on Mobile

1. Open Chrome DevTools
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select mobile device (iPhone 12, etc.)
4. Test login flow
5. Verify buttons are touch-friendly
6. Check responsive layout

---

## Security Notes

### ✅ Secure
- JWT tokens (24h expiration)
- HttpOnly cookies
- Bcrypt password hashing
- Admin-only access control

### ⚠️ Consider
- Make GitHub repository **PRIVATE** (prevent token exposure)
- Use strong passwords for admin accounts
- Enable HTTPS in production
- Set unique JWT_SECRET in production

---

## Support

### Branches
- **Main branch:** `main` (user panel)
- **Admin branch:** `admin-panel` (admin dashboard)

### Deployment
- **User panel:** Deploy `main` to fngpay.com
- **Admin panel:** Deploy `admin-panel` to admin.fngpay.com

### Both branches share:
- Same database
- Same API endpoints
- Same admin auth APIs

---

## Next Steps

1. ✅ Deploy `admin-panel` branch to separate URL
2. ✅ Test admin login
3. ✅ Verify mobile responsiveness
4. ✅ Set custom domain (optional)
5. ✅ Share admin URL with team

---

## Summary

| Feature | Main Branch | Admin-Panel Branch |
|---------|-------------|-------------------|
| **User Access** | Partner agents | Admin only |
| **Login** | Email + Password + 2FA | Username + Password |
| **Registration** | Yes | No |
| **2FA** | Required | No |
| **Admin Panel** | ❌ Removed | ✅ Full access |
| **Navigation** | User features only | Admin dashboard |
| **Domain** | fngpay.com | admin.fngpay.com |

Both branches are ready to deploy separately! 🚀
