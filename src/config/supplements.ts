import { Zap, Coffee, Droplet, LucideIcon } from 'lucide-react';

export interface SupplementConfig {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const SUPPLEMENTS: SupplementConfig[] = [
  { id: 'creatine', label: 'Creatina', icon: Zap },
  { id: 'preworkout', label: 'Preworkout', icon: Coffee },
  { id: 'electrolytes', label: 'Elettroliti', icon: Droplet },
];

export type SupplementIntake = Record<string, boolean>;
