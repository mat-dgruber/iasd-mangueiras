import { TestBed } from '@angular/core/testing';
import { AdminCmsService } from './admin-cms.service';
import { FirebaseService } from '../firebase/firebase.service';

describe('AdminCmsService', () => {
  let service: AdminCmsService;

  describe('Sem conexão Firestore', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          AdminCmsService,
          {
            provide: FirebaseService,
            useValue: { firestore: null },
          },
        ],
      });
      service = TestBed.inject(AdminCmsService);
    });

    it('retorna array vazio para getHorariosRegulares quando Firestore é nulo', async () => {
      const res = await service.getHorariosRegulares();
      expect(res).toEqual([]);
    });

    it('retorna array vazio para getAvisosHorarios quando Firestore é nulo', async () => {
      const res = await service.getAvisosHorarios();
      expect(res).toEqual([]);
    });

    it('lança erro ao tentar salvar horário regular sem Firestore', async () => {
      await expect(service.saveHorarioRegular({ titulo: 'Culto' })).rejects.toThrow(
        'Firestore indisponível',
      );
    });

    it('lança erro ao tentar deletar horário regular sem Firestore', async () => {
      await expect(service.deleteHorarioRegular('id-123')).rejects.toThrow('Firestore indisponível');
    });

    it('lança erro ao tentar alternar status de horário regular sem Firestore', async () => {
      await expect(service.toggleHorarioAtivo('id-123', false)).rejects.toThrow(
        'Firestore indisponível',
      );
    });

    it('lança erro ao tentar salvar aviso sem Firestore', async () => {
      await expect(
        service.saveAvisoHorario({ titulo: 'Aviso', mensagem: 'Msg' }),
      ).rejects.toThrow('Firestore indisponível');
    });

    it('rejeita arquivo maior que 5 MB', async () => {
      const largeFile = new File(['a'.repeat(5 * 1024 * 1024 + 1)], 'test.png');
      await expect(service.uploadBanner(largeFile)).rejects.toThrow(
        'O arquivo excede o tamanho máximo permitido de 5 MB.',
      );
    });

    it('rejeita arquivo com magic bytes inválidos', async () => {
      const fakePng = new File([new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03])], 'malicious.png');
      await expect(service.uploadBanner(fakePng)).rejects.toThrow(
        'Formato de imagem inválido. Utilize JPEG, PNG ou WebP.',
      );
    });
  });
});
