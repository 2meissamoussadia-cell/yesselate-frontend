/**
 * Storybook stories pour DemandView
 */

import type { Meta, StoryObj } from '@storybook/react';
import { DemandView } from './DemandView';
import { useWorkspaceStore } from '@/lib/stores/workspaceStore';
import type { WorkspaceTab } from '@/lib/stores/workspaceStore';

const meta: Meta<typeof DemandView> = {
  title: 'Features/Demandes/DemandView',
  component: DemandView,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DemandView>;

// Mock workspace tab
const createMockTab = (demandId: string): WorkspaceTab => ({
  id: `tab-${demandId}`,
  type: 'demand',
  label: `Demande ${demandId}`,
  data: { demandId },
  createdAt: new Date(),
});

export const WithBudgetWarning: Story = {
  render: () => {
    const tab = createMockTab('DEM-001');
    useWorkspaceStore.getState().openTab(tab);
    return <DemandView tab={tab} />;
  },
  parameters: {
    mockData: {
      demande: {
        id: 'DEM-001',
        subject: 'Demande avec budget en alerte',
        amount: 90000,
        budget: {
          available: 100000,
          consumed: 0,
          allocated: 0
        }
      }
    }
  }
};

export const WithHighRisk: Story = {
  render: () => {
    const tab = createMockTab('DEM-002');
    useWorkspaceStore.getState().openTab(tab);
    return <DemandView tab={tab} />;
  },
  parameters: {
    mockData: {
      demande: {
        id: 'DEM-002',
        subject: 'Demande avec risque élevé',
        amount: 6000000, // > 5M
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 jours
      }
    }
  }
};

export const WithValidationErrors: Story = {
  render: () => {
    const tab = createMockTab('DEM-003');
    useWorkspaceStore.getState().openTab(tab);
    return <DemandView tab={tab} />;
  },
  parameters: {
    mockData: {
      demande: {
        id: 'DEM-003',
        subject: 'Short', // Titre trop court
        amount: -1000, // Montant invalide
        bureau: 'INVALID'
      }
    }
  }
};

export const WithAutoApprove: Story = {
  render: () => {
    const tab = createMockTab('DEM-004');
    useWorkspaceStore.getState().openTab(tab);
    return <DemandView tab={tab} />;
  },
  parameters: {
    mockData: {
      demande: {
        id: 'DEM-004',
        subject: 'Demande auto-approuvable',
        amount: 400000, // < 500K
        priority: 'normal'
      }
    }
  }
};

export const WithCriticalBudget: Story = {
  render: () => {
    const tab = createMockTab('DEM-005');
    useWorkspaceStore.getState().openTab(tab);
    return <DemandView tab={tab} />;
  },
  parameters: {
    mockData: {
      demande: {
        id: 'DEM-005',
        subject: 'Demande avec budget critique',
        amount: 50000,
        budget: {
          available: 100000,
          consumed: 95000,
          allocated: 0
        }
      }
    }
  }
};

export const WithOverdueDeadline: Story = {
  render: () => {
    const tab = createMockTab('DEM-006');
    useWorkspaceStore.getState().openTab(tab);
    return <DemandView tab={tab} />;
  },
  parameters: {
    mockData: {
      demande: {
        id: 'DEM-006',
        subject: 'Demande en retard',
        amount: 100000,
        deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 jours en retard
      }
    }
  }
};

