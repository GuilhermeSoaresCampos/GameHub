import { db } from "../database/db";
import type { CreateProductDTO } from "../../src/dto/CreateProductDTO";
import type { Product } from "../../src/model/Product";

export interface ProductFilters {
  search?: string;
  category?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}

function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: Number(row.id),
    name: String(row.name),
    description: String(row.description),
    category: String(row.category),
    price: Number(row.price),
    stock: Number(row.stock)
  };
}

export class ProductRepository {
  async findAll(filters: ProductFilters): Promise<Product[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    const normalizedSearch = filters.search?.trim();
    const normalizedCategory = filters.category?.trim();
    const limit = Number.isFinite(filters.limit) && Number(filters.limit) > 0 ? Math.min(Number(filters.limit), 200) : 50;
    const offset = Number.isFinite(filters.offset) && Number(filters.offset) >= 0 ? Number(filters.offset) : 0;

    if (normalizedSearch) {
      values.push(`%${normalizedSearch}%`);
      const parameter = `$${values.length}`;
      conditions.push(`(LOWER(name) ILIKE LOWER(${parameter}) OR LOWER(description) ILIKE LOWER(${parameter}))`);
    }

    if (normalizedCategory) {
      values.push(normalizedCategory);
      conditions.push(`category ILIKE $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const orderBy = filters.sort === "price" ? "price ASC" : "name ASC";
    const limitIndex = values.length + 1;
    const offsetIndex = values.length + 2;
    values.push(limit, offset);

    const sql = `SELECT id, name, description, category, price, stock FROM products ${where} ORDER BY ${orderBy} LIMIT $${limitIndex} OFFSET $${offsetIndex}`;
    const startedAt = performance.now();
    const result = await db.query(sql, values);
    console.info(
      `[SQL] listagem retornada: ${result.rowCount ?? 0} linhas em ${(performance.now() - startedAt).toFixed(2)} ms`
    );
    return result.rows.map(mapProduct);
  }

  async create(input: CreateProductDTO): Promise<Product> {
    const result = await db.query(
      `INSERT INTO products (name, description, category, price, stock)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, description, category, price, stock`,
      [input.name, input.description, input.category, input.price, input.stock]
    );
    return mapProduct(result.rows[0]);
  }

  async update(id: number, input: CreateProductDTO): Promise<Product> {
    const result = await db.query(
      `UPDATE products
       SET name = $1, description = $2, category = $3, price = $4, stock = $5
       WHERE id = $6
       RETURNING id, name, description, category, price, stock`,
      [input.name, input.description, input.category, input.price, input.stock, id]
    );

    if (!result.rows[0]) {
      throw new Error("Produto não encontrado.");
    }

    return mapProduct(result.rows[0]);
  }

  async delete(id: number): Promise<void> {
    await db.query("DELETE FROM products WHERE id = $1", [id]);
  }

  async getDashboard() {
    const dashboardStartedAt = performance.now();
    const result = await db.query(`
      SELECT
        COUNT(*) AS total_products,
        COUNT(*) FILTER (WHERE stock <= 5) AS low_stock,
        COALESCE(SUM(price * stock), 0) AS inventory_value,
        COUNT(DISTINCT category) AS categories,
        COALESCE(
          (
            SELECT json_agg(product_row)
            FROM (
              SELECT id, name, category, price, stock
              FROM products
              WHERE stock <= 5
              ORDER BY stock ASC, price ASC
              LIMIT 5
            ) AS product_row
          ),
          '[]'::json
        ) AS low_stock_products
      FROM products
    `);
    const row = result.rows[0];
    console.info(`[SQL] dashboard: 1 consulta em ${(performance.now() - dashboardStartedAt).toFixed(2)} ms`);

    const lowStockProducts = Array.isArray(row.low_stock_products)
      ? row.low_stock_products.map((product: Record<string, unknown>) => ({
          id: Number(product.id),
          name: String(product.name),
          category: String(product.category),
          price: Number(product.price),
          stock: Number(product.stock)
        }))
      : [];

    return {
      totalProducts: Number(row.total_products),
      lowStock: Number(row.low_stock),
      inventoryValue: Number(row.inventory_value),
      categories: Number(row.categories),
      lowStockProducts
    };
  }
}
