const cloudinary = require('../config/cloudinary');

/**
 * @desc    Upload call recording to Cloudinary
 * @route   POST /api/upload
 * @access  Private
 */
const uploadRecording = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please provide an audio recording.',
      });
    }

    const file = req.file;
    const userId = req.user._id.toString();

    // The file is already uploaded to Cloudinary via multer-storage-cloudinary
    // req.file contains Cloudinary response data

    res.status(200).json({
      success: true,
      message: 'Recording uploaded successfully.',
      data: {
        file: {
          publicId: file.public_id || file.publicId,
          originalName: file.originalname,
          fileName: file.filename,
          mimeType: file.mimetype,
          size: file.size,
          url: file.path, // Cloudinary URL
          secureUrl: file.secure_url || file.path,
          format: file.format,
          duration: file.duration, // For audio files
          createdAt: new Date(),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all recordings for logged in user from Cloudinary
 * @route   GET /api/upload
 * @access  Private
 */
const getRecordings = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const { page = 1, limit = 20 } = req.query;

    // Get all files from Cloudinary for this user
    const result = await cloudinary.search
      .expression(`folder:call-recordings/${userId} AND resource_type:video`)
      .sort_by('created_at', 'desc')
      .max_results(parseInt(limit))
      .next_cursor(req.query.cursor || null)
      .execute();

    const files = result.resources.map((resource) => ({
      publicId: resource.public_id,
      fileName: resource.filename || resource.public_id.split('/').pop(),
      url: resource.secure_url,
      mimeType: `audio/${resource.format}`,
      size: resource.bytes,
      format: resource.format,
      duration: resource.duration,
      createdAt: resource.created_at,
    }));

    res.status(200).json({
      success: true,
      data: {
        files,
        count: files.length,
        nextCursor: result.next_cursor || null,
        totalCount: result.total_count || files.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a recording from Cloudinary
 * @route   DELETE /api/upload/:publicId
 * @access  Private
 */
const deleteRecording = async (req, res, next) => {
  try {
    const { publicId } = req.params;
    const userId = req.user._id.toString();

    // Construct full public_id if only filename provided
    const fullPublicId = publicId.includes('/')
      ? publicId
      : `call-recordings/${userId}/${publicId}`;

    // Verify ownership by checking the public_id contains user's id
    if (!fullPublicId.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this recording.',
      });
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(fullPublicId, {
      resource_type: 'video', // Audio files are stored as video in Cloudinary
    });

    if (result.result === 'not found') {
      return res.status(404).json({
        success: false,
        message: 'Recording not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Recording deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single recording by public ID
 * @route   GET /api/upload/:publicId
 * @access  Private
 */
const getRecordingById = async (req, res, next) => {
  try {
    const { publicId } = req.params;
    const userId = req.user._id.toString();

    // Construct full public_id if only filename provided
    const fullPublicId = publicId.includes('/')
      ? publicId
      : `call-recordings/${userId}/${publicId}`;

    // Get resource from Cloudinary
    const result = await cloudinary.api.resource(fullPublicId, {
      resource_type: 'video',
    });

    res.status(200).json({
      success: true,
      data: {
        file: {
          publicId: result.public_id,
          fileName: result.filename || result.public_id.split('/').pop(),
          url: result.secure_url,
          mimeType: `audio/${result.format}`,
          size: result.bytes,
          format: result.format,
          duration: result.duration,
          createdAt: result.created_at,
        },
      },
    });
  } catch (error) {
    if (error.http_code === 404) {
      return res.status(404).json({
        success: false,
        message: 'Recording not found.',
      });
    }
    next(error);
  }
};

module.exports = {
  uploadRecording,
  getRecordings,
  deleteRecording,
  getRecordingById,
};