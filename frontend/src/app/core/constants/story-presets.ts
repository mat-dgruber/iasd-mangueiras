import { StoryBackground } from '../models/story.models';

export const STORY_BACKGROUND_PRESETS: StoryBackground[] = [
  // 4 Gradientes Nobres / Royal Gradients
  {
    id: 'azul-imperial',
    nome: 'Azul Imperial',
    tipo: 'gradient',
    bgGradientCss: 'linear-gradient(135deg, #041d33 0%, #0b3d68 50%, #062642 100%)',
    canvasColors: ['#041d33', '#0b3d68', '#062642'],
    primaryTextColor: '#FFFFFF',
    accentColor: '#38BDF8',
    defaultOverlayOpacity: 0.4,
  },
  {
    id: 'dourado-aurora',
    nome: 'Dourado Aurora',
    tipo: 'gradient',
    bgGradientCss: 'linear-gradient(135deg, #78350f 0%, #b45309 50%, #451a03 100%)',
    canvasColors: ['#78350f', '#b45309', '#451a03'],
    primaryTextColor: '#FFFFFF',
    accentColor: '#FBBF24',
    defaultOverlayOpacity: 0.45,
  },
  {
    id: 'verde-esperanca',
    nome: 'Verde Esperança',
    tipo: 'gradient',
    bgGradientCss: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #022c22 100%)',
    canvasColors: ['#064e3b', '#047857', '#022c22'],
    primaryTextColor: '#FFFFFF',
    accentColor: '#34D399',
    defaultOverlayOpacity: 0.4,
  },
  {
    id: 'noite-celestial',
    nome: 'Noite Celestial',
    tipo: 'gradient',
    bgGradientCss: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #0f172a 100%)',
    canvasColors: ['#1e1b4b', '#312e81', '#0f172a'],
    primaryTextColor: '#FFFFFF',
    accentColor: '#E4E4E7',
    defaultOverlayOpacity: 0.4,
  },

  // 6 Presets Fotográficos de Alta Resolução / Photorealistic Presets
  {
    id: 'alvorada-montanhas',
    nome: 'Alvorada nas Montanhas',
    tipo: 'photo',
    imageUrl:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1080&q=80',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=70',
    canvasColors: ['#1e293b', '#334155', '#0f172a'],
    primaryTextColor: '#FFFFFF',
    accentColor: '#F59E0B',
    defaultOverlayOpacity: 0.55,
  },
  {
    id: 'ceu-estrelado',
    nome: 'Céu Estrelado',
    tipo: 'photo',
    imageUrl:
      'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1080&q=80',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=300&q=70',
    canvasColors: ['#0f172a', '#1e1b4b', '#030712'],
    primaryTextColor: '#FFFFFF',
    accentColor: '#60A5FA',
    defaultOverlayOpacity: 0.5,
  },
  {
    id: 'floresta-raios',
    nome: 'Raios na Floresta',
    tipo: 'photo',
    imageUrl:
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1080&q=80',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=300&q=70',
    canvasColors: ['#052e16', '#14532d', '#022c22'],
    primaryTextColor: '#FFFFFF',
    accentColor: '#4ADE80',
    defaultOverlayOpacity: 0.55,
  },
  {
    id: 'por-do-sol-ouro',
    nome: 'Pôr do Sol Dourado',
    tipo: 'photo',
    imageUrl:
      'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=1080&q=80',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=300&q=70',
    canvasColors: ['#451a03', '#78350f', '#1c1917'],
    primaryTextColor: '#FFFFFF',
    accentColor: '#FBBF24',
    defaultOverlayOpacity: 0.55,
  },
  {
    id: 'biblia-luz',
    nome: 'Bíblia Sagrada & Luz',
    tipo: 'photo',
    imageUrl:
      'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1080&q=80',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=300&q=70',
    canvasColors: ['#1c1917', '#44403c', '#0c0a09'],
    primaryTextColor: '#FFFFFF',
    accentColor: '#F59E0B',
    defaultOverlayOpacity: 0.55,
  },
  {
    id: 'nuvens-celestes',
    nome: 'Nuvens Celestes',
    tipo: 'photo',
    imageUrl:
      'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1080&q=80',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=300&q=70',
    canvasColors: ['#0c4a6e', '#0284c7', '#082f49'],
    primaryTextColor: '#FFFFFF',
    accentColor: '#38BDF8',
    defaultOverlayOpacity: 0.5,
  },
];
