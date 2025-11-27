# Firestore Security Rules - Production (Complete)

## Complete Production Rules

Go to Firebase Console → Firestore Database → Rules and replace with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'admin';
    }
    
    // ========== ADMINS COLLECTION ==========
    match /admins/{adminId} {
      // Allow reading if you're an admin OR reading your own document
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
    
    // ========== PRODUCTS COLLECTION ==========
    match /products/{productId} {
      // Public read (for mobile app)
      allow read: if true;
      
      // Only admins can write
      allow write: if isAdmin();
    }
    
    // ========== CATEGORIES COLLECTION ==========
    match /categories/{categoryId} {
      // Public read (for mobile app)
      allow read: if true;
      
      // Only admins can write
      allow write: if isAdmin();
    }
    
    // ========== PURCHASES COLLECTION ==========
    match /purchases/{purchaseId} {
      // Users can read their own purchases, admins can read all
      allow read: if request.auth != null && (
        isAdmin() || 
        resource.data.userId == request.auth.uid
      );
      
      // Only admins can write (create/update purchases)
      // Note: Purchases are created by Flutter app after IAP
      allow write: if isAdmin();
    }
    
    // ========== USERS COLLECTION ==========
    match /users/{userId} {
      // Users can read/update their own profile, admins can read/write all
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

## Key Features

1. **Admin-only writes** for products, categories, purchases
2. **Public reads** for products and categories (mobile app)
3. **User privacy** - users can only see their own purchases and profile
4. **Admin document** - users can create their own on first login
5. **Secure by default** - everything is denied unless explicitly allowed

## Testing

After applying these rules:
- ✅ Admins can create/edit/delete products
- ✅ Admins can manage categories
- ✅ Admins can view all purchases
- ✅ Users can view their own purchases
- ✅ Public can read products (for mobile app)
- ❌ Non-admins cannot create products
- ❌ Non-admins cannot view other users' purchases

