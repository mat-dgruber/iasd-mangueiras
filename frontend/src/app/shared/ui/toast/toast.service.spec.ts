import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
    service.clear();
  });

  it('deve inicializar com lista de toasts vazia', () => {
    expect(service.toasts().length).toBe(0);
  });

  it('deve adicionar um toast de sucesso corretamente', () => {
    const id = service.success('Operação concluída com sucesso!', 'Sucesso');
    expect(id).toBeDefined();
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].type).toBe('success');
    expect(service.toasts()[0].message).toBe('Operação concluída com sucesso!');
    expect(service.toasts()[0].title).toBe('Sucesso');
  });

  it('deve remover um toast pelo id', () => {
    const id1 = service.info('Primeiro toast');
    const id2 = service.error('Segundo toast');
    expect(service.toasts().length).toBe(2);

    service.dismiss(id1);
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].id).toBe(id2);
  });

  it('deve limpar todos os toasts', () => {
    service.info('Toast 1');
    service.warning('Toast 2');
    expect(service.toasts().length).toBe(2);

    service.clear();
    expect(service.toasts().length).toBe(0);
  });
});
