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
    expect(text).toContain('Estudo Bíblico');
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

  it('alterna para a aba de estudo bíblico e valida campos', () => {
    const component = fixture.componentInstance;
    component.setTab('estudo');
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Estudo Bíblico Gratuito');

    expect(component.estudoForm.valid).toBe(false);
    component.estudoForm.patchValue({
      nome: 'Interessado na Bíblia',
      email: 'estudo@exemplo.com',
      telefone: '(15) 99999-9999',
      preferencia: 'digital',
    });
    expect(component.estudoForm.valid).toBe(true);
  });

  it('aplica máscara de telefone corretamente', () => {
    const component = fixture.componentInstance;
    const fakeEvent = { target: { value: '15998887766' } } as unknown as Event;
    component.formatPhone(fakeEvent, component.contatoForm, 'telefone');

    expect(component.contatoForm.get('telefone')?.value).toBe('(15) 99888-7766');
  });

  it('exibe mensagem de erro quando errorMessage signal está preenchido', () => {
    const component = fixture.componentInstance;
    component.errorMessage.set('Erro de conexão ao servidor.');
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Não foi possível enviar');
    expect(text).toContain('Erro de conexão ao servidor.');
  });
});
