// components/nav/nav.analytics-btp.ts
import { DollarSign, Building2 } from "lucide-react";
import type { NavTree } from "./types";

export const navAnalyticsBTP: NavTree = {
  title: "Analytics BTP",
  groups: [
    {
      id: "chantiers",
      label: "Gestion de Chantiers",
      icon: Building2,
      sections: [
        {
          id: "suivi",
          label: "Suivi de Chantiers",
          items: [
            { id: "tdb", label: "Tableau de bord chantiers", href: "/maitre-ouvrage/analytics?cat=chantiers&sub=tdb" },
          ],
        },
      ],
    },
    {
      id: "finance",
      label: "Gestion Financière",
      icon: DollarSign,
      defaultOpen: true,
      sections: [
        {
          id: "budget",
          label: "Analyse Budgétaire",
          defaultOpen: true,
          items: [
            { id: "prevreal", label: "Budgets prévisionnels vs réalisés", href: "/maitre-ouvrage/analytics?cat=finance&sub=prevreal" },
            { id: "ecarts", label: "Analyse des écarts budgétaires", href: "/maitre-ouvrage/analytics?cat=finance&sub=ecarts" },
            { id: "revisions", label: "Révisions budgétaires", href: "/maitre-ouvrage/analytics?cat=finance&sub=revisions" },
          ],
        },
        {
          id: "couts",
          label: "Analyse des Coûts",
          defaultOpen: true,
          items: [
            { id: "directindirect", label: "Coûts directs vs indirects", href: "/maitre-ouvrage/analytics?cat=finance&sub=directindirect" },
            { id: "revient", label: "Analyse des coûts de revient", href: "/maitre-ouvrage/analytics?cat=finance&sub=revient" },
          ],
        },
      ],
    },
  ],
};



