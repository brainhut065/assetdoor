# Simple Firebase Storage Rules (TESTING ONLY)

## ⚠️ WARNING: These are TEST rules - NOT for production!

Go to Firebase Console → Storage → Rules and paste this:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow all authenticated users to read/write
    // ⚠️ TESTING ONLY - Use STORAGE_RULES_PRODUCTION.md for production
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ This allows any logged-in user to upload files. Use only for testing!**

## For Production

**Use the rules from `STORAGE_RULES_PRODUCTION.md`** which restrict uploads to admins only.

## After Applying

1. Click **Publish**
2. Wait 30 seconds
3. **Refresh your browser** (important!)
4. Try uploading again

## If Still Not Working

1. **Check you're logged in**: Make sure you're logged into the admin panel
2. **Check Firebase Auth**: Go to Firebase Console → Authentication → Users - make sure your user exists
3. **Clear browser cache**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. **Check browser console**: Look for any other errors

## More Restrictive Rules (After Testing)

Once the simple rules work, you can use these more secure rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Product images
    match /products/images/{imageId} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.resource.size < 5 * 1024 * 1024;
    }
    
    // Digital files
    match /products/files/{fileId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.resource.size < 1024 * 1024 * 1024; // 1GB limit
    }
  }
}
```

These don't check for admin status but still require authentication.

