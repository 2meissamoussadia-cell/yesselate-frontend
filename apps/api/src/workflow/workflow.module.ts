import { Module } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { WorkflowController } from './workflow.controller';
import { WorkflowGateway } from './workflow.gateway';

@Module({
  controllers: [WorkflowController],
  providers: [WorkflowService, WorkflowGateway],
  exports: [WorkflowService],
})
export class WorkflowModule {}
