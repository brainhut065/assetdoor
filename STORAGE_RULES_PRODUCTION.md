# Firebase Storage Security Rules - Production (Strict)

## ⚠️ Important: Production-Ready Rules

These rules restrict file uploads to **admins only** by checking the Firestore `admins` collection.

## Rules to Use

Go to Firebase Console → Storage → Rules and replace with these:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
        firestore.get(/databases/(default)/documents/admins/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Product images - public read, admin write only
    match /products/images/{imageId} {
      // Anyone can read (for mobile app)
      allow read: if true;
      
      // Only admins can write
      allow write: if request.auth != null && 
        isAdmin() && 
        request.resource.size < 5 * 1024 * 1024; // 5MB limit for images
    }
    
    // Digital files - authenticated read, admin write only
    match /products/files/{fileId} {
      // Only authenticated users can read (mobile app users)
      allow read: if request.auth != null;
      
      // Only admins can write
      allow write: if request.auth != null && 
        isAdmin() && 
        request.resource.size < 1024 * 1024 * 1024; // 1GB limit for files
    }
    
    // Deny all other paths
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## How It Works

1. **isAdmin() function**: Checks Firestore to see if the user has an admin document with `role: 'admin'`
2. **Product images**: Public read (anyone), admin-only write
3. **Digital files**: Authenticated read (logged-in users), admin-only write
4. **Size limits**: 5MB for images, 1GB for digital files
5. **All other paths**: Denied by default

## Testing the Rules

After applying these rules:

1. **As Admin**: You should be able to upload files ✅
2. **As Regular User** (if you test): Should NOT be able to upload ❌
3. **Unauthenticated**: Should NOT be able to upload ❌

## Troubleshooting

### If uploads fail:

1. **Check admin document exists**:
   - Go to Firestore → `admins` collection
   - Verify your user ID has a document with `role: 'admin'`

2. **Check Firestore rules allow reading admins**:
   - The Storage rules need to read from Firestore
   - Make sure your Firestore rules allow reading the `admins` collection (see FIRESTORE_SETUP.md)

3. **Verify user is logged in**:
   - Check browser console for auth errors
   - Make sure you're logged into the admin panel

## Firestore Rules Required

Make sure your Firestore rules allow reading the `admins` collection for the Storage rules to work:

```javascript
// In Firestore Rules, make sure admins collection is readable by Storage rules
match /admins/{adminId} {
  allow read: if request.auth != null && (
    // Admin can read all
    isAdmin() || 
    // User can read their own
    request.auth.uid == adminId
  );
  // ... rest of your admin rules
}
```

## Migration from Test Rules

1. Copy the production rules above
2. Go to Firebase Console → Storage → Rules
3. Paste and replace
4. Click **Publish**
5. Wait 30 seconds
6. Test uploading a file
7. If it works, you're good! ✅

---

**Note**: These rules are production-ready and secure. Only admins can upload files.

