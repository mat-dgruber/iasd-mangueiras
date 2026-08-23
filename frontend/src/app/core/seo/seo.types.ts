export interface SeoPage {
  title: string;
  description: string;
  path: `/${string}` | '';
  image?: string;
  faqs?: { question: string; answer: string }[];
  noIndex?: boolean;
}
