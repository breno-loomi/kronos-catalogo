import { InvalidCredentialsError } from '../../../domain/errors/domain-error';
import type { AdminRepository } from '../../ports/admin-repository';
import type { PasswordHasher } from '../../ports/password-hasher';
import type { SessionTokenService } from '../../ports/session-token';

export interface LoginInput {
  email: string;
  password: string;
}

export class LoginUseCase {
  constructor(
    private readonly admins: AdminRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: SessionTokenService,
  ) {}

  async execute(input: LoginInput): Promise<{ token: string; email: string }> {
    const admin = await this.admins.findByEmail(input.email.trim().toLowerCase());
    if (!admin) throw new InvalidCredentialsError();

    const ok = await this.hasher.verify(admin.passwordHash, input.password);
    if (!ok) throw new InvalidCredentialsError();

    const token = this.tokens.sign({ sub: admin.id, email: admin.email });
    return { token, email: admin.email };
  }
}
