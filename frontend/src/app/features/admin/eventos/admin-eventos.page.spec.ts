import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminEventosPage } from './admin-eventos.page';
import { AdminCmsService } from '../../../core/services/admin-cms.service';
import { FirebaseService } from '../../../core/firebase/firebase.service';

describe('AdminEventosPage', () => {
  let fixture: ComponentFixture<AdminEventosPage>;
  let component: AdminEventosPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEventosPage],
      providers: [AdminCmsService, FirebaseService],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminEventosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('exibe título de eventos e botão para novo evento', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Eventos & Programações');
    expect(text).toContain('Novo Evento');
  });

  it('abre e fecha o modal de cadastro de evento', () => {
    expect(component.isModalOpen()).toBe(false);

    component.openModal();
    fixture.detectChanges();
    expect(component.isModalOpen()).toBe(true);

    component.closeModal();
    fixture.detectChanges();
    expect(component.isModalOpen()).toBe(false);
  });
});
