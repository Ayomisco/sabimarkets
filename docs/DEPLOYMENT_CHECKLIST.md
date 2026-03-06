# Production Deployment Checklist

## Environment Variables Setup

### ⚠️ Critical for Trading
These **must** be set in your production environment (Vercel/Railway/etc.):

- [ ] `POLY_BUILDER_API_KEY` - Your Polymarket Builder API key
- [ ] `BUILDER_WALLET_ADDRESS` - Your builder wallet address
- [ ] `DATABASE_URL` - PostgreSQL connection string

### Required for Full Functionality
- [ ] `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - WalletConnect project ID
- [ ] `POLYGON_RPC_URL` - Alchemy/Infura Polygon RPC endpoint
- [ ] `NEXT_PUBLIC_POLYGON_RPC_URL` - Public Polygon RPC endpoint
- [ ] `NEXT_PUBLIC_BUILDER_WALLET_ADDRESS` - Public builder wallet
- [ ] `NEXT_PUBLIC_POLY_BUILDER_KEY` - Public builder key
- [ ] `NEXT_PUBLIC_SITE_URL` - Production URL

### Optional
- [ ] `NEXT_PUBLIC_SENTRY_DSN` - Sentry error tracking
- [ ] `SENTRY_AUTH_TOKEN` - Sentry deployment auth

---

## How to Set Environment Variables

### Vercel
1. Go to your project → Settings → Environment Variables
2. Add each variable with its value
3. Select Production, Preview, Development scopes
4. Click "Save"
5. Redeploy your application

### Railway
1. Go to your project → Variables tab
2. Click "New Variable"
3. Add each environment variable
4. Click "Deploy" to apply changes

---

## Verify Configuration

### 1. Check Health Endpoint
```bash
curl https://sabimarket.xyz/api/health
```

Expected response:
```json
{
  "timestamp": "2026-03-06T...",
  "environment": "production",
  "checks": {
    "polymarketApiKey": true,
    "builderWallet": true,
    "database": true,
    "walletConnect": true,
    "polygonRpc": true,
    "polymarketApiAccess": true
  },
  "status": "ok"
}
```

### 2. Test Trading Flow
1. Connect your wallet
2. Try to place a small order (e.g., $1)
3. Should NOT see "Unauthorized/Invalid API key"
4. Should see user-friendly error messages only

---

## Common Issues

### "Unauthorized/Invalid API key" Error

**Cause:** `POLY_BUILDER_API_KEY` not set or invalid in production

**Fix:**
1. Verify API key is added in hosting platform environment variables
2. Check API key hasn't been revoked by Polymarket
3. Ensure no extra spaces in the API key value
4. Redeploy after adding environment variable

### "Trading temporarily unavailable"

**Cause:** Missing or invalid API key, detected by our error handler

**Fix:**
1. Check `/api/health` endpoint
2. Verify `POLY_BUILDER_API_KEY` is set correctly
3. Contact Polymarket support if API key is invalid

### Database Connection Errors

**Cause:** `DATABASE_URL` not set or invalid

**Fix:**
1. Copy DATABASE_URL from Railway/local .env
2. Add to production environment variables
3. Ensure database is accessible from production

---

## Testing Checklist

After deploying, verify:

- [ ] Home page loads with markets
- [ ] Can connect wallet (MetaMask, Phantom, etc.)
- [ ] Markets show live prices
- [ ] Can view market details
- [ ] Can attempt to place order (no "Unauthorized" errors)
- [ ] Error messages are user-friendly
- [ ] Health endpoint returns all green checks
- [ ] Portfolio/positions page works
- [ ] Language switching works
- [ ] Mobile UI is responsive

---

## Next Steps After Fixing

1. **Test thoroughly** - Place small test trades
2. **Notify Polymarket team** - Let them know the issue is fixed
3. **Monitor errors** - Check Sentry/logs for any issues
4. **Update admin wallets** - Set your wallet in admin dashboard

---

## Support

If you continue to see issues:
1. Check `/api/health` endpoint
2. Review Vercel/Railway deployment logs
3. Test locally with same environment variables
4. Contact Polymarket support if API key issues persist
