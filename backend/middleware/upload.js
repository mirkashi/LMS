const multer = require('multer');

// Use memory storage: files are kept in RAM and handled by controllers (e.g., uploaded to Google Drive)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB
});

module.exports = uploadMiddleware;
