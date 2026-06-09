const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');

let storage = null;
const bucketName = process.env.GCS_BUCKET_NAME;

// Initialize Storage if configuration is provided
if (bucketName) {
    const config = {
        projectId: process.env.GCS_PROJECT_ID,
    };

    // If key file path is provided, load credentials
    if (process.env.GCS_KEY_FILE_PATH) {
        config.keyFilename = process.env.GCS_KEY_FILE_PATH;
    }

    try {
        storage = new Storage(config);
        console.log(`Google Cloud Storage initialized with bucket: ${bucketName}`);
    } catch (error) {
        console.error('Failed to initialize Google Cloud Storage:', error);
    }
}

/**
 * Uploads a local file to GCS
 * @param {string} localFilePath - Temporary local path of the file
 * @param {string} destinationName - Desired filename inside the bucket
 * @returns {Promise<string>} - The public URL of the uploaded asset
 */
const uploadToGCS = async (localFilePath, destinationName) => {
    if (!storage || !bucketName) {
        throw new Error('Google Cloud Storage is not initialized or configured.');
    }

    const bucket = storage.bucket(bucketName);

    await bucket.upload(localFilePath, {
        destination: destinationName,
        public: true,
        metadata: {
            cacheControl: 'public, max-age=31536000',
        },
    });

    return `https://storage.googleapis.com/${bucketName}/${destinationName}`;
};

module.exports = {
    isGCSConfigured: !!(storage && bucketName),
    uploadToGCS,
};
