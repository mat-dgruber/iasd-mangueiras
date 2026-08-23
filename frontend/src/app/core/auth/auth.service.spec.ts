import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { FirebaseService } from '../firebase/firebase.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, FirebaseService],
    });
    service = TestBed.inject(AuthService);
  });

  it('inicializa com estado deslogado', () => {
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('permite realizar logout limpando o usuário atual', async () => {
    await service.logout();
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });
});
