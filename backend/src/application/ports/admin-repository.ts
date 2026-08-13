export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
}

export interface AdminRepository {
  findByEmail(email: string): Promise<AdminUser | null>;
  create(email: string, passwordHash: string): Promise<AdminUser>;
}
