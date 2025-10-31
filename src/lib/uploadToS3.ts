// lib/uploadToS3.ts
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
  S3ServiceException,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

interface UploadResult {
  url: string;
  key: string;
  size: number;
}

export const uploadBufferToS3 = async (
  buffer: Buffer,
  mimetype: string,
  originalName: string,
  folder: string
): Promise<UploadResult> => {
  try {
    const cleanFileName = originalName
      .replace(/[^\w.-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();

    const key = `${folder}/${Date.now()}-${cleanFileName}`;

    const input: PutObjectCommandInput = {
      Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    };

    const command = new PutObjectCommand(input);
    await s3.send(command);

    return {
      url: `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`,
      key,
      size: buffer.length,
    };
  } catch (error) {
    if (error instanceof S3ServiceException) {
      console.error('S3 Upload Error:', error.$metadata);
      throw new Error(`Upload failed: ${error.message}`);
    }
    throw error;
  }
};

export const deleteFromS3 = async (url: string, folder: string): Promise<void> => {
  try {
    const expectedPrefix = `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/`;

    if (!url.startsWith(expectedPrefix)) {
      throw new Error("Invalid S3 URL format");
    }

    // Extract full key (including folder)
    const key = url.replace(expectedPrefix, ""); // e.g., "letters/1730264180000-file.pdf"

    // Optional validation: check folder match
    if (!key.startsWith(`${folder}/`)) {
      throw new Error(`Invalid folder: expected prefix '${folder}/' but got '${key}'`);
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!,
      Key: key,
    });

    await s3.send(command);
    console.log(`✅ Deleted from S3: ${key}`);
  } catch (error) {
    if (error instanceof S3ServiceException) {
      console.error("S3 Delete Error:", error.$metadata);
      throw new Error(`Delete failed: ${error.message}`);
    }
    console.error("Delete Error:", error);
    throw error;
  }
};
