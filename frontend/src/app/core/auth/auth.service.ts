import { Injectable, computed, inject, signal } from '@angular/core';
import {
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly firebase = inject(FirebaseService);

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    if (this.firebase.auth) {
      onAuthStateChanged(this.firebase.auth, (user) => {
        this.currentUser.set(user);
      });
    }
  }


  async loginWithGoogle(): Promise<User | null> {
    if (!this.firebase.auth) {
      this.errorMessage.set('Firebase Auth indisponível.');
      return null;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(this.firebase.auth, provider);
      this.currentUser.set(credential.user);
      this.isLoading.set(false);
      return credential.user;
    } catch (err: unknown) {
      this.isLoading.set(false);
      const msg = (err as Error)?.message || 'Erro ao autenticar com o Google.';
      this.errorMessage.set(msg);
      throw err;
    }
  }

  async loginWithEmail(email: string, pass: string): Promise<User | null> {
    if (!this.firebase.auth) {
      this.errorMessage.set('Firebase Auth indisponível.');
      return null;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const credential = await signInWithEmailAndPassword(this.firebase.auth, email, pass);
      this.currentUser.set(credential.user);
      this.isLoading.set(false);
      return credential.user;
    } catch (err: unknown) {
      this.isLoading.set(false);
      const error = err as { code?: string; message?: string };
      let msg = 'Erro ao realizar login.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        msg = 'E-mail ou senha incorretos.';
      } else if (error.code === 'auth/user-not-found') {
        msg = 'Usuário não encontrado.';
      } else if (error.code === 'auth/too-many-requests') {
        msg = 'Muitas tentativas. Tente novamente mais tarde.';
      }
      this.errorMessage.set(msg);
      throw err;
    }
  }

  async logout(): Promise<void> {
    if (this.firebase.auth) {
      await signOut(this.firebase.auth);
    }
    this.currentUser.set(null);
  }

  async resetPassword(email: string): Promise<void> {
    if (!this.firebase.auth) {
      throw new Error('Firebase Auth indisponível.');
    }
    await sendPasswordResetEmail(this.firebase.auth, email);
  }
}
