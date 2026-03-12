import { BadRequestException, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { PermitAuthGuard } from '../auth/permit-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('upload-image')
export class UploadImageController {

  @Post()
  @UseGuards(TokenAuthGuard, PermitAuthGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('image', {dest: './public/images/'}))
  async uploadImage(@UploadedFile() image: Express.Multer.File) {
    try {
      if (!image) throw new BadRequestException('Image file is required');

      return {url: '/images/' + image.filename};
    } catch (e) {
      throw new BadRequestException('error')
    }
  }
}
