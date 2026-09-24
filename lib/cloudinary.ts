import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'nexacrm-demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo-key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo-secret',
  secure: true,
});

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
  bytes: number;
}

/**
 * Upload a base64 string or file URL to Cloudinary
 */
export async function uploadToCloudinary(
  fileData: string,
  folder: string = 'nexacrm'
): Promise<CloudinaryUploadResult> {
  // If Cloudinary credentials are not set in environment, or in local mock mode,
  // return an optimized Cloudinary-formatted data URL or placeholder
  if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === 'demo-key') {
    return {
      secure_url: fileData.startsWith('data:') ? fileData : `https://res.cloudinary.com/demo/image/upload/v1600000000/${folder}/sample.jpg`,
      public_id: `${folder}/${Date.now()}`,
      format: 'jpg',
      resource_type: 'image',
      bytes: fileData.length,
    };
  }

  const result = await cloudinary.uploader.upload(fileData, {
    folder,
    resource_type: 'auto',
  });

  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
    format: result.format,
    resource_type: result.resource_type,
    bytes: result.bytes,
  };
}

/**
 * Delete a resource from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<any> {
  if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === 'demo-key') {
    return { result: 'ok' };
  }
  return await cloudinary.uploader.destroy(publicId);
}

export { cloudinary };
export default cloudinary;
