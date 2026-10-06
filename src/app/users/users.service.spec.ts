import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { vi } from 'vitest';
import { UsersService } from './users.service';
import { UserInput } from './user.model';

describe('UsersService', () => {
  let service: UsersService;
  const input: UserInput = {
    name: ' Ana Silva ',
    email: 'ANA@example.com',
    cpf: '529.982.247-25',
    phone: '(11) 98765-4321',
    phoneType: 'Celular',
  };
  beforeEach(() => {
    vi.useFakeTimers();
    service = TestBed.inject(UsersService);
  });
  afterEach(() => vi.useRealTimers());

  it('filtra ignorando acentos, caixa e espaços', async () => {
    const result = firstValueFrom(service.list(' JOAO '));
    await vi.advanceTimersByTimeAsync(400);
    expect((await result).map((user) => user.name)).toEqual(['João Oliveira']);
  });
  it('cria, normaliza e edita sem duplicar o usuário', async () => {
    const created = firstValueFrom(service.save(input));
    await vi.advanceTimersByTimeAsync(400);
    const user = await created;
    expect(user).toMatchObject({
      name: 'Ana Silva',
      email: 'ana@example.com',
      cpf: '52998224725',
      phone: '11987654321',
    });
    const edited = firstValueFrom(service.save({ ...user, name: 'Ana Souza' }, user.id));
    await vi.advanceTimersByTimeAsync(400);
    expect((await edited).id).toBe(user.id);
    const list = firstValueFrom(service.list('ana'));
    await vi.advanceTimersByTimeAsync(400);
    expect((await list).filter((item) => item.id === user.id)).toEqual([
      { ...user, name: 'Ana Souza' },
    ]);
  });
  it('rejeita e-mail duplicado', async () => {
    const result = firstValueFrom(service.save({ ...input, email: 'GIANA@example.com' }));
    const assertion = expect(result).rejects.toThrow('Já existe um usuário');
    await vi.advanceTimersByTimeAsync(400);
    await assertion;
  });
  it('informa quando o usuário editado não existe', async () => {
    const result = firstValueFrom(service.save(input, 'inexistente'));
    const assertion = expect(result).rejects.toThrow('Usuário não encontrado');
    await vi.advanceTimersByTimeAsync(400);
    await assertion;
  });
  it('não altera o estado quando uma operação é cancelada', async () => {
    const subscription = service.save(input).subscribe();
    subscription.unsubscribe();
    await vi.advanceTimersByTimeAsync(400);
    const result = firstValueFrom(service.list());
    await vi.advanceTimersByTimeAsync(400);
    expect(await result).toHaveLength(3);
  });
  it('retorna cópias para proteger os registros armazenados', async () => {
    const first = firstValueFrom(service.list());
    await vi.advanceTimersByTimeAsync(400);
    (await first)[0].name = 'Alterado';
    const second = firstValueFrom(service.list());
    await vi.advanceTimersByTimeAsync(400);
    expect((await second)[0].name).toBe('Giana Sandrini');
  });
});
