import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let component: ConfirmDialogComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('message', 'Deseja realmente excluir este item?');
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve exibir mensagem e títulos padrão quando aberto', () => {
    const textContent = fixture.nativeElement.textContent;
    expect(textContent).toContain('Confirmar Ação');
    expect(textContent).toContain('Deseja realmente excluir este item?');
    expect(textContent).toContain('Cancelar');
    expect(textContent).toContain('Confirmar');
  });

  it('deve aceitar textos customizados de título, confirmação e cancelamento', () => {
    fixture.componentRef.setInput('title', 'Remover Registro');
    fixture.componentRef.setInput('confirmText', 'Sim, excluir');
    fixture.componentRef.setInput('cancelText', 'Voltar');
    fixture.detectChanges();

    const textContent = fixture.nativeElement.textContent;
    expect(textContent).toContain('Remover Registro');
    expect(textContent).toContain('Sim, excluir');
    expect(textContent).toContain('Voltar');
  });

  it('deve emitir confirmed ao clicar no botão de confirmação', () => {
    let emitted = false;
    component.confirmed.subscribe(() => {
      emitted = true;
    });

    component.onConfirm();
    expect(emitted).toBe(true);
  });

  it('deve emitir cancelled ao clicar no botão de cancelamento', () => {
    let emitted = false;
    component.cancelled.subscribe(() => {
      emitted = true;
    });

    component.onCancel();
    expect(emitted).toBe(true);
  });

  it('não deve emitir confirmed ou cancelled quando isLoading for true', () => {
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();

    let confirmedEmitted = false;
    let cancelledEmitted = false;

    component.confirmed.subscribe(() => {
      confirmedEmitted = true;
    });
    component.cancelled.subscribe(() => {
      cancelledEmitted = true;
    });

    component.onConfirm();
    component.onCancel();

    expect(confirmedEmitted).toBe(false);
    expect(cancelledEmitted).toBe(false);
  });

  it('deve renderizar ícone e estilos da variante danger por padrão', () => {
    const iconContainer = fixture.nativeElement.querySelector('.bg-red-100');
    expect(iconContainer).not.toBeNull();
    expect(iconContainer?.classList).toContain('text-red-600');
  });

  it('deve renderizar ícone e estilos da variante warning', () => {
    fixture.componentRef.setInput('variant', 'warning');
    fixture.detectChanges();

    const iconContainer = fixture.nativeElement.querySelector('.bg-amber-100');
    expect(iconContainer).not.toBeNull();
    expect(iconContainer?.classList).toContain('text-amber-600');
  });

  it('deve renderizar ícone e estilos da variante primary', () => {
    fixture.componentRef.setInput('variant', 'primary');
    fixture.detectChanges();

    const iconContainer = fixture.nativeElement.querySelector('.bg-blue-100');
    expect(iconContainer).not.toBeNull();
    expect(iconContainer?.classList).toContain('text-advent-blue');
  });

  it('não deve exibir conteúdo quando isOpen for false', () => {
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();

    const modalDialog = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(modalDialog).toBeNull();
  });
});
