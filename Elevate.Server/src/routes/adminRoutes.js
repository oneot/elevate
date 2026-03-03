const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const adminController = require('../controllers/adminController');

// Multer storage configuration for local App Service storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save to the /uploads directory at the root of the project level
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Define admin routes
// Post CRUD
router.post('/posts', adminController.createPost);
router.put('/posts/:id', adminController.updatePost);
router.delete('/posts/:id', adminController.deletePost);

// Asset Management
router.post('/upload-local', upload.single('file'), adminController.uploadLocalAsset);
router.post('/assets', adminController.createAssetMetadata);

module.exports = router;
