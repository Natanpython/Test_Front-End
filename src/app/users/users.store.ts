import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, catchError, map, of, startWith, switchMap, timer } from 'rxjs';
import { User } from './user.model';
import { UsersService } from './users.service';

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
}

/** Uma instância por tela; o ciclo de vida encerra a busca ao sair dela. */
@Injectable()
export class UsersStore {
  private readonly service = inject(UsersService);
  private readonly requests = new BehaviorSubject({ term: '', wait: 0 });
  private readonly state = signal<UsersState>({ users: [], loading: true, error: null });
  readonly users = computed(() => this.state().users);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  constructor() {
    this.requests
      .pipe(
        // O switchMap externo cancela imediatamente a busca anterior, inclusive no debounce.
        switchMap(({ term, wait }) =>
          timer(wait).pipe(
            switchMap(() => this.service.list(term)),
            map((users) => ({ users, loading: false, error: null }) satisfies UsersState),
            catchError(() =>
              of<UsersState>({
                users: [],
                loading: false,
                error: 'Não foi possível carregar os usuários. Tente novamente.',
              }),
            ),
            startWith<UsersState>({ users: [], loading: true, error: null }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((state) => this.state.set(state));
  }

  search(term: string): void {
    const normalized = term.trim();
    if (normalized === this.requests.value.term) return;
    this.requests.next({ term: normalized, wait: 300 });
  }

  refresh(): void {
    this.requests.next({ term: this.requests.value.term, wait: 0 });
  }
}
