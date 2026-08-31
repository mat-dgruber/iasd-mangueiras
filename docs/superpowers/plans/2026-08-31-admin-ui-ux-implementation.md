# Admin UI/UX Overhaul & Lay-User Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Admin CMS domain into an accessible, error-forgiving and highly intuitive experience for church volunteers and lay-users by building reusable UI assist components (`ConfirmDialog`, `ImagePicker`), standardizing the 5 UI states (skeletons, empty states with CTAs, retry banners, inline field validations, toast notifications), and replacing technical browser dialogs.

**Architecture:** Standalone Angular components with Signals for reactive local state, consuming in-house atomic components (`ModalComponent`, `ButtonComponent`, `BadgeComponent`, `SkeletonComponent`, `ToastService`). Adheres to WCAG 2.2 AA (min touch targets 44px, focus rings, semantic color contrast).

**Tech Stack:** Angular 19+ (Standalone Components, Signals, Reactive Forms), Tailwind CSS, Firebase Firestore & Storage, Karma/Jasmine.

## Global Constraints

- **Language & Copy:** All user-facing text, error messages, placeholders and modal instructions MUST be in Brazilian Portuguese (pt-BR).
- **Code & Commits:** Source code, identifiers, types, file names and commit messages in English (EN-US) using Conventional Commits.
- **Design System:** Use in-house components in `shared/ui/`; do NOT introduce third-party UI libraries (zero extra dependencies).
- **Multi-Theme & Accessibility:** Support Light, Dark and High-Contrast modes; touch targets ≥ 44px; keyboard navigability (Escape, Tab traps).

---

### Task 1: Create `ConfirmDialogComponent` in `shared/ui`

**Files:**
- Create: `frontend/src/app/shared/ui/confirm-dialog/confirm-dialog.component.ts`
- Create: `frontend/src/app/shared/ui/confirm-dialog/confirm-dialog.component.spec.ts`

**Interfaces:**
- Consumes: `ModalComponent` (`app-ui-modal`), `ButtonComponent` (`app-ui-button`)
- Produces: `ConfirmDialogComponent` with selector `app-ui-confirm-dialog`
  - Inputs:
    - `isOpen = input.required<boolean>()`
    - `title = input<string>('Confirmar Ação')`
    - `message = input.required<string>()`
    - `confirmText = input<string>('Confirmar')`
    - `cancelText = input<string>('Cancelar')`
    - `variant = input<'danger' | 'warning' | 'primary'>('danger')`
    - `isLoading = input<boolean>(false)`
  - Outputs:
    - `confirmed = output<void>()`
    - `cancelled = output<void>()`

- [ ] **Step 1: Write the failing unit test**

```typescript
// frontend/src/app/shared/ui/confirm-dialog/confirm-dialog.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { Component, signal } from '@angular/core';

@Component({
  standalone: true,
  imports: [ConfirmDialogComponent],
  template: `
    <app-ui-confirm-dialog
      [isOpen]="isOpen()"
      [title]="'Excluir Item'"
      [message]="'Tem certeza que deseja excluir?'"
      [confirmText]="'Sim, excluir'"
      [cancelText]="'Voltar'"
      [variant]="'danger'"
      [isLoading]="isLoading()"
      (confirmed)="onConfirm()"
      (cancelled)="onCancel()"
    />
  `,
})
class TestHostComponent {
  isOpen = signal<boolean>(true);
  isLoading = signal<boolean>(false);
  confirmedCalls = 0;
  cancelledCalls = 0;

  onConfirm() { this.confirmedCalls++; }
  onCancel() { this.cancelledCalls++; }
}

describe('ConfirmDialogComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render title and message when open', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Excluir Item');
    expect(el.textContent).toContain('Tem certeza que deseja excluir?');
  });

  it('should emit confirmed event when clicking confirm button', () => {
    const confirmBtn = fixture.nativeElement.querySelector('button.bg-red-600') ||
                       fixture.nativeElement.querySelectorAll('button')[1];
    confirmBtn?.click();
    fixture.detectChanges();
    expect(host.confirmedCalls).toBe(1);
  });

  it('should emit cancelled event when clicking cancel button', () => {
    const cancelBtn = fixture.nativeElement.querySelector('button.border') ||
                      fixture.nativeElement.querySelectorAll('button')[0];
    cancelBtn?.click();
    fixture.detectChanges();
    expect(host.cancelledCalls).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm test -- --include=src/app/shared/ui/confirm-dialog/confirm-dialog.component.spec.ts --watch=false`
Expected: FAIL (Cannot find module)

- [ ] **Step 3: Implement `ConfirmDialogComponent`**

