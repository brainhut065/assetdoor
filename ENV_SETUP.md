# Environment Variables Setup

## ⚠️ Important: Update .env file

Since you're using **Vite** (not Create React App), environment variables must use the `VITE_` prefix instead of `REACT_APP_`.

### Update your `.env` file:

Change from:
```
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
...
```

To:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
...
```

### Your `.env` file should look like:

```env
VITE_FIREBASE_API_KEY=AIzaSyDnZKLoyhfx5p6bHqsQ0wYql6Jy_FFzEhA
VITE_FIREBASE_AUTH_DOMAIN=assetdoor-4c2a9.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=assetdoor-4c2a9
VITE_FIREBASE_STORAGE_BUCKET=assetdoor-4c2a9.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1046240978172
VITE_FIREBASE_APP_ID=1:1046240978172:web:e11f4c3d76cb4c67c46379
```

### After updating:
1. Save the `.env` file
2. **Restart the dev server** (stop with Ctrl+C, then run `npm run dev` again)
3. Environment variables are only loaded when the server starts

---

## Firebase Setup Checklist

Before running the app, make sure:

1. ✅ Firebase Authentication is enabled (Email/Password)
2. ✅ Admin user created in Firebase Auth
3. ✅ Firestore Database is created
4. ✅ Firebase Storage is enabled
5. ✅ Admin document created in Firestore `admins` collection

### Create Admin Document in Firestore:

1. Go to Firebase Console → Firestore Database
2. Click "Start collection"
3. Collection ID: `admins`
4. Document ID: [Your Firebase Auth UID]
5. Add fields:
   - `email` (string): Your admin email
   - `displayName` (string): Your name
   - `role` (string): "admin"
   - `isActive` (boolean): true
   - `createdAt` (timestamp): Current time
   - `lastLogin` (timestamp): Current time

---

## Running the App

```bash
npm run dev
```

The app will open at `http://localhost:5173`

Login with your admin credentials!

