# Firestore Security Rules Setup

## Current Issue
The admin panel is trying to read/write to Firestore but the security rules might be blocking access.

## Quick Fix: Update Firestore Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **assetdoor-4c2a9**
3. Click **Firestore Database** in the left sidebar
4. Click on the **Rules** tab
5. Replace the rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Products collection - public read, admin write
    match /products/{productId} {
      allow read: if true; // Public read for mobile app
      allow write: if isAdmin();
    }
    
    // Categories collection - public read, admin write
    match /categories/{categoryId} {
      allow read: if true; // Public read for mobile app
      allow write: if isAdmin();
    }
    
    // Purchases collection - users can read their own, admin can read/write all
    match /purchases/{purchaseId} {
      allow read: if request.auth != null && (
        isAdmin() || 
        resource.data.userId == request.auth.uid
      );
      allow write: if isAdmin();
    }
    
    // Users collection - users can read/update their own, admin can read/write all
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
    
    // Admins collection - only admins can read/write
    match /admins/{adminId} {
      allow read, write: if isAdmin();
      // Allow creating own admin document on first login
      allow create: if request.auth != null && request.auth.uid == adminId;
    }
  }
}
```

6. Click **Publish**

## Alternative: Test Mode (Temporary - NOT for production)

If you want to test quickly, you can temporarily use test mode:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 31);
    }
  }
}
```

**⚠️ WARNING**: This allows anyone to read/write. Only use for testing, then switch to proper rules above.

## Create Admin Document Manually (Alternative)

If security rules are blocking, you can create the admin document manually:

1. Go to Firestore Database
2. Click **Start collection** (or use existing `admins` collection)
3. Collection ID: `admins`
4. Document ID: **[Your Firebase Auth UID]**
   - To find your UID: Go to Authentication → Users → Click on your user → Copy the UID
5. Add these fields:
   - `email` (string): Your admin email
   - `displayName` (string): Your name
   - `role` (string): `admin`
   - `isActive` (boolean): `true`
   - `createdAt` (timestamp): Current time
   - `lastLogin` (timestamp): Current time

## After Setup

1. Refresh the admin panel
2. Try logging in again
3. The admin document will be created automatically if it doesn't exist (if rules allow)

