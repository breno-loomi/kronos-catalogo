import type { FastifyInstance } from 'fastify';
import { UpdateSettingsUseCase } from '../../../application/use-cases/settings/update-settings';
import { UpdateSettingsBodySchema } from '../schemas/settings.schemas';
import type { ServerDependencies } from '../server';

export async function registerAdminSettingsRoutes(
  fastify: FastifyInstance,
  deps: ServerDependencies,
): Promise<void> {
  const updateSettings = new UpdateSettingsUseCase(deps.settingsRepository);

  fastify.patch('/api/admin/settings', async (request) => {
    const body = UpdateSettingsBodySchema.parse(request.body);
    return updateSettings.execute(body);
  });
}
