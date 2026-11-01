import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? 'demo',
  api_key: process.env.CLOUDINARY_API_KEY ?? 'demo',
  api_secret: process.env.CLOUDINARY_API_SECRET ?? 'demo',
});

export const cloudinaryClient = cloudinary;

export function normalizeCloudinaryUrl(url: string | null | undefined) {
  return url ?? 'https://placehold.co/600x800/0b1220/ffffff?text=Player';
}
