import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'horarios', renderMode: RenderMode.Prerender },
  { path: 'ao-vivo', renderMode: RenderMode.Prerender },
  { path: 'eventos', renderMode: RenderMode.Prerender },
  { path: 'ministerios', renderMode: RenderMode.Prerender },
  { path: 'estudos', renderMode: RenderMode.Prerender },
  { path: 'sou-novo', renderMode: RenderMode.Prerender },
  { path: 'contato', renderMode: RenderMode.Prerender },
  { path: 'admin/login', renderMode: RenderMode.Client },
  { path: 'admin/**', renderMode: RenderMode.Client },
  { path: 'admin', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Server },
];
