import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChantierDto } from './dto/create-chantier.dto';
import { UpdateChantierDto } from './dto/update-chantier.dto';
import { FilterChantiersDto } from './dto/filter-chantiers.dto';
import { ChantierStatut } from '@prisma/client';

@Injectable()
export class ChantiersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateChantierDto) {
    const data = {
      clientId: dto.clientId,
      nom: dto.nom,
      description: dto.description,
      budget: dto.budget,
      margePct: dto.margePct,
      segment: dto.segment,
      phase: dto.phase ?? 1,
      etape: dto.etape ?? 1,
      statut: ChantierStatut.ACTIF,
      gpsLat: dto.gpsLat,
      gpsLng: dto.gpsLng,
      dateDebut: dto.dateDebut ? new Date(dto.dateDebut) : null,
      dateFinPrevue: dto.dateFinPrevue ? new Date(dto.dateFinPrevue) : null,
    };
    return this.prisma.chantier.create({
      data,
      include: { client: true },
    });
  }

  async findAll(filters: FilterChantiersDto) {
    const where: Record<string, unknown> = {};
    if (filters.segment?.length) {
      where.segment = { in: filters.segment };
    }
    if (filters.phase?.length) {
      where.phase = { in: filters.phase };
    }
    if (filters.statut?.length) {
      where.statut = { in: filters.statut };
    }
    const take = filters.take ?? 20;
    const skip = filters.skip ?? 0;
    const [items, total] = await Promise.all([
      this.prisma.chantier.findMany({
        where,
        take,
        skip,
        orderBy: { updatedAt: 'desc' },
        include: { client: { select: { nom: true, email: true } } },
      }),
      this.prisma.chantier.count({ where }),
    ]);
    return { items, total };
  }

  async findOne(id: string) {
    const chantier = await this.prisma.chantier.findUnique({
      where: { id },
      include: {
        client: true,
        workflowStates: { orderBy: { createdAt: 'desc' }, take: 5 },
        jalons: true,
      },
    });
    if (!chantier) throw new NotFoundException('Chantier introuvable');
    return chantier;
  }

  async findLive(id: string) {
    const chantier = await this.findOne(id);
    const [alertes, paiementsRecents] = await Promise.all([
      this.prisma.alerte.findMany({
        where: { chantierId: id, resolved: false },
        take: 10,
      }),
      this.prisma.paiement.findMany({
        where: { chantierId: id },
        orderBy: { date: 'desc' },
        take: 5,
      }),
    ]);
    return { ...chantier, alertes, paiementsRecents };
  }

  async update(id: string, dto: UpdateChantierDto) {
    await this.findOne(id);
    const data: Record<string, unknown> = { ...dto };
    if ('dateDebut' in dto && dto.dateDebut) data.dateDebut = new Date(dto.dateDebut as string);
    if ('dateFinPrevue' in dto && dto.dateFinPrevue) data.dateFinPrevue = new Date(dto.dateFinPrevue as string);
    return this.prisma.chantier.update({
      where: { id },
      data,
      include: { client: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.chantier.update({
      where: { id },
      data: { statut: ChantierStatut.ARCHIVE },
    });
  }
}
