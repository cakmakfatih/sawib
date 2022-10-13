import Logger from '../../../../core/Logger';
import { inject, injectable } from 'tsyringe';
import Tokens from '../../../../bin/Tokens';
import Store from 'electron-store';
import ScraperConfig from '../../domain/entities/ScraperConfig';
import safeCall from '../../../../utils/safeCall';

export const SCRAPER_STORE_KEYS = {
  scraperConfig: "scraperConfig",
};

export interface ScraperLocalDataSource {
  getScraperConfig(): ScraperConfig;
  setScraperConfig(config: ScraperConfig): boolean;
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

  getScraperConfig(): ScraperConfig {
    throw new Error('Method not implemented.');
  }

  setScraperConfig(config: ScraperConfig): boolean {
    this.logger.info("[ScraperLocalDataSource.setScraperConfig] started.");

    const setResultOrFailure = safeCall(() => this.store.set({
      [SCRAPER_STORE_KEYS.scraperConfig]: config
    }));

    if (setResultOrFailure.isLeft()) {
      const setResultErr = setResultOrFailure.value;

      this.logger.error(setResultErr);
      this.logger.info("[ScraperLocalDataSource.setScraperConfig] completed with a [Failure].");

      throw setResultErr;
    }

    this.logger.info("[ScraperLocalDataSource.setScraperConfig] completed.");

    return true;
  }
}

export default ScraperLocalDataSourceImpl;
