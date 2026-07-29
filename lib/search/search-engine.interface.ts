export interface SearchQueryOptions {
  query: string;
  categoryId?: string;
  subCategoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

export interface ISearchEngine {
  indexDocument(document: Record<string, any>): Promise<boolean>;
  removeDocument(documentId: string): Promise<boolean>;
  search(options: SearchQueryOptions): Promise<{
    hits: any[];
    total: number;
  }>;
}

export class PostgresSearchEngine implements ISearchEngine {
  public async indexDocument(document: Record<string, any>): Promise<boolean> {
    return true;
  }

  public async removeDocument(documentId: string): Promise<boolean> {
    return true;
  }

  public async search(options: SearchQueryOptions) {
    return {
      hits: [],
      total: 0,
    };
  }
}
