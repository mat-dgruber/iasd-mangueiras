import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FirebaseApp, initializeApp, getApps } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseStorage, getStorage } from 'firebase/storage';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private readonly platformId = inject(PLATFORM_ID);

  private readonly app: FirebaseApp | null = null;
  readonly auth: Auth | null = null;
  readonly firestore: Firestore | null = null;
  readonly storage: FirebaseStorage | null = null;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const apps = getApps();
        this.app = apps.length ? apps[0] : initializeApp(environment.firebase);
        this.auth = getAuth(this.app);
        this.firestore = getFirestore(this.app);
        this.storage = getStorage(this.app);
      } catch (err) {
        console.warn('Firebase initialization skipped or failed:', err);
      }
    }
  }

  isAvailable(): boolean {
    return isPlatformBrowser(this.platformId) && this.app !== null;
  }
}
