import Logger from '../../../../core/Logger';
import { inject, injectable } from 'tsyringe';
import Tokens from '../../../../bin/Tokens';
import Store from 'electron-store';
import PartsCheckCredentials from '../../domain/entities/PartsCheckCredentials';

const storeKeys = {
  partsCheckCredentials: "PARTS_CHECK_CREDENTIALS",
};

interface ScraperLocalDataSource {
  getPartsCheckCredentials(): Promise<PartsCheckCredentials>;
  setPartsCheckCredentials(credentials: PartsCheckCredentials): Promise<boolean>;
}

@injectable()
class ScraperLocalDataSourceImpl implements ScraperLocalDataSource {
  private readonly logger: Logger;
  private readonly store: Store;

  constructor(
    @inject(Tokens.logger) logger: Logger,
    @inject(Tokens.electronStore) store: Store,
  ) {
    this.logger = logger;
    this.store = store;
  }

  getPartsCheckCredentials(): Promise<PartsCheckCredentials> {
    throw new Error('Method not implemented.');
  }

  setPartsCheckCredentials(credentials: PartsCheckCredentials): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}

export default ScraperLocalDataSourceImpl;
