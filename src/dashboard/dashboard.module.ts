import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { EntitiesModuleModule } from 'src/entities-module/entities-module.module';

@Module({
  imports: [EntitiesModuleModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [],
})
export class DashboardModule { }
