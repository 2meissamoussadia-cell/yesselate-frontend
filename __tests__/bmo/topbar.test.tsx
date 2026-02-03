/**
 * Tests automatiques pour la topbar BMO
 * Vérifie : présence des éléments, menus Fichier/Paramétrage/Réglage, recherche, fil d'Ariane.
 */

import React from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BmoTopbar } from '@/components/bmo/navigation/BmoTopbar';

const mockPush = jest.fn();
const mockToggleCommandPalette = jest.fn();
const mockToggleSidebar = jest.fn();
const mockSetFontSizeScale = jest.fn();
const mockSetLocaleOverride = jest.fn();
const mockSetDarkMode = jest.fn();

const mockUsePathname = jest.fn(() => '/maitre-ouvrage/dashboard');
jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/lib/stores/app-store', () => ({
  useAppStore: () => ({
    darkMode: true,
    setDarkMode: mockSetDarkMode,
    localeOverride: 'fr-FR',
    setLocaleOverride: mockSetLocaleOverride,
    fontSizeScale: 'medium',
    setFontSizeScale: mockSetFontSizeScale,
  }),
}));

jest.mock('@/lib/stores/dashboardCommandCenterStore', () => ({
  useDashboardCommandCenterStore: (selector: (s: unknown) => unknown) => {
    const state = {
      navigation: { mainCategory: 'pilotage', subCategory: 'dashboard', subSubCategory: 'default' },
      goBack: jest.fn(),
      goForward: jest.fn(),
      navigate: jest.fn(),
      navigationHistory: [],
      forwardHistory: [],
      toggleSidebar: mockToggleSidebar,
    };
    return typeof selector === 'function' ? selector(state) : state;
  },
}));

jest.mock('@/modules/dashboard/navigation/dashboardNavigationConfig', () => ({
  dashboardNavigationConfig: {
    pilotage: {
      label: 'PILOTAGE',
      children: [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'alertes', label: "Centre d'alertes" },
        { id: 'gouvernance', label: 'Gouvernance & décisions' },
      ],
    },
  },
}));

describe('BMO Topbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/maitre-ouvrage/dashboard');
  });

  it('affiche la topbar avec data-testid bmo-topbar', () => {
    render(
      <BmoTopbar
        onMenuClick={jest.fn()}
        onSearchClick={mockToggleCommandPalette}
        onNotificationsClick={jest.fn()}
      />
    );
    expect(screen.getByTestId('bmo-topbar')).toBeInTheDocument();
    expect(screen.getByTestId('bmo-topbar')).toHaveAttribute('role', 'banner');
  });

  it('affiche le fil d\'Ariane avec topbar-breadcrumb', () => {
    render(
      <BmoTopbar
        onMenuClick={jest.fn()}
        onSearchClick={jest.fn()}
        onNotificationsClick={jest.fn()}
      />
    );
    expect(screen.getByTestId('topbar-breadcrumb')).toBeInTheDocument();
    expect(screen.getByTestId('topbar-breadcrumb')).toHaveTextContent('PILOTAGE');
  });

  it('menu trois points : ouverture et contenu Fichier (Nouvelle demande, Exporter)', async () => {
    const user = userEvent.setup();
    render(
      <BmoTopbar
        onMenuClick={jest.fn()}
        onSearchClick={jest.fn()}
        onNotificationsClick={jest.fn()}
      />
    );
    await user.click(screen.getByTestId('topbar-menu-more'));
    await user.click(screen.getByText('Fichier'));
    await waitFor(() => expect(screen.getByText('Nouvelle demande')).toBeInTheDocument());
    const menu = screen.getByRole('menu');
    expect(within(menu).getByText('Nouvelle demande')).toBeInTheDocument();
    expect(within(menu).getByRole('menuitem', { name: 'Exporter (PDF)' })).toBeInTheDocument();
  });

  it('menu trois points : contient Paramétrage (Langue, Français, Mon profil)', async () => {
    const user = userEvent.setup();
    render(
      <BmoTopbar
        onMenuClick={jest.fn()}
        onSearchClick={jest.fn()}
        onNotificationsClick={jest.fn()}
      />
    );
    await user.click(screen.getByTestId('topbar-menu-more'));
    await user.click(screen.getByText('Paramétrage'));
    await waitFor(() => expect(screen.getByText('Français')).toBeInTheDocument());
    const menu = screen.getByRole('menu');
    expect(within(menu).getByText(/Langue/)).toBeInTheDocument();
    expect(within(menu).getByText('Mon profil')).toBeInTheDocument();
  });

  it('menu trois points : contient Réglage (Taille du texte, Réduire, Normal, Augmenter)', async () => {
    const user = userEvent.setup();
    render(
      <BmoTopbar
        onMenuClick={jest.fn()}
        onSearchClick={jest.fn()}
        onNotificationsClick={jest.fn()}
      />
    );
    await user.click(screen.getByTestId('topbar-menu-more'));
    await user.click(screen.getByText('Réglage'));
    await waitFor(() => expect(screen.getByText(/Taille du texte/)).toBeInTheDocument());
    const menu = screen.getByRole('menu');
    expect(within(menu).getByText('Réduire')).toBeInTheDocument();
    expect(within(menu).getByText('Normal')).toBeInTheDocument();
    expect(within(menu).getByText('Augmenter')).toBeInTheDocument();
  });

  it('clic sur Augmenter dans le menu trois points appelle setFontSizeScale', async () => {
    const user = userEvent.setup();
    render(
      <BmoTopbar
        onMenuClick={jest.fn()}
        onSearchClick={jest.fn()}
        onNotificationsClick={jest.fn()}
      />
    );
    await user.click(screen.getByTestId('topbar-menu-more'));
    await user.click(screen.getByText('Réglage'));
    await waitFor(() => expect(screen.getByText('Augmenter')).toBeInTheDocument());
    const augmenter = screen.getByRole('menuitem', { name: 'Augmenter' });
    await user.click(augmenter);
    expect(mockSetFontSizeScale).toHaveBeenCalledWith('large');
  });

  it('bouton recherche appelle onSearchClick au clic', async () => {
    mockUsePathname.mockReturnValue('/maitre-ouvrage/demandes');
    const user = userEvent.setup();
    render(
      <BmoTopbar
        onMenuClick={jest.fn()}
        onSearchClick={mockToggleCommandPalette}
        onNotificationsClick={jest.fn()}
      />
    );
    const searchBtn = screen.getByTestId('topbar-search');
    await user.click(searchBtn);
    expect(mockToggleCommandPalette).toHaveBeenCalled();
  });
});
