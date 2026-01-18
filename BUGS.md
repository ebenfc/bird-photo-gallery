# Bug Tracker

## Open Bugs

(none)

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
