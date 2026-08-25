import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminHorariosPage } from './admin-horarios.page';
import { AdminCmsService } from '../../../core/services/admin-cms.service';
import { FirebaseService } from '../../../core/firebase/firebase.service';

describe('AdminHorariosPage', () => {
  let fixture: ComponentFixture<AdminHorariosPage>;
  let component: AdminHorariosPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminHorariosPage],
      providers: [provideRouter([]), AdminCmsService, FirebaseService],
    }).compileComponents();
    fixture = TestBed.createComponent(AdminHorariosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('exibe o título principal e grade regular', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Horários & Avisos Especiais');
    expect(text).toContain('Grade Regular de Cultos');
  });

  it('abre e fecha o modal de aviso especial', () => {
    expect(component.isModalOpen()).toBe(false);

    component.openModal();
    fixture.detectChanges();
    expect(component.isModalOpen()).toBe(true);

    component.closeModal();
    fixture.detectChanges();
    expect(component.isModalOpen()).toBe(false);
  });
});
