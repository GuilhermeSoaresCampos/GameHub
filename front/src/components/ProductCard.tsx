import type { ProductDTO } from "@/dto/ProductDTO";
import { formatCurrency } from "@/utils/formatCurrency";

interface ProductCardProps {
  product: ProductDTO;
  onDelete?: (id: number) => void;
  onEdit?: (product: ProductDTO) => void;
}

export function ProductCard({ product, onDelete, onEdit }: ProductCardProps) {
  return (
    <article className="product-card">
      <div className="product-card__top">
        <span className="category-pill">{product.category}</span>
        <span className={product.stock < 5 ? "stock stock--low" : "stock"}>
          Estoque: {product.stock}
        </span>
      </div>
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <div className="product-card__bottom">
        <strong>{formatCurrency(product.price)}</strong>
        {onEdit && (
          <button className="button" onClick={() => onEdit(product)}>
            Editar
          </button>
        )}
        {onDelete && (
          <button className="button button--danger" onClick={() => onDelete(product.id)}>
            Excluir
          </button>
        )}
      </div>
    </article>
  );
}
