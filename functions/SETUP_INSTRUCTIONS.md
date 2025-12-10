# Cloud Functions Setup Instructions

## Prerequisites

1. ✅ Google Play Developer API enabled
2. ✅ Service account created
3. ✅ Service account key (JSON) downloaded
4. ✅ Service account linked in Google Play Console

## Step 1: Install Dependencies

Navigate to the `functions` directory and install dependencies:

```bash
cd functions
npm install
```

## Step 2: Configure Firebase Functions

You need to set the service account key and package name as Firebase Functions config.

### Option A: Using Firebase CLI (Recommended)

1. **Get your service account JSON key content:**
   - Open the JSON file you downloaded from Google Cloud Console
   - Copy the entire content

2. **Set the configuration:**
   ```bash
   firebase functions:config:set googleplay.package_name="com.assetdoor.app"
   firebase functions:config:set googleplay.service_account_key='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
   ```
   
   **Important:** Replace the JSON content with your actual service account key JSON. Make sure to escape quotes properly or use single quotes around the JSON string.

### Option B: Using Environment Variables (Alternative)

If the above doesn't work, you can use environment variables:

1. Create a `.env` file in the `functions` directory:
   ```env
   GOOGLE_PLAY_PACKAGE_NAME=com.assetdoor.app
   GOOGLE_PLAY_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
   ```

2. Update `functions/index.js` to read from environment variables instead of `functions.config()`

## Step 3: Deploy Functions

```bash
# Make sure you're in the project root directory
firebase deploy --only functions
```

This will:
- Install dependencies
- Deploy the scheduled function `syncGooglePlayProducts` (runs every 1 minute)
- Deploy the manual trigger function `manualSyncGooglePlayProducts`

## Step 4: Test the Function

### Test Manual Sync (HTTP Trigger)

After deployment, you'll get a URL like:
```
https://us-central1-assetdoor-4c2a9.cloudfunctions.net/manualSyncGooglePlayProducts
```

Visit this URL in your browser or use curl:
```bash
curl https://us-central1-assetdoor-4c2a9.cloudfunctions.net/manualSyncGooglePlayProducts
```

### Check Firestore

1. Go to Firebase Console → Firestore Database
2. Check the `iapProducts` collection
3. You should see your IAP products synced from Google Play Console

### Check Function Logs

```bash
firebase functions:log
```

Or in Firebase Console:
1. Go to Functions → Logs
2. Check for `syncGooglePlayProducts` logs

## Step 5: Verify Scheduled Sync

The function runs automatically every 1 minute. Check the logs after a few minutes to verify it's working.

## Troubleshooting

### Error: "Service account key not configured"
- Make sure you've set the Firebase Functions config correctly
- Check that the JSON is properly formatted

### Error: "Permission denied"
- Verify service account has access in Google Play Console → Setup → API access
- Check that Google Play Developer API is enabled in Google Cloud Console

### Error: "Package name not found"
- Verify the package name matches your app in Google Play Console
- Check that you've uploaded at least one APK/AAB

### Function not running
- Check Firebase Functions logs
- Verify the function is deployed: `firebase functions:list`
- Check that Pub/Sub is enabled in your Firebase project

## Security Notes

⚠️ **Important:**
- Never commit the service account JSON key to Git
- The key is stored securely in Firebase Functions config
- Only admins with Firebase access can view/modify config

## Next Steps

After the function is working:
1. ✅ IAP products will sync to Firestore automatically
2. ✅ Admin panel can fetch and display IAP products
3. ✅ Product form can link to IAP products

