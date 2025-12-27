# GitHub Secrets Configuration Guide

This document explains all the secrets needed for GitHub Actions CI/CD workflows.

## Overview

GitHub Actions workflows require secrets for:
- Vercel deployment
- Supabase database access
- Solana program deployment
- Security and authentication

## How to Add Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter name and value
5. Click **Add secret**

---

## Required Secrets

### Vercel Deployment

#### `VERCEL_TOKEN`
**Purpose**: Authenticate with Vercel API for deployments

**How to get**:
```bash
# 1. Login to Vercel
vercel login

# 2. Go to Vercel dashboard
# https://vercel.com/account/tokens

# 3. Click "Create Token"
# Name: "GitHub Actions"
# Scope: Full Account
# Expiration: No expiration (or set as needed)

# 4. Copy the token
```

**Example value**: `xxxxxxxxxxxxxxxxxxxxxxxxxxx`

#### `VERCEL_ORG_ID` (Optional)
**Purpose**: Specify Vercel organization/team

**How to get**:
```bash
# Run in your project
vercel link

# Check .vercel/project.json
cat .vercel/project.json
# Copy "orgId" value
```

**Example value**: `team_xxxxxxxxxxxxxxxxxxxxx`

#### `VERCEL_PROJECT_ID` (Optional)
**Purpose**: Specify Vercel project

**How to get**:
```bash
# From .vercel/project.json
cat .vercel/project.json
# Copy "projectId" value
```

**Example value**: `prj_xxxxxxxxxxxxxxxxxxxxx`

#### `VERCEL_DOMAIN`
**Purpose**: Your deployment domain for health checks

**Value**: Your Vercel deployment domain

**Example value**: `zeroglaze-mvp.vercel.app`

---

### Supabase Configuration

#### `NEXT_PUBLIC_SUPABASE_URL`
**Purpose**: Supabase project URL

