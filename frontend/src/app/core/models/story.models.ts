export type StoryFormat = 'story' | 'feed'; // 9:16 (1080x1920) | 1:1 (1080x1080)

export type BackgroundType = 'gradient' | 'photo' | 'custom';

export interface StoryBackground {
  id: string;
  nome: string;
  tipo: BackgroundType;
  bgGradientCss?: string;
  canvasColors?: [string, string, string];
  imageUrl?: string;
  thumbnailUrl?: string;
  primaryTextColor: string;
  accentColor: string;
  defaultOverlayOpacity: number; // 0.3 a 0.85
}

export type VerseCategory =
  | 'paz'
  | 'esperanca'
  | 'oracao'
  | 'coragem'
  | 'amor'
  | 'gratidao'
  | 'fe'
  | 'direcao'
  | 'geral';

export interface DailyVerse {
  id: string;
  texto: string;
  referencia: string;
  tema: string;
  categoria: VerseCategory;
  tagsSemanticas?: string[];
}

export interface SemanticVerseMatch {
  verse: DailyVerse;
  similarityScore: number;
  matchPercentage: number;
}
