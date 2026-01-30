"use client";

/**
 * Factures — Liste des factures avec MUI DataGrid + filtres (portail maître-ouvrage).
 */

import { useState } from "react";
import { DataGrid, type GridColDef, type GridFilterModel } from "@mui/x-data-grid";
import TextField from "@mui/material/TextField";
import { PageTemplate } from "@/components/navigation/PageTemplate";
import { MUIDarkProvider } from "@/components/bmo/mui/MUIDarkProvider";

const rows = [
  { id: 1, numero: "FAC-001", chantier: "Chantier A", montant: 1200000, statut: "En attente" },
  { id: 2, numero: "FAC-002", chantier: "Chantier B", montant: 800000, statut: "Payée" },
  { id: 3, numero: "FAC-003", chantier: "Chantier C", montant: 2500000, statut: "En attente" },
];

const columns: GridColDef[] = [
  { field: "numero", headerName: "N° facture", flex: 1 },
  { field: "chantier", headerName: "Chantier", flex: 1 },
  { field: "montant", headerName: "Montant", type: "number", flex: 1 },
  { field: "statut", headerName: "Statut", flex: 1 },
];

export default function FacturesPage() {
  const [filterText, setFilterText] = useState("");
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
    quickFilterValues: [],
  });

  const handleFilterChange = (value: string) => {
    setFilterText(value);
    setFilterModel((prev) => ({
      ...prev,
      quickFilterValues: value ? [value] : [],
    }));
  };

  return (
    <PageTemplate
      title="Factures"
      description="Factures en attente de validation ou de paiement."
    >
      <MUIDarkProvider>
        <div className="space-y-4">
          <div className="flex gap-2 items-center flex-wrap">
            <TextField
              size="small"
              label="Filtrer les factures"
              value={filterText}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="min-w-[200px]"
            />
          </div>
          <div style={{ height: 520, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              filterModel={filterModel}
              onFilterModelChange={(m) => setFilterModel(m)}
              disableColumnMenu
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
            />
          </div>
        </div>
      </MUIDarkProvider>
    </PageTemplate>
  );
}
