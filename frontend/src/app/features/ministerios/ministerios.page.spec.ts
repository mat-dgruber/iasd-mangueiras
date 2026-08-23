import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MinisteriosPage } from './ministerios.page';

describe('MinisteriosPage', () => {
  let fixture: ComponentFixture<MinisteriosPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MinisteriosPage] }).compileComponents();
    fixture = TestBed.createComponent(MinisteriosPage);
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
});
