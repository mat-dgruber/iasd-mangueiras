import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ContatoPage } from './contato.page';

describe('ContatoPage', () => {
  let fixture: ComponentFixture<ContatoPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContatoPage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(ContatoPage);
    fixture.detectChanges();
  });

  it('exibe título e abas de contato e oração', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Contato e Pedido de Oração');
    expect(text).toContain('Fale Conosco');
    expect(text).toContain('Pedido de Oração');
    expect(text).toContain('Fale pelo WhatsApp');
  });

  it('valida campos obrigatórios no formulário de contato', () => {
    const component = fixture.componentInstance;
    expect(component.contatoForm.valid).toBe(false);

    component.contatoForm.patchValue({
      nome: 'Teste',
      email: 'teste@exemplo.com',
      mensagem: 'Mensagem válida com mais de 5 caracteres',
    });

    expect(component.contatoForm.valid).toBe(true);
  });


  it('alterna para a aba de pedido de oração', () => {
    const component = fixture.componentInstance;
    component.setTab('oracao');
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Motivo de Oração');
    expect(text).toContain('confidencial');
  });
});
