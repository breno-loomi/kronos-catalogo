import jwt from 'jsonwebtoken';
import type { SessionPayload, SessionTokenService } from '../../application/ports/session-token';

export class JwtSessionTokenService implements SessionTokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string,
  ) {}

  sign(payload: SessionPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  verify(token: string): SessionPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret);
      if (
        typeof decoded === 'object' &&
        decoded !== null &&
        'sub' in decoded &&
        'email' in decoded
      ) {
        return { sub: String(decoded.sub), email: String((decoded as { email: unknown }).email) };
      }
      return null;
    } catch {
      return null;
    }
  }
}
