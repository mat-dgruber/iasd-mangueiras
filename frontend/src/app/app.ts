import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { FooterComponent } from './layout/footer/footer.component';
import { HeaderComponent } from './layout/header/header.component';
import { ToastContainerComponent } from './shared/ui/toast/toast-container.component';
import { GlobalSearchDialogComponent } from './shared/ui/search/global-search-dialog.component';

@Component({
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    ToastContainerComponent,
    GlobalSearchDialogComponent,
  ],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);
  protected readonly currentUrl = signal<string>('');

  @ViewChild(GlobalSearchDialogComponent) searchDialog?: GlobalSearchDialogComponent;

  protected readonly isAdminRoute = computed(() => {
    const url = this.currentUrl();
    return url.startsWith('/admin');
  });

  constructor() {
    this.currentUrl.set(this.router.url || '');
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects || event.url);
      });
  }

  openSearch(): void {
    this.searchDialog?.open();
  }
}
