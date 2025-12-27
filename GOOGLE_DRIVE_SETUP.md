# Google Drive Integration Setup Guide

This guide explains how to set up Google Drive integration for automatic file storage in the LMS.

## Prerequisites

- Google Cloud Console account
- Google Drive API enabled
- OAuth 2.0 credentials

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

## Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Configure OAuth consent screen if prompted
4. Select "Desktop application" as application type
5. Download the JSON file or note the Client ID and Client Secret

## Step 3: Get Refresh Token

1. Use the following script to get a refresh token (replace with your credentials):

```javascript
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  'YOUR_CLIENT_ID',
  'YOUR_CLIENT_SECRET',
  'urn:ietf:wg:oauth:2.0:oob'
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/drive.file']
});

console.log('Authorize this app by visiting:', authUrl);

// After authorization, use the code to get tokens
// oauth2Client.getToken(code, (err, token) => {
//   console.log(token.refresh_token);
// });
```

2. Visit the auth URL, authorize the app, and get the authorization code
3. Exchange the code for tokens and save the refresh_token

## Step 4: Configure Environment Variables

Update `backend/.env` with your credentials:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
GOOGLE_DRIVE_FOLDER_ID=your_root_folder_id_here
```

## Step 5: Create Root Folder in Google Drive

1. Create a folder in Google Drive for LMS files
2. Get the folder ID from the URL (the long string after `/folders/`)
3. Set it as `GOOGLE_DRIVE_FOLDER_ID`

## Features

- **Automatic Uploads**: Files are uploaded to course-specific folders
- **Retry Mechanism**: Failed uploads are retried up to 3 times with exponential backoff
- **Public Access**: Uploaded files are made publicly readable
- **Metadata Storage**: File IDs, names, sizes, and types are stored in the database
- **Streaming Support**: Videos can be streamed directly from Google Drive

## File Organization

Files are organized in the following hierarchy:
```
LMS Root Folder/
├── course-{courseId}/
│   ├── course-image-{timestamp}-{filename}
│   ├── course-material-{timestamp}-{filename}
│   └── lesson-video-{timestamp}-{filename}
```

## Dependencies

Required npm packages:
- `googleapis`

Install with:
```bash
npm install googleapis
```

## Error Handling

- Network failures trigger automatic retries
- Invalid credentials return configuration errors
- Large file uploads may require chunked uploads (handled by googleapis)

## Security Notes

- Refresh tokens should be kept secure
- Files are made public for LMS access
- Consider implementing file access controls if needed