import { env } from '../config/env.js';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client with credentials from environment
const s3 = new S3Client({
  region: env.AWS_S3_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Interface for presigned URL request parameters
 */
export interface PresignedUrlParams {
  key: string;
  contentType: string;
}

/**
 * Interface for presigned URL response
 */
export interface PresignedUrlResponse {
  fileLink: string;
  signedUrl: string;
}

/**
 * Creates a presigned URL for uploading a file directly to S3
 * The presigned URL allows the frontend to upload files securely without exposing AWS credentials
 *
 * @param params - Object containing the S3 key and content type
 * @param params.key - The S3 object key (file path in bucket)
 * @param params.contentType - MIME type of the file (e.g., 'image/png', 'application/pdf')
 * @returns Object containing the final file URL and the presigned upload URL
 * @throws Error if presigned URL generation fails
 */
export async function createPresignedPost({
  key,
  contentType,
}: PresignedUrlParams): Promise<PresignedUrlResponse> {
  try {
    // Validate input parameters
    if (!key || typeof key !== 'string') {
      throw new Error('Invalid key: must be a non-empty string');
    }

    if (!contentType || typeof contentType !== 'string') {
      throw new Error('Invalid contentType: must be a non-empty string');
    }

    // Create the PutObject command with metadata
    const command = new PutObjectCommand({
      Bucket: env.AWS_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    // Generate the final public URL for the uploaded file
    const fileLink = `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_S3_REGION}.amazonaws.com/${key}`;

    // Generate presigned URL valid for 5 minutes
    const signedUrl = await getSignedUrl(s3, command, {
      expiresIn: 5 * 60, // 300 seconds = 5 minutes
    });

    return { fileLink, signedUrl };
  } catch (error) {
    console.error('Error creating presigned URL:', error);
    throw new Error(
      `Failed to create presigned URL: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
