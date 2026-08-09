import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
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

  // 2. Habilitar CORS para o Frontend Angular
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 3. Validação Global de Payloads DTO
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

  // 4. Configurar Documentação OpenAPI / Swagger UI
  const config = new DocumentBuilder()
    .setTitle('Nexus Arcade API')
    .setDescription(
      'Documentação técnica interativa da RESTful API do Nexus Arcade, cobrindo Autenticação JWT, RBAC, Catálogo de Jogos e Armazenamento de ROMs.',
    )
    .setVersion('0.3.0-sprint3')
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
