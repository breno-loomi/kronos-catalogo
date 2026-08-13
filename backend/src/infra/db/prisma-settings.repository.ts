import type { PrismaClient } from '@prisma/client';
import type { SettingsRepository } from '../../application/ports/settings-repository';
import type { Settings } from '../../domain/entities/settings';

const SETTINGS_ID = 1;
const DEFAULT_PHONE = '5511999999999';

export class PrismaSettingsRepository implements SettingsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async get(): Promise<Settings> {
    const row = await this.prisma.settings.upsert({
      where: { id: SETTINGS_ID },
      update: {},
      create: { id: SETTINGS_ID, phone: DEFAULT_PHONE },
    });
    return { phone: row.phone };
  }

  async update(patch: Partial<Settings>): Promise<Settings> {
    const row = await this.prisma.settings.upsert({
      where: { id: SETTINGS_ID },
      update: { ...patch },
      create: { id: SETTINGS_ID, phone: patch.phone ?? DEFAULT_PHONE },
    });
    return { phone: row.phone };
  }
}
