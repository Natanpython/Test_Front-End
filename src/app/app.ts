import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { User } from './users/user.model';
import { UsersStore } from './users/users.store';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, MatButtonModule, MatProgressSpinnerModule],
  providers: [UsersStore],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly store = inject(UsersStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  private userDialogActive = false;
  readonly search = new FormControl('', { nonNullable: true });
  readonly page = signal(0);
  readonly pageSize = 6;
  readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.store.users().length / this.pageSize)),
  );
  readonly currentPage = computed(() => Math.min(this.page(), this.pageCount() - 1));
  readonly visibleUsers = computed(() =>
    this.store
      .users()
      .slice(this.currentPage() * this.pageSize, (this.currentPage() + 1) * this.pageSize),
  );

  constructor() {
    this.search.valueChanges.pipe(takeUntilDestroyed()).subscribe((term) => {
      this.page.set(0);
      this.store.search(term);
    });
  }

  changePage(delta: number): void {
    this.page.set(Math.max(0, Math.min(this.currentPage() + delta, this.pageCount() - 1)));
  }

  async openUser(user: User | null = null): Promise<void> {
    if (this.userDialogActive || this.destroyRef.destroyed) return;
    this.userDialogActive = true;
    try {
      const { UserDialog } = await import('./users/user-dialog');
      if (this.destroyRef.destroyed) return;
      const ref = this.dialog.open<InstanceType<typeof UserDialog>, User | null, User>(UserDialog, {
        data: user,
        width: '560px',
        maxWidth: 'calc(100vw - 32px)',
        autoFocus: 'first-tabbable',
      });
      const saved = await firstValueFrom(
        ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)),
        { defaultValue: undefined },
      );
      if (!saved || this.destroyRef.destroyed) return;
      this.store.refresh();
      this.snackBar.open(
        user ? 'Usuário atualizado com sucesso.' : 'Usuário cadastrado com sucesso.',
        'Fechar',
        { duration: 4500 },
      );
    } catch {
      if (!this.destroyRef.destroyed) {
        this.snackBar.open('Não foi possível abrir o formulário. Tente novamente.', 'Fechar', {
          duration: 4500,
        });
      }
    } finally {
      this.userDialogActive = false;
    }
  }
}
