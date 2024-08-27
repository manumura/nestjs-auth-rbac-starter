import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { Role as RoleEnum } from '../model/role.model';

@Injectable()
export class RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByName(role: RoleEnum): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: {
        name: role,
      },
    });
  }

  async findAllAsMap(): Promise<Map<string, Role>> {
    const entities = await this.prisma.role.findMany();

    const rolesMap: Map<string, Role> = new Map();
    entities.forEach((entity) => {
      rolesMap.set(entity.name, entity);
    });

    return rolesMap;
  }
}
