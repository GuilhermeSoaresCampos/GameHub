"use client";

import { useEffect, useMemo, useState } from "react";
import { MetricCard } from "@/components/MetricCard";
import { apiRequest } from "@/fetch/api";

interface DashboardProductAlert {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
}

interface DashboardDTO {
  totalProducts: number;
  lowStock: number;
  inventoryValue: number;
  categories: number;
  lowStockProducts: DashboardProductAlert[];
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

      {data.lowStockProducts.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <h2>Estoque crítico</h2>
          <ul style={{ marginTop: "0.75rem", paddingLeft: "1.25rem" }}>
            {data.lowStockProducts.map((product) => (
              <li key={product.id} style={{ marginBottom: "0.5rem" }}>
                <strong>{product.name}</strong> · {product.category} · {product.stock} un. · {product.price.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL"
                })}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
