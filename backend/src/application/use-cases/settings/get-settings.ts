import type { Settings } from '../../../domain/entities/settings';
import type { SettingsRepository } from '../../ports/settings-repository';

export class GetSettingsUseCase {
  constructor(private readonly settings: SettingsRepository) {}

  execute(): Promise<Settings> {
    return this.settings.get();
  }
}
