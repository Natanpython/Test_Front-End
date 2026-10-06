import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { UserDialog } from './user-dialog';
import { User } from './user.model';
import { UsersService } from './users.service';

describe('UserDialog', () => {
  const user: User = {
    id: '1',
    name: 'Ana',
    email: 'ana@example.com',
    cpf: '52998224725',
    phone: '11987654321',
    phoneType: 'Celular',
  };
  const save = vi.fn();
  const ref = { close: vi.fn(), disableClose: false };
  function create(data: User | null = null) {
    TestBed.configureTestingModule({
      imports: [UserDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: ref },
        { provide: UsersService, useValue: { save } },
      ],
    });
    const fixture = TestBed.createComponent(UserDialog);
    fixture.detectChanges();
    return fixture;
  }
  beforeEach(() => {
    vi.clearAllMocks();
    ref.disableClose = false;
    save.mockReturnValue(of(user));
  });

  it('desabilita salvar quando vazio e exibe os erros por campo', () => {
    const fixture = create();
    const dialog = fixture.componentInstance;
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled).toBe(true);
    dialog.save();
    fixture.detectChanges();
    expect(save).not.toHaveBeenCalled();
    expect(element.textContent).toContain('Informe o e-mail.');
    expect(element.textContent).toContain('Informe o nome.');
    expect(element.textContent).toContain('Informe o CPF.');
    expect(element.textContent).toContain('Informe o telefone.');
  });
  it('preenche os campos na edição e salva com o mesmo id', () => {
    const fixture = create(user);
    const dialog = fixture.componentInstance;
    expect(dialog.form.controls.name.value).toBe('Ana');
    expect(dialog.form.valid).toBe(true);
    dialog.form.controls.name.setValue('Ana Souza');
    dialog.save();
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ name: 'Ana Souza' }), '1');
    expect(ref.close).toHaveBeenCalledWith(user);
  });
  it('envia cadastro sem id ao submeter o formulário', () => {
    const fixture = create();
    fixture.componentInstance.form.patchValue(user);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    element
      .querySelector('form')
      ?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ name: 'Ana' }), undefined);
    expect(ref.close).toHaveBeenCalledWith(user);
  });
  it('bloqueia envio duplo e fechamento durante o salvamento', () => {
    const pending = new Subject<User>();
    save.mockReturnValue(pending);
    const dialog = create(user).componentInstance;
    dialog.save();
    dialog.save();
    expect(save).toHaveBeenCalledTimes(1);
    expect(dialog.saving()).toBe(true);
    expect(dialog.form.disabled).toBe(true);
    expect(ref.disableClose).toBe(true);
    pending.next(user);
    pending.complete();
    expect(dialog.saving()).toBe(false);
    expect(ref.disableClose).toBe(false);
  });
  it('preserva os dados e permite corrigir após erro', () => {
    save.mockReturnValue(throwError(() => new Error('E-mail duplicado')));
    const fixture = create(user);
    const dialog = fixture.componentInstance;
    dialog.save();
    fixture.detectChanges();
    expect(dialog.error()).toBe('E-mail duplicado');
    expect(dialog.form.enabled).toBe(true);
    expect(dialog.form.controls.name.value).toBe('Ana');
    expect(ref.close).not.toHaveBeenCalled();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')?.textContent,
    ).toContain('E-mail duplicado');
  });
  it('usa mensagem amigável para um erro desconhecido', () => {
    save.mockReturnValue(throwError(() => null));
    const dialog = create(user).componentInstance;
    dialog.save();
    expect(dialog.error()).toContain('Não foi possível salvar');
  });
});
