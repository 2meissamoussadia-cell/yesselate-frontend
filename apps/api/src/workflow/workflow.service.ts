import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkflowGateway } from './workflow.gateway';

@Injectable()
export class WorkflowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: WorkflowGateway,
  ) {}

  async getPhasesWithStats() {
    const chantiers = await this.prisma.chantier.findMany({
      where: { statut: 'ACTIF' },
      select: { phase: true, id: true },
    });
    const byPhase = new Map<number, string[]>();
    for (let p = 1; p <= 6; p++) {
      byPhase.set(p, []);
    }
    for (const c of chantiers) {
      const list = byPhase.get(c.phase) ?? [];
      list.push(c.id);
      byPhase.set(c.phase, list);
    }
    return Array.from(byPhase.entries()).map(([phase, chantierIds]) => ({
      phase,
      nom: `Phase ${phase}`,
      nbChantiers: chantierIds.length,
      chantierIds,
    }));
  }

  async changePhase(chantierId: string, newPhase: number) {
    if (newPhase < 1 || newPhase > 6) {
      throw new Error('Phase invalide (1-6)');
    }
    const chantier = await this.prisma.chantier.findUnique({
      where: { id: chantierId },
    });
    if (!chantier) throw new NotFoundException('Chantier introuvable');
    const updated = await this.prisma.chantier.update({
      where: { id: chantierId },
      data: { phase: newPhase },
      include: { client: true },
    });
    this.gateway.broadcastPhaseChange(chantierId, newPhase);
    return updated;
  }

  async bulkAction(chantierIds: string[], action: string, payload?: unknown) {
    // Actions groupées : relancer, valider jalons, etc.
    const results = { processed: 0, errors: [] as string[] };
    for (const id of chantierIds) {
      try {
        if (action === 'change_phase' && typeof payload === 'object' && payload !== null && 'phase' in payload) {
          await this.changePhase(id, Number((payload as { phase: number }).phase));
          results.processed++;
        }
      } catch (e) {
        results.errors.push(`${id}: ${(e as Error).message}`);
      }
    }
    return results;
  }
}
