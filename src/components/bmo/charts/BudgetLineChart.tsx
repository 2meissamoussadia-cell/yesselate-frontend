"use client";

/**
 * BudgetLineChart — Évolution du budget consommé (Nivo line chart).
 * À placer dans le panneau droit du Cockpit DG ou Engagements & Finances.
 */

import { ResponsiveLine } from "@nivo/line";

const data = [
  {
    id: "Budget consommé",
    data: [
      { x: "Jan", y: 12 },
      { x: "Fév", y: 24 },
      { x: "Mar", y: 36 },
      { x: "Avr", y: 48 },
      { x: "Mai", y: 60 },
      { x: "Juin", y: 72 },
    ],
  },
];

export function BudgetLineChart() {
  return (
    <div className="h-64 w-full">
      <ResponsiveLine
        data={data}
        margin={{ top: 20, right: 40, bottom: 40, left: 50 }}
        xScale={{ type: "point" }}
        yScale={{ type: "linear", stacked: false, min: 0, max: 100 }}
        curve="monotoneX"
        axisBottom={{
          legend: "Mois",
          legendOffset: 32,
          legendPosition: "middle",
        }}
        axisLeft={{
          legend: "% du budget",
          legendOffset: -40,
          legendPosition: "middle",
        }}
        colors={["#22c55e"]}
        pointSize={6}
        pointColor={{ theme: "background" }}
        pointBorderWidth={2}
        pointBorderColor="#22c55e"
        useMesh
        theme={{
          text: { fill: "#e5e7eb" },
          axis: { ticks: { text: { fill: "#9ca3af" } } },
          grid: { line: { stroke: "#1f2933", strokeWidth: 1 } },
        }}
      />
    </div>
  );
}
