import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminOracoesPage } from './admin-oracoes.page';
import { AdminCmsService } from '../../../core/services/admin-cms.service';
import { FirebaseService } from '../../../core/firebase/firebase.service';

describe('AdminOracoesPage', () => {
  let fixture: ComponentFixture<AdminOracoesPage>;
  let component: AdminOracoesPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminOracoesPage],
      providers: [AdminCmsService, FirebaseService],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminOracoesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('exibe título e filtros de pedidos de oração', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Caixa de Pedidos de Oração & Estudos');
    expect(text).toContain('Todos');
    expect(text).toContain('Pendentes');
    expect(text).toContain('Orados');
    expect(text).toContain('Confidenciais');
  });

  it('filtra pedidos confidenciais', () => {
    component.selectedFilter.set('Confidenciais');
    fixture.detectChanges();

    const filtered = component.filteredOracoes();
    expect(filtered.every((o) => o.confidencial)).toBe(true);
  });
});
