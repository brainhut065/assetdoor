# Switch Firestore from MongoDB Compatibility Mode to Native Mode

## Issue
You created Firestore in **MongoDB Compatibility Mode**, but our admin panel uses **Native Firestore** with security rules. We need to switch to Native mode.

## Solution: Switch to Native Mode

### Option 1: Delete and Recreate (Recommended if no important data)

**⚠️ WARNING**: This will delete all data in your current Firestore database. Only do this if you don't have important data yet.

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **assetdoor-4c2a9**
3. Click **Firestore Database** in the left sidebar
4. Click the **Settings** (gear icon) at the top
5. Scroll down and click **Delete database**
6. Confirm deletion
7. Wait for deletion to complete

8. **Create new database in Native mode**:
   - Click **Create database**
   - Select **Start in production mode** (we'll add rules after)
   - **IMPORTANT**: Make sure you select **Native mode** (not MongoDB compatibility)
   - Choose a location (e.g., `us-central1`)
   - Click **Enable**

9. **Add Security Rules**:
   - Go to **Rules** tab
   - Paste the rules from `FIRESTORE_SETUP.md`
   - Click **Publish**

### Option 2: Keep MongoDB Mode (Not Recommended)

If you have important data and can't delete, you'll need to:
- Use MongoDB Atlas instead of Firestore
- Or migrate data to Native mode (complex process)

**For now, let's go with Option 1** since you're just starting.

---

## After Switching to Native Mode

1. ✅ You'll see the **Rules** tab
2. ✅ Security rules will work
3. ✅ Admin panel will work properly
4. ✅ All Firestore features will be available

---

## Quick Steps Summary

1. Delete current MongoDB compatibility database
2. Create new database in **Native mode**
3. Add security rules
4. Test admin panel login

Let me know when you've switched to Native mode and we'll continue!

