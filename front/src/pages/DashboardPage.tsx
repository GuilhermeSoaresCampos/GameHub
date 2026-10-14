"use client";

import { useEffect, useMemo, useState } from "react";
import { MetricCard } from "@/components/MetricCard";
import { apiRequest } from "@/fetch/api";

interface DashboardDTO {
  totalProducts: number;
  lowStock: number;
  inventoryValue: number;
  categories: number;
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardDTO | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    apiRequest<DashboardDTO>("/dashboard", { signal: controller.signal })
      .then((dashboardData) => {
        if (!controller.signal.aborted) {
          setData(dashboardData);
        }
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") {
          return;
        }

        setError(requestError instanceof Error ? requestError.message : "Erro ao carregar dashboard.");
      });

    return () => controller.abort();
  }, []);

  const metrics = useMemo(() => {
    if (!data) {
      return [] as Array<{ label: string; value: string; description: string }>;
    }

    return [
      { label: "Produtos", value: String(data.totalProducts), description: "Itens cadastrados" },
      { label: "Estoque baixo", value: String(data.lowStock), description: "Cinco unidades ou menos" },
      { label: "Categorias", value: String(data.categories), description: "Categorias disponíveis" },
      {
        label: "Valor em estoque",
        value: data.inventoryValue.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL"
        }),
        description: "Preço × quantidade"
      }
    ];
  }, [data]);

  if (error) return <p className="form-error">{error}</p>;
  if (!data) return <p className="state-message">Carregando indicadores...</p>;

  return (
    <section>
      <span className="eyebrow">VISÃO GERAL</span>
      <h1>Dashboard</h1>
      <p className="section-intro">Indicadores atuais do catálogo GameHub.</p>
      <div className="metrics-grid">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            description={metric.description}
          />
        ))}
      </div>
    </section>
  );
}
