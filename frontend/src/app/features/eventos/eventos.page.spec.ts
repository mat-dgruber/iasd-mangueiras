import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EventosPage } from './eventos.page';

describe('EventosPage', () => {
  let fixture: ComponentFixture<EventosPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventosPage],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(EventosPage);
    fixture.detectChanges();
  });

  it('exibe título e seções de eventos e comunicados', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Eventos e Programações');
    expect(text).toContain('Próximos Eventos');
    expect(text).toContain('Comunicados e Avisos Gerais');
  });

  it('renderiza os eventos cadastrados', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Semana de Oração da Família');
  });
});
