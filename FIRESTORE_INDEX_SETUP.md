# Firestore Index Setup for Purchases

## Current Status

I've updated the `getPurchases` function to avoid the composite index requirement by filtering the `status` field client-side. This is a **temporary workaround** that works but may be slower with large datasets.

## Option 1: Use the Workaround (Current)

The code now filters purchases by status on the client-side after fetching from Firestore. This works immediately without creating any indexes, but:
- ✅ Works immediately
- ✅ No setup required
- ⚠️ May be slower with many purchases (fetches all, then filters)
- ⚠️ Uses more bandwidth

## Option 2: Create the Composite Index (Recommended for Production)

For better performance, especially as your purchase data grows, you should create the composite index.

### Quick Method (Using the Error Link)

1. **Click the link** in the error message:
   ```
   https://console.firebase.google.com/v1/r/project/assetdoor-4c2a9/firestore/indexes?create_composite=...
   ```

2. This will take you directly to the Firebase Console with the index pre-configured.

3. Click **"Create Index"** and wait for it to build (usually takes a few minutes).

### Manual Method

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `assetdoor-4c2a9`
3. Navigate to **Firestore Database** → **Indexes** tab
4. Click **"Create Index"**
5. Configure:
   - **Collection ID**: `purchases`
   - **Fields to index**:
     - `status` (Ascending)
     - `purchaseDate` (Descending)
   - **Query scope**: Collection
6. Click **"Create"**

### After Creating the Index

Once the index is created, you can update the code to use server-side filtering again for better performance:

```javascript
// In firestore.js, you can revert to server-side filtering:
if (filters.status && filters.status !== 'All') {
  q = query(q, where('status', '==', filters.status));
}
```

## Index Status

You can check index build status in Firebase Console → Firestore → Indexes. The index will show as "Building" until it's ready, then change to "Enabled".

## Note

The current workaround will continue to work even after you create the index. The index is optional but recommended for production use with large datasets.

