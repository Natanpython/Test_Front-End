export type PhoneType = 'Celular' | 'Fixo';

export interface UserInput {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  phoneType: PhoneType;
}

export interface User extends UserInput {
  id: string;
}
