import { Body, Controller, Get, Patch, Param, Post } from '@nestjs/common';
import { WorkflowService } from './workflow.service';

@Controller('api/workflow')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get('phases')
  getPhases() {
    return this.workflowService.getPhasesWithStats();
  }

  @Patch('chantier/:id')
  changePhase(
    @Param('id') chantierId: string,
    @Body() body: { phase: number },
  ) {
    return this.workflowService.changePhase(chantierId, body.phase);
  }

  @Post('bulk-action')
  bulkAction(
    @Body() body: { chantierIds: string[]; action: string; payload?: unknown },
  ) {
    return this.workflowService.bulkAction(
      body.chantierIds,
      body.action,
      body.payload,
    );
  }
}
