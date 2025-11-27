# Quick Fix for Blank Page

## Issue
The page is blank because the `.env` file uses `REACT_APP_` prefix but Vite needs `VITE_` prefix.

## Solution

### Option 1: Update .env file (Recommended)

Open `.env` file and change all `REACT_APP_` to `VITE_`:

**Before:**
```env
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

**After:**
```env
VITE_FIREBASE_API_KEY=AIzaSyDnZKLoyhfx5p6bHqsQ0wYql6Jy_FFzEhA
VITE_FIREBASE_AUTH_DOMAIN=assetdoor-4c2a9.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=assetdoor-4c2a9
VITE_FIREBASE_STORAGE_BUCKET=assetdoor-4c2a9.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1046240978172
VITE_FIREBASE_APP_ID=1:1046240978172:web:e11f4c3d76cb4c67c46379
```

### Option 2: Temporary Fix (Already Applied)

I've updated the code to support both `VITE_` and `REACT_APP_` prefixes, so it should work now. But you still need to:

1. **Restart the dev server**:
   - Stop the current server (Ctrl+C in terminal)
   - Run `npm run dev` again

2. **Check browser console**:
   - Open browser DevTools (F12)
   - Check Console tab for any errors
   - Check Network tab to see if Firebase is loading

## After Fixing

1. Restart dev server
2. Open `http://localhost:5174`
3. You should see the Login page
4. If still blank, check browser console for errors

## Common Errors

### "Firebase configuration is missing"
- Check `.env` file has correct variable names
- Restart dev server after changing `.env`

### "Failed to fetch"
- Check Firebase project is active
- Check internet connection
- Check Firebase console for any issues

### "User is not an admin"
- Create admin document in Firestore (see ENV_SETUP.md)
- Collection: `admins`
- Document ID: Your Firebase Auth UID

