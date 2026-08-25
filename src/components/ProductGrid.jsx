import React from 'react';
import ProductCard from './ProductCard';
import LoadingSkeleton from './LoadingSkeleton';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';

export default function ProductGrid({
  products = [],
  isLoading = false,
  error = null,
  onRetry,
  onClearFilters,
}) {
  if (isLoading) {
    return <LoadingSkeleton count={8} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="No Products Match Your Criteria"
        description="Try adjusting your keyword search, selecting a different category, or resetting the price filter."
        actionText="Clear All Filters"
        onAction={onClearFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
