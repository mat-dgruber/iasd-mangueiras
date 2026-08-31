import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminContatosPage } from './admin-contatos.page';
import { AdminCmsService } from '../../../core/services/admin-cms.service';
import { FirebaseService } from '../../../core/firebase/firebase.service';

describe('AdminContatosPage', () => {
  let fixture: ComponentFixture<AdminContatosPage>;
  let component: AdminContatosPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminContatosPage],
      providers: [AdminCmsService, FirebaseService],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminContatosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('exibe título e filtros de mensagens de contato', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Mensagens de Contato');
    expect(text).toContain('Todos');
    expect(text).toContain('Não Lidos');
    expect(text).toContain('Lidos');
    expect(text).toContain('Respondidos');
  });

  it('filtra mensagens não lidas corretamente', () => {
    component.contatos.set([
      { id: '1', nome: 'João', email: 'joao@teste.com', mensagem: 'Olá', lido: false },
      { id: '2', nome: 'Maria', email: 'maria@teste.com', mensagem: 'Tudo bem?', lido: true, respondido: false },
      { id: '3', nome: 'Pedro', email: 'pedro@teste.com', mensagem: 'Dúvida', lido: true, respondido: true },
    ]);

    component.selectedFilter.set('Não Lidos');
    fixture.detectChanges();

    const filtered = component.filteredContatos();
    expect(filtered.length).toBe(1);
    expect(filtered[0].nome).toBe('João');
  });

  it('filtra mensagens respondidas corretamente', () => {
    component.contatos.set([
      { id: '1', nome: 'João', email: 'joao@teste.com', mensagem: 'Olá', lido: false },
      { id: '2', nome: 'Maria', email: 'maria@teste.com', mensagem: 'Tudo bem?', lido: true, respondido: false },
      { id: '3', nome: 'Pedro', email: 'pedro@teste.com', mensagem: 'Dúvida', lido: true, respondido: true },
    ]);

    component.selectedFilter.set('Respondidos');
    fixture.detectChanges();

    const filtered = component.filteredContatos();
    expect(filtered.length).toBe(1);
    expect(filtered[0].nome).toBe('Pedro');
  });

  it('gera link de WhatsApp formatado com código do país', () => {
    const url = component.getWhatsAppUrl('(15) 99786-4835', 'Carlos');
    expect(url).toContain('wa.me/5515997864835');
    expect(url).toContain('Carlos');
  });
});
