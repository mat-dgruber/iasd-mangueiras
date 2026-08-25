import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HorariosPage } from './horarios.page';
import { ToastService } from '../../shared/ui/toast/toast.service';

describe('HorariosPage', () => {
  let fixture: ComponentFixture<HorariosPage>;
  let component: HorariosPage;
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorariosPage],
      providers: [provideRouter([]), ToastService],
    }).compileComponents();

    toastService = TestBed.inject(ToastService);
    fixture = TestBed.createComponent(HorariosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('exibe título e seções de horários e localização', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Horários e Localização');
    expect(text).toContain('Programação Semanal');
    expect(text).toContain('Como Chegar');
    expect(text).toContain('Escola Sabatina');
    expect(text).toContain('Culto Divino');
  });

  it('renderiza o badge compacto de pôr do sol e próximo culto', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Pôr do sol hoje em Tatuí');
    expect(text).toContain('Próximo Culto:');
  });

  it('renderiza botões de rotas de mobilidade (Google Maps, Waze, Apple Maps, Uber)', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const gmaps = compiled.querySelector('a[href*="google.com/maps"]');
    const waze = compiled.querySelector('a[href*="waze.com"]');
    const apple = compiled.querySelector('a[href*="maps.apple.com"]');
    const uber = compiled.querySelector('a[href*="uber.com"]');

    expect(gmaps).toBeTruthy();
    expect(waze).toBeTruthy();
    expect(apple).toBeTruthy();
    expect(uber).toBeTruthy();
  });

  it('renderiza o painel de comodidades e acessibilidade', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Estacionamento');
    expect(text).toContain('Acessibilidade');
    expect(text).toContain('Espaço Infantil');
    expect(text).toContain('Ambiente Climatizado');
  });

  it('copia o endereço e dispara notificação no ToastService', async () => {
    const toastSpy = vi.spyOn(toastService, 'success');
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);

    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextSpy,
      },
    });

    await component.copyAddress();

    expect(writeTextSpy).toHaveBeenCalledWith(expect.stringContaining('Tatuí'));
    expect(toastSpy).toHaveBeenCalledWith(
      expect.stringContaining('copiado'),
      expect.any(String),
    );
  });

  it('gera links válidos para o Google Calendar e WhatsApp nos cultos', () => {
    const horario = component.horarios()[0];
    const gCalLink = component.getGoogleCalendarLink(horario);
    const waLink = component.getWhatsAppLink(horario);

    expect(gCalLink).toContain('calendar.google.com/calendar/render');
    expect(gCalLink).toContain('action=TEMPLATE');
    expect(waLink).toContain('api.whatsapp.com/send');
    expect(waLink).toContain(encodeURIComponent(horario.titulo));
  });

  it('dispara o download do arquivo .ics ao acionar a ação de calendário', () => {
    const createUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-ics-url');
    const revokeUrlSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    const horario = component.horarios()[0];
    component.toggleCalendarMenu(horario.titulo);
    expect(component.openCalendarMenuId()).toBe(horario.titulo);

    component.downloadIcsAndClose(horario);

    expect(createUrlSpy).toHaveBeenCalled();
    expect(revokeUrlSpy).toHaveBeenCalledWith('blob:mock-ics-url');
    expect(component.openCalendarMenuId()).toBeNull();

    createUrlSpy.mockRestore();
    revokeUrlSpy.mockRestore();
  });

  it('alterna o menu de calendário por culto e fecha ao pressionar Escape', () => {
    const horario = component.horarios()[0];
    expect(component.openCalendarMenuId()).toBeNull();

    component.toggleCalendarMenu(horario.titulo);
    expect(component.openCalendarMenuId()).toBe(horario.titulo);

    component.onEscape();
    expect(component.openCalendarMenuId()).toBeNull();
  });

  it('permite alternar perguntas frequentes no acordeão', () => {
    const firstFaq = component['faqs'][0].question;
    expect(component.isExpanded(firstFaq)).toBe(true);

    component.toggleFaq(firstFaq);
    expect(component.isExpanded(firstFaq)).toBe(false);

    component.toggleFaq(firstFaq);
    expect(component.isExpanded(firstFaq)).toBe(true);
  });
});
