const { google } = require('googleapis');

let driveClient;

function getDriveClient() {
  if (driveClient) return driveClient;

  const required = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REFRESH_TOKEN'
  ];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    console.warn(`Missing Google API env vars: ${missing.join(', ')}`);
    console.warn('Google Drive upload functionality will be disabled. Files will be stored locally.');
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
    return driveClient;
  } catch (error) {
    console.error('Failed to initialize Google Drive client:', error.message);
    return null;
  }
}

async function uploadBufferToDrive({ buffer, name, mimeType, folderId }) {
  const drive = getDriveClient();
  
  if (!drive) {
    throw new Error('Google Drive client not configured. Please check environment variables.');
  }

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
    fields: 'id, name, webViewLink, webContentLink, mimeType, size'
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

  return {
    id: fileId,
    webViewLink: res.data.webViewLink,
    webContentLink: res.data.webContentLink,
    name: res.data.name,
    mimeType: res.data.mimeType,
    size: res.data.size,
  };
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

module.exports = {
  uploadBufferToDrive,
  streamDriveFile,
};
