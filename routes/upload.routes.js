const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const uploadController = require('../controllers/upload.controller');

/**
 * Configure Cloudinary Storage for Multer
 */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const fileExt = file.originalname.split('.').pop() || 'webm';

    return {
      folder: 'call-recordings',
      resource_type: 'video', // Audio files are stored as video in Cloudinary
      format: fileExt,
      public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
      // Optional: Add transformation for audio optimization
      transformation: [
        { quality: 'auto' },
        { flags: 'strip_profile' },
      ],
    };
  },
});

/**
 * File filter for allowed audio types
 */
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = (process.env.ALLOWED_AUDIO_TYPES || 'audio/mpeg,audio/wav,audio/mp3,audio/mp4,audio/ogg,audio/webm,audio/x-m4a,audio/m4a,audio/x-wav')
    .split(',')
    .map((type) => type.trim());

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(`File type not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`),
      false
    );
  }
};

// Configure multer with Cloudinary storage
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024, // Default 50MB
  },
});

/**
 * @route   POST /api/upload
 * @desc    Upload call recording to Cloudinary
 * @access  Public
 */
router.post('/', upload.single('recording'), uploadController.uploadRecording);

/**
 * @route   GET /api/upload
 * @desc    Get all recordings
 * @access  Public
 */
router.get('/', uploadController.getRecordings);

/**
 * @route   GET /api/upload/:publicId
 * @desc    Get a single recording by public ID
 * @access  Public
 */
router.get('/:publicId', uploadController.getRecordingById);

/**
 * @route   DELETE /api/upload/:publicId
 * @desc    Delete a recording from Cloudinary
 * @access  Public
 */
router.delete('/:publicId', uploadController.deleteRecording);

module.exports = router;