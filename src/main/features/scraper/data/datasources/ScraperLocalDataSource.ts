import Logger from '../../../../core/Logger';
import { inject, injectable } from 'tsyringe';
import Tokens from '../../../../bin/Tokens';
import Store from 'electron-store';
import ScraperConfig from '../../domain/entities/ScraperConfig';

const storeKeys = {
  config: "CONFIG",
};

export interface ScraperLocalDataSource {
  getScraperConfig(): Promise<ScraperConfig>;
  setScraperConfig(config: ScraperConfig): Promise<boolean>;
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

  getScraperConfig(): Promise<ScraperConfig> {
    throw new Error('Method not implemented.');
  }

  setScraperConfig(config: ScraperConfig): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}

export default ScraperLocalDataSourceImpl;
