# Guide: Getting Environment Secrets and Tokens

This guide will help you obtain all the required secrets and tokens for the `.env` file.

## Required Secrets

### ✅ Already Configured
- `POLAR_API_TOKEN` - ✅ Set (updated in Doppler)
- `POLAR_ORG_ID` - ✅ Set (`f0c16049-5959-42c9-8be8-5952c38c7d63`)

### ⚠️ Need to Obtain
- `POLAR_WEBHOOK_SECRET` - For verifying Polar webhooks
- `GITHUB_TOKEN` - For accessing GitHub API
- `GITHUB_WEBHOOK_SECRET` - For verifying GitHub webhooks

---

## 1. POLAR_WEBHOOK_SECRET

### What it is:
Secret key used to verify that webhook requests are actually coming from Polar.

### How to get it:

**Option A: Create Webhook in Polar Dashboard**
1. Go to: https://polar.sh/dashboard/settings/webhooks
2. Click **"Create Webhook"** or **"Add Webhook"**
3. Configure:
   - **URL**: `https://your-domain.com/api/v1/webhooks/polar` (or your Vercel URL)
   - **Events**: Select `subscription.created`, `subscription.updated`, `subscription.canceled`
4. After creating, Polar will show you the **Webhook Secret**
5. Copy the secret (format: usually a long random string)

**Option B: Use Existing Webhook**
1. Go to: https://polar.sh/dashboard/settings/webhooks
2. Find your existing webhook
3. Click to view details
4. Copy the **Secret** or **Signing Secret**

**For Testing (Temporary):**
- You can use: `test_webhook_secret` (but replace with real secret before production)

---

## 2. GITHUB_TOKEN

### What it is:
Personal Access Token (PAT) for accessing the GitHub API to read repository contents.

### How to get it:

**Step 1: Go to GitHub Token Settings**
- Visit: https://github.com/settings/tokens
- Or use GitHub CLI: `gh browse --settings tokens`

**Step 2: Generate New Token**
1. Click **"Generate new token"** → **"Generate new token (classic)"**
2. Give it a descriptive name: `SOLVET Subscription System`
3. Set expiration: **90 days** (or your preference)
4. Select scopes:
   - ✅ **`repo`** - Full control of private repositories
     - Needed for: Reading `no3d-tools-library` repo contents
   - ✅ **`read:org`** (optional) - Read org membership
5. Click **"Generate token"**

**Step 3: Copy Token**
- ⚠️ **IMPORTANT**: Copy the token immediately - you won't see it again!
- Format: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- Store it securely

**Alternative: Use GitHub CLI Token**
If you have GitHub CLI installed and authenticated:
```bash
gh auth token
```
This will output your current GitHub CLI token (format: `gho_...`)

---

## 3. GITHUB_WEBHOOK_SECRET

### What it is:
Secret key used to verify that webhook requests are actually coming from GitHub.

### How to get it:

**Step 1: Go to Repository Settings**
1. Go to: https://github.com/node-dojo/no3d-tools-library/settings/hooks
   (Replace `node-dojo/no3d-tools-library` with your actual repo)

**Step 2: Create Webhook**
1. Click **"Add webhook"**
2. Configure:
   - **Payload URL**: `https://your-domain.com/api/v1/webhooks/github`
   - **Content type**: `application/json`
   - **Secret**: Generate a random secret (or use a password generator)
     - Format: Long random string (e.g., `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)
   - **Events**: Select **"Just the push event"**
3. Click **"Add webhook"**

**Step 3: Copy the Secret**
- The secret you entered is what you need for `GITHUB_WEBHOOK_SECRET`
- ⚠️ **IMPORTANT**: Copy it immediately - GitHub won't show it again!

**For Testing (Temporary):**
- You can generate a test secret: `openssl rand -hex 32`
- Or use: `test_github_webhook_secret` (but replace before production)

---

## Quick Setup Script

After obtaining all secrets, update your `.env` file:

```bash
# Edit .env file
nano .env
# or
code .env
```

Add/update these lines:
```env
POLAR_API_TOKEN=polar_oat_your_actual_token_here
POLAR_ORG_ID=f0c16049-5959-42c9-8be8-5952c38c7d63
POLAR_WEBHOOK_SECRET=your_polar_webhook_secret_here
GITHUB_TOKEN=ghp_your_github_token_here
GITHUB_WEBHOOK_SECRET=your_github_webhook_secret_here
```

---

## Verification

After updating `.env`, verify:

```bash
# Check all vars are set
node -e "require('dotenv').config(); console.log('POLAR_API_TOKEN:', process.env.POLAR_API_TOKEN ? 'Set' : 'Missing'); console.log('POLAR_ORG_ID:', process.env.POLAR_ORG_ID ? 'Set' : 'Missing'); console.log('POLAR_WEBHOOK_SECRET:', process.env.POLAR_WEBHOOK_SECRET ? 'Set' : 'Missing'); console.log('GITHUB_TOKEN:', process.env.GITHUB_TOKEN ? 'Set' : 'Missing'); console.log('GITHUB_WEBHOOK_SECRET:', process.env.GITHUB_WEBHOOK_SECRET ? 'Set' : 'Missing');"
```

---

## Security Best Practices

1. **Never commit `.env` to git** - It's already in `.gitignore`
2. **Use Doppler for production** - Secrets are encrypted and managed centrally
3. **Rotate tokens regularly** - Especially if exposed
4. **Use minimum required scopes** - Don't grant unnecessary permissions
5. **Set expiration dates** - Don't create tokens that never expire

---

## Quick Links

- **Polar API Tokens**: https://polar.sh/dashboard/settings/api
- **Polar Webhooks**: https://polar.sh/dashboard/settings/webhooks
- **GitHub Tokens**: https://github.com/settings/tokens
- **GitHub Webhooks**: https://github.com/node-dojo/no3d-tools-library/settings/hooks

---

## Need Help?

If you're stuck:
1. Check the error messages - they often indicate which secret is missing
2. Verify you have the correct permissions/access
3. Make sure you're copying the entire token (no truncation)
4. Check for extra spaces or quotes in `.env` file





