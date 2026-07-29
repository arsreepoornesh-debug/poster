export * from "./auth";
export * from "./custom-poster";
export * from "./payment";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DynamicBreadcrumbItem {
  label: string;
  href: string;
}

export interface DynamicRouteResolution {
  type: "category" | "subcategory" | "collection" | "not_found";
  categorySlug: string;
  subcategorySlug?: string;
  collectionSlug?: string;
  categoryName?: string;
  subcategoryName?: string;
  collectionName?: string;
  entityId?: string;
}
