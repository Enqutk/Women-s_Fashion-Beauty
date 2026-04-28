import ProductsCatalog from "../../ProductsCatalog";

type ProductsCategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    q?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
};

export default async function ProductsCategoryPage({
  params,
  searchParams,
}: ProductsCategoryPageProps) {
  const routeParams = await params;
  const query = searchParams ? await searchParams : undefined;

  return (
    <ProductsCatalog
      categorySlug={routeParams.slug}
      q={query?.q}
      minPrice={query?.minPrice}
      maxPrice={query?.maxPrice}
    />
  );
}
