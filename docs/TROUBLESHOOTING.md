# Troubleshooting Guide

## Photo Upload Issues

### Error: "Failed to process image"

This error occurs when the server fails to process an uploaded image. Common causes:

#### 1. Missing Environment Variables

Check that all required environment variables are set in Railway:

```bash
DATABASE_URL        # PostgreSQL connection string
SUPABASE_URL        # Supabase project URL (https://xxx.supabase.co)
SUPABASE_ANON_KEY   # Supabase anonymous key
```

**How to verify:** Check Railway dashboard > Variables

#### 2. Sharp Library Issues

Sharp is a native image processing library that requires platform-specific binaries.

**Symptoms:**
- "Sharp import failed" in logs
- Image processing works locally but not in production

**Solutions:**
1. The app has fallback logic - if sharp fails, it uploads original images
2. Check Railway build logs for sharp compilation errors
3. Try clearing Railway cache and redeploying

**Current Configuration:**
- `next.config.ts` has `serverExternalPackages: ['sharp']`
- Sharp is configured with `cache(false)` and `concurrency(1)` for serverless

#### 3. Supabase Storage Issues

**Symptoms:**
- "Storage upload failed" in error message
- Images process but don't save

**Check:**
1. Bucket `bird-photos` exists in Supabase Storage
2. Bucket is set to public (or has appropriate RLS policies)
3. SUPABASE_ANON_KEY has permission to upload

#### 4. Database Connection Issues

**Symptoms:**
- "Failed to save photo" error
- Upload completes but photo not in database

**Check:**
1. DATABASE_URL is correct and accessible from Railway
2. SSL is configured correctly for production
3. Database has `photos` table with all required columns

### Debugging Steps

1. **Check Railway Logs:**
   - Go to Railway dashboard
   - Click on your deployment
   - View logs for error messages

2. **Look for Specific Errors:**
   - "Sharp import failed" → Sharp binary issue
   - "Missing SUPABASE_URL" → Environment variable issue
   - "DATABASE_URL environment variable is not set" → Missing DB config
   - "Storage upload failed" → Supabase permissions issue

3. **Test Components Individually:**
   ```bash
   # Test sharp locally
   node -e "require('sharp')"

   # Test database connection
   npm run db:push
   ```

---

## 500 Errors on API Endpoints

### Symptoms
- API returns 500 Internal Server Error
- No detailed error in response

### Common Causes

1. **Schema Mismatch:**
   - Code references columns that don't exist in database
   - Solution: Run `npm run db:push` to sync schema

2. **TypeScript Strict Mode:**
   - Array access without undefined checks
   - Look for `result[0]` without optional chaining

3. **Missing Environment Variables:**
   - Database, Supabase, or other configs missing

### How to Debug

1. Check Railway deployment logs
2. Look for the specific API route in error
3. Search codebase for that route's handler
4. Check for try-catch blocks and what errors they catch

---

## Database Issues

### Running Migrations

```bash
# Push schema changes to database
npm run db:push

# This runs automatically on deployment via postbuild script
```

### Schema Changes Pending

The following schema changes are commented out and require migration:

1. **Soft Deletes:** `deletedAt` column on `photos` and `species` tables
   - File: `src/db/schema.ts`
   - Implementation: `src/lib/softDelete.ts.disabled`
   - Enable by uncommenting columns and renaming softDelete.ts

---

## Local Development

### Setup

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Push database schema
npm run db:push

# Start development server
npm run dev
```

### Common Local Issues

1. **Sharp fails on M1/M2 Mac:**
   ```bash
   npm rebuild sharp
   ```

2. **Database connection refused:**
   - Check DATABASE_URL points to local or cloud database
   - Ensure PostgreSQL is running

3. **TypeScript errors:**
   ```bash
   npm run type-check
   ```
