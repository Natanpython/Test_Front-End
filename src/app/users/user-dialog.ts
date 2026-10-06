import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { finalize } from 'rxjs';
import { User, PhoneType } from './user.model';
import { UsersService } from './users.service';
import { cpfValidator, nonBlank, phoneValidator } from './user.validators';

@Component({
  selector: 'app-user-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './user-dialog.html',
  styleUrl: './user-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDialog {
  readonly user = inject<User | null>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<UserDialog, User>);
  private readonly service = inject(UsersService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder).nonNullable;
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly form = this.fb.group({
    email: [
      this.user?.email ?? '',
      [Validators.required, Validators.email, Validators.maxLength(254)],
    ],
    name: [this.user?.name ?? '', [Validators.required, nonBlank, Validators.maxLength(120)]],
    cpf: [this.user?.cpf ?? '', [Validators.required, cpfValidator]],
    phone: [this.user?.phone ?? '', [Validators.required, phoneValidator]],
    phoneType: [this.user?.phoneType ?? ('Celular' as PhoneType), Validators.required],
  });

  save(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set(null);
    this.saving.set(true);
    this.dialogRef.disableClose = true;
    const input = this.form.getRawValue();
    this.form.disable();
    this.service
      .save(input, this.user?.id)
      .pipe(
        finalize(() => {
          this.saving.set(false);
          this.dialogRef.disableClose = false;
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (user) => this.dialogRef.close(user),
        error: (error: unknown) =>
          this.error.set(
            error instanceof Error ? error.message : 'Não foi possível salvar. Tente novamente.',
          ),
      });
  }
}
