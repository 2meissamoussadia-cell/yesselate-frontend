/** Stub endpoint - à implémenter selon l'API réelle */
export interface Chantier {
  id: string;
  nom: string;
  [key: string]: unknown;
}
export interface ChantiersListResponse {
  data: Chantier[];
  total: number;
}
export interface FilterChantiersParams {
  [key: string]: unknown;
}
export const chantiers = {
  list: async (_params?: FilterChantiersParams): Promise<ChantiersListResponse> =>
    ({ data: [], total: 0 }),
};
export const endpoints = {
  chantiers: { list: chantiers.list },
  projects: { list: async () => ({ data: [], total: 0 }) },
  devis: { list: async () => ({ data: [], total: 0 }) },
  users: { list: async () => ({ data: [], total: 0 }) },
  payments: { list: async () => ({ data: [], total: 0 }) },
};
export type EcosystemNode = { id: string; label?: string; [key: string]: unknown };
export type EcosystemLink = { source: string; target: string; [key: string]: unknown };
