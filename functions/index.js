/**
 * Cloud Functions for IAP Product Syncing
 * 
 * This function syncs IAP products from Google Play Console to Firestore
 * Runs every 1 minute automatically
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { google } = require('googleapis');

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Firestore
const db = admin.firestore();

/**
 * Sync Google Play IAP Products to Firestore
 * 
 * This function:
 * 1. Authenticates with Google Play Developer API using service account
 * 2. Fetches all IAP products from Google Play Console
 * 3. Transforms and upserts them to Firestore iapProducts collection
 * 4. Handles errors gracefully
 */
exports.syncGooglePlayProducts = functions.pubsub
  .schedule('every 1 minutes')
  .timeZone('UTC')
  .onRun(async (context) => {
    console.log('Starting Google Play IAP products sync...');
    
    try {
      // Get configuration from environment variables
      const packageName = functions.config().googleplay?.package_name || 'com.assetdoor.app';
      const serviceAccountKey = functions.config().googleplay?.service_account_key;
      
      if (!serviceAccountKey) {
        throw new Error('Service account key not configured. Please set googleplay.service_account_key in Firebase Functions config.');
      }
      
      // Parse service account key (can be JSON string or object)
      let credentials;
      if (typeof serviceAccountKey === 'string') {
        credentials = JSON.parse(serviceAccountKey);
      } else {
        credentials = serviceAccountKey;
      }
      
      // Authenticate with Google Play Developer API
      const auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: ['https://www.googleapis.com/auth/androidpublisher'],
      });
      
      const androidpublisher = google.androidpublisher({
        version: 'v3',
        auth: auth,
      });
      
      // Fetch all IAP products from Google Play Console
      console.log(`Fetching IAP products for package: ${packageName}`);
      const response = await androidpublisher.inappproducts.list({
        packageName: packageName,
      });
      
      const iapProducts = response.data.inappproducts || [];
      console.log(`Found ${iapProducts.length} IAP products`);
      
      // Process each product
      const batch = db.batch();
      let updateCount = 0;
      let createCount = 0;
      
      for (const product of iapProducts) {
        const sku = product.sku;
        if (!sku) {
          console.warn('Skipping product without SKU:', product);
          continue;
        }
        
        // Transform Google Play product to Firestore structure
        const prices = [];
        
        // Extract prices from defaultPrice or listings
        if (product.defaultPrice) {
          const priceMicros = product.defaultPrice.priceMicros || 0;
          const currency = product.defaultPrice.currency || 'USD';
          const amount = priceMicros / 1000000; // Convert micros to regular currency
          
          prices.push({
            currency: currency,
            amount: amount,
            formatted: formatPrice(amount, currency),
          });
        }
        
        // Check if product already exists
        const productRef = db.collection('iapProducts').doc(sku);
        const productDoc = await productRef.get();
        
        const iapProductData = {
          platform: 'android',
          sku: sku,
          productId: null, // iOS only
          name: product.defaultLanguage || sku,
          description: product.defaultLanguage || '',
          prices: prices,
          status: product.status || 'inactive',
          storeProductId: product.packageName || null,
          lastSynced: admin.firestore.FieldValue.serverTimestamp(),
          syncError: null,
          linkedProductId: productDoc.exists ? productDoc.data().linkedProductId || null : null,
          isLinked: productDoc.exists ? !!productDoc.data().linkedProductId : false,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        
        // Add createdAt only for new documents
        if (!productDoc.exists) {
          iapProductData.createdAt = admin.firestore.FieldValue.serverTimestamp();
          createCount++;
        } else {
          updateCount++;
        }
        
        // Upsert to Firestore
        batch.set(productRef, iapProductData, { merge: true });
      }
      
      // Commit batch write
      await batch.commit();
      
      console.log(`Sync completed: ${createCount} created, ${updateCount} updated`);
      
      return {
        success: true,
        total: iapProducts.length,
        created: createCount,
        updated: updateCount,
      };
      
    } catch (error) {
      console.error('Error syncing Google Play IAP products:', error);
      
      // Log error to Firestore for debugging
      try {
        await db.collection('iapProducts').doc('_sync_status').set({
          lastSync: admin.firestore.FieldValue.serverTimestamp(),
          success: false,
          error: error.message,
          platform: 'android',
        }, { merge: true });
      } catch (logError) {
        console.error('Failed to log sync error:', logError);
      }
      
      // Don't throw error - let it retry on next schedule
      return {
        success: false,
        error: error.message,
      };
    }
  });

/**
 * Manual trigger function for testing
 * Can be called via HTTP or from admin panel
 * 
 * Usage: Call the HTTP endpoint to trigger sync manually
 */
exports.manualSyncGooglePlayProducts = functions.https.onRequest(async (req, res) => {
  console.log('Manual sync triggered');
  
  try {
    // Get configuration from environment variables
    const packageName = functions.config().googleplay?.package_name || 'com.assetdoor.app';
    const serviceAccountKey = functions.config().googleplay?.service_account_key;
    
    if (!serviceAccountKey) {
      return res.status(500).json({
        success: false,
        error: 'Service account key not configured',
      });
    }
    
    // Parse service account key
    let credentials;
    if (typeof serviceAccountKey === 'string') {
      credentials = JSON.parse(serviceAccountKey);
    } else {
      credentials = serviceAccountKey;
    }
    
    // Authenticate with Google Play Developer API
    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });
    
    const androidpublisher = google.androidpublisher({
      version: 'v3',
      auth: auth,
    });
    
    // Fetch all IAP products
    const response = await androidpublisher.inappproducts.list({
      packageName: packageName,
    });
    
    const iapProducts = response.data.inappproducts || [];
    
    // Process and save to Firestore
    const batch = db.batch();
    let updateCount = 0;
    let createCount = 0;
    
    for (const product of iapProducts) {
      const sku = product.sku;
      if (!sku) continue;
      
      const prices = [];
      if (product.defaultPrice) {
        const priceMicros = product.defaultPrice.priceMicros || 0;
        const currency = product.defaultPrice.currency || 'USD';
        const amount = priceMicros / 1000000;
        
        prices.push({
          currency: currency,
          amount: amount,
          formatted: formatPrice(amount, currency),
        });
      }
      
      const productRef = db.collection('iapProducts').doc(sku);
      const productDoc = await productRef.get();
      
      const iapProductData = {
        platform: 'android',
        sku: sku,
        productId: null,
        name: product.defaultLanguage || sku,
        description: product.defaultLanguage || '',
        prices: prices,
        status: product.status || 'inactive',
        storeProductId: product.packageName || null,
        lastSynced: admin.firestore.FieldValue.serverTimestamp(),
        syncError: null,
        linkedProductId: productDoc.exists ? productDoc.data().linkedProductId || null : null,
        isLinked: productDoc.exists ? !!productDoc.data().linkedProductId : false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      
      if (!productDoc.exists) {
        iapProductData.createdAt = admin.firestore.FieldValue.serverTimestamp();
        createCount++;
      } else {
        updateCount++;
      }
      
      batch.set(productRef, iapProductData, { merge: true });
    }
    
    await batch.commit();
    
    res.status(200).json({
      success: true,
      message: 'Sync completed successfully',
      data: {
        total: iapProducts.length,
        created: createCount,
        updated: updateCount,
      },
    });
  } catch (error) {
    console.error('Manual sync error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Helper function to format price
 */
function formatPrice(amount, currency) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
}

