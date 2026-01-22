# Claude Code Sessions

This document tracks Claude Code development sessions for this project.

---

## Session: Security Hardening (January 2026)

**Branch:** `claude/security-hardening-myP9O`
**Status:** IN PROGRESS - Photo upload issue being debugged

### Objectives
1. Add input validation with Zod schemas
2. Implement file upload security (magic byte validation)
3. Add rate limiting to API endpoints
4. Add security headers
5. Enable TypeScript strict mode
6. Implement soft deletes (deferred - requires migration)

### Completed Work

#### 1. Input Validation (Zod)
- Created `/src/lib/validation.ts` with schemas for:
  - `SpeciesSchema` / `SpeciesUpdateSchema`
  - `PhotoUpdateSchema`
  - `BrowserUploadSchema`
  - `PaginationSchema`
  - `PhotosQuerySchema` / `SpeciesQuerySchema`
  - `IdParamSchema`

#### 2. File Upload Security
- Created `/src/lib/fileValidation.ts` with:
  - MIME type validation
  - File extension validation
  - Magic byte validation (JPEG, PNG, GIF, WebP, HEIC)
  - File size limits (20MB max)

#### 3. Rate Limiting
- Created `/src/lib/rateLimit.ts` with:
  - In-memory rate limiting
  - Configurable limits per endpoint type
  - Rate limit headers in responses

#### 4. Security Headers
- Updated `/next.config.ts` with headers:
  - `Strict-Transport-Security`
  - `X-Frame-Options`
  - `X-Content-Type-Options`
  - `X-XSS-Protection`
  - `Referrer-Policy`
  - `Permissions-Policy`

#### 5. TypeScript Strict Mode
- Enabled `noUncheckedIndexedAccess` in tsconfig.json
- Fixed all array access patterns with optional chaining
- Fixed undefined checks throughout codebase

#### 6. Soft Deletes (Deferred)
- Created schema with `deletedAt` columns (commented out)
- Created `/src/lib/softDelete.ts.disabled`
- **Note:** Requires database migration before enabling

### Current Issue: Photo Upload 500 Error

**Symptom:** Photo uploads fail with "Failed to process image" error

**Root Cause Analysis (Completed):**
1. Sharp import tracking bug - undefined vs null confusion
2. Missing environment variable validation
3. Potential sharp binary issues in Railway serverless

**Fixes Applied:**
1. Fixed sharp import state tracking with boolean flag
2. Added DATABASE_URL validation
3. Added detailed logging for debugging
4. Added serverExternalPackages config for sharp

**If Still Failing, Check:**
1. Railway environment variables are set:
   - `DATABASE_URL`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
2. Supabase storage bucket `bird-photos` exists with proper permissions
3. Railway deployment logs for sharp-related errors

### Files Modified

#### API Routes
- `src/app/api/upload/browser/route.ts` - Added step-by-step error handling
- `src/app/api/photos/[id]/route.ts` - Fixed undefined checks, removed soft delete
- `src/app/api/photos/unassigned/route.ts` - Fixed count undefined check
- `src/app/api/species/[id]/route.ts` - Fixed undefined array access
- `src/app/api/species/route.ts` - Added validation

#### Libraries
- `src/lib/image.ts` - Sharp fallback, better error handling
- `src/lib/validation.ts` - NEW: Zod schemas
- `src/lib/fileValidation.ts` - NEW: File security validation
- `src/lib/rateLimit.ts` - NEW: Rate limiting
- `src/lib/logger.ts` - Logging utility
- `src/lib/supabase.ts` - Storage upload with fetch API
- `src/lib/wikipedia.ts` - Fixed regex match handling

#### Database
- `src/db/schema.ts` - Soft delete columns commented out
- `src/db/index.ts` - Added DATABASE_URL validation

#### Config
- `next.config.ts` - Security headers, serverExternalPackages
- `tsconfig.json` - Strict mode enabled

### Next Steps
1. Verify photo upload works after latest fix deployment
2. If still failing, check Railway logs for specific error
3. Consider removing sharp dependency if issues persist (upload original images only)
4. Re-enable soft deletes after running database migration

### PR History
- PR #14: Initial error handling fixes
- PR #15: Sharp serverless configuration
- PR #16: Sharp fallback and better logging
- PR #17 (pending): Critical bug fixes for sharp import tracking

---

## Environment Requirements

```bash
# Required environment variables
DATABASE_URL=postgresql://user:pass@host:5432/db
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...

# Optional
NODE_ENV=production
```

## Deployment Checklist

- [ ] All environment variables set in Railway
- [ ] Supabase storage bucket `bird-photos` created
- [ ] Bucket has `originals/` and `thumbnails/` folders (auto-created on first upload)
- [ ] Database migrations applied (`npm run db:push`)
