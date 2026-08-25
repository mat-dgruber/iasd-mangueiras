import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { FooterComponent } from './layout/footer/footer.component';
import { HeaderComponent } from './layout/header/header.component';
import { ToastContainerComponent } from './shared/ui/toast/toast-container.component';

@Component({
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastContainerComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);
  protected readonly currentUrl = signal<string>('');

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
}
