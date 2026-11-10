import { v2 as cloudinary } from 'cloudinary';
import { promises as fs } from 'fs';
import path from 'path';

// Configure Cloudinary if credentials are present
const hasCloudinaryCredentials = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinaryCredentials) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Uploads a file buffer or base64 string to Cloudinary,
 * falling back to local storage if Cloudinary credentials are not configured.
 *
 * @param {Buffer|string} fileContent - Buffer or Base64 string of file
 * @param {Object} options - { filename, folder, resourceType }
 * @returns {Promise<{ secure_url: string, public_id: string, bytes: number, format: string }>}
 */
export async function uploadMedicalDocument(fileContent, options = {}) {
  const {
    filename = `doc_${Date.now()}`,
    folder = 'valora/medical_records',
    resourceType = 'auto',
  } = options;

  // If Cloudinary credentials configured, upload to Cloudinary
  if (hasCloudinaryCredentials) {
    try {
      let uploadPayload = fileContent;
      if (Buffer.isBuffer(fileContent)) {
        uploadPayload = `data:application/octet-stream;base64,${fileContent.toString('base64')}`;
      }

      const result = await cloudinary.uploader.upload(uploadPayload, {
        folder,
        resource_type: resourceType,
        public_id: `${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}`,
      });

      return {
        secure_url: result.secure_url,
        public_id: result.public_id,
        bytes: result.bytes || 0,
        format: result.format || 'pdf',
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(`Cloud upload failed: ${error.message}`);
    }
  }

  // Fallback: Local storage inside public/uploads/
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder.replace(/[^a-zA-Z0-9_-]/g, '/'));
    await fs.mkdir(uploadDir, { recursive: true });

    let buffer;
    if (Buffer.isBuffer(fileContent)) {
      buffer = fileContent;
    } else if (typeof fileContent === 'string' && fileContent.startsWith('data:')) {
      const base64Data = fileContent.split(';base64,').pop();
      buffer = Buffer.from(base64Data, 'base64');
    } else if (typeof fileContent === 'string') {
      buffer = Buffer.from(fileContent, 'utf-8');
    }

    const ext = path.extname(filename) || '.pdf';
    const cleanName = `${path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, cleanName);

    await fs.writeFile(filePath, buffer);

    const relativeUrl = `/uploads/${folder.replace(/[^a-zA-Z0-9_-]/g, '/')}/${cleanName}`;
    return {
      secure_url: relativeUrl,
      public_id: `local_${cleanName}`,
      bytes: buffer.length,
      format: ext.replace('.', ''),
    };
  } catch (localErr) {
    console.error('Local fallback upload error:', localErr);
    throw new Error(`File storage error: ${localErr.message}`);
  }
}

/**
 * Delete a file from storage
 */
export async function deleteMedicalDocument(publicId, fileUrl) {
  if (hasCloudinaryCredentials && publicId && !publicId.startsWith('local_')) {
    try {
      await cloudinary.uploader.destroy(publicId);
      return true;
    } catch (e) {
      console.error('Cloudinary delete error:', e);
    }
  }

  if (fileUrl && fileUrl.startsWith('/uploads/')) {
    try {
      const filePath = path.join(process.cwd(), 'public', fileUrl);
      await fs.unlink(filePath);
      return true;
    } catch (e) {
      console.warn('Could not delete local file:', e.message);
    }
  }

  return false;
}

