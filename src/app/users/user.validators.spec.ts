import { FormControl } from '@angular/forms';
import { cpfValidator, nonBlank, phoneValidator } from './user.validators';

describe('Validações do usuário', () => {
  it.each(['52998224725', '111.444.777-35', '12345678909'])('aceita CPF válido: %s', (value) => {
    expect(cpfValidator(new FormControl(value))).toBeNull();
  });
  it.each(['11111111111', '12345678900', '52998224715', '123', 'abc52998224725'])(
    'rejeita CPF inválido: %s',
    (value) => {
      expect(cpfValidator(new FormControl(value))).toEqual({ cpf: true });
    },
  );
  it.each([
    '11987654321',
    '(21) 3456-7890',
    '(11) 98765-4321',
    '11 98765-4321',
    '(11)987654321',
    '2134567890',
  ])('aceita telefone: %s', (value) => {
    expect(phoneValidator(new FormControl(value))).toBeNull();
  });
  it.each([
    '123',
    '00987654321',
    '11abc987654321',
    '11887654321',
    '++11987654321',
    '((11987654321',
    '11)987654321',
    '(11 987654321',
    '11  98765-4321',
    '11987-654321',
    '11\n987654321',
  ])('rejeita telefone: %s', (value) => {
    expect(phoneValidator(new FormControl(value))).toEqual({ phone: true });
  });
  it('deixa campos vazios para o required e rejeita nome só com espaços', () => {
    expect(cpfValidator(new FormControl(''))).toBeNull();
    expect(phoneValidator(new FormControl(''))).toBeNull();
    expect(nonBlank(new FormControl('   '))).toEqual({ required: true });
    expect(nonBlank(new FormControl('Ana'))).toBeNull();
  });
});
