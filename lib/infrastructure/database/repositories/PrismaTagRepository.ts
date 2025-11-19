import { ITagRepository } from '@/lib/domain/repositories/ITagRepository';
import { Tag, CreateTagDTO, UpdateTagDTO } from '@/lib/domain/entities/Tag';
import prisma from '../prisma-client';

export class PrismaTagRepository implements ITagRepository {
  async findAll(): Promise<Tag[]> {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });
    return tags as Tag[];
  }

  async findById(id: string): Promise<Tag | null> {
    const tag = await prisma.tag.findUnique({
      where: { id },
    });
    return tag as Tag | null;
  }

  async findByName(name: string): Promise<Tag | null> {
    const tag = await prisma.tag.findUnique({
      where: { name },
    });
    return tag as Tag | null;
  }

  async create(data: CreateTagDTO): Promise<Tag> {
    const tag = await prisma.tag.create({
      data,
    });
    return tag as Tag;
  }

  async update(id: string, data: UpdateTagDTO): Promise<Tag> {
    const tag = await prisma.tag.update({
      where: { id },
      data,
    });
    return tag as Tag;
  }

  async delete(id: string): Promise<void> {
    await prisma.tag.delete({
      where: { id },
    });
  }
}
