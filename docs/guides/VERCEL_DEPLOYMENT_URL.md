# Finding Your Vercel Deployment URL

## Current Status

**Project:** `solvet-global`  
**Organization:** `node-dojos-projects`  
**Project ID:** `prj_rqOgjxEDf1Pg56EOQh7XDC8wgAB1`

## Getting Your Deployment URL

### Option 1: Check Vercel Dashboard

1. **Open Dashboard:**
   - Visit: https://vercel.com/node-dojos-projects/solvet-global
   - Or: https://vercel.com/dashboard

2. **Find Deployment:**
   - Click on your project
   - View the latest deployment
   - Copy the deployment URL

### Option 2: Deploy and Get URL

**Deploy to Production:**
```bash
vercel --prod
```

After deployment, Vercel will show:
```
✅ Production: https://solvet-global-[hash].vercel.app
```

**Deploy Preview (for testing):**
```bash
vercel
```

This creates a preview deployment URL.

### Option 3: Check via CLI

**List deployments:**
```bash
vercel ls
```

**Get project info:**
```bash
vercel project ls
```

**Inspect specific deployment:**
```bash
vercel inspect <deployment-url>
```

## URL Formats

Your Vercel URLs will be in one of these formats:

1. **Default (with hash):**
   ```
   https://solvet-global-[random-hash].vercel.app
   ```

2. **Production (if configured):**
   ```
   https://solvet-global.vercel.app
   ```

3. **Custom Domain (if configured):**
   ```
   https://your-custom-domain.com
   ```

## For Webhook Configuration

When setting up webhooks, use your Vercel deployment URL:

**Polar Webhook:**
```
https://your-vercel-url.vercel.app/api/v1/webhooks/polar
```

**GitHub Webhook:**
```
https://your-vercel-url.vercel.app/api/v1/webhooks/github
```

## Quick Links

- **Vercel Dashboard:** https://vercel.com/node-dojos-projects/solvet-global
- **All Projects:** https://vercel.com/dashboard
- **Deployments:** https://vercel.com/node-dojos-projects/solvet-global/deployments

## Note

If you haven't deployed yet, you'll need to:
1. Run `vercel --prod` to deploy
2. Or push to your connected GitHub repository (if auto-deploy is enabled)



