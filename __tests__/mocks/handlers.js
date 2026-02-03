/**
 * MSW handlers — Mock API pour tests
 */

const { http, HttpResponse } = require('msw');

const handlers = [
  http.get('/api/alertes', () => {
    return HttpResponse.json({
      data: [
        {
          id: '1',
          numero: 'A-2024-0001',
          titre: 'Retard livraison béton',
          niveau: 'critique',
          statut: 'non-traite',
          chantier: { id: 'vdp2', nom: 'Villa Dakar Phase 2', code: 'VDP2-2024' },
        },
      ],
      total: 1,
    });
  }),

  http.post('/api/alertes', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      { id: crypto.randomUUID(), ...body },
      { status: 201 }
    );
  }),

  http.patch('/api/alertes/:id', async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: params.id, ...body });
  }),

  http.delete('/api/alertes/:id', ({ params }) => {
    return HttpResponse.json({ success: true });
  }),

  http.get('/api/chantiers', () => {
    return HttpResponse.json({
      data: [
        {
          id: 'vdp2',
          nom: 'Villa Dakar Phase 2',
          code: 'VDP2-2024',
          statut: 'en-cours',
        },
      ],
    });
  }),

  http.get('/api/users', () => {
    return HttpResponse.json({
      data: [
        { id: 'user1', nom: 'A. DIALLO', role: 'Directeur Général' },
      ],
    });
  }),
];

module.exports = { handlers };
