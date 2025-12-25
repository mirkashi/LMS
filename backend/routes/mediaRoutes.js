const express = require('express');
const router = express.Router();
const { streamDriveFile } = require('../utils/googleDrive');

// Stream a Google Drive file through backend
router.get('/drive/:fileId/stream', streamDriveFile);

module.exports = router;
