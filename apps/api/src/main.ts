import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Aplicar cabeçalhos de segurança HTTP com Helmet
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: false,
    }),
  );

  // 2. Ajustar limites do Body Parser para suportar Save States em nuvem (Base64 da memória do WebAssembly)
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // 3. Habilitar CORS para o Frontend Angular
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 4. Validação Global de Payloads DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 5. Configurar Documentação OpenAPI / Swagger UI
  const config = new DocumentBuilder()
    .setTitle('Nexus Arcade API')
    .setDescription(
      'Documentação técnica interativa da RESTful API do Nexus Arcade, cobrindo Autenticação JWT, RBAC, Catálogo de Jogos, Armazenamento de ROMs e Save States.',
    )
    .setVersion('0.9.0-sprint9')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Insira seu Access Token JWT aqui',
        in: 'header',
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`[NestJS] API Nexus Arcade executando em http://localhost:${port}`);
  console.log(`[Swagger] Documentação OpenAPI em http://localhost:${port}/api/docs`);
}
bootstrap();
