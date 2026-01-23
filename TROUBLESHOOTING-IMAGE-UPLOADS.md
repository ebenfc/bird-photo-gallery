# Image Upload Troubleshooting Guide

## Issue Summary
After security and maturity updates, image uploads were failing with HTTP 500 errors showing "Failed to process image".

## Root Cause Identified
Missing Supabase environment variables (`DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`) in both local and production environments.

---

## ✅ LOCAL ENVIRONMENT - FIXED

### Changes Made:
1. **Added missing environment variables to `.env.local`:**
   - `DATABASE_URL` - Session Pooler connection string (IPv4/IPv6 compatible)
   - `SUPABASE_URL` - Supabase project URL
   - `SUPABASE_ANON_KEY` - Public anonymous key

2. **Created database schema:**
   - Ran `npm run db:push` to create tables in Supabase database
   - Tables: `photos`, `species`, `haikubox_detections`, `haikubox_sync_log`, `haikubox_activity_log`

3. **Verified Supabase Storage:**
   - Confirmed `bird-photos` bucket exists with `originals/` and `thumbnails/` folders
   - Bucket is public for image viewing

### Current Status: ✅ WORKING
- Local uploads at http://localhost:3000 are successful
- Images process correctly with Sharp
- Files upload to Supabase Storage
- Database records created properly

---

## ⚠️ PRODUCTION ENVIRONMENT - NEEDS FIX

### Platform: Vercel

### Required Actions:

#### Step 1: Update Vercel Environment Variables
Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

Add/Update these three variables for **Production** environment:

**DATABASE_URL:**
```
postgresql://postgres.vbojxtgnalidhsnjccrn:LaK81VtsbQ0MtAUR@aws-1-us-east-1.pooler.supabase.com:5432/postgres
```

**SUPABASE_URL:**
```
https://vbojxtgnalidhsnjccrn.supabase.co
```

**SUPABASE_ANON_KEY:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZib2p4dGduYWxpZGhzbmpjY3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MTc2MTYsImV4cCI6MjA4NDE5MzYxNn0.bSvmWz9_xhmVD3UzzjJlbWCMaqkSeBVwBD-6q4WhpKo
```

**Important:** Also verify these existing variables are set:
- `API_KEY` - For iOS Shortcut authentication
- `HAIKUBOX_SERIAL` - For Haikubox integration

#### Step 2: Redeploy

**Option A - Manual Redeploy:**
1. Go to **Deployments** tab
2. Click three dots on latest deployment
3. Click **Redeploy**

**Option B - Git Push:**
```bash
git commit --allow-empty -m "Trigger redeploy with updated env vars"
git push
```

#### Step 3: Verify Production
1. Visit your production URL
2. Test image upload
3. Verify image appears in gallery
4. Check Supabase Storage for new files

---

## Technical Details

### Why It Failed:

1. **Missing Environment Variables:**
   - Code requires `SUPABASE_URL` and `SUPABASE_ANON_KEY` to upload images
   - Without them, `uploadToStorage()` throws immediately at line 16-18 of `src/lib/supabase.ts`

2. **Wrong DATABASE_URL Format:**
   - Initially used "Direct Connection" URL (IPv6 only)
   - Switched to "Session Pooler" URL (IPv4/IPv6 compatible)
   - Port changed from 5432 (direct) to 5432 (pooler)

### Upload Flow:
```
Browser → Validation → Sharp Processing → Supabase Storage → Database Insert → Success
                ↑                               ↑
           Magic bytes check            Requires env vars
```

### Key Files Modified:
- `.env.local` - Added Supabase credentials
- `src/app/api/upload/browser/route.ts` - Already has granular error logging
- `src/lib/image.ts` - Already has fallback error handling

---

## Supabase Configuration

### Project Details:
- **Project ID:** vbojxtgnalidhsnjccrn
- **Region:** US East (aws-1-us-east-1)
- **Storage Bucket:** bird-photos (public)

### Database Tables Created:
- `species` - Bird species information
- `photos` - Uploaded photo records
- `haikubox_detections` - Synced bird detection data
- `haikubox_sync_log` - Sync history tracking
- `haikubox_activity_log` - Individual detection timestamps

### Storage Structure:
```
bird-photos/
├── originals/{uuid}.jpg (90% JPEG quality)
└── thumbnails/{uuid}_thumb.jpg (80% JPEG quality, 400px wide)
```

---

## Verification Checklist

### Local Development:
- [x] Environment variables in `.env.local`
- [x] Database tables exist
- [x] Supabase bucket accessible
- [x] Upload test successful
- [x] Images display in gallery

### Production (Vercel):
- [ ] Environment variables in Vercel dashboard
- [ ] Redeployment triggered
- [ ] Upload test successful
- [ ] Images display in gallery
- [ ] Existing photos still accessible

---

## Common Issues & Solutions

### Issue: "Failed to process image"
**Solution:** Missing `SUPABASE_URL` or `SUPABASE_ANON_KEY` environment variables

### Issue: "relation 'photos' does not exist"
**Solution:** Run `DATABASE_URL="..." npm run db:push` to create tables

### Issue: Database connection refused (IPv6 error)
**Solution:** Use Session Pooler URL instead of Direct Connection URL

### Issue: "password authentication failed"
**Solution:** Reset database password in Supabase dashboard or verify correct password in DATABASE_URL

---

## Next Steps (If Issues Persist)

1. **Check Vercel Deployment Logs:**
   - Go to Deployments → Latest → Function Logs
   - Look for errors during upload attempts

2. **Test Supabase Connection:**
   - Run `npm run db:push` locally to verify credentials work
   - Check Supabase dashboard for API request logs

3. **Verify Bucket Policies:**
   - Ensure "bird-photos" bucket allows INSERT and SELECT operations
   - Check bucket is set to Public

4. **Contact Support:**
   - If persistent issues, check Supabase status page
   - Review Vercel function logs for detailed error messages

---

## Files Reference

- **Upload API:** `src/app/api/upload/browser/route.ts`
- **Image Processing:** `src/lib/image.ts`
- **Storage Operations:** `src/lib/supabase.ts`
- **Database Schema:** `src/db/schema.ts`
- **Environment Template:** `.env.example`

---

**Last Updated:** 2026-01-23
**Status:** Local ✅ | Production ⚠️ (env vars need updating)
