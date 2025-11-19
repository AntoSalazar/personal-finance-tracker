import { Tag, CreateTagDTO, UpdateTagDTO } from '../entities/Tag';

export interface ITagRepository {
  findAll(): Promise<Tag[]>;
  findById(id: string): Promise<Tag | null>;
  findByName(name: string): Promise<Tag | null>;
  create(data: CreateTagDTO): Promise<Tag>;
  update(id: string, data: UpdateTagDTO): Promise<Tag>;
  delete(id: string): Promise<void>;
}
