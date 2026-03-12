export interface SaveUserCommand {
  id: number;
  nome: string;
  dtNascimento: string;
  status: boolean;
  telefones: string[];
}
