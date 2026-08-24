import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminPgsPage } from './admin-pgs.page';
import { AdminCmsService } from '../../../core/services/admin-cms.service';
import { FirebaseService } from '../../../core/firebase/firebase.service';

describe('AdminPgsPage', () => {
  let fixture: ComponentFixture<AdminPgsPage>;
  let component: AdminPgsPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPgsPage],
      providers: [AdminCmsService, FirebaseService],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPgsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('exibe o título e o botão de novo pequeno grupo', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Gestão de Pequenos Grupos (PGs)');
    expect(text).toContain('+ Novo Pequeno Grupo');
  });

  it('abre e fecha o modal de cadastro de PG', () => {
    expect(component.isModalOpen()).toBe(false);

    component.openModal();
    fixture.detectChanges();
    expect(component.isModalOpen()).toBe(true);

    component.closeModal();
    fixture.detectChanges();
    expect(component.isModalOpen()).toBe(false);
  });

  it('valida o formulário de cadastro de PG', () => {
    component.openModal();
    expect(component.pgForm.valid).toBe(false);

    component.pgForm.patchValue({
      nome: 'PG Conexão Jovem',
      lider: 'Lucas e Beatriz',
      telefone: '(15) 99811-2233',
      bairro: 'Centro',
      dia: 'Terça-feira',
      horario: '19:30',
      perfil: 'Jovens (JA)',
      descricao: 'Encontro com estudo dinâmico e louvor.',
    });

    expect(component.pgForm.valid).toBe(true);
  });
});
