import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Component, signal } from '@angular/core';
import { DateTimePickerComponent } from './datetime-picker.component';

@Component({
  standalone: true,
  imports: [DateTimePickerComponent, ReactiveFormsModule],
  template: `
    <app-ui-datetime-picker
      [formControl]="control"
      [label]="'Data Teste'"
      [placeholder]="'Selecione...'"
      [comHorario]="comHorario()"
    />
  `,
})
class TestHostComponent {
  control = new FormControl('');
  comHorario = signal(true);
}

describe('DateTimePickerComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let component: DateTimePickerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, DateTimePickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should format ISO string to localized display string with time', () => {
    host.control.setValue('2026-12-31T20:30:00');
    fixture.detectChanges();

    const inputTrigger = fixture.nativeElement.querySelector('button[aria-haspopup="dialog"]');
    expect(inputTrigger.textContent).toContain('31/12/2026');
    expect(inputTrigger.textContent).toContain('20:30');
  });

  it('should format ISO string to localized display string without time when comHorario is false', () => {
    host.comHorario.set(false);
    host.control.setValue('2026-12-31');
    fixture.detectChanges();

    const inputTrigger = fixture.nativeElement.querySelector('button[aria-haspopup="dialog"]');
    expect(inputTrigger.textContent).toContain('31/12/2026');
    expect(inputTrigger.textContent).not.toContain('às');
  });

  it('should toggle popover open and close on trigger click and Escape key', () => {
    const trigger = fixture.nativeElement.querySelector('button[aria-haspopup="dialog"]');
    expect(component.isOpen()).toBe(false);

    trigger.click();
    fixture.detectChanges();
    expect(component.isOpen()).toBe(true);

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    window.dispatchEvent(event);
    fixture.detectChanges();
    expect(component.isOpen()).toBe(false);
  });

  it('should update form control value when selecting a day and time', () => {
    component.isOpen.set(true);
    fixture.detectChanges();

    component.currentViewYear.set(2026);
    component.currentViewMonth.set(11);
    component.selectDay(15);
    component.setHour(19);
    component.setMinute(45);
    component.applyAndClose();
    fixture.detectChanges();

    expect(host.control.value).toBe('2026-12-15T19:45:00');
  });

  it('should clear value when clear button is clicked', () => {
    host.control.setValue('2026-12-31T20:30:00');
    fixture.detectChanges();

    component.clearValue(new MouseEvent('click'));
    fixture.detectChanges();

    expect(host.control.value).toBe('');
    expect(component.value()).toBe('');
  });

  it('should handle month and decade navigation', () => {
    component.currentViewYear.set(2026);
    component.currentViewMonth.set(5);

    component.previousMonth();
    expect(component.currentViewMonth()).toBe(4);

    component.nextMonth();
    expect(component.currentViewMonth()).toBe(5);

    component.selectMonth(0);
    expect(component.currentViewMonth()).toBe(0);
    expect(component.viewMode()).toBe('days');

    component.selectYear(2028);
    expect(component.currentViewYear()).toBe(2028);
    expect(component.viewMode()).toBe('months');

    const baseYear = component.baseDecadeYear();
    component.nextDecade();
    expect(component.baseDecadeYear()).toBe(baseYear + 12);

    component.previousDecade();
    expect(component.baseDecadeYear()).toBe(baseYear);
  });

  it('should set current date on goToToday and current time on setCurrentTime', () => {
    const now = new Date();
    component.goToToday();
    expect(component.currentViewMonth()).toBe(now.getMonth());
    expect(component.currentViewYear()).toBe(now.getFullYear());
    expect(component.selectedDayState()).toBe(now.getDate());

    component.setCurrentTime();
    expect(component.selectedHour()).toBe(now.getHours());
    expect(component.selectedMinute()).toBe(now.getMinutes());
  });

  it('should step and change hours and minutes correctly', () => {
    component.selectedHour.set(23);
    component.stepHour(1);
    expect(component.selectedHour()).toBe(0);

    component.stepHour(-1);
    expect(component.selectedHour()).toBe(23);

    component.selectedMinute.set(55);
    component.stepMinute(5);
    expect(component.selectedMinute()).toBe(0);

    component.stepMinute(-5);
    expect(component.selectedMinute()).toBe(55);

    const hourEvent = { target: { value: '14' } } as unknown as Event;
    component.onHourChange(hourEvent);
    expect(component.selectedHour()).toBe(14);

    const minEvent = { target: { value: '30' } } as unknown as Event;
    component.onMinuteChange(minEvent);
    expect(component.selectedMinute()).toBe(30);
  });

  it('should not open when disabled', () => {
    host.control.disable();
    fixture.detectChanges();

    component.toggleOpen();
    expect(component.isOpen()).toBe(false);
  });

  it('should auto-apply and close when comHorario is false upon day selection', () => {
    host.comHorario.set(false);
    fixture.detectChanges();

    component.isOpen.set(true);
    component.currentViewYear.set(2026);
    component.currentViewMonth.set(11);
    component.selectDay(25);
    fixture.detectChanges();

    expect(component.isOpen()).toBe(false);
    expect(host.control.value).toBe('2026-12-25');
  });

  it('should close popover on outside click', () => {
    component.isOpen.set(true);
    fixture.detectChanges();

    const outsideClick = new MouseEvent('click');
    document.dispatchEvent(outsideClick);
    fixture.detectChanges();

    expect(component.isOpen()).toBe(false);
  });
});
