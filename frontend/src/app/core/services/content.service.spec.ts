import { TestBed } from '@angular/core/testing';
import { ContentService } from './content.service';

describe('ContentService', () => {
  it('carrega horários institucionais iniciais', () => {
    const service = TestBed.inject(ContentService);
    expect(service.horarios().length).toBeGreaterThan(0);
    expect(service.horarios()[0].titulo).toBeTruthy();
    expect(service.horarios()[0].dia).toBeTruthy();
  });
});
