import { siteConfig } from "@/config/site";

export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.url}`,
    })),
  };
}

export function generateCategoryJsonLd(category: {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.description || siteConfig.description,
    url: `${siteConfig.url}/${category.slug}`,
    image: category.imageUrl || siteConfig.ogImage,
  };
}
