import React from "react";
import { PosterRepository } from "@/lib/repositories/poster.repository";
import { CategoryRepository } from "@/lib/repositories/category.repository";
import { ProductCard } from "@/components/storefront/product-card";
import { Search, Filter, RefreshCw } from "lucide-react";
import Link from "next/link";

export default async function SearchCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const categoryId = params.category || undefined;
  const page = parseInt(params.page || "1");

  const [postersResult, categoriesResult] = await Promise.all([
    PosterRepository.findAll({
      search: query,
      categoryId,
      page,
      limit: 12,
      sortBy: params.sort === "price_asc" ? "basePrice" : "createdAt",
      sortOrder: params.sort === "price_asc" ? "asc" : "desc",
    }),
    CategoryRepository.findAll({ limit: 100 }),
  ]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header & Search Bar */}
      <div className="space-y-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Search Poster Catalog</h1>

        <form method="GET" action="/search" className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search posters by title, tags, or themes..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-card border border-border focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/20"
          >
            Search
          </button>
        </form>
      </div>

      {/* Main Filter & Results Layout */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filter Sidebar */}
        <aside className="w-full md:w-64 space-y-6 flex-shrink-0">
          <div className="glass-card p-5 rounded-2xl border border-border bg-card space-y-4 text-xs">
            <div className="font-bold flex items-center justify-between border-b border-border pb-3">
              <span className="flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-brand-600" />
                <span>Catalog Filters</span>
              </span>
              <Link href="/search" className="text-[11px] text-brand-600 hover:underline">Reset</Link>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <label className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider block">
                Categories
              </label>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                <Link
                  href="/search"
                  className={`block px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    !categoryId ? "bg-brand-600 text-white" : "hover:bg-muted"
                  }`}
                >
                  All Categories
                </Link>
                {categoriesResult.items.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/search?category=${cat.id}${query ? `&q=${query}` : ""}`}
                    className={`block px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      categoryId === cat.id ? "bg-brand-600 text-white" : "hover:bg-muted"
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Results Grid */}
        <main className="flex-1 space-y-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing <strong className="text-foreground">{postersResult.items.length}</strong> of{" "}
              <strong className="text-foreground">{postersResult.total}</strong> posters
            </span>
          </div>

          {postersResult.items.length === 0 ? (
            <div className="glass-card p-12 rounded-2xl border border-border bg-card text-center space-y-3">
              <h3 className="text-base font-bold">No Posters Match Your Search</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Try searching for another keyword or browse top categories from the home page.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {postersResult.items.map((poster) => (
                <ProductCard key={poster.id} poster={poster} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
