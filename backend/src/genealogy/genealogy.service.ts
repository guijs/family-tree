import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export interface CreatePersonDto {
  treeId: string;
  firstName: string;
  lastName: string;
  parentId?: string;
  gender?: string;
  birthDate?: Date;
  deathDate?: Date;
  isLiving?: boolean;
}

export interface CreateTreeDto {
  name: string;
  description?: string;
  isPublic?: boolean;
}

@Injectable()
export class GenealogyService {
  private prisma: PrismaClient;

  constructor(@Inject('PRISMA_CLIENT') prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  // Tree operations
  async createTree(userId: string, dto: CreateTreeDto) {
    const tree = await this.prisma.genealogyTree.create({
      data: {
        name: dto.name,
        description: dto.description,
        isPublic: dto.isPublic ?? false,
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return tree;
  }

  async findTrees(userId: string) {
    return this.prisma.genealogyTree.findMany({
      where: {
        deletedAt: null,
        OR: [
          { isPublic: true },
          { members: { some: { userId } } },
        ],
      },
      include: {
        members: {
          where: { userId },
          select: {
            role: true,
          },
        },
      },
    });
  }

  async findTreeById(treeId: string, userId: string) {
    const tree = await this.prisma.genealogyTree.findUnique({
      where: { id: treeId, deletedAt: null },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!tree) {
      throw new NotFoundException(`Tree with ID ${treeId} not found`);
    }

    return tree;
  }

  // Person operations with recursive queries
  async createPerson(dto: CreatePersonDto) {
    const person = await this.prisma.person.create({
      data: {
        treeId: dto.treeId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        parentId: dto.parentId,
        gender: dto.gender,
        birthDate: dto.birthDate,
        deathDate: dto.deathDate,
        isLiving: dto.isLiving ?? true,
      },
    });

    return person;
  }

  async getAncestors(personId: string, treeId: string, maxDepth: number = 5) {
    const result = await this.prisma.$queryRaw`
      WITH RECURSIVE ancestors AS (
        SELECT id, "firstName", "lastName", "parentId", "treeId", "gender", "birthDate", "deathDate", "isLiving", 0 as depth, ARRAY[id] as visited
        FROM "Person"
        WHERE id = ${personId} AND "treeId" = ${treeId} AND "deletedAt" IS NULL
        UNION ALL
        SELECT p.id, p."firstName", p."lastName", p."parentId", p."treeId", p."gender", p."birthDate", p."deathDate", p."isLiving", a.depth + 1, a.visited || p.id
        FROM "Person" p
        INNER JOIN ancestors a ON p.id = a."parentId"
        WHERE NOT p.id = ANY(a.visited) AND a.depth < ${maxDepth} AND p."deletedAt" IS NULL
      )
      SELECT * FROM ancestors ORDER BY depth ASC
    `;

    return result;
  }

  async getDescendants(personId: string, treeId: string, maxDepth: number = 5) {
    const result = await this.prisma.$queryRaw`
      WITH RECURSIVE descendants AS (
        SELECT id, "firstName", "lastName", "parentId", "treeId", "gender", "birthDate", "deathDate", "isLiving", 0 as depth, ARRAY[id] as visited
        FROM "Person"
        WHERE id = ${personId} AND "treeId" = ${treeId} AND "deletedAt" IS NULL
        UNION ALL
        SELECT p.id, p."firstName", p."lastName", p."parentId", p."treeId", p."gender", p."birthDate", p."deathDate", p."isLiving", d.depth + 1, d.visited || p.id
        FROM "Person" p
        INNER JOIN descendants d ON p."parentId" = d.id
        WHERE NOT p.id = ANY(d.visited) AND d.depth < ${maxDepth} AND p."deletedAt" IS NULL
      )
      SELECT * FROM descendants ORDER BY depth ASC
    `;

    return result;
  }

  async getFamilyTree(treeId: string, rootPersonId?: string, maxDepth: number = 3) {
    if (rootPersonId) {
      // Get descendants from specific person
      return this.getDescendants(rootPersonId, treeId, maxDepth);
    }

    // Get all persons in the tree with their hierarchy
    const persons = await this.prisma.person.findMany({
      where: {
        treeId,
        deletedAt: null,
        parentId: null, // Root persons only
      },
      include: {
        children: {
          where: { deletedAt: null },
          include: {
            children: {
              where: { deletedAt: null },
            },
          },
        },
      },
    });

    return persons;
  }

  async updatePerson(id: string, data: any, version?: number) {
    const updateData: any = { ...data };
    
    // Optimistic locking
    if (version !== undefined) {
      const current = await this.prisma.person.findUnique({
        where: { id },
        select: { version: true },
      });

      if (current && current.version !== version) {
        throw new Error('Version conflict: data has been modified by another user');
      }

      updateData.version = version + 1;
    }

    return this.prisma.person.update({
      where: { id },
      data: updateData,
    });
  }

  async deletePerson(id: string) {
    // Soft delete
    return this.prisma.person.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
