import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ContentService } from '../../core/services/content.service';
import { SeoService } from '../../core/seo/seo.service';
import { CultoEscalaGroup, EscalaItem } from '../../core/models/content.models';
import { EscalaCultoCardComponent } from './components/escala-culto-card.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { filterEscalas, groupEscalasByCulto } from './utils/escalas.utils';

export interface DepartmentFilter {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-escalas-page',
  standalone: true,
  imports: [EscalaCultoCardComponent, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './escalas.page.html',
})
export class EscalasPage implements OnInit {
  private readonly contentService = inject(ContentService);
  private readonly seoService = inject(SeoService);

  readonly searchTerm = signal<string>('');
  readonly selectedDepartment = signal<string>('todos');
  readonly showPastEscalas = signal<boolean>(false);

  readonly departments: DepartmentFilter[] = [
    { id: 'todos', label: 'Todos', icon: 'apps' },
    { id: 'Sonorização & Transmissão', label: 'Som & Mídia', icon: 'volume_up' },
    { id: 'Diaconato', label: 'Diaconato', icon: 'volunteer_activism' },
    { id: 'Recepção', label: 'Recepção', icon: 'waving_hand' },
    { id: 'Música & Louvor', label: 'Música & Louvor', icon: 'piano' },
    { id: 'Escola Sabatina', label: 'Escola Sabatina', icon: 'menu_book' },
    { id: 'Ministério Infantil', label: 'Infantil', icon: 'child_care' },
  ];

  readonly isLoading = signal<boolean>(false);

  private readonly filteredEscalas = computed<EscalaItem[]>(() => {
    const raw = this.contentService.escalas();
    return filterEscalas(raw, this.searchTerm(), this.selectedDepartment());
  });

  private readonly allGroups = computed<CultoEscalaGroup[]>(() => {
    return groupEscalasByCulto(this.filteredEscalas());
  });

  readonly activeGroups = computed<CultoEscalaGroup[]>(() => {
    return this.allGroups().filter((g) => !g.isPassado);
  });

  readonly pastGroups = computed<CultoEscalaGroup[]>(() => {
    return this.allGroups().filter((g) => g.isPassado);
  });

  ngOnInit(): void {
    this.seoService.apply({
      title: 'Escalas & Voluntários — IASD Mangueiras',
      description: 'Consulte as escalas ministeriais e voluntários nos cultos da IASD Mangueiras em Tatuí.',
      path: '/escalas',
    });
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedDepartment.set('todos');
  }
}
