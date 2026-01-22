const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

let driveClient;
let driveConfigured = null; // Cache the configuration status

function getDriveClient() {
  if (driveClient) return driveClient;

  // Check if we already determined Drive is not configured
  if (driveConfigured === false) {
    return null;
  }

  const required = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REFRESH_TOKEN'
  ];
  
  const missing = required.filter((k) => !process.env[k] || process.env[k] === 'your_refresh_token_here');
  
  if (missing.length) {
    console.warn('\n⚠️  Google Drive is NOT configured properly!');
    console.warn(`Missing or invalid env vars: ${missing.join(', ')}`);
    console.warn('📁 Files will be stored LOCALLY in backend/uploads/ directory');
    console.warn('ℹ️  To enable Google Drive, please configure the credentials in backend/.env\n');
    driveConfigured = false;
    return null;
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob'
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

    driveClient = google.drive({ version: 'v3', auth: oauth2Client });
    driveConfigured = true;
    console.log('✅ Google Drive client initialized successfully');
    return driveClient;
  } catch (error) {
    console.error('❌ Failed to initialize Google Drive client:', error.message);
    driveConfigured = false;
    return null;
  }
}

// Check if Google Drive is configured
function isGoogleDriveConfigured() {
  if (driveConfigured !== null) {
    return driveConfigured;
  }
  getDriveClient(); // This will set driveConfigured
  return driveConfigured === true;
}

async function createFolderIfNotExists(folderName, parentFolderId) {
  const drive = getDriveClient();
  if (!drive) {
    throw new Error('Google Drive client not configured. Please check environment variables.');
  }

  try {
    // Check if folder already exists
    const searchRes = await drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentFolderId}' in parents and trashed=false`,
      fields: 'files(id, name)',
    });

    if (searchRes.data.files.length > 0) {
      return searchRes.data.files[0].id;
    }

    // Create new folder
    const createRes = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : undefined,
      },
      fields: 'id',
    });

    return createRes.data.id;
  } catch (error) {
    console.error('Failed to create/find folder:', error.message);
    throw error;
  }
}

// Save file locally as fallback
async function saveFileLocally({ buffer, name, subfolder = 'courses' }) {
  try {
    // Ensure subfolder is a safe single directory name
    let safeSubfolder = typeof subfolder === 'string' && subfolder.length > 0 ? subfolder : 'courses';
    if (!/^[a-zA-Z0-9_-]+$/.test(safeSubfolder)) {
      console.warn(`Invalid subfolder "${safeSubfolder}" provided to saveFileLocally; falling back to "courses".`);
      safeSubfolder = 'courses';
    }

    const uploadsRoot = path.resolve(__dirname, '../uploads');
    const uploadsDir = path.resolve(uploadsRoot, safeSubfolder);

    // Ensure the resolved uploadsDir is within the uploadsRoot directory
    if (uploadsDir !== uploadsRoot && !uploadsDir.startsWith(uploadsRoot + path.sep)) {
      throw new Error('Invalid upload directory resolved when saving file locally');
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const filename = `${Date.now()}-${name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filepath = path.join(uploadsDir, filename);
    
    fs.writeFileSync(filepath, buffer);
    
    // Return URL path that can be accessed via Express static middleware
    return {
      id: filename,
      url: `/uploads/${safeSubfolder}/${filename}`,
      name: filename,
      size: buffer.length,
      storageType: 'local'
    };
  } catch (error) {
    console.error('Failed to save file locally:', error);
    throw new Error(`Failed to save file locally: ${error.message}`);
  }
}

async function uploadBufferToDrive({ buffer, name, mimeType, folderId, subfolder = 'courses', retries = 3 }) {
  // Normalize and validate subfolder to a safe single directory name
  let safeSubfolder = typeof subfolder === 'string' && subfolder.length > 0 ? subfolder : 'courses';
  if (!/^[a-zA-Z0-9_-]+$/.test(safeSubfolder)) {
    console.warn(`Invalid subfolder "${safeSubfolder}" provided to uploadBufferToDrive; falling back to "courses".`);
    safeSubfolder = 'courses';
  }

  const drive = getDriveClient();

  // If Google Drive is not configured, save locally
  if (!drive) {
    console.log(`📁 Saving file locally: ${name}`);
    return await saveFileLocally({ buffer, name, subfolder: safeSubfolder });
  }

  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await drive.files.create({
        requestBody: {
          name,
          parents: folderId ? [folderId] : undefined,
          mimeType,
        },
        media: {
          mimeType,
          body: Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer),
        },
        fields: 'id, name, webViewLink, webContentLink, mimeType, size, thumbnailLink'
      });

      const fileId = res.data.id;
      // Make file public readable
      try {
        await drive.permissions.create({
          fileId,
          requestBody: { role: 'reader', type: 'anyone' }
        });
      } catch (e) {
        console.warn('Failed to set file permissions:', e.message);
      }

      console.log(`✅ File uploaded to Google Drive: ${name}`);
      return {
        id: fileId,
        webViewLink: res.data.webViewLink,
        webContentLink: res.data.webContentLink,
        thumbnailLink: res.data.thumbnailLink,
        name: res.data.name,
        mimeType: res.data.mimeType,
        size: res.data.size,
        url: `https://drive.google.com/uc?id=${fileId}`,
        storageType: 'google-drive'
      };
    } catch (error) {
      lastError = error;
      console.warn(`Upload attempt ${attempt} failed:`, error.message);
      if (attempt < retries) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  // If all Google Drive attempts failed, fallback to local storage
  console.warn(`⚠️  Google Drive upload failed after ${retries} attempts. Saving locally as fallback.`);
  console.warn(`Error: ${lastError.message}`);
  return await saveFileLocally({ buffer, name, subfolder });
}

// Stream a Drive file through our backend, supporting range requests
async function streamDriveFile(req, res) {
  const drive = getDriveClient();
  const { fileId } = req.params;

  if (!drive) {
    return res.status(500).json({ 
      success: false, 
      message: 'Google Drive not configured' 
    });
  }

  try {
    const driveRes = await drive.files.get({
      fileId,
      alt: 'media'
    }, { responseType: 'stream' });

    res.setHeader('Content-Type', 'video/mp4');
    driveRes.data.on('error', (err) => {
      console.error('Drive stream error:', err);
      res.status(500).end('Stream error');
    });
    driveRes.data.pipe(res);
  } catch (error) {
    console.error('Failed to stream from Drive:', error.message);
    res.status(500).json({ success: false, message: 'Failed to stream file' });
  }
}

// Delete file from Google Drive or local storage
async function deleteFile(fileId, storageType = 'google-drive') {
  if (storageType === 'local') {
    try {
      const filepath = path.join(__dirname, '../uploads', fileId);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        console.log(`🗑️  Deleted local file: ${fileId}`);
        return true;
      }
    } catch (error) {
      console.error('Failed to delete local file:', error);
      return false;
    }
  } else {
    const drive = getDriveClient();
    if (!drive) {
      console.warn('Cannot delete from Google Drive - not configured');
      return false;
    }
    
    try {
      await drive.files.delete({ fileId });
      console.log(`🗑️  Deleted Google Drive file: ${fileId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete from Google Drive:', error);
      return false;
    }
  }
}

module.exports = {
  uploadBufferToDrive,
  streamDriveFile,
  createFolderIfNotExists,
  isGoogleDriveConfigured,
  saveFileLocally,
  deleteFile,
};