**How to get**:
1. Go to [app.supabase.com](https://app.supabase.com)
2. Open your project
3. Settings → API
4. Copy "Project URL"

**Example value**: `https://xxxxxxxxxxxxx.supabase.co`

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
**Purpose**: Supabase anonymous/public API key

**How to get**:
1. Supabase Dashboard → Settings → API
2. Copy "anon public" key

**Example value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### `SUPABASE_SERVICE_ROLE_KEY`
**Purpose**: Supabase service role key (admin access)

**How to get**:
1. Supabase Dashboard → Settings → API
2. Copy "service_role" key
3. **Keep this secret!** It has admin privileges

**Example value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### `SUPABASE_PROJECT_REF`
**Purpose**: Supabase project reference ID

**How to get**:
1. Supabase Dashboard → Settings → General
2. Copy "Reference ID"

**Example value**: `xxxxxxxxxxxxx`

#### `SUPABASE_ACCESS_TOKEN`
**Purpose**: Personal access token for Supabase CLI

**How to get**:
```bash
# 1. Login to Supabase CLI
supabase login

# 2. Go to Supabase dashboard
# https://app.supabase.com/account/tokens

# 3. Generate new token
# Name: "GitHub Actions"

# 4. Copy the token
```

**Example value**: `sbp_xxxxxxxxxxxxxxxxxxxxxxxx`

---

### Solana Configuration

#### `NEXT_PUBLIC_PROGRAM_ID`
**Purpose**: Deployed Solana program ID

**How to get**:
```bash
# After deploying your program
./scripts/deploy-program.sh devnet

# Copy the Program ID from output
# Or check Anchor.toml
cat Anchor.toml
```

**Example value**: `ZERO123abc456def789ghi012jkl345mno678pqr901stu234vwx`

#### `SOLANA_DEPLOYER_KEYPAIR`
**Purpose**: Keypair for deploying Solana programs

**How to get**:
```bash
# 1. Generate new keypair for deployment
solana-keygen new --no-bip39-passphrase -o ./deployer-keypair.json

# 2. Fund it with devnet SOL
solana airdrop 2 $(solana-keygen pubkey ./deployer-keypair.json)

# 3. Get the keypair array
cat ./deployer-keypair.json

# 4. Copy entire array including brackets
# [1,2,3,4,5,...]
```

**Example value**: `[123,45,67,89,101,...]` (256 numbers)

**Security notes**:
- For devnet: Can use the same keypair in GitHub
- For mainnet: Use a dedicated deployment wallet with limited funds
- Never commit keypair to repository
- Rotate regularly

---

### Security & Authentication

#### `WEBHOOK_SECRET`
**Purpose**: Validate incoming webhooks

**How to generate**:
```bash
# Generate random 32-byte hex string
openssl rand -hex 32

# Or on macOS/Linux
head -c 32 /dev/urandom | base64

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example value**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2`

#### `JWT_SECRET`
**Purpose**: Sign JWT tokens for API authentication

**How to generate**: Same as `WEBHOOK_SECRET`

**Example value**: `f2e1d0c9b8a7z6y5x4w3v2u1t0s9r8q7p6o5n4m3l2k1j0i9h8g7f6e5d4c3b2a1`

#### `CRON_SECRET`
**Purpose**: Authenticate cron job requests

**How to generate**: Same as `WEBHOOK_SECRET`

**Example value**: `9f8e7d6c5b4a3928171605142312a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s`

---

### Optional: Twitch Integration

#### `TWITCH_CLIENT_ID`
**Purpose**: Twitch API client ID

**How to get**:
1. Go to [dev.twitch.tv/console/apps](https://dev.twitch.tv/console/apps)
2. Create or open your app
3. Copy "Client ID"

**Example value**: `xxxxxxxxxxxxxxxxxxxxxx`

#### `TWITCH_CLIENT_SECRET`
**Purpose**: Twitch API client secret

**How to get**:
1. Same as Client ID
2. Click "New Secret"
3. Copy the secret

**Example value**: `xxxxxxxxxxxxxxxxxxxxxx`

---

## Secrets Checklist

Before enabling CI/CD, ensure all required secrets are set:

### Core (Required for deployment)
- [ ] `VERCEL_TOKEN`
- [ ] `VERCEL_DOMAIN`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `SUPABASE_PROJECT_REF`
- [ ] `SUPABASE_ACCESS_TOKEN`
- [ ] `NEXT_PUBLIC_PROGRAM_ID`
- [ ] `SOLANA_DEPLOYER_KEYPAIR`
- [ ] `WEBHOOK_SECRET`
- [ ] `CRON_SECRET`

### Optional
- [ ] `JWT_SECRET`
- [ ] `TWITCH_CLIENT_ID`
- [ ] `TWITCH_CLIENT_SECRET`
- [ ] `VERCEL_ORG_ID`
- [ ] `VERCEL_PROJECT_ID`

---

## Verification

After adding all secrets:

### 1. Check Secrets are Set
```bash
# In GitHub UI
# Settings → Secrets → Actions
# You should see all secrets listed (values hidden)
```

### 2. Test Workflow
```bash
# Trigger a workflow manually
# Actions → Deploy to Devnet → Run workflow

# Check for errors related to missing secrets
```

### 3. Review Logs
```bash
# If workflow fails
# Click on failed job
# Look for "secret not found" errors
```

---

## Security Best Practices

### 1. Principle of Least Privilege
- Use separate keys for dev/staging/prod
- Limit access to production secrets
- Rotate secrets regularly

### 2. Secret Rotation
```bash
# Rotate secrets every 90 days
# Update in both:
# 1. GitHub Secrets
# 2. Vercel Environment Variables

# For Solana keypair:
# 1. Generate new keypair
# 2. Transfer any remaining SOL
# 3. Update GitHub secret
# 4. Delete old keypair
```

### 3. Access Control
- Limit who can access repository settings
- Enable 2FA for all team members
- Use GitHub Teams for permission management

### 4. Audit Trail
- Review GitHub Actions logs regularly
- Monitor Vercel deployment logs
- Check Supabase audit logs

### 5. Secret Scanning
```bash
# Enable GitHub secret scanning
# Settings → Security → Secret scanning
# Enable "Secret scanning alerts"
```

---

## Troubleshooting

### Secret Not Working

**Check**:
1. No extra spaces or newlines in secret value
2. Secret name matches exactly (case-sensitive)
3. Secret is in correct environment (repository/environment)

### Workflow Can't Access Secret

**Solution**:
```yaml
# In workflow file, ensure secret is referenced correctly
env:
  VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}

# Not:
env:
  VERCEL_TOKEN: secrets.VERCEL_TOKEN  # Wrong!
```

### Secret Value Too Long

**For Solana keypair**:
```bash
# GitHub has limit of ~65,000 characters
# Keypair should be fine (~1,000 characters)

# If issue persists:
# 1. Ensure it's valid JSON array
# 2. No extra formatting
# 3. Just: [1,2,3,...]
```

---

## Environment-Specific Secrets

For multiple environments (dev/staging/prod):

### Option 1: Environment Secrets
```bash
# Create environments in GitHub
# Settings → Environments → New environment

# Add environment-specific secrets
# e.g., SUPABASE_URL_PROD vs SUPABASE_URL_DEV
```

### Option 2: Secret Prefixes
```bash
# Use prefixes in secret names
DEV_SUPABASE_URL
STAGING_SUPABASE_URL
PROD_SUPABASE_URL

# Reference in workflow based on branch
```

---

## Support

For issues with:
- **GitHub Secrets**: [GitHub Docs](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- **Vercel**: [Vercel Support](https://vercel.com/support)
- **Supabase**: [Supabase Discord](https://discord.supabase.com)
- **Solana**: [Solana Discord](https://discord.gg/solana)
