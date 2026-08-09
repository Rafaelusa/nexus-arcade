import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealthStatus() {
    return {
      status: 'online',
      service: 'Nexus Arcade API Core',
      version: '0.1.0-sprint1',
      timestamp: new Date().toISOString(),
      database: 'PostgreSQL (Docker)',
      architecture: 'Monorepo Full Stack (NestJS + Angular)',
    };
  }
}
