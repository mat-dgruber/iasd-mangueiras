import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MinisteriosPage } from './ministerios.page';

describe('MinisteriosPage', () => {
  let fixture: ComponentFixture<MinisteriosPage>;
  let component: MinisteriosPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MinisteriosPage] }).compileComponents();
    fixture = TestBed.createComponent(MinisteriosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('exibe título principal e área de envolvimento', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Ministérios da Igreja');
    expect(text).toContain('Deseja servir ou conhecer mais sobre um ministério?');
  });

  it('renderiza os ministérios ativos', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Recepção e Acolhimento');
    expect(text).toContain('Ministério da Criança');
    expect(text).toContain('Desbravadores e Aventureiros');
  });

  it('filtra ministérios por categoria', () => {
    component.setCategory('Louvor & Adoração');
    fixture.detectChanges();

    const filtered = component.filteredMinisterios();
    expect(filtered.length).toBe(1);
    expect(filtered[0].nome).toBe('Música e Louvor');
  });

  it('filtra ministérios por termo de busca', () => {
    component.onSearchInput({ target: { value: 'solidária' } } as unknown as Event);
    fixture.detectChanges();

    const filtered = component.filteredMinisterios();
    expect(filtered.length).toBe(1);
    expect(filtered[0].nome).toContain('Ação Solidária Adventista');
  });


  it('exibe mensagem amigável quando nenhum ministério é encontrado', () => {
    component.onSearchInput({ target: { value: 'termo-inexistente-xyz' } } as unknown as Event);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Nenhum ministério encontrado');

    component.resetFilters();
    fixture.detectChanges();
    expect(component.filteredMinisterios().length).toBeGreaterThan(0);
  });
});
