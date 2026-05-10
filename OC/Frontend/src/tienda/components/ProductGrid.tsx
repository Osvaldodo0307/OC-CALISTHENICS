import type { Product } from '../types/store'
import ProductCard from './ProductCard'

interface Props {
  products: Product[]
  onQuickView?: (product: Product) => void
  /** Cantidad de columnas máxima en desktop. Default 4. */
  maxCols?: 3 | 4 | 5
}

export default function ProductGrid({ products, onQuickView, maxCols = 4 }: Props) {
  const colsClass =
    maxCols === 5
      ? 'lg:grid-cols-4 xl:grid-cols-5'
      : maxCols === 3
        ? 'lg:grid-cols-3'
        : 'lg:grid-cols-3 xl:grid-cols-4'

  return (
    <div className={`grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-5 ${colsClass}`}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onQuickView={onQuickView} />
      ))}
    </div>
  )
}
