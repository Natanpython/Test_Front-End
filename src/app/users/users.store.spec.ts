import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { User } from './user.model';
import { UsersService } from './users.service';
import { UsersStore } from './users.store';

describe('UsersStore', () => {
  const user: User = {
    id: '1',
    name: 'Ana',
    email: 'ana@example.com',
    cpf: '52998224725',
    phone: '11987654321',
    phoneType: 'Celular',
  };
  let list: ReturnType<typeof vi.fn<(term: string) => Observable<User[]>>>;
  let store: UsersStore;
  beforeEach(() => {
    vi.useFakeTimers();
    list = vi.fn<(term: string) => Observable<User[]>>().mockReturnValue(of([user]));
    TestBed.configureTestingModule({
      providers: [UsersStore, { provide: UsersService, useValue: { list } }],
    });
    store = TestBed.inject(UsersStore);
  });
  afterEach(() => vi.useRealTimers());

  it('carrega os usuários e encerra o loading', async () => {
    expect(store.loading()).toBe(true);
    await vi.advanceTimersByTimeAsync(0);
    expect(store.users()).toEqual([user]);
    expect(store.loading()).toBe(false);
  });
  it('aguarda 300 ms após a última digitação e ignora termos repetidos', async () => {
    await vi.advanceTimersByTimeAsync(0);
    list.mockClear();
    store.search('A');
    await vi.advanceTimersByTimeAsync(200);
    store.search('Ana');
    await vi.advanceTimersByTimeAsync(299);
    expect(list).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(list).toHaveBeenCalledExactlyOnceWith('Ana');
    store.search(' Ana ');
    await vi.advanceTimersByTimeAsync(300);
    expect(list).toHaveBeenCalledTimes(1);
  });
  it('cancela a requisição anterior imediatamente e ignora respostas antigas', async () => {
    const old = new Subject<User[]>();
    const cancelled = vi.fn();
    list.mockReturnValueOnce(
      new Observable((subscriber) => {
        const subscription = old.subscribe(subscriber);
        return () => {
          cancelled();
          subscription.unsubscribe();
        };
      }),
    );
    await vi.advanceTimersByTimeAsync(0);
    store.search('Ana');
    expect(cancelled).toHaveBeenCalledTimes(1);
    old.next([{ ...user, name: 'Resposta antiga' }]);
    expect(store.users()).toEqual([]);
    await vi.advanceTimersByTimeAsync(300);
    expect(store.users()).toEqual([user]);
  });
  it('exibe erro e permite tentar novamente sem matar o fluxo', async () => {
    list.mockReturnValueOnce(throwError(() => new Error('Falha')));
    await vi.advanceTimersByTimeAsync(0);
    expect(store.error()).toContain('Não foi possível');
    expect(store.loading()).toBe(false);
    store.refresh();
    await vi.advanceTimersByTimeAsync(0);
    expect(store.error()).toBeNull();
    expect(store.users()).toEqual([user]);
  });
  it('encerra a subscription ao destruir o contexto', async () => {
    const cancelled = vi.fn();
    list.mockReturnValue(new Observable(() => cancelled));
    await vi.advanceTimersByTimeAsync(0);
    TestBed.resetTestingModule();
    expect(cancelled).toHaveBeenCalledTimes(1);
  });
});
