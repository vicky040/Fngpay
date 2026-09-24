# PV-ADMIN - Free Registration Agent Code

## 🎯 What is PV-ADMIN?

`PV-ADMIN` is a special agent code that allows users to register on the platform **WITHOUT** requiring:
- ❌ Payment of 200 USDT
- ❌ Telegram bot interaction
- ❌ Waiting for blockchain confirmation

Perfect for:
- Testing
- Demo accounts
- VIP users
- Staff/admin registrations
- Development

---

## ✅ Current Status

**Agent Code**: `PV-ADMIN`  
**Status**: ✅ Active and ready to use  
**Payment Required**: ❌ No  
**Created**: 2026-09-24  

---

## 📝 How to Use

### For Users:

1. Go to: https://fngpay.vercel.app/register
2. Fill in registration form:
   - **Agent ID**: `PV-ADMIN` ← Use this code
   - Full Name
   - Email
   - Mobile
   - Telegram ID
   - Password
   - PIN
3. Submit
4. ✅ Account created immediately (no payment needed!)

### Registration Flow:

```
User visits /register
    ↓
Enters agent code: PV-ADMIN
    ↓
Backend checks database
    ↓
Finds PV-ADMIN (status: completed, claimed_at: NULL)
    ↓
Validates ✅
    ↓
Creates account immediately
    ↓
No payment required! ✅
```

---

## 🔧 Technical Details

### Database Record:

```sql
SELECT * FROM telegram_onboarding_sessions 
WHERE agent_code = 'PV-ADMIN';
```

**Fields:**
- `agent_code`: `PV-ADMIN`
- `status`: `completed` (appears as paid)
- `credited_at`: Set (payment appears confirmed)
- `claimed_at`: `NULL` (available for use)
- `price_amount`: `0` (no payment required)
- `chat_id`: `0` (special admin ID)

### How It Works:

The registration validation (`/api/auth/register`) checks:

```typescript
SELECT id FROM telegram_onboarding_sessions 
WHERE agent_code = 'PV-ADMIN'
  AND status = 'completed'      // ✅ Appears as paid
  AND claimed_at IS NULL;        // ✅ Available to use
```

✅ Passes validation → Account created  
❌ Fails validation → Error message

---

## 🛠️ Management Commands

### Create/Reset PV-ADMIN:
```bash
npm run db:create-admin
```

This will:
- Create PV-ADMIN if doesn't exist
- Reset it if already exists
- Make it available for use (set claimed_at = NULL)

### Check Status:
```sql
SELECT agent_code, status, credited_at, claimed_at 
FROM telegram_onboarding_sessions 
WHERE agent_code = 'PV-ADMIN';
```

### Make Reusable (if someone already used it):
```sql
UPDATE telegram_onboarding_sessions 
SET claimed_at = NULL 
WHERE agent_code = 'PV-ADMIN';
```

---

## 🔄 Reusability

### Single Use (Default Behavior):
When someone registers with `PV-ADMIN`:
- `claimed_at` gets set to current timestamp
- Code becomes "used" and can't be used again
- New users get error: "Agent ID already exists"

### Make It Reusable (Multiple Users):
Run this query to reset:
```sql
UPDATE telegram_onboarding_sessions 
SET claimed_at = NULL 
WHERE agent_code = 'PV-ADMIN';
```

Or run:
```bash
npm run db:create-admin
```

Now `PV-ADMIN` can be used again!

---

## ⚠️ Important Notes

### Security Considerations:

1. **Don't Share Publicly**: This code bypasses payment
2. **Controlled Distribution**: Only give to trusted users
3. **Monitor Usage**: Check who's using it
4. **Reset Regularly**: Keep it secure

### For Production:

**Option 1: Keep It Private**
- Share only with VIP/admin users
- Monitor registrations
- Reset after each use

**Option 2: Disable After Testing**
- Delete from database when not needed
- Use real payment flow for public users

---

## 📊 Monitoring Usage

### See who used PV-ADMIN:
```sql
SELECT agent_code, full_name, email, created_at 
FROM agents 
WHERE agent_code = 'PV-ADMIN';
```

### Check if it's been claimed:
```sql
SELECT agent_code, claimed_at 
FROM telegram_onboarding_sessions 
WHERE agent_code = 'PV-ADMIN';
```

If `claimed_at` is NOT NULL, someone used it.

---

## 🎨 Comparison: Normal vs Admin Registration

### Normal User Flow:
```
Message bot → Pay 200 USDT → Wait 5-30 mins → 
Get Agent ID → Register → Account created
```

**Time**: 5-30 minutes  
**Cost**: 200 USDT  
**Complexity**: Multiple steps

### PV-ADMIN Flow:
```
Go to register page → Use PV-ADMIN → Account created
```

**Time**: 30 seconds  
**Cost**: FREE  
**Complexity**: Single step

---

## 🚀 Use Cases

### 1. Testing & Development
```
Developers use PV-ADMIN to test registration
without needing real USDT
```

### 2. Demo Accounts
```
Show platform features to potential partners
without requiring upfront payment
```

### 3. Staff Accounts
```
Internal team members get quick access
```

### 4. VIP Partners
```
Special users bypass payment as incentive
```

---

## 🔐 Access Control

### Current Setup:
- ✅ Code exists in database
- ✅ Validation in registration API
- ✅ Works on website
- ❌ No special restrictions

### To Add Restrictions (Future):

Add IP whitelist, email domain check, or admin approval:

```typescript
// Example: Only allow specific emails
if (agentCode === 'PV-ADMIN') {
  const allowedEmails = ['admin@fngpay.app', 'vip@fngpay.app'];
  if (!allowedEmails.includes(email)) {
    return error('PV-ADMIN code restricted');
  }
}
```

---

## 📝 Summary

✅ **PV-ADMIN is active**  
✅ **No payment required**  
✅ **Instant registration**  
✅ **Can be reset/reused**  
✅ **Perfect for testing**  

**Location**: Database (`telegram_onboarding_sessions`)  
**Script**: `scripts/create-admin-agent.js`  
**Command**: `npm run db:create-admin`  

---

**Created**: 2026-09-24  
**Status**: Active  
**Last Updated**: 2026-09-24
