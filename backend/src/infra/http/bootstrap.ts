import 'dotenv/config';
import { loadEnv } from '../config/env';
import { PrismaAdminRepository } from '../db/prisma-admin.repository';
import { createPrismaClient } from '../db/prisma-client';
import { PrismaProductRepository } from '../db/prisma-product.repository';
import { PrismaSettingsRepository } from '../db/prisma-settings.repository';
import { Argon2PasswordHasher } from '../security/argon2-password-hasher';
import { JwtSessionTokenService } from '../security/jwt-session';
import { LocalDiskImageStorage } from '../storage/local-disk.image-storage';
import { buildServer } from './server';

async function main() {
  const env = loadEnv();
  const prisma = createPrismaClient();

  const server = await buildServer({
    env,
    productRepository: new PrismaProductRepository(prisma),
    settingsRepository: new PrismaSettingsRepository(prisma),
    adminRepository: new PrismaAdminRepository(prisma),
    passwordHasher: new Argon2PasswordHasher(),
    sessionTokens: new JwtSessionTokenService(env.JWT_SECRET, env.JWT_EXPIRES_IN),
    imageStorage: new LocalDiskImageStorage(env.UPLOAD_DIR, env.PUBLIC_UPLOAD_BASE_URL),
  });

  const shutdown = async () => {
    await server.close();
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  await server.listen({ port: env.PORT, host: env.HOST });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
