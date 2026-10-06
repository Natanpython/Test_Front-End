import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, of } from 'rxjs';
import { vi } from 'vitest';
import { App } from './app';
import { User } from './users/user.model';
import { UsersStore } from './users/users.store';

describe('App', () => {
  const users: User[] = Array.from({ length: 7 }, (_, index) => ({
    id: String(index),
    name: `Pessoa ${index}`,
    email: `pessoa${index}@example.com`,
    cpf: '52998224725',
    phone: '11987654321',
    phoneType: 'Celular',
  }));
  const store = {
    users: signal(users),
    loading: signal(false),
    error: signal<string | null>(null),
    search: vi.fn(),
    refresh: vi.fn(),
  };
  const dialog = { open: vi.fn() };
  const snackBar = { open: vi.fn() };
  beforeEach(() => {
    vi.clearAllMocks();
    store.users.set(users);
    store.loading.set(false);
    store.error.set(null);
    dialog.open.mockReturnValue({ afterClosed: () => of(undefined) });
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: MatDialog, useValue: dialog },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    }).overrideComponent(App, { set: { providers: [{ provide: UsersStore, useValue: store }] } });
  });

  it('renderiza nome, e-mail, edição e paginação', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('h1')?.textContent).toBe('Usuários cadastrados');
    expect(element.querySelectorAll('.user-card')).toHaveLength(6);
    expect(element.textContent).toContain('pessoa0@example.com');
    expect(element.querySelector('[aria-label="Editar Pessoa 0"]')).not.toBeNull();
    fixture.componentInstance.changePage(1);
    fixture.detectChanges();
    expect(element.querySelectorAll('.user-card')).toHaveLength(1);
    expect(element.textContent).toContain('Pessoa 6');
    fixture.componentInstance.changePage(1);
    expect(fixture.componentInstance.currentPage()).toBe(1);
  });
  it('encaminha o texto digitado e volta à primeira página', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    fixture.componentInstance.changePage(1);
    const input = (fixture.nativeElement as HTMLElement).querySelector('input')!;
    input.value = 'Ana';
    input.dispatchEvent(new Event('input'));
    expect(store.search).toHaveBeenCalledWith('Ana');
    expect(fixture.componentInstance.page()).toBe(0);
  });
  it('renderiza loading, erro com retry e estado vazio', () => {
    const fixture = TestBed.createComponent(App);
    const element: HTMLElement = fixture.nativeElement;
    store.loading.set(true);
    fixture.detectChanges();
    expect(element.textContent).toContain('Buscando usuários');
    store.loading.set(false);
    store.error.set('Falha ao carregar');
    fixture.detectChanges();
    expect(element.querySelector('[role="alert"]')?.textContent).toContain('Falha');
    element.querySelector<HTMLButtonElement>('.state button')?.click();
    expect(store.refresh).toHaveBeenCalledOnce();
    store.error.set(null);
    store.users.set([]);
    fixture.detectChanges();
    expect(element.textContent).toContain('Nenhum usuário encontrado');
  });
  it('não atualiza a lista quando o modal é cancelado', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.componentInstance.openUser();
    expect(dialog.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ data: null }),
    );
    expect(store.refresh).not.toHaveBeenCalled();
  });
  it('atualiza a lista e confirma cadastro e edição', async () => {
    dialog.open.mockReturnValue({ afterClosed: () => of(users[0]) });
    const fixture = TestBed.createComponent(App);
    await fixture.componentInstance.openUser();
    expect(snackBar.open).toHaveBeenCalledWith(
      'Usuário cadastrado com sucesso.',
      'Fechar',
      expect.anything(),
    );
    await fixture.componentInstance.openUser(users[0]);
    expect(dialog.open).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ data: users[0] }),
    );
    expect(snackBar.open).toHaveBeenLastCalledWith(
      'Usuário atualizado com sucesso.',
      'Fechar',
      expect.anything(),
    );
    expect(store.refresh).toHaveBeenCalledTimes(2);
  });
  it('impede aberturas concorrentes e permite reabrir depois de cancelar', async () => {
    const closed = new Subject<User | undefined>();
    dialog.open.mockReturnValue({ afterClosed: () => closed });
    const app = TestBed.createComponent(App).componentInstance;
    const opening = app.openUser();
    await app.openUser(users[0]);
    await vi.waitFor(() => expect(dialog.open).toHaveBeenCalledTimes(1));
    await app.openUser();
    expect(dialog.open).toHaveBeenCalledTimes(1);
    closed.next(undefined);
    closed.complete();
    await opening;
    dialog.open.mockReturnValue({ afterClosed: () => of(undefined) });
    await app.openUser();
    expect(dialog.open).toHaveBeenCalledTimes(2);
  });
  it('informa falha ao abrir e permite tentar novamente', async () => {
    dialog.open.mockImplementationOnce(() => {
      throw new Error('Falha ao abrir');
    });
    const app = TestBed.createComponent(App).componentInstance;
    await app.openUser();
    expect(snackBar.open).toHaveBeenCalledWith(
      'Não foi possível abrir o formulário. Tente novamente.',
      'Fechar',
      expect.anything(),
    );
    await app.openUser();
    expect(dialog.open).toHaveBeenCalledTimes(2);
  });
  it('não abre o modal se o componente for destruído durante o carregamento', async () => {
    const fixture = TestBed.createComponent(App);
    const opening = fixture.componentInstance.openUser();
    fixture.destroy();
    await opening;
    expect(dialog.open).not.toHaveBeenCalled();
  });
});
