import { NestFactory } from '@nestjs/core';
import { NestExpressApplication, ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express from 'express';
import { IncomingMessage, ServerResponse } from 'http';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

const expressApp = express();
let nestApp: NestExpressApplication | null = null;

async function bootstrap(): Promise<NestExpressApplication> {
  if (nestApp) return nestApp;

  nestApp = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(expressApp),
    {
      logger:
        process.env.NODE_ENV === 'production'
          ? ['error', 'warn']
          : ['log', 'error', 'warn', 'debug'],
    },
  );

  nestApp.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );
  nestApp.useGlobalFilters(new HttpExceptionFilter());
  nestApp.setGlobalPrefix('api');
  nestApp.enableCors();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Nexus API')
    .setDescription(
      'Senior NestJS E-commerce Portfolio — CQRS · JWT Auth · Rate Limiting · SQLite in-memory',
    )
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
    .addTag('auth', 'Authentication — register & login')
    .addTag('products', 'Product catalog — public reads, Admin writes')
    .addTag('orders', 'Order management — CQRS pattern (Command & Query buses)')
    .build();

  const document = SwaggerModule.createDocument(nestApp, swaggerConfig);
  SwaggerModule.setup('docs', nestApp, document, {
    swaggerOptions: { persistAuthorization: true },
    customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-standalone-preset.min.js',
    ],
  });

  await nestApp.init();
  return nestApp;
}

// Serverless handler — export = compiles to module.exports = fn (required by @vercel/node)
const serverlessHandler = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
  await bootstrap();
  expressApp(req as any, res as any);
};

// Local development server
if (!process.env.VERCEL) {
  bootstrap().then((app) =>
    app.listen(process.env.PORT ?? 3000, () => {
      console.log(`Server: http://localhost:${process.env.PORT ?? 3000}/api`);
      console.log(`Swagger: http://localhost:${process.env.PORT ?? 3000}/docs`);
    }),
  );
}

export = serverlessHandler;
