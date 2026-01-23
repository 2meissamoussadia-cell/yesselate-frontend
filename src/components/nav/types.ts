// components/nav/types.ts
import type { LucideIcon } from "lucide-react";

export type NavBadge =
  | number
  | { value: number; tone?: "default" | "warning" | "critical" };

export type NavItem = {
  id: string;
  label: string;
  href: string;
  badge?: NavBadge;
};

export type NavSection = {
  id: string;
  label: string;
  items: NavItem[];
  defaultOpen?: boolean;
};

export type NavGroup = {
  id: string;
  label: string;
  icon?: LucideIcon;
  sections: NavSection[];
  defaultOpen?: boolean;
};

export type NavTree = {
  title?: string; // ex "Analytics BTP"
  groups: NavGroup[];
};



