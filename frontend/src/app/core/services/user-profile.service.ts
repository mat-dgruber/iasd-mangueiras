import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface UserPgProfile {
  bairro: string | null;
  perfil: string | null;
  horarioPref: ('manha' | 'tarde' | 'noite')[];
  diasPref: string[];
  savedAt: string;
  version: number;
}

const STORAGE_KEY = 'iasd_pg_profile';
const CURRENT_VERSION = 1;

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly profile = signal<UserPgProfile | null>(null);

  constructor() {
    if (this.isBrowser) {
      this.loadProfile();
    }
  }

  private loadProfile(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UserPgProfile;
        if (parsed.version === CURRENT_VERSION) {
          this.profile.set(parsed);
        }
      }
    } catch {
      // Ignora erro de parse ou acesso ao localStorage
    }
  }

  saveProfile(data: Omit<UserPgProfile, 'savedAt' | 'version'>): void {
    const fullProfile: UserPgProfile = {
      ...data,
      savedAt: new Date().toISOString(),
      version: CURRENT_VERSION,
    };

    this.profile.set(fullProfile);

    if (this.isBrowser) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fullProfile));
      } catch {
        // Ignora fallback se armazenamento bloqueado
      }
    }
  }

  clearProfile(): void {
    this.profile.set(null);
    if (this.isBrowser) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignora erro ao limpar
      }
    }
  }

  buildQueryFromProfile(p: UserPgProfile): string {
    const parts: string[] = [];

    if (p.perfil && p.perfil !== 'Todos') {
      parts.push(`público perfil ${p.perfil}`);
    }

    if (p.bairro && p.bairro !== 'Todos') {
      parts.push(`bairro ${p.bairro} Tatuí`);
    }

    if (p.horarioPref && p.horarioPref.length > 0) {
      const turnos = p.horarioPref.join(', ');
      parts.push(`horário encontro no período da ${turnos}`);
    }

    if (p.diasPref && p.diasPref.length > 0) {
      const dias = p.diasPref.join(' ou ');
      parts.push(`reuniões de ${dias}`);
    }

    return parts.join(' ');
  }
}
