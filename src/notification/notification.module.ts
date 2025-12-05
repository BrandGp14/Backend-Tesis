import { Module, OnModuleInit } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { EntitiesModuleModule } from 'src/entities-module/entities-module.module';
import { NotificationGateway } from './notification.gateway';
import { NotificationWorker } from './notification.worker';

@Module({
  imports: [EntitiesModuleModule],
  providers: [NotificationService, NotificationGateway, NotificationWorker],
  controllers: [NotificationController],
})
export class NotificationModule { }
