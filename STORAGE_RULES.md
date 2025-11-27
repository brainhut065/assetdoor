# Firebase Storage Security Rules

## Current Issue
Getting "User does not have permission to access" error when uploading files. The Storage security rules need to be updated.

## Solution: Update Firebase Storage Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **assetdoor-4c2a9**
3. Click **Storage** in the left sidebar
4. Click on the **Rules** tab
5. Replace the rules with the following:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
        firestore.get(/databases/(default)/documents/admins/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Product images - public read, admin write
    match /products/images/{imageId} {
      allow read: if true; // Public read for mobile app
      allow write: if request.auth != null && isAdmin() && 
        request.resource.size < 5 * 1024 * 1024; // 5MB limit
    }
    
    // Digital files - authenticated read, admin write
    match /products/files/{fileId} {
      allow read: if request.auth != null; // Only authenticated users (mobile app)
      allow write: if request.auth != null && isAdmin() && 
        request.resource.size < 1024 * 1024 * 1024; // 1GB limit
    }
  }
}
```

6. Click **Publish**

## Alternative: Simpler Rules (For Testing)

If the above doesn't work immediately, you can use these simpler rules for testing:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to read/write (for testing)
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ WARNING**: The simpler rules allow any authenticated user to upload. Use only for testing, then switch to the proper rules above.

## After Updating Rules

1. Wait 10-20 seconds for rules to propagate
2. Try uploading an image again
3. It should work now!

## Troubleshooting

If you still get errors:
- Make sure you're logged in as an admin
- Check that the admin document exists in Firestore
- Verify the Storage rules were published successfully
- Try refreshing the page

