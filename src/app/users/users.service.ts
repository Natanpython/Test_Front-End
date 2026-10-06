import { Injectable } from '@angular/core';
import { Observable, map, timer } from 'rxjs';
import { User, UserInput } from './user.model';

export function normalizeName(value: string): string {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');
}

/** Mock assíncrono: trocar este serviço por HttpClient não muda a interface da tela. */
@Injectable({ providedIn: 'root' })
export class UsersService {
  private users: User[] = [
    {
      id: '1',
      name: 'Giana Sandrini',
      email: 'giana@example.com',
      cpf: '52998224725',
      phone: '11987654321',
      phoneType: 'Celular',
    },
    {
      id: '2',
      name: 'João Oliveira',
      email: 'joao@example.com',
      cpf: '11144477735',
      phone: '2134567890',
      phoneType: 'Fixo',
    },
    {
      id: '3',
      name: 'Marina Costa',
      email: 'marina@example.com',
      cpf: '12345678909',
      phone: '31987654321',
      phoneType: 'Celular',
    },
  ];

  list(term = ''): Observable<User[]> {
    return timer(400).pipe(
      map(() =>
        this.users
          .filter((user) => normalizeName(user.name).includes(normalizeName(term)))
          .map((user) => ({ ...user })),
      ),
    );
  }

  save(input: UserInput, id?: string): Observable<User> {
    return timer(400).pipe(
      map(() => {
        const data: UserInput = {
          ...input,
          name: input.name.trim(),
          email: input.email.trim().toLowerCase(),
          cpf: input.cpf.replace(/\D/g, ''),
          phone: input.phone.replace(/\D/g, ''),
        };
        if (this.users.some((user) => user.id !== id && user.email.toLowerCase() === data.email)) {
          throw new Error('Já existe um usuário com este e-mail.');
        }
        if (id !== undefined && !this.users.some((user) => user.id === id)) {
          throw new Error('Usuário não encontrado. Atualize a listagem e tente novamente.');
        }
        const user: User = { ...data, id: id ?? crypto.randomUUID() };
        this.users =
          id === undefined
            ? [...this.users, user]
            : this.users.map((current) => (current.id === id ? user : current));
        return { ...user };
      }),
    );
  }
}
