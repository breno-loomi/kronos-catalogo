import type { Settings } from '../../../domain/entities/settings';
import { ValidationError } from '../../../domain/errors/domain-error';
import type { SettingsRepository } from '../../ports/settings-repository';

const PHONE_PATTERN = /^\d{10,15}$/;

export interface UpdateSettingsInput {
  phone: string;
}

export class UpdateSettingsUseCase {
  constructor(private readonly settings: SettingsRepository) {}

  async execute(input: UpdateSettingsInput): Promise<Settings> {
    if (!PHONE_PATTERN.test(input.phone)) {
      throw new ValidationError('phone precisa ter só dígitos, com DDI (10 a 15 dígitos).');
    }
    return this.settings.update({ phone: input.phone });
  }
}
