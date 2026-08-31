export interface SeoBreadcrumb {
  name: string;
  url: string;
}

export interface SeoEvent {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  locationName?: string;
  locationAddress?: string;
  image?: string;
}

export interface SeoVideo {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  embedUrl: string;
}

export interface SeoPage {
  title: string;
  description: string;
  path: `/${string}` | '';
  image?: string;
  faqs?: { question: string; answer: string }[];
  breadcrumbs?: SeoBreadcrumb[];
  events?: SeoEvent[];
  video?: SeoVideo;
  noIndex?: boolean;
}
