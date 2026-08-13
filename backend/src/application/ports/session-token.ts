export interface SessionPayload {
  sub: string;
  email: string;
}

export interface SessionTokenService {
  sign(payload: SessionPayload): string;
  /** Devolve null se o token for inválido ou expirado — nunca lança. */
  verify(token: string): SessionPayload | null;
}
