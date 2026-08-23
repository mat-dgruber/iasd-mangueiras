import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
    title: 'IASD Mangueiras — Igreja Adventista em Tatuí',
  },
  {
    path: 'horarios',
    loadComponent: () => import('./features/horarios/horarios.page').then((m) => m.HorariosPage),
    title: 'Horários — IASD Mangueiras',
  },
  {
    path: 'ao-vivo',
    loadComponent: () => import('./features/ao-vivo/ao-vivo.page').then((m) => m.AoVivoPage),
    title: 'Ao vivo — IASD Mangueiras',
  },
  {
    path: 'eventos',
    loadComponent: () => import('./features/eventos/eventos.page').then((m) => m.EventosPage),
    title: 'Eventos — IASD Mangueiras',
  },
  {
    path: 'ministerios',
    loadComponent: () => import('./features/ministerios/ministerios.page').then((m) => m.MinisteriosPage),
    title: 'Ministérios — IASD Mangueiras',
  },
  {
    path: 'sou-novo',
    loadComponent: () => import('./features/sou-novo/sou-novo.page').then((m) => m.SouNovoPage),
    title: 'Sou novo — IASD Mangueiras',
  },
  {
    path: 'contato',
    loadComponent: () => import('./features/contato/contato.page').then((m) => m.ContatoPage),
    title: 'Contato e oração — IASD Mangueiras',
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.page').then((m) => m.NotFoundPage),
    title: 'Página não encontrada — IASD Mangueiras',
  },
];
