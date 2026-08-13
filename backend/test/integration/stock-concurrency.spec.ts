import { execSync } from 'node:child_process';
import type { PrismaClient } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { loadEnv } from '../../src/infra/config/env';
import { PrismaAdminRepository } from '../../src/infra/db/prisma-admin.repository';
import { createPrismaClient } from '../../src/infra/db/prisma-client';
import { PrismaProductRepository } from '../../src/infra/db/prisma-product.repository';
import { PrismaSettingsRepository } from '../../src/infra/db/prisma-settings.repository';
import { buildServer } from '../../src/infra/http/server';
import { Argon2PasswordHasher } from '../../src/infra/security/argon2-password-hasher';
import { JwtSessionTokenService } from '../../src/infra/security/jwt-session';

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'postgresql://kronos:kronos@localhost:5432/kronos_test?schema=public';

describe('concorrência de estoque (Postgres real)', () => {
  let prisma: PrismaClient;
  let server: FastifyInstance;
  let cookieHeader: string;

  beforeAll(async () => {
    execSync('npx prisma migrate deploy', {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
      stdio: 'inherit',
    });

    prisma = createPrismaClient(TEST_DATABASE_URL);

    const env = loadEnv({
      ...process.env,
      NODE_ENV: 'test',
      DATABASE_URL: TEST_DATABASE_URL,
      JWT_SECRET: 'test-secret-com-pelo-menos-16-chars',
      CORS_ORIGIN: 'http://localhost:5500',
    });

    const sessionTokens = new JwtSessionTokenService(env.JWT_SECRET, env.JWT_EXPIRES_IN);

    server = await buildServer({
      env,
      productRepository: new PrismaProductRepository(prisma),
      settingsRepository: new PrismaSettingsRepository(prisma),
      adminRepository: new PrismaAdminRepository(prisma),
      passwordHasher: new Argon2PasswordHasher(),
      sessionTokens,
      imageStorage: { save: async () => ({ url: '' }) },
    });

    const token = sessionTokens.sign({ sub: 'test-admin', email: 'admin@test.local' });
    cookieHeader = `${env.COOKIE_NAME}=${token}`;
  });

  afterAll(async () => {
    await server.close();
    await prisma.$disconnect();
  });

  it('20 incrementos concorrentes na mesma numeração não perdem contagem', async () => {
    const product = await prisma.product.create({
      data: {
        brand: 'Nike',
        name: 'Teste Concorrência Incremento',
        cat: 'corrida',
        desc: '',
        price: 100,
        avail: 'Pronta entrega',
        img: '',
        stock: { create: [{ size: '42', qty: 0 }] },
      },
    });

    const CONCURRENCY = 20;
    const responses = await Promise.all(
      Array.from({ length: CONCURRENCY }, () =>
        server.inject({
          method: 'PATCH',
          url: `/api/admin/products/${product.id}/stock`,
          headers: { cookie: cookieHeader },
          payload: { size: '42', delta: 1 },
        }),
      ),
    );

    for (const res of responses) expect(res.statusCode).toBe(200);

    const finalStock = await prisma.stockItem.findUnique({
      where: { productId_size: { productId: product.id, size: '42' } },
    });
    expect(finalStock?.qty).toBe(CONCURRENCY);
  });

  it('decrementos concorrentes nunca deixam a quantidade negativa', async () => {
    const product = await prisma.product.create({
      data: {
        brand: 'Nike',
        name: 'Teste Concorrência Decremento',
        cat: 'corrida',
        desc: '',
        price: 100,
        avail: 'Pronta entrega',
        img: '',
        stock: { create: [{ size: '42', qty: 5 }] },
      },
    });

    const responses = await Promise.all(
      Array.from({ length: 10 }, () =>
        server.inject({
          method: 'PATCH',
          url: `/api/admin/products/${product.id}/stock`,
          headers: { cookie: cookieHeader },
          payload: { size: '42', delta: -1 },
        }),
      ),
    );

    const okCount = responses.filter((res) => res.statusCode === 200).length;
    const conflictCount = responses.filter((res) => res.statusCode === 409).length;
    expect(okCount).toBe(5);
    expect(conflictCount).toBe(5);

    const finalStock = await prisma.stockItem.findUnique({
      where: { productId_size: { productId: product.id, size: '42' } },
    });
    expect(finalStock?.qty).toBe(0);
  });
});
