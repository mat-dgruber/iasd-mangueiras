export type SearchEntityType =
  | 'evento'
  | 'ministerio'
  | 'pg'
  | 'estudo'
  | 'versiculo'
  | 'video'
  | 'horario';

export interface SemanticSearchResult {
  id: string;
  type: SearchEntityType;
  title: string;
  description: string;
  url: string;
  badgeText: string;
  departmentOrCategory?: string;
  similarityScore: number;
  matchPercentage: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface SearchFilterOptions {
  category?: SearchEntityType | 'all';
  minScore?: number;
  maxResults?: number;
}
