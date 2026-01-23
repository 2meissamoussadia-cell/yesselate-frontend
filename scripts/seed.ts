import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const demands = [
  {
    id: 'REQ-2024-001',
    subject: 'Acquisition équipement informatique',
    bureau: 'ADM',
    type: 'Équipement',
    amount: '4 500 000',
    icon: '💻',
    priority: 'high' as const,
    status: 'pending' as const,
    requestedAt: new Date('2024-01-15'),
  },
  {
    id: 'REQ-2024-002',
    subject: 'Formation personnel technique',
    bureau: 'RH',
    type: 'Formation',
    amount: '2 800 000',
    icon: '📚',
    priority: 'normal' as const,
    status: 'pending' as const,
    requestedAt: new Date('2024-01-10'),
  },
  {
    id: 'REQ-2024-003',
    subject: 'Rénovation locaux administratifs',
    bureau: 'LOG',
    type: 'Travaux',
    amount: '15 000 000',
    icon: '🏢',
    priority: 'urgent' as const,
    status: 'pending' as const,
    requestedAt: new Date('2024-01-05'),
  },
  {
    id: 'REQ-2024-004',
    subject: 'Fournitures de bureau Q1',
    bureau: 'ADM',
    type: 'Fournitures',
    amount: '750 000',
    icon: '📋',
    priority: 'low' as const,
    status: 'validated' as const,
    requestedAt: new Date('2024-01-20'),
  },
  {
    id: 'REQ-2024-005',
    subject: 'Mission terrain zone nord',
    bureau: 'OPS',
    type: 'Mission',
    amount: '3 200 000',
    icon: '✈️',
    priority: 'high' as const,
    status: 'pending' as const,
    requestedAt: new Date('2024-01-08'),
  },
  {
    id: 'REQ-2024-006',
    subject: 'Maintenance serveurs',
    bureau: 'IT',
    type: 'Maintenance',
    amount: '1 200 000',
    icon: '⚙️',
    priority: 'urgent' as const,
    status: 'pending' as const,
    requestedAt: new Date('2024-01-03'),
  },
  {
    id: 'REQ-2024-007',
    subject: 'Consultation juridique',
    bureau: 'JUR',
    type: 'Service',
    amount: '5 000 000',
    icon: '⚖️',
    priority: 'normal' as const,
    status: 'rejected' as const,
    requestedAt: new Date('2024-01-18'),
  },
  {
    id: 'REQ-2024-008',
    subject: 'Audit financier externe',
    bureau: 'FIN',
    type: 'Audit',
    amount: '8 500 000',
    icon: '💼',
    priority: 'high' as const,
    status: 'validated' as const,
    requestedAt: new Date('2024-01-12'),
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Supprimer toutes les données existantes
  await prisma.demandEvent.deleteMany();
  await prisma.demand.deleteMany();

  // Créer les demandes avec leurs événements
  for (const demandData of demands) {
    const demand = await prisma.demand.create({
      data: {
        ...demandData,
        amount: typeof demandData.amount === 'string' 
          ? parseFloat(demandData.amount.replace(/\s/g, '')) 
          : demandData.amount,
        events: {
          create: [
            {
              actorId: 'USR-SEED',
              actorName: 'Script Seed',
              action: 'creation',
              details: 'Demande créée lors de l\'initialisation',
              at: demandData.requestedAt,
            },
            ...(demandData.status === 'validated'
              ? [
                  {
                    actorId: 'USR-001',
                    actorName: 'A. DIALLO',
                    action: 'validation',
                    details: 'Demande validée par le directeur général',
                    at: new Date(demandData.requestedAt.getTime() + 2 * 24 * 60 * 60 * 1000),
                  },
                ]
              : []),
            ...(demandData.status === 'rejected'
              ? [
                  {
                    actorId: 'USR-001',
                    actorName: 'A. DIALLO',
                    action: 'rejection',
                    details: 'Budget insuffisant pour cette période',
                    at: new Date(demandData.requestedAt.getTime() + 1 * 24 * 60 * 60 * 1000),
                  },
                ]
              : []),
          ],
        },
      },
    });

    console.log(`✅ Created demand: ${demand.id}`);
  }

  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

