# Bug Tracker

## Open Bugs

### BUG-002: Photo Upload Fails with "Failed to process image"
**Status:** Investigating
**Severity:** Critical
**Reported:** 2026-01-22

**Description:**
Photo uploads fail with HTTP 500 error and message "Failed to process image" on the production Railway deployment.

**Steps to Reproduce:**
1. Navigate to the bird gallery app
2. Click to upload a photo
3. Select any valid image file (JPEG, PNG, etc.)
4. Click "Upload Photo"

**Expected:** Photo uploads successfully
**Actual:** Error message "Failed to process image"

**Investigation Notes:**
- Error occurs in `processUploadedImage()` function
- Sharp library may be failing to import or process in Railway serverless environment
- Fallback logic added to upload original image if sharp fails
- Multiple fixes deployed but issue persists

**Fixes Attempted:**
1. Added `serverExternalPackages: ['sharp']` to next.config.ts
2. Added sharp fallback to upload original if processing fails
3. Fixed sharp import tracking bug (undefined vs null)
4. Added DATABASE_URL validation

**Next Steps:**
1. Check Railway deployment logs for specific error
2. Verify all environment variables are set
3. If sharp continues to fail, consider removing image processing entirely

**Workaround:** None currently - uploads are blocked

---

## Closed Bugs

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
