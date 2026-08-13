import type { PrismaClient } from '@prisma/client';
import type { AdminRepository, AdminUser } from '../../application/ports/admin-repository';

export class PrismaAdminRepository implements AdminRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<AdminUser | null> {
    return this.prisma.adminUser.findUnique({ where: { email } });
  }

  async create(email: string, passwordHash: string): Promise<AdminUser> {
    return this.prisma.adminUser.create({ data: { email, passwordHash } });
  }
}
