import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';
import { Room, Server } from 'colyseus';
import { playground } from '@colyseus/playground';
import { MainRoom } from './rooms/main.room';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { monitor } from '@colyseus/monitor';

function injectDeps<T extends { new (...args: any[]): Room }>(
  app: INestApplication,
  target: T,
): T {
  const selfDeps = Reflect.getMetadata('self:paramtypes', target) || [];
  const dependencies = Reflect.getMetadata('design:paramtypes', target) || [];

  selfDeps.forEach((dep: any) => {
    dependencies[dep.index] = dep.param;
  });

  const injectables =
    dependencies.map((dependency: any) => {
      return app.get(dependency);
    }) || [];

  return class extends target {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(...args: any[]) {
      super(...injectables);
    }
  };
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '../src/', 'views'));
  app.setViewEngine('ejs');
  app.useBodyParser('json', { limit: '50mb' });

  app.enableCors();
  app.use('/colyseus/playground', playground);
  app.use('/colyseus', monitor());

  const server = new Server({
    transport: new WebSocketTransport({
      server: app.getHttpServer(),
    }),
  });

  server.define('my_room', injectDeps(app, MainRoom));

  const config = new DocumentBuilder()
    .setTitle('TSP API Example')
    .setDescription('TSP API')
    .setVersion('1.0')
    .addTag('TSP')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api.doc', app, document, {
    customfavIcon: 'https://avatars.githubusercontent.com/u/6936373?s=200&v=4',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.css',
    ],
  });

  await app.init();
  await server.listen(4099).then(() => {
    console.log('app listion on port 3999');
  });
}
bootstrap();
