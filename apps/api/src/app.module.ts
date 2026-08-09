import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
import { UsersModule } from './users/users.module';
import { StorageModule } from './storage/storage.module';
import { PlatformsModule } from './platforms/platforms.module';
import { GamesModule } from './games/games.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    AuditModule,
    UsersModule,
    StorageModule,
    PlatformsModule,
    GamesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
