import { describe, expect, it } from 'vitest';
import type { AdminRepository, AdminUser } from '../../../src/application/ports/admin-repository';
import type { PasswordHasher } from '../../../src/application/ports/password-hasher';
import type {
  SessionPayload,
  SessionTokenService,
} from '../../../src/application/ports/session-token';
import { LoginUseCase } from '../../../src/application/use-cases/auth/login';
import { InvalidCredentialsError } from '../../../src/domain/errors/domain-error';

class FakeAdminRepository implements AdminRepository {
  private readonly admins = new Map<string, AdminUser>();

  seed(admin: AdminUser) {
    this.admins.set(admin.email, admin);
  }

  async findByEmail(email: string): Promise<AdminUser | null> {
    return this.admins.get(email) ?? null;
  }

  async create(email: string, passwordHash: string): Promise<AdminUser> {
    const admin = { id: 'admin-1', email, passwordHash };
    this.admins.set(email, admin);
    return admin;
  }
}

class FakePasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return `hashed:${plain}`;
  }

  async verify(hash: string, plain: string): Promise<boolean> {
    return hash === `hashed:${plain}`;
  }
}

class FakeSessionTokenService implements SessionTokenService {
  sign(payload: SessionPayload): string {
    return `token:${payload.sub}:${payload.email}`;
  }

  verify(): SessionPayload | null {
    return null;
  }
}

describe('LoginUseCase', () => {
  it('rejeita e-mail que não existe', async () => {
    const useCase = new LoginUseCase(
      new FakeAdminRepository(),
      new FakePasswordHasher(),
      new FakeSessionTokenService(),
    );
    await expect(useCase.execute({ email: 'ninguem@kronos.com', password: 'x' })).rejects.toThrow(
      InvalidCredentialsError,
    );
  });

  it('rejeita senha incorreta', async () => {
    const admins = new FakeAdminRepository();
    admins.seed({ id: 'admin-1', email: 'admin@kronos.com', passwordHash: 'hashed:certa' });
    const useCase = new LoginUseCase(
      admins,
      new FakePasswordHasher(),
      new FakeSessionTokenService(),
    );
    await expect(
      useCase.execute({ email: 'admin@kronos.com', password: 'errada' }),
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it('devolve token e email quando as credenciais batem', async () => {
    const admins = new FakeAdminRepository();
    admins.seed({ id: 'admin-1', email: 'admin@kronos.com', passwordHash: 'hashed:certa' });
    const useCase = new LoginUseCase(
      admins,
      new FakePasswordHasher(),
      new FakeSessionTokenService(),
    );
    const result = await useCase.execute({ email: 'admin@kronos.com', password: 'certa' });
    expect(result).toEqual({ token: 'token:admin-1:admin@kronos.com', email: 'admin@kronos.com' });
  });
});
