import { Account, CreateAccountDTO, UpdateAccountDTO } from '../entities/Account';

export interface IAccountRepository {
  findAll(): Promise<Account[]>;
  findById(id: string): Promise<Account | null>;
  findByType(type: string): Promise<Account[]>;
  create(data: CreateAccountDTO): Promise<Account>;
  update(id: string, data: UpdateAccountDTO): Promise<Account>;
  delete(id: string): Promise<void>;
  getTotalBalance(): Promise<number>;
}
