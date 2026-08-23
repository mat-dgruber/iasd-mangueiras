import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminComunicadosPage } from './admin-comunicados.page';

import { AdminCmsService } from '../../../core/services/admin-cms.service';
import { FirebaseService } from '../../../core/firebase/firebase.service';

describe('AdminComunicadosPage', () => {
  let fixture: ComponentFixture<AdminComunicadosPage>;
  let component: AdminComunicadosPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminComunicadosPage],
      providers: [AdminCmsService, FirebaseService],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminComunicadosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('exibe título de comunicados e botão para novo comunicado', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Comunicados & Avisos');
    expect(text).toContain('+ Novo Comunicado');
  });

  it('abre e fecha o modal de cadastro de comunicado', () => {
    expect(component.isModalOpen()).toBe(false);

    component.openModal();
    fixture.detectChanges();
    expect(component.isModalOpen()).toBe(true);

    component.closeModal();
    fixture.detectChanges();
    expect(component.isModalOpen()).toBe(false);
  });
});
