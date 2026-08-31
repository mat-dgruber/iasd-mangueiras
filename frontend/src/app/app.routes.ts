import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

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
    path: 'estudos',
    loadComponent: () => import('./features/estudos/estudos.page').then((m) => m.EstudosPage),
    title: 'Estudos Bíblicos & PGs — IASD Mangueiras',
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
    path: 'admin/login',
    loadComponent: () =>
      import('./features/admin/login/admin-login.page').then((m) => m.AdminLoginPage),
    title: 'Login — Painel Administrativo IASD Mangueiras',
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.page').then(
            (m) => m.AdminDashboardPage,
          ),
        title: 'Painel Geral — IASD Mangueiras',
      },
      {
        path: 'eventos',
        loadComponent: () =>
          import('./features/admin/eventos/admin-eventos.page').then((m) => m.AdminEventosPage),
        title: 'Gestão de Eventos — IASD Mangueiras',
      },
      {
        path: 'comunicados',
        loadComponent: () =>
          import('./features/admin/comunicados/admin-comunicados.page').then(
            (m) => m.AdminComunicadosPage,
          ),
        title: 'Gestão de Comunicados — IASD Mangueiras',
      },
      {
        path: 'pgs',
        loadComponent: () =>
          import('./features/admin/pgs/admin-pgs.page').then((m) => m.AdminPgsPage),
        title: 'Gestão de Pequenos Grupos — IASD Mangueiras',
      },
      {
        path: 'oracoes',
        loadComponent: () =>
          import('./features/admin/oracoes/admin-oracoes.page').then((m) => m.AdminOracoesPage),
        title: 'Caixa de Oração — IASD Mangueiras',
      },
      {
        path: 'contatos',
        loadComponent: () =>
          import('./features/admin/contatos/admin-contatos.page').then((m) => m.AdminContatosPage),
        title: 'Mensagens de Contato — IASD Mangueiras',
      },
      {
        path: 'horarios',
        loadComponent: () =>
          import('./features/admin/horarios/admin-horarios.page').then((m) => m.AdminHorariosPage),
        title: 'Gestão de Horários — IASD Mangueiras',
      },
      {
        path: 'escalas',
        loadComponent: () =>
          import('./features/admin/escalas/admin-escalas.page').then((m) => m.AdminEscalasPage),
        title: 'Escalas dos Departamentos — IASD Mangueiras',
      },
      {
        path: 'ministerios',
        loadComponent: () =>
          import('./features/admin/ministerios/admin-ministerios.page').then(
            (m) => m.AdminMinisteriosPage,
          ),
        title: 'Gestão de Ministérios — IASD Mangueiras',
      },
    ],
  },

  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.page').then((m) => m.NotFoundPage),
    title: 'Página não encontrada — IASD Mangueiras',
  },
];

