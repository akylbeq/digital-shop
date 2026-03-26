import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
  S3ClientConfig,
} from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;

  constructor() {
    const s3Config: S3ClientConfig = {
      region: process.env.AWS_REGION as string,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
    };

    this.s3Client = new S3Client(s3Config);
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const bucket: string = process.env.AWS_BUCKET_NAME as string;
    const region: string = process.env.AWS_REGION as string;

    if (!bucket || !region) {
      throw new InternalServerErrorException(
        'AWS Config (Bucket/Region) is missing',
      );
    }

    const key = `images/${Date.now()}-${file.originalname}`;

    const params: PutObjectCommandInput = {
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      const command = new PutObjectCommand(params);
      await this.s3Client.send(command);

      return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown S3 error';
      console.error('S3 Upload Error:', errorMessage);
      throw new InternalServerErrorException('Failed to upload file to S3');
    }
  }
}
