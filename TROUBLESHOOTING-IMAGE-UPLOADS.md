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

## ✅ PRODUCTION ENVIRONMENT - FIXED

### Platform: Railway

### Issues Found and Resolved:

#### Issue 1: Database Schema Out of Sync
**Problem:** Railway database was missing recent schema updates
- Missing `haikubox_activity_log` table
- Queries looking for `deleted_at` column that didn't exist

**Solution:**
```bash
DATABASE_URL="postgresql://postgres:PASSWORD@hopper.proxy.rlwy.net:PORT/railway" npm run db:push
```

#### Issue 2: Wrong DATABASE_URL
**Problem:** Railway was configured to use Supabase database instead of Railway Postgres
- Production showed only local test data
- All production photos appeared to be "lost"

**Solution:** Updated DATABASE_URL in Railway to point to internal Railway Postgres:
```
${{Postgres.DATABASE_URL}}
```
Or manually:
```
postgresql://postgres:PASSWORD@postgres.railway.internal:5432/railway
```

**Important:** Production data was NOT lost - it was just in the Railway database, but the app was connecting to Supabase.

#### Issue 3: Malformed SUPABASE_ANON_KEY
**Problem:** Environment variable was missing first character
- Had: `yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Should be: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (note the 'e' at the start)

**Why this matters:** JWT tokens always start with `eyJ` (base64 for `{"alg":`)

**Solution:** Corrected SUPABASE_ANON_KEY in Railway dashboard

#### Issue 4: Supabase Storage Bucket
**Problem:** Initially thought bucket was missing, but it existed with correct name `bird-photos` (lowercase)

**Verified:**
- Bucket exists and is PUBLIC
- Policies configured correctly for INSERT, SELECT, UPDATE, DELETE
- Direct upload test succeeded

### Final Environment Variables (Railway Production):

**Required Variables:**
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
SUPABASE_URL=https://vbojxtgnalidhsnjccrn.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZib2p4dGduYWxpZGhzbmpjY3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MTc2MTYsImV4cCI6MjA4NDE5MzYxNn0.bSvmWz9_xhmVD3UzzjJlbWCMaqkSeBVwBD-6q4WhpKo
HAIKUBOX_SERIAL=<your-serial>
```

### Resolution Steps Taken:
1. ✅ Pushed database schema to Railway Postgres
2. ✅ Fixed DATABASE_URL to point to Railway internal database
3. ✅ Corrected SUPABASE_ANON_KEY (added missing 'e' prefix)
4. ✅ Verified Supabase storage bucket exists and is accessible
5. ✅ Redeployed Railway application
6. ✅ Tested image upload - SUCCESS

### Current Status: ✅ WORKING
- Production URL: https://bird-photo-gallery-production.up.railway.app/
- Image uploads functioning correctly
- All 26 production photos intact and accessible
- Images uploading to Supabase Storage
- Database records created in Railway Postgres

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

### Production (Railway):
- [x] Environment variables in Railway dashboard
- [x] Database schema synchronized
- [x] Redeployment triggered
- [x] Upload test successful
- [x] Images display in gallery
- [x] Existing photos still accessible

---

## Common Issues & Solutions

### Issue: "Failed to process image"
**Causes:**
1. Missing `SUPABASE_URL` or `SUPABASE_ANON_KEY` environment variables
2. Malformed `SUPABASE_ANON_KEY` (JWT must start with `eyJ`)
3. Supabase storage bucket doesn't exist or has incorrect name

**Solution:** Verify all Supabase environment variables are correct and bucket exists

### Issue: "relation 'photos' does not exist" or "column 'deleted_at' does not exist"
**Cause:** Database schema is out of sync

**Solution:** Push schema to production database:
```bash
DATABASE_URL="<production-db-url>" npm run db:push
```

### Issue: Production shows wrong data (local test data instead of production data)
**Cause:** DATABASE_URL pointing to wrong database

**Solution:**
- For Railway: Use `${{Postgres.DATABASE_URL}}` variable reference
- Verify DATABASE_URL points to production database, not local/development database

### Issue: "Bucket not found" in Supabase
**Causes:**
1. Storage bucket doesn't exist
2. Bucket name case mismatch (code uses `bird-photos` but bucket is `BIRD-PHOTOS`)
3. Bucket policies don't allow anonymous access

**Solution:** Create bucket with exact name in code, ensure it's public, verify policies allow INSERT/SELECT

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
**Status:** Local ✅ | Production ✅ (RESOLVED)
