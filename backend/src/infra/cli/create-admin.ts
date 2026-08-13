import 'dotenv/config';
import { z } from 'zod';
import { PrismaAdminRepository } from '../db/prisma-admin.repository';
import { createPrismaClient } from '../db/prisma-client';
import { Argon2PasswordHasher } from '../security/argon2-password-hasher';

function parseArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    if (key.includes('=')) {
      const [k, ...rest] = key.split('=');
      args[k] = rest.join('=');
    } else {
      const next = argv[i + 1];
      args[key] = next && !next.startsWith('--') ? next : '';
      if (args[key]) i++;
    }
  }
  return args;
}

const ArgsSchema = z.object({
  email: z.string().trim().email('--email precisa ser um e-mail válido.'),
  password: z.string().min(8, '--password precisa ter pelo menos 8 caracteres.'),
});

async function main() {
  const raw = parseArgs(process.argv.slice(2));
  const { email, password } = ArgsSchema.parse({ email: raw.email, password: raw.password });

  const prisma = createPrismaClient();
  const admins = new PrismaAdminRepository(prisma);
  const hasher = new Argon2PasswordHasher();

  const normalizedEmail = email.toLowerCase();
  const passwordHash = await hasher.hash(password);
  const existing = await admins.findByEmail(normalizedEmail);

  if (existing) {
    await prisma.adminUser.update({ where: { email: normalizedEmail }, data: { passwordHash } });
    console.log(`Senha atualizada para o admin ${normalizedEmail}.`);
  } else {
    await admins.create(normalizedEmail, passwordHash);
    console.log(`Admin ${normalizedEmail} criado.`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
