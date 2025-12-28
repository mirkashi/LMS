/**
 * Google OAuth2 Refresh Token Generator
 * 
 * This script helps you generate a refresh token for Google Drive API access.
 * 
 * Usage:
 * 1. Ensure googleapis is installed: npm install googleapis
 * 2. Run: node backend/scripts/generateRefreshToken.js
 * 3. Follow the instructions in the console
 */

const { google } = require('googleapis');
const readline = require('readline');

// Your OAuth2 credentials from .env file
const CLIENT_ID = '880436395510-qp96q8vjgumps5h3piinf74o6p6eq09k.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Generate auth URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/drive.file'],
  prompt: 'consent' // Forces refresh token generation
});

console.log('\n===========================================');
console.log('🔑 Google Drive Refresh Token Generator');
console.log('===========================================\n');

console.log('📋 Step 1: Authorize this application');
console.log('----------------------------------------');
console.log('Visit this URL in your browser:\n');
console.log(authUrl);
console.log('\n');

console.log('📋 Step 2: Get authorization code');
console.log('----------------------------------------');
console.log('After authorizing, you will receive a code.');
console.log('Copy that code and paste it below.\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the authorization code: ', async (code) => {
  try {
    console.log('\n🔄 Exchanging code for tokens...\n');
    
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('✅ Success! Here is your refresh token:\n');
    console.log('===========================================');
    console.log(tokens.refresh_token);
    console.log('===========================================\n');
    
    console.log('📝 Next Steps:');
    console.log('----------------------------------------');
    console.log('1. Copy the refresh token above');
    console.log('2. Open backend/.env file');
    console.log('3. Replace this line:');
    console.log('   GOOGLE_REFRESH_TOKEN=your_refresh_token_here');
    console.log('   with:');
    console.log(`   GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('4. Restart your backend server');
    console.log('5. Test course upload functionality\n');
    
    if (tokens.access_token) {
      console.log('ℹ️  Additional Info:');
      console.log('----------------------------------------');
      console.log('Access Token (expires in 1 hour):', tokens.access_token);
      console.log('Token Type:', tokens.token_type);
      console.log('Expiry Date:', new Date(tokens.expiry_date).toLocaleString());
      console.log('\n✅ Your refresh token never expires unless you revoke it.\n');
    }
    
  } catch (error) {
    console.error('\n❌ Error exchanging code for tokens:');
    console.error(error.message);
    console.log('\nPlease try again or check that:');
    console.log('1. You copied the entire authorization code');
    console.log('2. The code has not expired (codes expire quickly)');
    console.log('3. Your CLIENT_ID and CLIENT_SECRET are correct\n');
  }
  
  rl.close();
});