```typescript
// frontend/src/app/shared/ui/confirm-dialog/confirm-dialog.component.ts
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-ui-confirm-dialog',
  standalone: true,
  imports: [ModalComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-ui-modal
      [isOpen]="isOpen()"
      [title]="title()"
      [size]="'sm'"
      [showFooter]="true"
      [closeOnBackdrop]="!isLoading()"
      (close)="onCancel()"
    >
      <div class="flex items-start gap-4 py-1">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          [class.bg-red-100]="variant() === 'danger'"
          [class.text-red-600]="variant() === 'danger'"
          [class.bg-amber-100]="variant() === 'warning'"
          [class.text-amber-600]="variant() === 'warning'"
          [class.bg-blue-100]="variant() === 'primary'"
          [class.text-advent-blue]="variant() === 'primary'"
        >
          @if (variant() === 'danger') {
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          } @else if (variant() === 'warning') {
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          } @else {
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          }
        </div>

        <p class="text-sm leading-relaxed text-slate-600 select-none">
          {{ message() }}
        </p>
      </div>

      <div footer class="flex w-full items-center justify-end gap-2.5">
        <app-ui-button
          [variant]="'outline'"
          [size]="'sm'"
          [disabled]="isLoading()"
          (click)="onCancel()"
        >
          {{ cancelText() }}
        </app-ui-button>

        <app-ui-button
          [variant]="variant() === 'danger' ? 'danger' : 'primary'"
          [size]="'sm'"
          [loading]="isLoading()"
          (click)="onConfirm()"
        >
          {{ confirmText() }}
        </app-ui-button>
      </div>
    </app-ui-modal>
  `,
})
export class ConfirmDialogComponent {
  readonly isOpen = input.required<boolean>();
  readonly title = input<string>('Confirmar Ação');
  readonly message = input.required<string>();
  readonly confirmText = input<string>('Confirmar');
  readonly cancelText = input<string>('Cancelar');
  readonly variant = input<'danger' | 'warning' | 'primary'>('danger');
  readonly isLoading = input<boolean>(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  onConfirm(): void {
    if (!this.isLoading()) {
      this.confirmed.emit();
    }
  }

  onCancel(): void {
    if (!this.isLoading()) {
      this.cancelled.emit();
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npm test -- --include=src/app/shared/ui/confirm-dialog/confirm-dialog.component.spec.ts --watch=false`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/shared/ui/confirm-dialog/
git commit -m "feat(ui): add accessible ConfirmDialogComponent with variant and loading states"
```

---

### Task 2: Create `ImagePickerComponent` in `shared/ui`

**Files:**
- Create: `frontend/src/app/shared/ui/image-picker/image-picker.component.ts`
- Create: `frontend/src/app/shared/ui/image-picker/image-picker.component.spec.ts`

**Interfaces:**
- Consumes: `ButtonComponent` (`app-ui-button`), `ToastService`
- Produces: `ImagePickerComponent` with selector `app-ui-image-picker`
  - Inputs:
    - `value = input<string>('')` (current image URL)
    - `label = input<string>('Imagem / Banner')`
    - `helpText = input<string>('Recomendado JPG, PNG ou WebP até 5MB')`
    - `maxSizeMb = input<number>(5)`
  - Outputs:
    - `imageSelected = output<File>()`
    - `imageRemoved = output<void>()`
    - `urlChanged = output<string>()`

- [ ] **Step 1: Write the failing unit test**

```typescript
// frontend/src/app/shared/ui/image-picker/image-picker.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImagePickerComponent } from './image-picker.component';
import { ToastService } from '../toast/toast.service';

describe('ImagePickerComponent', () => {
  let fixture: ComponentFixture<ImagePickerComponent>;
  let component: ImagePickerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImagePickerComponent],
      providers: [ToastService],
    }).compileComponents();

    fixture = TestBed.createComponent(ImagePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render drag-and-drop zone when no image is selected', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Selecione uma imagem');
  });

  it('should render preview image and remove button when value is set', () => {
    fixture.componentRef.setInput('value', 'https://example.com/banner.jpg');
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('img');
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('https://example.com/banner.jpg');
  });

  it('should emit imageRemoved when remove button is clicked', () => {
    fixture.componentRef.setInput('value', 'https://example.com/banner.jpg');
    fixture.detectChanges();

    let removed = false;
    component.imageRemoved.subscribe(() => { removed = true; });

    const removeBtn = fixture.nativeElement.querySelector('button[aria-label="Remover imagem"]');
    removeBtn?.click();
    expect(removed).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm test -- --include=src/app/shared/ui/image-picker/image-picker.component.spec.ts --watch=false`
Expected: FAIL (Cannot find module)

- [ ] **Step 3: Implement `ImagePickerComponent`**

```typescript
// frontend/src/app/shared/ui/image-picker/image-picker.component.ts
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, inject, input, output, signal } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { ToastService } from '../toast/toast.service';

@Component({
  selector: 'app-ui-image-picker',
  standalone: true,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-2">
      <label class="block text-xs font-semibold uppercase text-advent-muted">
        {{ label() }}
      </label>

      @if (previewUrl() || value()) {
        <div class="relative overflow-hidden rounded-2xl border border-advent-border bg-slate-50 p-2">
          <div class="relative h-44 w-full overflow-hidden rounded-xl bg-slate-900 flex items-center justify-center">
            <img
              [src]="previewUrl() || value()"
              alt="Pré-visualização da imagem"
              class="h-full w-full object-cover"
            />
            <button
              type="button"
              (click)="removeImage()"
              aria-label="Remover imagem"
              class="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white hover:bg-red-600 transition-colors cursor-pointer"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="mt-2 flex items-center justify-between px-1">
            <span class="text-[11px] text-advent-muted truncate max-w-[200px]">
              {{ selectedFileName() || 'Imagem configurada' }}
            </span>
            <button
              type="button"
              (click)="fileInput.click()"
              class="text-xs font-semibold text-advent-blue hover:underline cursor-pointer"
            >
              Trocar foto
            </button>
          </div>
        </div>
      } @else {
        <div
          class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-advent-border p-6 text-center transition-colors hover:border-advent-blue hover:bg-blue-50/20 cursor-pointer"
          (click)="fileInput.click()"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
          [class.border-advent-blue]="isDragging()"
          [class.bg-blue-50]="isDragging()"
        >
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-advent-blue/10 text-advent-blue mb-3">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <p class="text-sm font-semibold text-advent-text">Selecione uma imagem</p>
          <p class="text-xs text-advent-muted mt-1">{{ helpText() }}</p>
        </div>
      }

      <!-- Opção de colar link manual (colapsável) -->
      <details class="text-xs text-advent-muted pt-1">
        <summary class="cursor-pointer hover:text-advent-text font-medium select-none">
          Ou colar link/URL direto de imagem
        </summary>
        <div class="mt-2 flex gap-2">
          <input
            #urlInput
            type="url"
            [value]="value()"
            placeholder="https://exemplo.com/foto.jpg"
            (change)="onUrlInputChange(urlInput.value)"
            class="w-full rounded-card border border-advent-border px-3 py-1.5 text-xs text-advent-text focus:border-advent-blue focus:outline-none"
          />
        </div>
      </details>

      <input
        #fileInput
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="hidden"
        (change)="onFileInputChange($event)"
      />
    </div>
  `,
})
export class ImagePickerComponent {
  private readonly toast = inject(ToastService);

  readonly value = input<string>('');
  readonly label = input<string>('Imagem / Banner');
  readonly helpText = input<string>('Recomendado JPG, PNG ou WebP até 5MB');
  readonly maxSizeMb = input<number>(5);

  readonly imageSelected = output<File>();
  readonly imageRemoved = output<void>();
  readonly urlChanged = output<string>();

  readonly previewUrl = signal<string | null>(null);
  readonly selectedFileName = signal<string | null>(null);
  readonly isDragging = signal<boolean>(false);

  @ViewChild('fileInput') fileInputRef?: ElementRef<HTMLInputElement>;

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  private handleFile(file: File): void {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      this.toast.error('Formato inválido. Use JPG, PNG ou WebP.');
      return;
    }

    if (file.size > this.maxSizeMb() * 1024 * 1024) {
      this.toast.error(`A imagem deve ter no máximo ${this.maxSizeMb()}MB.`);
      return;
    }

    this.selectedFileName.set(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl.set(reader.result as string);
    };
    reader.readAsDataURL(file);

    this.imageSelected.emit(file);
  }

  removeImage(): void {
    this.previewUrl.set(null);
    this.selectedFileName.set(null);
    if (this.fileInputRef?.nativeElement) {
      this.fileInputRef.nativeElement.value = '';
    }
    this.imageRemoved.emit();
    this.urlChanged.emit('');
  }

  onUrlInputChange(newUrl: string): void {
    this.previewUrl.set(null);
    this.urlChanged.emit(newUrl.trim());
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npm test -- --include=src/app/shared/ui/image-picker/image-picker.component.spec.ts --watch=false`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/shared/ui/image-picker/
git commit -m "feat(ui): add accessible ImagePickerComponent with drag-drop, preview and validation"
```

---

### Task 3: Polish `AdminComunicadosPage` & `AdminEscalasPage`

**Files:**
- Modify: `frontend/src/app/features/admin/comunicados/admin-comunicados.page.ts`
- Modify: `frontend/src/app/features/admin/comunicados/admin-comunicados.page.spec.ts`
- Modify: `frontend/src/app/features/admin/escalas/admin-escalas.page.ts`
- Modify: `frontend/src/app/features/admin/escalas/admin-escalas.page.spec.ts`

**Improvements:**
- Integrate `SkeletonComponent` during loading.
- Empty states with integrated "+ Criar" CTA.
- Replace browser `confirm()` with `ConfirmDialogComponent`.
- Inline visual validation on form inputs with error text (e.g. "O título deve ter no mínimo 3 caracteres").
- Replace local banner timeouts with `ToastService.success()` and `ToastService.error()`.

- [ ] **Step 1: Update unit test with new dialog interaction in comunicados**

Verify `admin-comunicados.page.spec.ts` covers opening the delete modal, confirming deletion, and inline validation check.

- [ ] **Step 2: Update `AdminComunicadosPage` and `AdminEscalasPage` templates and component logic**

Inject `ToastService`, import `ConfirmDialogComponent`, `SkeletonComponent`, `ButtonComponent`, `BadgeComponent`.
Add signals `comunicadoToDelete = signal<Comunicado | null>(null)` and `escalaToDelete = signal<EscalaItem | null>(null)`.

- [ ] **Step 3: Run unit tests**

Run: `cd frontend && npm test -- --include=src/app/features/admin/comunicados/admin-comunicados.page.spec.ts,src/app/features/admin/escalas/admin-escalas.page.spec.ts --watch=false`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/features/admin/comunicados/ frontend/src/app/features/admin/escalas/
git commit -m "feat(admin): polish comunicados and escalas with skeletons, validation and confirm dialogs"
```

---

### Task 4: Polish `AdminEventosPage` & `AdminMinisteriosPage`

**Files:**
- Modify: `frontend/src/app/features/admin/eventos/admin-eventos.page.ts`
- Modify: `frontend/src/app/features/admin/eventos/admin-eventos.page.spec.ts`
- Modify: `frontend/src/app/features/admin/ministerios/admin-ministerios.page.ts`
- Modify: `frontend/src/app/features/admin/ministerios/admin-ministerios.page.spec.ts`

**Improvements:**
- Integrate `ImagePickerComponent` for event and ministry banner/photo uploads.
- Replace `window.confirm` with `ConfirmDialogComponent`.
- Replace "Carregando..." with card skeletons.
- Inline form validation messages.

- [ ] **Step 1: Update unit tests for eventos and ministerios**

- [ ] **Step 2: Update `AdminEventosPage` and `AdminMinisteriosPage`**

- [ ] **Step 3: Run unit tests**

Run: `cd frontend && npm test -- --include=src/app/features/admin/eventos/admin-eventos.page.spec.ts,src/app/features/admin/ministerios/admin-ministerios.page.spec.ts --watch=false`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/features/admin/eventos/ frontend/src/app/features/admin/ministerios/
git commit -m "feat(admin): integrate ImagePicker, Skeletons and ConfirmDialog in eventos and ministerios"
```

---

### Task 5: Polish `AdminOracoesPage`, `AdminContatosPage`, `AdminPgsPage`, `AdminHorariosPage` & `AdminDashboardPage`

**Files:**
- Modify: `frontend/src/app/features/admin/oracoes/admin-oracoes.page.ts`
- Modify: `frontend/src/app/features/admin/contatos/admin-contatos.page.ts`
- Modify: `frontend/src/app/features/admin/pgs/admin-pgs.page.ts`
- Modify: `frontend/src/app/features/admin/horarios/admin-horarios.page.ts`
- Modify: `frontend/src/app/features/admin/dashboard/admin-dashboard.page.ts`
- Modify associated spec files.

**Improvements:**
- Unify `ToastService` feedback across all admin views.
- Add `SkeletonComponent` and actionable empty states in PGs, Horários, Orações and Contatos.
- Add quick WhatsApp and confidentiality badges in Orações and Contatos.
- Replace remaining `confirm()` calls with `ConfirmDialogComponent`.

- [ ] **Step 1: Update components and specs for remaining admin pages**

- [ ] **Step 2: Run all admin specs**

Run: `cd frontend && npm test -- --include=src/app/features/admin/**/*.spec.ts --watch=false`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/features/admin/
git commit -m "feat(admin): standardize skeletons, toasts and empty states across remaining admin pages"
```

---

### Task 6: Global Build, TypeScript Typecheck and Verification

**Files:**
- All touched files

- [ ] **Step 1: Run full TypeScript static type checking**

Run: `cd frontend && npx tsc --noEmit`
Expected: Clean exit (0 errors)

- [ ] **Step 2: Run complete unit test suite**

Run: `cd frontend && npm test -- --watch=false`
Expected: All tests pass

- [ ] **Step 3: Verify Angular production build**

Run: `cd frontend && npm run build`
Expected: Build succeeds with 0 errors

- [ ] **Step 4: Commit and finalize**

```bash
git status
git commit -m "chore(admin): finalize full admin ui/ux overhaul and test verification"
```
