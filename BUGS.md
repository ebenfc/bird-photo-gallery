# Bug Tracker

## Open Bugs

_No open bugs at this time._

---

## Closed Bugs

### BUG-002: Photo Upload Fails with "Failed to process image"
**Status:** Fixed (2026-01-23)
**Severity:** Critical
**Reported:** 2026-01-22
**Resolved:** 2026-01-23

**Description:**
Photo uploads failed with HTTP 500 error and message "Failed to process image" on the production Railway deployment.

**Steps to Reproduce:**
1. Navigate to the bird gallery app
2. Click to upload a photo
3. Select any valid image file (JPEG, PNG, etc.)
4. Click "Upload Photo"

**Expected:** Photo uploads successfully
**Actual:** Error message "Failed to process image"

**Root Causes Identified:**

1. **Database Schema Out of Sync**
   - Railway Postgres missing `haikubox_activity_log` table
   - Queries looking for `deleted_at` column that didn't exist in production
   - Solution: Ran `npm run db:push` with Railway DATABASE_URL to sync schema

2. **Wrong DATABASE_URL Configuration**
   - Railway environment variable pointed to Supabase database instead of Railway Postgres
   - Caused production data to appear "lost" (it was actually in Railway DB)
   - Solution: Updated to use `${{Postgres.DATABASE_URL}}` Railway variable reference

3. **Malformed SUPABASE_ANON_KEY**
   - Environment variable missing first character 'e'
   - Had: `yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Should be: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - JWT tokens must start with `eyJ` (base64 for `{"alg":`)
   - Solution: Corrected the environment variable in Railway dashboard

**Resolution:**
- Updated Railway environment variables with correct values
- Synchronized database schema to Railway Postgres
- Verified Supabase storage bucket exists and is accessible
- Redeployed application
- All 26 production photos intact and accessible
- Image uploads now working correctly

**Related Documentation:** See [TROUBLESHOOTING-IMAGE-UPLOADS.md](./TROUBLESHOOTING-IMAGE-UPLOADS.md) for complete details

---

### BUG-001: Assign Species Modal Stuck on Second Photo
**Status:** Fixed (2026-01-18)
**Severity:** High
**Reported:** 2026-01-18

**Description:**
When processing multiple photos in the Inbox's "Assign Species" workflow, the modal dialog becomes unresponsive on the second photo and cannot be dismissed.

**Steps to Reproduce:**
1. Navigate to the Inbox section
2. Click "Start Assigning" to begin photo species assignment
3. Assign or skip the first photo (Photo 1 of 2) - works successfully
4. Proceed to the second photo (Photo 2 of 2)
5. Attempt to close modal via X button, "Skip for now", Escape, or Enter

**Expected:** Modal should close or advance
**Actual:** Modal remains open and unresponsive

**Workaround:** Navigate away or refresh the page

**Fix:** Added explicit `isOpen` prop to SpeciesAssignModal component. The modal was only checking if `photo` was null, but `setShowAssignModal(false)` wasn't actually closing the modal because `photo` remained non-null after the last photo in a queue.
