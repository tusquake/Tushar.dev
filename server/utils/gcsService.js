const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');

let storage = null;

// Auto-detect GCS credentials path (for local dev/Secret Files)
let keyPath = process.env.GCS_KEY_FILE_PATH;
if (!keyPath) {
    const defaultRootPath = path.join(__dirname, '..', '..', 'gcp-credentials-key.json');
    const defaultServerPath = path.join(__dirname, '..', 'gcp-credentials-key.json');
    if (fs.existsSync(defaultRootPath)) {
        keyPath = defaultRootPath;
    } else if (fs.existsSync(defaultServerPath)) {
        keyPath = defaultServerPath;
    }
}

// Fallback configs if env is empty
const projectId = process.env.GCS_PROJECT_ID || 'galvanic-axle-474007-a2';
const bucketName = process.env.GCS_BUCKET_NAME || 'galvanic-axle-474007-a2-media';

// Check if credentials JSON is passed as a string in environment variables (for Render envs)
const keyJson = process.env.GCS_KEY_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

if (bucketName) {
    const config = {};
    if (projectId) config.projectId = projectId;
    
    if (keyJson) {
        try {
            config.credentials = JSON.parse(keyJson);
        } catch (err) {
            console.error('Failed to parse GCS_KEY_JSON / GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable:', err);
        }
    } else if (keyPath) {
        config.keyFilename = keyPath;
    }

    try {
        storage = new Storage(config);
        console.log(`Google Cloud Storage initialized automatically with bucket: ${bucketName}`);
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
