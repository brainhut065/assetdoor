# Fixed Firestore Security Rules

## Problem
Getting "Missing or insufficient permission" error because the rules are blocking admin document creation.

## Solution: Updated Security Rules

Go to Firebase Console → Firestore Database → Rules tab and replace with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Admins collection - CRITICAL: Allow creating own document first
    match /admins/{adminId} {
      // Allow reading if you're an admin OR if you're reading your own document
      allow read: if request.auth != null && (
        isAdmin() || 
        request.auth.uid == adminId
      );
      
      // Allow creating your own admin document (for first-time setup)
      allow create: if request.auth != null && 
        request.auth.uid == adminId &&
        request.resource.data.keys().hasAll(['email', 'role', 'isActive']) &&
        request.resource.data.role == 'admin';
      
      // Allow updating if you're an admin OR updating your own document
      allow update: if request.auth != null && (
        isAdmin() || 
        request.auth.uid == adminId
      );
      
      // Only admins can delete
      allow delete: if isAdmin();
    }
    
    // Products - public read, admin write
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Categories - public read, admin write
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Purchases - users read own, admin read/write all
    match /purchases/{purchaseId} {
      allow read: if request.auth != null && (
        isAdmin() || 
        resource.data.userId == request.auth.uid
      );
      allow write: if isAdmin();
    }
    
    // Users - users read/update own, admin read/write all
    match /users/{userId} {
      allow read: if request.auth != null && (
        isAdmin() || 
        userId == request.auth.uid
      );
      allow write: if request.auth != null && (
        isAdmin() || 
        userId == request.auth.uid
      );
    }
  }
}
```

## Key Changes

1. **Separated create, read, update, delete permissions** for admins collection
2. **Allow create** if user is creating their own document with correct fields
3. **Allow read** if user is admin OR reading their own document
4. **Allow update** if user is admin OR updating their own document

## After Updating Rules

1. Click **Publish**
2. Wait a few seconds for rules to propagate
3. Refresh the admin panel
4. Try logging in again

The admin document should be created automatically on first login!

