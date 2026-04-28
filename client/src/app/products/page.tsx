import ProductsCatalog from "./ProductsCatalog";

type ProductsPageProps = {
  searchParams?: Promise<{
    category?: string;
    q?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  return (
    <ProductsCatalog
      categorySlug={null}
      q={params?.q}
      minPrice={params?.minPrice}
      maxPrice={params?.maxPrice}
    />
  );
}
