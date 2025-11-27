# Test Firestore Rules (Temporary)

If you're still getting permission errors, you can temporarily use these **TEST RULES** to verify everything works:

## ⚠️ WARNING: These are TEST rules - NOT for production!

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // TEMPORARY: Allow all authenticated users to read/write
    // ONLY USE FOR TESTING!
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Steps:

1. Go to Firebase Console → Firestore → Rules
2. Paste the test rules above
3. Click **Publish**
4. Try logging in
5. If it works, replace with proper rules from `FIRESTORE_RULES_FIXED.md`

## After Testing:

Once login works, **immediately replace** with the proper security rules from `FIRESTORE_RULES_FIXED.md` for production security.

