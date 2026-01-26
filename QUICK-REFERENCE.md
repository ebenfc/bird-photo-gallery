# Quick Reference - Manual Steps

Copy and paste these commands in order:

## 1. Push Database Schema
```bash
cd "/Users/ebencarey/Documents/Bird App/bird-photo-gallery"
npm run db:push
```
**When prompted:**
- Arrow keys to select: `+ image_url create column`
- Press Enter
- Type `y` to confirm

---

## 2. Start Server
```bash
npm run dev
```
**Then:**
- Open http://localhost:3000
- Click "Sign up"
- Enter your email and password
- Complete sign-up

---

## 3. Run Migration
**Replace `YOUR_EMAIL` with the email you just used:**
```bash
npx tsx scripts/migrate-to-multi-user.ts YOUR_EMAIL
```

**Example:**
```bash
npx tsx scripts/migrate-to-multi-user.ts eben@example.com
```

**Expected:** You'll see "✅ Migration completed successfully!"

---

## 4. Test Data Isolation

**Open TWO browser windows:**

**Window 1 (your account):**
- Already signed in
- Should see all your photos/species

**Window 2 (new incognito window):**
```bash
http://localhost:3000
```
- Sign up with DIFFERENT email
- Should see NO data from Window 1
- Upload a test photo
- Go back to Window 1
- Should NOT see the photo from Window 2

---

## ✅ Success!

If both accounts have separate data, you're done!

**Next:** See `CLERK-INTEGRATION-COMPLETE.md` for deployment to Railway.

---

## 🆘 If Something Goes Wrong

**"User not found" during migration:**
- Make sure you signed up first (Step 2)
- Use the EXACT email you signed up with

**Can't access pages / "Unauthorized":**
- Sign out and sign back in
- Check that Clerk keys are in `.env.local`

**Database push fails:**
- Check that `DATABASE_URL` is in `.env.local`
- Try restarting your terminal

**TypeScript warnings about userId:**
- This is normal during migration
- They won't affect functionality

---

📖 **Full Guide**: `CLERK-INTEGRATION-COMPLETE.md`
🔍 **Project Context**: `.claude/claude.md`
