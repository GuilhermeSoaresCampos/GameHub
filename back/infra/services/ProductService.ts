import { ProductRepository, type ProductFilters } from "../repositories/ProductRepository";
import type { CreateProductDTO } from "../../src/dto/CreateProductDTO";

export class ProductService {
  constructor(private readonly repository = new ProductRepository()) {}

  list(filters: ProductFilters) {
    return this.repository.findAll(filters);
  }

  create(input: CreateProductDTO) {
    return this.repository.create(input);
  }

  async update(id: number, input: CreateProductDTO) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Identificador de produto inválido.");
    }

    return this.repository.update(id, input);
  }

  async remove(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Identificador de produto inválido.");
    }

    await this.repository.delete(id);
  }

  dashboard() {
    return this.repository.getDashboard();
  }
}
