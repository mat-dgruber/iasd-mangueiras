import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstudosLicaoTabComponent } from './estudos-licao-tab.component';

describe('EstudosLicaoTabComponent', () => {
  let fixture: ComponentFixture<EstudosLicaoTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstudosLicaoTabComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EstudosLicaoTabComponent);
    fixture.detectChanges();
  });

  it('renderiza canais recomendados e materiais de estudo', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Estudo Diário da Lição no Navegador');
    expect(text).toContain('Aprofunde seu Estudo com Especialistas');
    expect(text).toContain('Canal Lamed');
    expect(text).toContain('Michelson Borges');
    expect(text).toContain('Presente 7');
    expect(text).toContain('Lições da Bíblia');
    expect(text).toContain('Lição dos Adultos');
    expect(text).toContain('Ministério Jovem');
  });
});
