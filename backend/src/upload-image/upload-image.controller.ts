import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { PermitAuthGuard } from '../auth/permit-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { S3Service } from '../s3/s3.service';

@Controller('upload-image')
export class UploadImageController {
  constructor(private readonly s3Service: S3Service) {}

  @Post()
  @UseGuards(TokenAuthGuard, PermitAuthGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@UploadedFile() image: Express.Multer.File) {
    if (!image) {
      throw new BadRequestException('Image file is required');
    }
    try {
      const imageUrl = await this.s3Service.uploadFile(image);

      return { url: imageUrl };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Upload failed';
      throw new BadRequestException(message);
    }
  }
}
