import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: 'http://localhost:3000', // Адрес твоего фронтенда
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Важно, если используешь куки/сессии
  });
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // удаляет поля, которых нет в DTO
      forbidNonWhitelisted: true, // выдает ошибку, если прислали лишние поля
      transform: true, // автоматически превращает строки в числа (важно для form-data!)
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);
  await app.listen(8000);
}
void bootstrap();
