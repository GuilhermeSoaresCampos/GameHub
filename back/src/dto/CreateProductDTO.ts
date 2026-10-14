import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(3).max(500),
  category: z.enum(["Consoles", "Jogos", "Acessórios"]),
  price: z.number().positive(),
  stock: z.number().int().min(0)
});

export const updateProductSchema = createProductSchema;

export type CreateProductDTO = z.infer<typeof createProductSchema>;
export type UpdateProductDTO = z.infer<typeof updateProductSchema>;
