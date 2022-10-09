import { Either, Right } from '@typed-f/either';
import { Failure } from '../../../../core/error/failures';
import Logger from '../../../../core/Logger';
import Tokens from '../../../../bin/Tokens';
import StealthBrowser from '../../domain/entities/StealthBrowser';
import StealthBrowserLaunchOptions from '../../domain/entities/StealthBrowserLaunchOptions';
import BrowserRepository from '../../domain/repositories/BrowserRepository';
import { inject, injectable } from 'tsyringe';
import { BrowserType, Browser, BrowserContext, FirefoxBrowser } from 'playwright-firefox';

@injectable()
class BrowserRepositoryImpl implements BrowserRepository {
  private readonly logger: Logger;
  private readonly firefox: BrowserType<Browser>;

  constructor(
    @inject(Tokens.logger) logger: Logger,
    @inject(Tokens.firefox) firefox: BrowserType<Browser>,
  ) {
    this.logger = logger;
    this.firefox = firefox;
  }

  async launch(params?: StealthBrowserLaunchOptions | undefined): Promise<Either<Failure, StealthBrowser>> {
    this.logger.info("[BrowserRepository.launch] started.");

    const browser = await this.firefox.launch();
    const context = await this.createContext(browser);

    const stealthBrowser: StealthBrowser = {
      browser,
      context,
    };

    this.logger.info("[BrowserRepository.launch] completed.");

    return new Right(stealthBrowser);
  }

  async createContext(browser: FirefoxBrowser): Promise<BrowserContext> {
    return await browser.newContext();
  }
}

export default BrowserRepositoryImpl;
