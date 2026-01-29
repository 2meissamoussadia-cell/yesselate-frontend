/**
 * Custom 3D props and types for Three.js / R3F components
 */

export interface HealthReactor3DProps {
  operations: number;
  finance: number;
  workflow: number;
  criticalAlerts: number;
  onSphereClick?: (domain: string) => void;
}

export interface LiveChantier3DProps {
  chantierId: string;
  gpsLive: boolean;
  avancement: number;
  materialsStatus: 'OK' | 'WARNING' | 'CRITICAL';
  bureauControle: string;
  onActionClick?: (action: string) => void;
}

export interface SceneCameraConfig {
  position: [number, number, number];
  fov?: number;
}
