export interface IAISearchProvider {
  semanticSearch(query: string, limit?: number): Promise<any[]>;
}

export interface IAITagGeneratorProvider {
  generateTagsFromImage(imageUrl: string): Promise<string[]>;
}

export interface IAIDescriptionGeneratorProvider {
  generateDescription(title: string, category: string, tags: string[]): Promise<string>;
  generateSEOMetadata(title: string, description: string): Promise<{
    metaTitle: string;
    metaDescription: string;
  }>;
}

export interface IAIChatbotProvider {
  generateResponse(userPrompt: string, context?: Record<string, any>): Promise<string>;
}
